#!/usr/bin/env node
// Engångskörning: geokodar företag och platser som redan har en adress
// men saknar koordinater (skapade innan geokodning fanns, se
// src/lib/geocode.ts). Nya/ändrade adresser geokodas automatiskt
// framöver av createCompany/updateCompany/createLocation/updateLocation
// i src/lib/db.ts - det här skriptet behöver alltså bara köras en gång
// för att fånga upp historiska rader, men är ofarligt att köra om:
// rader som redan har koordinater hoppas bara över.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");

const envLocalPath = path.join(projectRoot, ".env.local");
if (fs.existsSync(envLocalPath)) {
  for (const line of fs.readFileSync(envLocalPath, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !(match[1] in process.env)) {
      process.env[match[1]] = match[2].trim().replace(/^"|"$/g, "");
    }
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("[geocode-backfill] DATABASE_URL saknas i miljövariablerna - avbryter.");
  process.exit(1);
}

const sql = neon(databaseUrl);

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "Collaktiv-Foretagsportal/1.0 (+https://partner.collaktiv.se, partner@collaktiv.se)";
const MIN_INTERVAL_MS = 1100;

async function geocodeAddress(address, city, region) {
  const query = [address, city, region, "Sverige"]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
  if (!query) return null;
  try {
    const url = `${NOMINATIM_URL}?format=json&limit=1&countrycodes=se&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, "Accept-Language": "sv" } });
    if (!res.ok) {
      console.error(`[geocode-backfill] Nominatim svarade ${res.status} för "${query}"`);
      return null;
    }
    const results = await res.json();
    const first = results[0];
    if (!first) return null;
    const latitude = Number.parseFloat(first.lat);
    const longitude = Number.parseFloat(first.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return { latitude, longitude };
  } catch (err) {
    console.error(`[geocode-backfill] Kunde inte geokoda "${query}":`, err);
    return null;
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const companies = await sql`
  select id, name, address, city, region from companies
  where address is not null and address != '' and latitude is null
`;
console.log(`[geocode-backfill] ${companies.length} företag saknar koordinater.`);
for (const c of companies) {
  const result = await geocodeAddress(c.address, c.city, c.region);
  if (result) {
    await sql`update companies set latitude = ${result.latitude}, longitude = ${result.longitude} where id = ${c.id}`;
    console.log(`[geocode-backfill] ${c.name}: ${result.latitude}, ${result.longitude}`);
  } else {
    console.log(`[geocode-backfill] ${c.name}: ingen träff, hoppar över.`);
  }
  await sleep(MIN_INTERVAL_MS);
}

const locations = await sql`
  select id, name, address from company_locations
  where address is not null and address != '' and latitude is null
`;
console.log(`[geocode-backfill] ${locations.length} platser saknar koordinater.`);
for (const l of locations) {
  const result = await geocodeAddress(l.address);
  if (result) {
    await sql`update company_locations set latitude = ${result.latitude}, longitude = ${result.longitude} where id = ${l.id}`;
    console.log(`[geocode-backfill] ${l.name || l.address}: ${result.latitude}, ${result.longitude}`);
  } else {
    console.log(`[geocode-backfill] ${l.name || l.address}: ingen träff, hoppar över.`);
  }
  await sleep(MIN_INTERVAL_MS);
}

console.log("[geocode-backfill] Klart.");
