# GurNirmal Technology — Website

React + Vite + Three.js marketing site, with a serverless contact endpoint.

## Development

```bash
npm install
npm run dev
```

## Contact form

`src/components/sections/Contact.jsx` posts to the `/api/contact` serverless
function (`api/contact.js`), which sends an email via [Resend](https://resend.com)
to `amansprivate@gmail.com`.

Copy `.env.example` to `.env` and fill in `RESEND_API_KEY` for local testing
with `vercel dev`. Plain `vite dev` does not run the `/api` function.

## Deploying to Vercel

1. Push this repo to GitHub (already set up as `amanndeepak/companyGurnirmal`).
2. Import the repo in [Vercel](https://vercel.com/new) — it auto-detects Vite
   via `vercel.json`.
3. In the Vercel project's **Settings → Environment Variables**, add:
   - `RESEND_API_KEY` — from [resend.com/api-keys](https://resend.com/api-keys)
   - `RESEND_FROM_EMAIL` *(optional)* — e.g. `GurNirmal <noreply@gurnirmal.com>`,
     once a sending domain is verified in Resend. Until then the function
     falls back to Resend's shared `onboarding@resend.dev` sender.
4. Deploy.

### Connecting www.gurnirmal.com

In the Vercel project: **Settings → Domains → Add** → enter `gurnirmal.com`
and `www.gurnirmal.com`. Vercel will show the DNS records to add at your
domain registrar (an `A`/`ALIAS` record for the apex and a `CNAME` for `www`
pointing to `cname.vercel-dns.com`). Propagation is usually a few minutes to
a few hours.
