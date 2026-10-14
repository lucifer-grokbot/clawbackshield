// Netlify scheduled function: daily at 03:30 UTC (9:00 AM IST) trigger the deadline reminder job.
export default async () => {
  const base = process.env.URL; const sec = process.env.CRON_SECRET;
  if (!base || !sec) return new Response("not configured", { status: 200 });
  const r = await fetch(`${base}/api/cron/reminders`, { headers: { authorization: `Bearer ${sec}` } });
  console.log("[reminders]", r.status, await r.text());
  return new Response("ok");
};
export const config = { schedule: "30 3 * * *" };
