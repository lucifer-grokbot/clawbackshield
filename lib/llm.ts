const URL = "https://openrouter.ai/api/v1/chat/completions";
export const MODEL = "google/gemini-2.5-flash";
export class LlmError extends Error { constructor(msg: string, public status: number) { super(msg); } }
export async function chat(messages: unknown[], schema: object | boolean = false): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new LlmError("The AI service is not configured on this server.", 500);
  let last = 0;
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-Title": "ClawbackShield" },
      body: JSON.stringify({ model: MODEL, messages, temperature: 0, seed: 7, reasoning: { effort: "none", exclude: true }, max_tokens: 6000, ...(schema === true ? { response_format: { type: "json_object" } } : schema ? { response_format: { type: "json_schema", json_schema: { name: "notice_analysis", strict: true, schema } } } : {}) }),
    });
    last = r.status;
    if (r.ok) { const d = await r.json(); return d.choices?.[0]?.message?.content ?? ""; }
    if (r.status === 400 && schema && schema !== true) { schema = true; continue; } // model lacks json_schema: fall back
    if (r.status === 429 || r.status >= 500) { await new Promise((s) => setTimeout(s, 1500 * (attempt + 1))); continue; }
    throw new LlmError(`AI service error (${r.status}).`, r.status);
  }
  throw new LlmError(last === 429 ? "Our AI reader is busy right now. Please wait a minute and try again." : "The AI service is temporarily unavailable. Please try again shortly.", last === 429 ? 429 : 503);
}

const str = { type: "string" }, nstr = { type: ["string", "null"] };
const obj = (p: Record<string, object>) => ({ type: "object", properties: p, required: Object.keys(p), additionalProperties: false });
export const SCHEMA = obj({
  summary: str, beneficiary: nstr, benefitType: nstr, amount: nstr, reason: str, noticeDate: nstr,
  keyDates: { type: "array", items: obj({ label: str, date: nstr, note: str }) },
  options: { type: "array", items: obj({ name: str, form: str, whenItFits: str, deadlineNote: str }) },
  recommendedOption: str, recommendedReason: str, letterType: { type: "string", enum: ["waiver", "reconsideration"] }, letter: str,
  questionsToAsk: { type: "array", items: str }, missingInfo: { type: "array", items: str },
});
