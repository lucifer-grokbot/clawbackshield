# ClawbackShield

**Live:** https://clawbackshield.netlify.app

ClawbackShield helps people who got a benefits overpayment / clawback notice understand it and fight back. Upload or paste the notice, get a plain-English summary with deadlines, then build a full case: guided intake, repayment/waiver calculator, and a ready-to-send PDF appeal packet.

> Not legal advice. ClawbackShield gives information and document tools, not a lawyer.

## Features
- Notice analysis from PDF, image or pasted text: summary, amounts, deadlines, next steps
- Case builder: multi-step intake, calculator, review, generated PDF packet
- Deadline reminders by email (daily scheduled function)
- Passwordless magic-link sign-in
- Plans and checkout via Stripe (optional; mocked in dev)
- Rate-limited guest usage

## Stack
Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion · Netlify (hosting, Functions, Blobs) · OpenRouter (Gemini 2.5 Flash) · unpdf + pdf-lib · Resend · Stripe · jose (JWT sessions)

## Run locally
```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3000
```
For Blobs-backed storage like production, use `netlify dev`.

## Environment variables
| Name | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | AI analysis (required) |
| `AUTH_SECRET` | Signs session/magic-link tokens (required) |
| `NEXT_PUBLIC_SITE_URL` | Public base URL |
| `RESEND_API_KEY`, `EMAIL_FROM` | Email delivery (logs to console if unset) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PACK`, `STRIPE_PRICE_CAREGIVER` | Payments (optional) |
| `OWNER_EMAIL` | Owner notifications |
| `CRON_SECRET` | Protects the reminders endpoint |
| `DEMO_LOGIN_CODE` | Optional owner test login |
| `GUEST_DAILY_LIMIT` | Guest analyses per day |

Never commit real values. `.env*` files are git-ignored.

## License
MIT, see [LICENSE](LICENSE).
