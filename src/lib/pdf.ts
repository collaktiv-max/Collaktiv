import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getPlan } from "./pricing";
import type { CompanyProfile, Offer } from "./types";

const BRAND_GREEN: [number, number, number] = [22, 104, 73];
const INK: [number, number, number] = [15, 42, 31];
const MUTED: [number, number, number] = [91, 113, 104];

function formatDate(date: Date) {
  return date.toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" });
}

const STATUS_LABELS: Record<Offer["status"], string> = {
  utkast: "Utkast",
  granskas: "Granskas",
  publicerad: "Publicerad",
  pausad: "Pausad",
  arkiverad: "Arkiverad",
};

/**
 * Exporterar en statistikrapport som PDF. Innehållet speglar exakt vad
 * företaget redan ser upplåst på Översikt-sidan: Standard ger bara
 * totala visningar, Premium ger full nedbrytning per erbjudande.
 */
export function generateStatsPdf(company: CompanyProfile, offers: Offer[]) {
  const isPremium = company.packageTier === "premium";
  const plan = getPlan(company.packageTier);

  const totalViews = offers.reduce((sum, o) => sum + o.stats.views, 0);
  const totalRedemptions = offers.reduce((sum, o) => sum + o.stats.redemptions, 0);
  const conversion = totalViews > 0 ? Math.round((totalRedemptions / totalViews) * 100) : 0;
  const topOffer = [...offers].sort((a, b) => b.stats.views - a.stats.views)[0];

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...BRAND_GREEN);
  doc.text("Collaktiv", 14, 18);

  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.text("Statistikrapport", 14, 25);

  doc.setFontSize(10);
  doc.text(formatDate(new Date()), pageWidth - 14, 18, { align: "right" });
  doc.text(`${plan.name}-paket`, pageWidth - 14, 25, { align: "right" });

  doc.setDrawColor(226, 236, 231);
  doc.line(14, 30, pageWidth - 14, 30);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text(company.name, 14, 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`${offers.length} erbjudande${offers.length === 1 ? "" : "n"} totalt`, 14, 46);

  let y = 58;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text("Sammanfattning", 14, y);
  y += 8;

  const summaryRows: [string, string][] = [["Visningar totalt", totalViews.toLocaleString("sv-SE")]];
  if (isPremium) {
    summaryRows.push(
      ["Inlösningar totalt", totalRedemptions.toLocaleString("sv-SE")],
      ["Konverteringsgrad", `${conversion}%`],
      ["Mest populära erbjudande", topOffer ? topOffer.title : "–"]
    );
  }

  autoTable(doc, {
    startY: y,
    head: [],
    body: summaryRows,
    theme: "plain",
    styles: { font: "helvetica", fontSize: 10, textColor: INK, cellPadding: { top: 2, bottom: 2 } },
    columnStyles: {
      0: { textColor: MUTED, cellWidth: 70 },
      1: { fontStyle: "bold" },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  if (!isPremium) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(
      "Uppgradera till Premium för inlösningar, konverteringsgrad och statistik per erbjudande.",
      14,
      y,
      { maxWidth: pageWidth - 28 }
    );
    y += 10;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text("Erbjudanden", 14, y);
  y += 4;

  if (isPremium) {
    autoTable(doc, {
      startY: y,
      head: [["Erbjudande", "Status", "Visningar", "Inlösningar", "Konvertering"]],
      body: offers.map((o) => [
        o.title,
        STATUS_LABELS[o.status],
        o.stats.views.toLocaleString("sv-SE"),
        o.stats.redemptions.toLocaleString("sv-SE"),
        o.stats.views > 0 ? `${Math.round((o.stats.redemptions / o.stats.views) * 100)}%` : "–",
      ]),
      theme: "striped",
      headStyles: { fillColor: BRAND_GREEN, textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { font: "helvetica", fontSize: 9, textColor: INK },
      alternateRowStyles: { fillColor: [242, 250, 247] },
    });
  } else {
    autoTable(doc, {
      startY: y,
      head: [["Erbjudande", "Status"]],
      body: offers.map((o) => [o.title, STATUS_LABELS[o.status]]),
      theme: "striped",
      headStyles: { fillColor: BRAND_GREEN, textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { font: "helvetica", fontSize: 9, textColor: INK },
      alternateRowStyles: { fillColor: [242, 250, 247] },
    });
  }

  const fileSafeName = company.name.replace(/[^a-zA-Z0-9åäöÅÄÖ]+/g, "-").toLowerCase();
  doc.save(`collaktiv-statistik-${fileSafeName || "foretag"}.pdf`);
}
