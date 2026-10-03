import "server-only";
import {
  getCompaniesNeedingOfferReminder,
  getCompaniesNeedingPaymentReminder,
  markOfferReminderSent,
  markPaymentReminderSent,
} from "./db";
import { sendOfferReminderEmail, sendPaymentReminderEmail } from "./email";

// Körs av /api/cron/reminders (dagligt schema, se vercel.json).
// Tröskelvärden (2/3 dagar innan första påminnelsen, 5 dagar mellan
// uppföljare) ligger i respektive databasfråga i src/lib/db.ts.
export async function runReminderSweep() {
  const [paymentDue, offerDue] = await Promise.all([
    getCompaniesNeedingPaymentReminder(),
    getCompaniesNeedingOfferReminder(),
  ]);

  let paymentRemindersSent = 0;
  for (const company of paymentDue) {
    const { sent } = await sendPaymentReminderEmail(company);
    if (sent) {
      await markPaymentReminderSent(company.id);
      paymentRemindersSent++;
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
