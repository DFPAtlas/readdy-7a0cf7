const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function buildStoreZip(files: { name: string; data: Uint8Array }[]): Blob {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(file.data);
    const size = file.data.length;

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0, true);
    local.setUint16(8, 0, true);
    local.setUint16(10, dosTime, true);
    local.setUint16(12, dosDate, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, size, true);
    local.setUint32(22, size, true);
    local.setUint16(26, nameBytes.length, true);
    local.setUint16(28, 0, true);
    localParts.push(new Uint8Array(local.buffer), nameBytes, file.data);

    const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true);
    cd.setUint16(4, 20 << 8, true);
    cd.setUint16(6, 20, true);
    cd.setUint16(8, 0, true);
    cd.setUint16(10, 0, true);
    cd.setUint16(12, dosTime, true);
    cd.setUint16(14, dosDate, true);
    cd.setUint32(16, crc, true);
    cd.setUint32(20, size, true);
    cd.setUint32(24, size, true);
    cd.setUint16(28, nameBytes.length, true);
    cd.setUint16(30, 0, true);
    cd.setUint16(32, 0, true);
    cd.setUint16(34, 0, true);
    cd.setUint16(36, 0, true);
    cd.setUint32(38, 0, true);
    cd.setUint32(42, offset, true);
    centralParts.push(new Uint8Array(cd.buffer), nameBytes);

    offset += 30 + nameBytes.length + size;
  }

  const centralOffset = offset;
  let centralSize = 0;
  for (const part of centralParts) centralSize += part.length;

  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true);
  eocd.setUint16(4, 0, true);
  eocd.setUint16(6, 0, true);
  eocd.setUint16(8, files.length, true);
  eocd.setUint16(10, files.length, true);
  eocd.setUint32(12, centralSize, true);
  eocd.setUint32(16, centralOffset, true);
  eocd.setUint16(20, 0, true);

  const all = [...localParts, ...centralParts, new Uint8Array(eocd.buffer)];
  const total = all.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let p = 0;
  for (const part of all) {
    out.set(part, p);
    p += part.length;
  }
  return new Blob([out], { type: "application/zip" });
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const LOGO_PRIMARY =
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="240" viewBox="0 0 640 240"><rect width="640" height="240" fill="#FFFFFF"/><text x="320" y="152" text-anchor="middle" font-family="Pacifico, Trebuchet MS, cursive" font-size="80" fill="#143828">LetHub</text><circle cx="502" cy="94" r="10" fill="#C28A78"/></svg>';

const LOGO_WHITE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="240" viewBox="0 0 640 240"><rect width="640" height="240" fill="#143828"/><text x="320" y="152" text-anchor="middle" font-family="Pacifico, Trebuchet MS, cursive" font-size="80" fill="#FFFFFF">LetHub</text><circle cx="502" cy="94" r="10" fill="#C28A78"/></svg>';

const LOGO_MARK =
  '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect width="240" height="240" rx="48" fill="#143828"/><text x="120" y="144" text-anchor="middle" font-family="Pacifico, Trebuchet MS, cursive" font-size="76" fill="#FFFFFF">L</text><circle cx="182" cy="72" r="14" fill="#C28A78"/></svg>';

export function downloadLogoPack() {
  const encoder = new TextEncoder();
  const files = [
    { name: "lethub-logo-primary.svg", data: encoder.encode(LOGO_PRIMARY) },
    { name: "lethub-logo-white.svg", data: encoder.encode(LOGO_WHITE) },
    { name: "lethub-mark.svg", data: encoder.encode(LOGO_MARK) },
  ];
  downloadBlob("lethub-logo-pack.zip", buildStoreZip(files));
}

