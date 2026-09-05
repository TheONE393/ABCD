# Cloudflare Pages Deployment Guide

This guide walks you through deploying the **Microbial Biology Lab Website** to [Cloudflare Pages](https://pages.cloudflare.com/), connecting your Git repository, configuring live Google Sheets data and Cloudflare Turnstile, and attaching a custom domain.

---

## Architecture Overview

- **Framework**: Astro (Static Site Generation - SSG)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite`
- **Build Output**: `dist/`
- **Serverless Functions**: `functions/api/contact.js` (Cloudflare Pages natively mounts files inside the `functions/` directory without needing an SSR adapter)
- **Security & Cache Headers**: `public/_headers` (automatically copied to `dist/_headers` on build)

---

## 1. Cloudflare Pages Build Settings

When creating a new project in the [Cloudflare Dashboard](https://dash.cloudflare.com/):

| Setting                    | Recommended Value | Notes                                                |
| :------------------------- | :---------------- | :--------------------------------------------------- |
| **Framework Preset**       | `Astro`           | Cloudflare detects Astro automatically               |
| **Build Command**          | `npm run build`   | Runs Astro static site compiler                      |
| **Build Output Directory** | `dist`            | Destination for compiled HTML, CSS, JS, and sitemaps |
| **Root Directory**         | `/`               | Leave blank or default                               |
| **Node.js Version**        | `22`              | Configured automatically via `.nvmrc` in repo root   |

---

## 2. Step-by-Step Deployment Walkthrough

### Step 1: Push Repository to GitHub or GitLab

Ensure your local branch is committed and pushed to your remote repository:

```bash
git add .
git commit -m "feat: complete website ready for deployment"
git push origin main
```

### Step 2: Connect Repo in Cloudflare Pages

1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, click **Workers & Pages** > **Overview** > **Create application**.
3. Select the **Pages** tab and click **Connect to Git**.
4. Authorize Cloudflare to access your GitHub or GitLab repository.
5. Select the repository and click **Begin setup**.

### Step 3: Configure Build Settings & Environment Variables

1. Under **Project name**, enter a name (e.g. `microbial-biology-lab`). This will create an initial URL like `https://microbial-biology-lab.pages.dev`.
2. Under **Build settings**, verify:
   - **Framework preset**: `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. Expand **Environment variables** and add the keys detailed below.
4. Click **Save and Deploy**.

---

## 3. Configuring Live Google Sheets Data

The lab website automatically populates Team members, Publications, and News entries during build time by reading CSV data published from Google Sheets.

### Obtaining the CSV URLs:

For each of your 3 Google Sheets:

1. Open the Google Sheet in your browser.
2. Click **File** > **Share** > **Publish to web**.
3. Under the **Link** tab, select the specific sheet tab (e.g. `Team`, `Publications`, or `News`).
4. In the format dropdown, change _Web page_ to **Comma-separated values (.csv)**.
5. Click **Publish** (or accept the confirmation dialog).
6. Copy the resulting URL. It should look like:
   ```
   https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub?gid=0&single=true&output=csv
   ```

### Adding to Cloudflare Pages:

In Cloudflare Dashboard > **Workers & Pages** > **[Your Project]** > **Settings** > **Environment variables**:

| Variable Name            | Description                    | Example Value                                                                           |
| :----------------------- | :----------------------------- | :-------------------------------------------------------------------------------------- |
| `SHEET_TEAM_URL`         | Published CSV for Team Members | `https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub?gid=0&single=true&output=csv` |
| `SHEET_PUBLICATIONS_URL` | Published CSV for Publications | `https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub?gid=1&single=true&output=csv` |
| `SHEET_NEWS_URL`         | Published CSV for Lab News     | `https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub?gid=2&single=true&output=csv` |

_(Alternative: You can also edit the fallback values directly in [`src/lib/fetchSheetData.js`](file:///e:/ABCD/src/lib/fetchSheetData.js).)_

> **Tip for Automatic Re-builds on Sheet Updates**:
> In Cloudflare Pages, go to **Settings** > **Builds & deployments** > **Deploy hooks** and create a Webhook URL. You can trigger this webhook via a simple Google Apps Script `onEdit` trigger or a GitHub Action cron job whenever someone edits the spreadsheet.

---

## 4. Configuring Cloudflare Turnstile (Contact Form)

Cloudflare Turnstile protects your contact form against bots without making users solve image captchas.

### Step 1: Create a Turnstile Widget

1. In Cloudflare Dashboard, click **Turnstile** in the left sidebar.
2. Click **Add widget**.
3. **Widget name**: `Lab Contact Form`
4. **Domains**:
   - Add your Cloudflare pages domain: `*.pages.dev`
   - Add `localhost` (for local development)
   - Add your custom domain once purchased (e.g. `lab.university.edu`)
5. **Widget Mode**: _Managed_ (recommended).
6. Click **Create**.

### Step 2: Copy Keys to Cloudflare Pages Environment Variables

Cloudflare will display two keys:

- **Site Key** (Public): Safe to expose in HTML.
- **Secret Key** (Private): Must be kept secure.

Go to your Pages project > **Settings** > **Environment variables**:

| Variable Name               | Environment          | Value                            | Type                   |
| :-------------------------- | :------------------- | :------------------------------- | :--------------------- |
| `PUBLIC_TURNSTILE_SITE_KEY` | Production & Preview | `0x4AAAAAA...` (Your Site Key)   | Plain text             |
| `TURNSTILE_SECRET_KEY`      | Production & Preview | `0x4AAAAAA...` (Your Secret Key) | **Secret (Encrypted)** |

---

## 5. (Optional) Email Delivery for Contact Form

Inquiries submitted through `/contact` are processed serverless by `functions/api/contact.js`.

To automatically email submissions to your inbox:

1. Sign up for a free transactional email provider such as [Resend](https://resend.com) (free tier allows 3,000 emails/month).
2. Generate an API Key in Resend.
3. In Cloudflare Pages > **Settings** > **Environment variables**, add:
   - `RESEND_API_KEY` (Secret): `re_123456789...`
   - `LAB_CONTACT_EMAIL` (Plain text): `pi-lastname@university.edu`
4. In [`functions/api/contact.js`](file:///e:/ABCD/functions/api/contact.js), uncomment Section 4 (the Resend fetch block).

---

## 6. Attaching a Custom Domain

Once your lab domain (e.g. `thelastnamelab.org` or a university subdomain like `microbiology.university.edu`) is ready:

### If Your Domain DNS is Managed by Cloudflare:

1. In Cloudflare Dashboard, go to **Workers & Pages** > **[Your Project]** > **Custom domains**.
2. Click **Set up a custom domain**.
3. Enter your domain (e.g. `thelastnamelab.org` or `www.thelastnamelab.org`).
4. Click **Continue**. Cloudflare automatically adds the necessary CNAME/DNS records and provisions an SSL certificate.

### If Your Domain is Managed by an External Registrar or University DNS:

1. In Cloudflare Pages > **Custom domains**, enter your custom domain and click **Continue**.
2. Cloudflare will provide a CNAME target (e.g. `microbial-biology-lab.pages.dev`).
3. Add a **CNAME record** in your external DNS provider:
   - **Name / Host**: `subdomain` (or `@` if supported by DNS provider)
   - **Target / Points to**: `<your-project>.pages.dev`
4. Once DNS propagates (typically 5–30 minutes), Cloudflare automatically issues an SSL certificate.

### Update Site URL Environment Variable:

Once your custom domain is live:

1. In Cloudflare Pages > **Settings** > **Environment variables**, update:
   - `PUBLIC_SITE_URL` = `https://your-custom-domain.org`
2. Update `public/robots.txt` and `astro.config.mjs` if you prefer hardcoding instead of env vars:
   ```txt
   Sitemap: https://your-custom-domain.org/sitemap-index.xml
   ```
3. Trigger a rebuild by clicking **Deployments** > **Retry deployment** to regenerate the sitemap and canonical URLs with your new domain name.

---

## 7. Local Testing Quick Reference

To test everything locally using the exact Cloudflare runtime:

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Run Astro dev server
npm run dev

# 4. Build and test static output
npm run build
npm run preview
```
