# Vercel: see every branch push (including `v2-redesign`)

This repo uses **GitHub Actions + Vercel CLI** for deployments. Automatic deploys from the Vercel GitHub integration are **disabled** in `vercel.json` (`git.deploymentEnabled: false`) so you get **one** predictable pipeline: **push → Action → Vercel**.

## 1) Connect the correct GitHub repository

Your local `origin` is:

`https://github.com/godhulivyas-build/Sarthi.git` → repo slug **`Sarthi`** (spelling matters).

In Vercel → your project → **Settings → Git**, the connected repository must be **`godhulivyas-build/Sarthi`**, not a similarly named repo (e.g. **`Saarthi`** with an extra `a`). If it is wrong, **Disconnect** and reconnect to **`Sarthi`**.

## 2) One-time: add GitHub Actions secrets

On **GitHub** → this repository → **Settings → Secrets and variables → Actions → New repository secret**, add:

| Secret | Where to get it |
|--------|------------------|
| `VERCEL_TOKEN` | [Vercel → Account → Tokens](https://vercel.com/account/tokens) → Create |
| `VERCEL_ORG_ID` | Vercel project **Settings → General** (Team / Personal ID), or run `vercel link` locally and read `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Same page / same `project.json` as `projectId` |

After secrets exist, every **`git push`** triggers:

- **`main`** → **production** deployment (your production `.vercel.app` / custom domain).
- **Any other branch** (e.g. **`v2-redesign`**) → **preview** deployment. Open the **Deploy to Vercel** workflow run in GitHub → logs for the final `vercel deploy` line, or open **Vercel → Deployments** and select the latest **Preview** for that branch.

## 3) Environment variables on Vercel

In Vercel → **Settings → Environment Variables**, add keys used at build/runtime (e.g. `GEMINI_API_KEY`, `VITE_GOOGLE_MAPS_API_KEY`, `VITE_RAZORPAY_KEY_ID`) for **Preview** and **Production** as needed, then redeploy.

## 4) Optional: production URL should track `v2-redesign` only

If you want the **production** domain to follow **`v2-redesign`** instead of **`main`** (temporary while designing):

Vercel → **Settings → Git → Production Branch** → set to **`v2-redesign`**.

Switch it back to **`main`** when you are ready for real production.

## Troubleshooting

- **Workflow fails on `vercel pull`**: wrong `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`, or token lacks access to the team/project.
- **Old site, new commits**: wrong Git repo connected in Vercel (see step 1).
- **SPA 404 on refresh**: `vercel.json` includes a rewrite to `index.html` for client-side routes.
