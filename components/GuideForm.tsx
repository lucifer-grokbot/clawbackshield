"use client";
import { useState } from "react";
export default function GuideForm() {
  const [email, setEmail] = useState(""); const [st, setSt] = useState<"idle" | "busy" | "ok">("idle"); const [err, setErr] = useState("");
  async function go(e: React.FormEvent) {
    e.preventDefault(); setSt("busy"); setErr("");
    const r = await fetch("/api/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role: "guide" }) }).catch(() => null);
    if (r?.ok) setSt("ok"); else { setErr((await r?.json().catch(() => null))?.error || "Something went wrong. Please try again."); setSt("idle"); }
  }
  if (st === "ok") return <div className="rounded-xl border-2 border-sage bg-sage-100 p-5" role="status"><p className="font-semibold">Your guide is ready.</p><a href="/waiver-guide.pdf" className="btn-primary mt-3" download>Download the PDF guide</a></div>;
  return <form onSubmit={go} className="flex flex-col gap-2 sm:flex-row">
    <label htmlFor="ge" className="sr-only">Email</label><input id="ge" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="flex-1 rounded-md border-2 border-navy/20 bg-white px-4 py-3" />
    <button disabled={st === "busy"} className="btn-primary justify-center">{st === "busy" ? "One moment…" : "Get the free PDF guide"}</button>
    {err && <p className="text-rust" role="alert">{err}</p>}</form>;
}