function buildPdf(title: string, sections: { heading: string; lines: string[] }[]): Blob {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  let content = "";
  let y = 760;
  content += `BT /F1 20 Tf 50 ${y} Td (${esc(title)}) Tj ET\n`;
  y -= 40;
  for (const section of sections) {
    content += `BT /F1 13 Tf 50 ${y} Td (${esc(section.heading)}) Tj ET\n`;
    y -= 22;
    for (const line of section.lines) {
      content += `BT /F1 10 Tf 60 ${y} Td (${esc(line)}) Tj ET\n`;
      y -= 16;
    }
    y -= 10;
  }

  const contentBytes = new TextEncoder().encode(content);
  const objects: string[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
  objects[3] =
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[5] = `<< /Length ${contentBytes.length} >>\nstream\n${content}endstream`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let i = 1; i <= 5; i++) {
    offsets[i] = pdf.length;
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = pdf.length;
  pdf += "xref\n0 6\n0000000000 65535 f \n";
  for (let i = 1; i <= 5; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function downloadBrandGuidelines() {
  const blob = buildPdf("LetHub Brand Guidelines", [
    {
      heading: "Brand colours",
      lines: [
        "Primary green: #143828",
        "Accent terracotta: #C28A78",
        "Text: #3A3F3A",
        "Muted text: #687068",
      ],
    },
    {
      heading: "Typography",
      lines: [
        "Wordmark: Pacifico",
        "Headings and body: system sans-serif",
        "Maintain a clear hierarchy across all surfaces.",
      ],
    },
    {
      heading: "Logo usage",
      lines: [
        "Use the primary logo on light backgrounds.",
        "Use the white logo on green or dark backgrounds.",
        "Keep clear space around the logo at all times.",
      ],
    },
    {
      heading: "Voice and tone",
      lines: [
        "Friendly, clear, and reassuring.",
        "Use plain English and avoid jargon.",
      ],
    },
  ]);
  downloadBlob("lethub-brand-guidelines.pdf", blob);
}

function drawAppFrame(
  ctx: CanvasRenderingContext2D,
  title: string,
  accent: string
) {
  ctx.fillStyle = "#F4F6F5";
  ctx.fillRect(0, 0, 1280, 800);
  ctx.fillStyle = "#143828";
  ctx.fillRect(0, 0, 240, 800);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(240, 0, 1040, 64);
  ctx.fillStyle = "#C28A78";
  ctx.beginPath();
  ctx.arc(60, 52, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 28px Pacifico, cursive";
  ctx.fillText("LetHub", 88, 64);

  ctx.fillStyle = "#3A3F3A";
  ctx.font = "600 22px Arial, sans-serif";
  ctx.fillText(title, 280, 42);

  const cards = [
    { x: 280, y: 110, w: 300, h: 130, c: accent },
    { x: 620, y: 110, w: 300, h: 130, c: "#F1E9E4" },
    { x: 960, y: 110, w: 280, h: 130, c: "#E7EDEA" },
    { x: 280, y: 270, w: 460, h: 220, c: "#FFFFFF" },
    { x: 780, y: 270, w: 460, h: 220, c: "#FFFFFF" },
    { x: 280, y: 520, w: 960, h: 220, c: "#FFFFFF" },
  ];
  for (const card of cards) {
    ctx.fillStyle = card.c;
    ctx.fillRect(card.x, card.y, card.w, card.h);
  }
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 1;
  for (const card of cards) {
    ctx.strokeRect(card.x + 0.5, card.y + 0.5, card.w - 1, card.h - 1);
  }
}

function makeScreenshotPng(title: string, accent: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas not supported"));
      return;
    }
    drawAppFrame(ctx, title, accent);
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to render screenshot"));
        return;
      }
      blob.arrayBuffer().then((buffer) => resolve(new Uint8Array(buffer)));
    }, "image/png");
  });
}

export async function downloadScreenshots() {
  const dashboard = await makeScreenshotPng("Portfolio Overview", "#C28A78");
  const compliance = await makeScreenshotPng("Compliance Hub", "#EF4444");
  downloadBlob(
    "lethub-screenshots.zip",
    buildStoreZip([
      { name: "lethub-dashboard.png", data: dashboard },
      { name: "lethub-compliance.png", data: compliance },
    ])
  );
}