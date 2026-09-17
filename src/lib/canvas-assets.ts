export interface AssetConfig {
  width: number;
  height: number;
  companyName: string;
  offerTitle: string;
  discountValue: string;
  logoDataUrl?: string;
  qr?: boolean;
  variant?: "dark" | "light" | "accent";
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.split(" ");
  let line = "";
  const lines: string[] = [];
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  if (lines.length > maxLines) {
    const truncated = lines.slice(0, maxLines);
    let last = truncated[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 1) {
      last = last.slice(0, -1);
    }
    truncated[maxLines - 1] = `${last}…`;
    lines.length = 0;
    lines.push(...truncated);
  }

  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return lines.length;
}

function drawQR(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, seed: string) {
  const cells = 9;
  const cellSize = size / cells;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return (h % 1000) / 1000;
  };

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = "#0f1f18";
  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      const isFinder =
        (row < 3 && col < 3) || (row < 3 && col > cells - 4) || (row > cells - 4 && col < 3);
      if (isFinder || rand() > 0.52) {
        ctx.fillRect(x + col * cellSize, y + row * cellSize, cellSize - 1, cellSize - 1);
      }
    }
  }
}

const PRIMARY = "#166849";
const ACCENT = "#8fd34f";
const DARK = "#0f1f18";

export function renderMarketingAsset(canvas: HTMLCanvasElement, config: AssetConfig) {
  const { width, height, companyName, offerTitle, discountValue, variant = "dark" } = config;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const bgColors = {
    dark: [DARK, "#163627"],
    light: ["#ffffff", "#f2faf7"],
    accent: [PRIMARY, "#1f8f5f"],
  }[variant];

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, bgColors[0]);
  gradient.addColorStop(1, bgColors[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const textColor = variant === "light" ? DARK : "#ffffff";
  const mutedColor = variant === "light" ? "#5b7168" : "rgba(255,255,255,0.7)";

  // Base all proportions on the shorter side, so wide/short formats (like a
  // 1200x630 Facebook post) don't blow up text sized off the long side.
  const scale = Math.min(width, height);
  const isWide = width / height > 1.35;
  const pad = scale * 0.08;

  // Collaktiv-badge
  ctx.fillStyle = variant === "light" ? "rgba(22,104,73,0.1)" : "rgba(255,255,255,0.12)";
  ctx.font = `700 ${scale * 0.028}px Arial`;
  const badgeText = "COLLAKTIV-PARTNER";
  const badgeWidth = ctx.measureText(badgeText).width + scale * 0.06;
  ctx.beginPath();
  const bh = scale * 0.06;
  const bx = pad;
  const by = pad;
  const r = bh / 2;
  ctx.moveTo(bx + r, by);
  ctx.arcTo(bx + badgeWidth, by, bx + badgeWidth, by + bh, r);
  ctx.arcTo(bx + badgeWidth, by + bh, bx, by + bh, r);
  ctx.arcTo(bx, by + bh, bx, by, r);
  ctx.arcTo(bx, by, bx + badgeWidth, by, r);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = variant === "light" ? PRIMARY : ACCENT;
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, bx + scale * 0.03, by + bh / 2 + 1);

  // Discount badge
  ctx.fillStyle = "#e0432c";
  const discBadgeY = by + bh + pad * 0.5;
  const discFont = scale * 0.11;
  ctx.font = `800 ${discFont}px Arial`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(discountValue, pad, discBadgeY + discFont);

  const qrSize = scale * 0.3;

  // Offer title — on wide/short formats the QR sits to the right of the
  // text block, so reserve horizontal room for it; on square/portrait
  // formats the QR sits below the text with plenty of vertical room instead.
  ctx.fillStyle = textColor;
  ctx.font = `800 ${scale * 0.055}px Arial`;
  ctx.textBaseline = "alphabetic";
  const titleLineHeight = scale * 0.068;
  const titleY = discBadgeY + discFont + scale * 0.09;
  const titleMaxWidth =
    width - pad * 2 - (config.qr && isWide ? qrSize + pad * 0.8 : 0);
  const availableHeight = height - titleY - pad * (config.qr ? 2.8 : 1.3);
  const maxLines = Math.max(1, Math.floor(availableHeight / titleLineHeight));
  wrapText(ctx, offerTitle, pad, titleY, titleMaxWidth, titleLineHeight, maxLines);

  // Company name
  ctx.fillStyle = mutedColor;
  ctx.font = `600 ${scale * 0.032}px Arial`;
  ctx.fillText(companyName, pad, height - pad * (config.qr && !isWide ? 2.6 : 1.1));

  if (config.qr) {
    const qrX = width - pad - qrSize;
    const qrY = height - pad - qrSize;
    drawQR(ctx, qrX, qrY, qrSize, offerTitle + companyName);
    if (!isWide) {
      ctx.fillStyle = mutedColor;
      ctx.font = `600 ${scale * 0.024}px Arial`;
      ctx.fillText("Skanna för erbjudandet", pad, height - pad * 1.1);
    }
  }
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
