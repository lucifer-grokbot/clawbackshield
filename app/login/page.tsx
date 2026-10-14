"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
function Login() {
  const sp = useSearchParams(); const [email, setEmail] = useState(""); const [st, setSt] = useState<"idle" | "busy" | "sent" | "err" | "soon">("idle"); const [dev, setDev] = useState<string>();
  const [code, setCode] = useState(""); const [cst, setCst] = useState<string | null>(null);
  async function demo(e: React.FormEvent) {
    e.preventDefault(); setCst("busy");
    const r = await fetch("/api/auth/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, next: sp.get("next") || "/account" }) });
    const d = await r.json().catch(() => ({})); if (r.ok) window.location.href = d.next || "/account"; else setCst(d.error || "That test code isn't valid.");
  }
  async function go(e: React.FormEvent) {
    e.preventDefault(); setSt("busy");
    const r = await fetch("/api/auth/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, next: sp.get("next") || "/account" }) });
    const d = await r.json(); if (r.ok && d.emailOff) setSt("soon"); else if (r.ok) { setSt("sent"); setDev(d.devLink); } else setSt("err");
  }
  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <p className="eyebrow">Your account</p>
      <h1 className="mt-2 font-serif text-4xl font-medium">Sign in or create an account</h1>
      <p className="mt-3 text-navy/80">No password needed. We&apos;ll email you a secure link.</p>
      {sp.get("error") && <p className="mt-4 rounded-lg bg-rust-100 p-3">That link expired or was already used. Request a new one.</p>}
      {st === "soon" ? (
        <div className="card mt-6 p-6" role="status"><p className="font-semibold">Email sign-in opens soon</p><p className="mt-1 text-navy/80">We&apos;re finishing email sign-in, so no link was sent. You can still <a className="underline" href="/analyze">read a notice as a guest</a> right now.</p></div>
      ) : st === "sent" ? (
        <div className="card mt-6 p-6"><p className="font-semibold">Check your inbox</p><p className="mt-1 text-navy/80">We sent a sign-in link to {email}. It works for 20 minutes.</p>
          {dev && <p className="mt-3 text-sm">Dev mode (no email provider): <a className="underline" href={dev}>open sign-in link</a></p>}</div>
      ) : (
        <form onSubmit={go} className="mt-6 space-y-3">
          <label htmlFor="em" className="block font-medium">Email address</label>
          <input id="em" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border-2 border-navy/20 bg-white px-4 py-3" />
          <button disabled={st === "busy"} className="btn-primary w-full justify-center">{st === "busy" ? "Sending…" : "Email me a sign-in link"}</button>
          {st === "err" && <p className="text-rust">Please check the email address and try again.</p>}
        </form>
      )}
      <details className="mt-8 text-base"><summary className="cursor-pointer text-navy/70">Have a test code?</summary>
        <form onSubmit={demo} className="mt-3 space-y-2">
          <label htmlFor="tc" className="block font-medium">Test code</label>
          <input id="tc" type="password" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded-md border-2 border-navy/20 bg-white px-4 py-3" />
          <button disabled={cst === "busy" || !code} className="btn-primary w-full justify-center">{cst === "busy" ? "Signing in…" : "Sign in with test code"}</button>
          {cst && cst !== "busy" && <p className="text-rust">{cst}</p>}
        </form></details>
    </div>
  );
}
export default function Page() { return <Suspense><Login /></Suspense>; }
