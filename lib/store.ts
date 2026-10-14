// Key-value storage: Netlify Blobs in production (on Netlify), local JSON files in dev.
import { promises as fs } from "fs";
import path from "path";
const onNetlify = !!(process.env.NETLIFY || process.env.SITE_ID || process.env.NETLIFY_BLOBS_CONTEXT || (process.env.NEXT_PUBLIC_SITE_URL || "").startsWith("https"));
const dir = path.join(process.cwd(), "data", "kv");
const safe = (k: string) => k.replace(/[^a-zA-Z0-9._@-]/g, "_");
async function blobStore() { const { getStore } = await import("@netlify/blobs"); return getStore({ name: "clawbackshield", consistency: "strong" }); }
export async function kvGet<T>(key: string): Promise<T | null> {
  if (onNetlify) {
    const st = await blobStore();
    // get() on a missing key can hang inside the Next runtime; check metadata first.
    if (!(await st.getMetadata(key))) return null;
    return ((await st.get(key, { type: "json" })) as T) ?? null;
  }
  try { return JSON.parse(await fs.readFile(path.join(dir, safe(key) + ".json"), "utf8")); } catch { return null; }
}
export async function kvSet(key: string, val: unknown) {
  if (onNetlify) return void (await (await blobStore()).setJSON(key, val));
  await fs.mkdir(dir, { recursive: true }); await fs.writeFile(path.join(dir, safe(key) + ".json"), JSON.stringify(val, null, 2));
}
