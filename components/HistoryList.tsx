"use client";
import type { HistoryItem } from "@/lib/users";
export default function HistoryList({ items }: { items: HistoryItem[] }) {
  return <ul className="mt-4 space-y-3">{items.map((h) => { const r = h.result as { summary?: string; letter?: string };
    return <li key={h.id} className="card p-5"><details><summary className="cursor-pointer font-semibold">{new Date(h.at).toLocaleDateString()} · {h.amount || "Amount not stated"} · {h.recommendedOption}</summary>
      <p className="mt-3 text-navy/85">{r.summary}</p><a href={`/cases/new?from=${h.id}`} className="btn-primary mt-3 !py-2">Start a waiver case from this</a>{r.letter && <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-cream p-4 font-sans text-base">{r.letter}</pre>}</details></li>; })}</ul>;
}
