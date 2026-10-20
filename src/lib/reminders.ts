import "server-only";
import {
  getCompaniesNeedingOfferReminder,
  getCompaniesNeedingPaymentReminder,
  getCompaniesWithExpiredComplimentaryAccess,
  getComplimentaryCompaniesAwaitingLaunch,
  markOfferReminderSent,
  markPaymentReminderSent,
  updateCompany,
} from "./db";
import { sendOfferReminderEmail, sendPaymentReminderEmail } from "./email";
import { PAYMENTS_ENABLED, APP_LAUNCH_DATE } from "./config";
import { computeComplimentaryUntil } from "./complimentary";

// Körs av /api/cron/reminders (dagligt schema, se vercel.json).
// Tröskelvärden (2/3 dagar innan första påminnelsen, 5 dagar mellan
// uppföljare) ligger i respektive databasfråga i src/lib/db.ts.
export async function runReminderSweep() {
  const [paymentDue, offerDue, complimentaryExpired] = await Promise.all([
    getCompaniesNeedingPaymentReminder(),
    getCompaniesNeedingOfferReminder(),
    getCompaniesWithExpiredComplimentaryAccess(),
  ]);

  // Kostnadsfri åtkomst som admin gav en bestämd löptid för (se "Ge
  // kostnadsfri åtkomst" i admin) återkallas automatiskt här – annars
  // skulle löptiden bara vara kosmetisk text utan faktisk effekt.
  for (const company of complimentaryExpired) {
    await updateCompany(company.id, {
      paymentConfirmed: false,
      complimentary: false,
      complimentaryUntil: undefined,
      complimentaryDuration: undefined,
    });
  }

  // Löptider som beviljades innan lanseringsdatumet (APP_LAUNCH_DATE)
  // var känt har ännu inget complimentary_until – så fort datumet sätts
  // ska de räknas ut och fyllas i här, annars skulle de ligga kvar som
  // kostnadsfria för evigt istället för att faktiskt löpa ut.
  let complimentaryBackfilled = 0;
  if (APP_LAUNCH_DATE) {
    const awaitingLaunch = await getComplimentaryCompaniesAwaitingLaunch();
    for (const company of awaitingLaunch) {
      if (!company.complimentaryDuration) continue;
      await updateCompany(company.id, {
        complimentaryUntil: computeComplimentaryUntil(company.complimentaryDuration),
      });
      complimentaryBackfilled++;
    }
  }

  // Så länge betalning inte är igång skarpt (se PAYMENTS_ENABLED) ska
  // vi inte påminna företag om att "välja paket" – mejlet länkar till
  // en betalknapp de ändå inte kan använda än, vilket bara förvirrar
  // dem. Räknas fortfarande i svaret så det syns i loggen att de
  // väntar, men skickas inte och markeras inte som skickat.
  let paymentRemindersSent = 0;
  if (PAYMENTS_ENABLED) {
    for (const company of paymentDue) {
      const { sent } = await sendPaymentReminderEmail(company);
      if (sent) {
        await markPaymentReminderSent(company.id);
        paymentRemindersSent++;
      }
    }
  }

  let offerRemindersSent = 0;
  for (const company of offerDue) {
    const { sent } = await sendOfferReminderEmail(company);
    if (sent) {
      await markOfferReminderSent(company.id);
      offerRemindersSent++;
    }
  }

  return {
    paymentRemindersChecked: paymentDue.length,
    paymentRemindersSent,
    offerRemindersChecked: offerDue.length,
    offerRemindersSent,
    complimentaryAccessExpired: complimentaryExpired.length,
    complimentaryAccessBackfilled: complimentaryBackfilled,
  };
}
