"use client";
export const money = (n: number) => { const v = Number(n) || 0; return (v < 0 ? "-$" : "$") + Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
export function Field({ label, hint, children, id }: { label: string; hint?: string; children: React.ReactNode; id: string }) {
  return <div><label htmlFor={id} className="block font-medium">{label}</label>{hint && <p id={id + "-hint"} className="text-sm text-navy/70">{hint}</p>}<div className="mt-1">{children}</div></div>;
}
export const inputCls = "w-full rounded-md border-2 border-navy/20 bg-white px-4 py-3 text-base outline-none focus:border-amber";
export function Notice({ kind = "info", children }: { kind?: "info" | "warn" | "ok"; children: React.ReactNode }) {
  const c = kind === "warn" ? "border-amber bg-amber-100" : kind === "ok" ? "border-sage bg-sage-100" : "border-navy/20 bg-white";
  return <div role={kind === "warn" ? "alert" : "status"} className={`rounded-xl border-2 p-4 text-base ${c}`}>{children}</div>;
}
export function DraftBadge() { return <span className="ml-2 rounded bg-rust px-2 py-0.5 align-middle font-sans text-xs font-semibold text-white">DRAFT · NOT LEGAL ADVICE</span>; }
export function MoneyGrid({ fields, value, onChange, prefix }: { fields: [string, string][]; value: Record<string, number>; onChange: (v: Record<string, number>) => void; prefix: string }) {
  return <div className="grid gap-3 sm:grid-cols-2">{fields.map(([k, l]) => (
    <Field key={k} id={`${prefix}-${k}`} label={l}><div className="flex items-center gap-2"><span aria-hidden className="text-navy/60">$</span>
      <input id={`${prefix}-${k}`} inputMode="decimal" type="number" min={0} step="0.01" value={value[k] || ""} placeholder="0" onChange={(e) => onChange({ ...value, [k]: Number(e.target.value) || 0 })} className={inputCls} /></div></Field>))}</div>;
}
