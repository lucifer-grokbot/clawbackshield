// Minimal PDF writer on pdf-lib (pure JS, serverless-safe). Text is sanitized to WinAnsi.
import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";
const NAVY = rgb(0.075, 0.13, 0.235), RUST = rgb(0.65, 0.275, 0.12), GREY = rgb(0.35, 0.35, 0.4);
export const ascii = (s: string) => String(s ?? "").replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, "-").replace(/\u2026/g, "...").replace(/[\u2022\u25CF]/g, "*").replace(/[\u2192]/g, "->").replace(/\u2713/g, "[x]").replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");
export type Block = { h1?: string; h2?: string; p?: string; small?: string; box?: string; check?: string[] };
export async function buildPdf(title: string, blocks: Block[], footer: string) {
  const doc = await PDFDocument.create(); doc.setTitle(ascii(title)); doc.setProducer("ClawbackShield");
  const reg = await doc.embedFont(StandardFonts.Helvetica), bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const W = 612, H = 792, M = 54; let page: PDFPage = doc.addPage([W, H]); let y = H - M;
  const newPage = () => { page = doc.addPage([W, H]); y = H - M; };
  const wrap = (t: string, f: PDFFont, size: number, width: number) => {
    const out: string[] = [];
    for (const para of ascii(t).split("\n")) {
      let line = ""; for (const w of para.split(/ +/)) { const nx = line ? line + " " + w : w; if (f.widthOfTextAtSize(nx, size) > width && line) { out.push(line); line = w; } else line = nx; }
      out.push(line);
    } return out;
  };
  const write = (t: string, f: PDFFont, size: number, color = NAVY, indent = 0, gap = 4) => {
    for (const l of wrap(t, f, size, W - 2 * M - indent)) { if (y < M + 30) newPage(); page.drawText(l, { x: M + indent, y, size, font: f, color }); y -= size * 1.35; } y -= gap;
  };
  for (const b of blocks) {
    if (b.h1) { if (y < H - M - 10) newPage(); write(b.h1, bold, 20, NAVY, 0, 8); }
    if (b.h2) { if (y < M + 90) newPage(); y -= 6; write(b.h2, bold, 13, RUST, 0, 4); }
    if (b.p) write(b.p, reg, 10.5);
    if (b.small) write(b.small, reg, 9, GREY);
    if (b.box) { const lines = wrap(b.box, bold, 9.5, W - 2 * M - 16); const hh = lines.length * 13 + 12; if (y - hh < M + 30) newPage();
      page.drawRectangle({ x: M, y: y - hh + 10, width: W - 2 * M, height: hh, borderColor: RUST, borderWidth: 1.2, color: rgb(0.965, 0.886, 0.84) });
      y -= 2; for (const l of lines) { page.drawText(l, { x: M + 8, y, size: 9.5, font: bold, color: NAVY }); y -= 13; } y -= 10; }
    if (b.check) for (const c of b.check) write("[  ]  " + c, reg, 10.5, NAVY, 6, 1);
  }
  const pages = doc.getPages();
  pages.forEach((p, i) => { p.drawText(ascii(`${footer}   Page ${i + 1} of ${pages.length}`), { x: M, y: 26, size: 7.5, font: reg, color: GREY, maxWidth: W - 2 * M }); });
  return Buffer.from(await doc.save());
}
