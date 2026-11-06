#!/usr/bin/env node
// Applicerar db/schema.sql mot DATABASE_URL. Körs automatiskt före varje
// Vercel-deploy (se "vercel-build" i package.json) så att schemat aldrig
// hamnar efter koden igen - annars har vi varit tvungna att köra nya
// kolumner manuellt i Neons SQL Editor varje gång. Säkert att köra om
// och om igen: alla statements i schema.sql är skrivna med
// "if not exists", så redan tillämpade ändringar bara hoppas över.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const schemaPath = path.join(projectRoot, "db", "schema.sql");

// Vercel sätter DATABASE_URL som en riktig miljövariabel vid deploy, men
// lokalt (npm run db:migrate) finns den bara i .env.local, som bara Next
// själv läser automatiskt - läs in den manuellt här också, utan att
// skriva över en variabel som redan är satt i miljön.
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
  console.error("[migrate] DATABASE_URL saknas i miljövariablerna - avbryter.");
  process.exit(1);
}

const sql = neon(databaseUrl);
const schemaText = fs.readFileSync(schemaPath, "utf8");

// Filen innehåller bara enkel DDL utan semikolon inuti strängar, så en
// enkel split på ";" räcker för att dela upp den i enskilda statements
// (Neons HTTP-driver kör ett statement per anrop, inte en hel fil).
const statements = schemaText
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(`[migrate] Kör ${statements.length} statements från db/schema.sql...`);

for (const [i, statement] of statements.entries()) {
  try {
    await sql.query(statement);
  } catch (err) {
    console.error(
      `[migrate] Fel i statement ${i + 1}/${statements.length}:\n${statement}\n`,
      err
    );
    process.exit(1);
  }
}

console.log(`[migrate] Klart - schemat är uppdaterat.`);
