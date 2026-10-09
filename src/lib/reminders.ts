import "server-only";
import {
  getCompaniesNeedingOfferReminder,
  getCompaniesNeedingPaymentReminder,
  markOfferReminderSent,
  markPaymentReminderSent,
} from "./db";
import { sendOfferReminderEmail, sendPaymentReminderEmail } from "./email";
import { PAYMENTS_ENABLED } from "./config";

// Körs av /api/cron/reminders (dagligt schema, se vercel.json).
// Tröskelvärden (2/3 dagar innan första påminnelsen, 5 dagar mellan
// uppföljare) ligger i respektive databasfråga i src/lib/db.ts.
export async function runReminderSweep() {
  const [paymentDue, offerDue] = await Promise.all([
    getCompaniesNeedingPaymentReminder(),
    getCompaniesNeedingOfferReminder(),
  ]);

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
  };
}
