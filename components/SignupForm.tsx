"use client";
import { useState } from "react";
export default function SignupForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState(""); const [role, setRole] = useState("caregiver");
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle"); const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setState("busy");
    const r = await fetch("/api/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }) });
    if (r.ok) { setState("ok"); window.location.href = "/checklist?welcome=1"; } else { setState("err"); setMsg((await r.json()).error); }
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="flex-1 rounded-full border border-navy/20 bg-white px-4 py-3 text-navy outline-none focus:border-amber" />
      <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-full border border-navy/20 bg-white px-4 py-3 text-navy">
        <option value="caregiver">I'm a caregiver</option><option value="beneficiary">I'm the beneficiary</option><option value="rep-payee">Rep payee</option><option value="advocate">Advocate</option>
      </select>
      <button disabled={state === "busy"} className={`rounded-full px-5 py-3 font-semibold ${dark ? "bg-amber text-navy" : "bg-navy text-cream"} hover:opacity-90`}>{state === "busy" ? "Sending…" : "Get the free checklist"}</button>
      {state === "err" && <p className="text-sm text-rust">{msg}</p>}
    </form>
  );
}
