import "server-only";

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  /** Staden Nominatim själv tolkade adressen till, om någon - används
   * som fallback när företaget/platsen inte fyllt i "Stad" separat
   * (se createCompany/updateCompany i db.ts), så "Okänd stad" i admins
   * städer-nedbrytning (OversiktSection) bara gäller rader som
   * verkligen saknar användbar adress, inte bara ett tomt fält. */
  city?: string;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  municipality?: string;
  suburb?: string;
}

// Prioritetsordning: de flesta svenska kommunsäten (Gävle, Bollnäs,
// Hudiksvall, Sandviken...) taggas "city" eller "town" av OSM - faller
// bara tillbaka till "municipality" (och städar bort ett eventuellt
// " kommun"-suffix) eller "suburb" (storstädernas stadsdelar) om inget
// av de mer specifika fälten finns.
function pickCity(address: NominatimAddress | undefined): string | undefined {
  if (!address) return undefined;
  const direct = address.city || address.town || address.village || address.hamlet;
  if (direct) return direct;
  if (address.municipality) return address.municipality.replace(/\s*kommun$/i, "");
  return address.suburb;
}

// Nominatim (OpenStreetMap) - gratis, kräver ingen API-nyckel/konto.
// Används bara när en adress faktiskt skapas eller ändras (inte vid
// varje sidvisning), så volymen är mycket låg för en lokal portal.
// Användningsvillkoren kräver max ~1 anrop/sekund och en beskrivande
// User-Agent - lastCallAt nedan håller det, oavsett hur många
// anrop som råkar komma tätt inpå varandra (t.ex. backfill-skriptet).
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "Collaktiv-Foretagsportal/1.0 (+https://partner.collaktiv.se, partner@collaktiv.se)";
const MIN_INTERVAL_MS = 1100;

let lastCallAt = 0;

async function throttle() {
  const wait = lastCallAt + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastCallAt = Date.now();
}

// Slår upp koordinater för en adress. Returnerar null (aldrig kastar)
// om adressen är tom, inget träffas, eller tjänsten är nere - en
// misslyckad geokodning ska aldrig hindra att företaget/platsen sparas,
// bara lämna latitude/longitude null tills nästa försök (se db.ts).
export async function geocodeAddress(
  address: string | undefined,
  city?: string,
  region?: string
): Promise<GeocodeResult | null> {
  const query = [address, city, region, "Sverige"]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
  if (!query) return null;

  try {
    await throttle();
    const url = `${NOMINATIM_URL}?format=json&limit=1&countrycodes=se&addressdetails=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "sv" },
    });
    if (!res.ok) {
      console.error(`[geocode] Nominatim svarade ${res.status} för "${query}"`);
      return null;
    }
    const results = (await res.json()) as {
      lat: string;
      lon: string;
      address?: NominatimAddress;
    }[];
    const first = results[0];
    if (!first) return null;
    const latitude = Number.parseFloat(first.lat);
    const longitude = Number.parseFloat(first.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return { latitude, longitude, city: pickCity(first.address) };
  } catch (err) {
    console.error(`[geocode] Kunde inte geokoda "${query}":`, err);
    return null;
  }
}
