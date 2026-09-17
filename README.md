# Collaktiv – Företagsportalen

Företagsportalen för Collaktiv: en publik landningssida som säljer in
partnerskapet till lokala företag, ett onboarding-flöde för att ansöka om
att bli partner, och en inloggad portal där godkända företag hanterar
erbjudanden, statistik, marknadsföringsmaterial och sin profil.

Byggt med Next.js (App Router), TypeScript och Tailwind CSS v4. Det finns
ingen extern backend ännu – all data (företag, erbjudanden, inbjudningar)
lagras i `localStorage` via `src/lib/store.tsx`, så portalen går att testa
och demonstrera end-to-end utan någon serverdel. AI-funktionerna
(erbjudandeförslag, textförbättring, poängsättning, marknadsföringsvarianter)
är simulerade i `src/lib/ai-mock.ts` med samma gränssnitt som riktiga
anrop skulle ha.

## Kom igång

```bash
npm install
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

- `/` – publik landningssida
- `/registrera` – ansökningsflöde i fyra steg
- `/logga-in` – inloggning (valfri e-post/lösenord öppnar en demo-portal
  med exempeldata om ingen ansökan finns sedan tidigare)
- `/portal` – Översikt, Erbjudanden, Marknadsföring och Profil för
  inloggade företag

## Struktur

- `src/app` – sidor (App Router)
- `src/components` – UI uppdelat per område (`ui`, `landing`, `onboarding`,
  `portal`, `marketing`)
- `src/lib` – datamodell (`types.ts`), state/mock-auth (`store.tsx`),
  simulerad AI (`ai-mock.ts`), canvas-genererat marknadsföringsmaterial
  (`canvas-assets.ts`) och mock-statistik (`mock-stats.ts`)

## Kontroller

```bash
npm run lint
npx tsc --noEmit
npm run build
```
