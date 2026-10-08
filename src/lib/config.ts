// Regionen portalen körs i just nu. Byt detta värde (eller koppla till en
// riktig regionväljare) för att återanvända portalen i fler regioner.
export const REGION = "Gävleborg";
export const TRAFFIC_OPERATOR = "X-trafik";
export const RESENARER_COUNT = "12 000+";

// TILLFÄLLIGT: reseappen är inte lanserad för resenärer än. Styr
// texten i admin ("redo men inte live") och i portalen (badge-notis
// på publicerade erbjudanden). Publicerade erbjudanden samlas redan
// nu i databasen och är hämtbara via /api/public/offers – det är
// alltså redo att kopplas in, bara själva appen/lanseringen som
// saknas. Sätt till true den dag appen går live.
export const APP_LAUNCHED = false;
