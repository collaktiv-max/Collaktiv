#!/usr/bin/env node
// Engångskörning: fyller i "Stad" för företag som redan har en adress
// men lämnade själva stadsfältet tomt (hamnar annars som "Okänd stad"
// i admins städer-nedbrytning, se OversiktSection i AdminSections.tsx,
// trots att adressen är fullt användbar). Slår upp staden Nominatim
// själv tolkar adressen till, se pickCity/geocodeAddress i
// src/lib/geocode.ts - samma fallback används numera automatiskt av
// createCompany/updateCompany för alla NYA/ändrade adresser, så det
// här skriptet behöver bara köras en gång för att fånga upp
// historiska rader. Ofarligt att köra om: rader som redan har en stad
// hoppas bara över.
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
  console.error("[city-backfill] DATABASE_URL saknas i miljövariablerna - avbryter.");
  process.exit(1);
}

const sql = neon(databaseUrl);

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "Collaktiv-Foretagsportal/1.0 (+https://partner.collaktiv.se, partner@collaktiv.se)";
const MIN_INTERVAL_MS = 1100;

function pickCity(address) {
  if (!address) return undefined;
  const direct = address.city || address.town || address.village || address.hamlet;
  if (direct) return direct;
  if (address.municipality) return address.municipality.replace(/\s*kommun$/i, "");
  return address.suburb;
}

async function geocodeCity(address, region) {
  const query = [address, region, "Sverige"].map((part) => part?.trim()).filter(Boolean).join(", ");
  if (!query) return null;
  try {
    const url = `${NOMINATIM_URL}?format=json&limit=1&countrycodes=se&addressdetails=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, "Accept-Language": "sv" } });
    if (!res.ok) {
      console.error(`[city-backfill] Nominatim svarade ${res.status} för "${query}"`);
      return null;
    }
    const results = await res.json();
    const first = results[0];
    if (!first) return null;
    const latitude = Number.parseFloat(first.lat);
    const longitude = Number.parseFloat(first.lon);
    return {
      city: pickCity(first.address),
      latitude: Number.isFinite(latitude) ? latitude : null,
      longitude: Number.isFinite(longitude) ? longitude : null,
    };
  } catch (err) {
    console.error(`[city-backfill] Kunde inte geokoda "${query}":`, err);
    return null;
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const companies = await sql`
  select id, name, address, region, latitude, longitude from companies
  where (city is null or city = '') and address is not null and address != ''
`;
console.log(`[city-backfill] ${companies.length} företag saknar stad men har en adress.`);

let updated = 0;
for (const c of companies) {
  const result = await geocodeCity(c.address, c.region);
  if (result?.city) {
    // Fyller bara i koordinater om de verkligen saknas sedan innan -
    // rör inte en redan satt latitude/longitude i onödan.
    const latitude = c.latitude ?? result.latitude;
    const longitude = c.longitude ?? result.longitude;
    await sql`update companies set city = ${result.city}, latitude = ${latitude}, longitude = ${longitude} where id = ${c.id}`;
    console.log(`[city-backfill] ${c.name}: "${c.address}" -> ${result.city}`);
    updated++;
  } else {
    console.log(`[city-backfill] ${c.name}: ingen stad hittad för "${c.address}", hoppar över.`);
  }
  await sleep(MIN_INTERVAL_MS);
}

console.log(`[city-backfill] Klart. ${updated} av ${companies.length} företag fick en stad.`);
