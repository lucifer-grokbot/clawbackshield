import { ImageResponse } from "next/og";
export const size = { width: 1200, height: 630 }; export const contentType = "image/png"; export const alt = "ClawbackShield";
export default function OG() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#FAF6EE", color: "#13213C" }}>
    <div style={{ fontSize: 36, color: "#A6461F", fontWeight: 700 }}>ClawbackShield</div>
    <div style={{ fontSize: 72, marginTop: 20, lineHeight: 1.1 }}>Got an SSA overpayment letter? Know your options in minutes.</div>
    <div style={{ fontSize: 28, marginTop: 30, color: "#22345A" }}>Plain-English summary · real deadlines · draft letter · Not legal advice</div></div>, size);
}
