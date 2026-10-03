import { NextRequest, NextResponse } from "next/server";
import { runReminderSweep } from "@/lib/reminders";

// Anropas av Vercel Cron (se vercel.json) en gång per dag. Skyddas av
// CRON_SECRET – Vercel skickar automatiskt med den som Bearer-token
// när miljövariabeln är satt i projektet.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runReminderSweep();
  return NextResponse.json({ ok: true, ...result });
}
