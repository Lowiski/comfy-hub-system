# Deploy ComfyHub — GitHub + Vercel + Render

Use this exact order:

1. prepare the repo
2. deploy the API on Render
3. deploy the frontend on Vercel
4. connect them with environment variables
5. verify

> Do **not** upload `server/.env`, `ComfyHub-Portable.zip`, `PUBLIC-LINK.txt`, or `cloudflared.exe`.
> A `.gitignore` has already been added to keep them out of GitHub.

---

## 1. Prepare GitHub

### 1.1 Create an empty GitHub repository

On GitHub:

- click **New repository**
- name it, for example `comfyhub`
- keep it **empty** — do not add README, license, or `.gitignore`
- copy the repository URL

### 1.2 Initialize and push from this computer

Open PowerShell in:

```powershell
cd C:\Users\User\OneDrive\Desktop\Comfy
```

Run:

```powershell
git init
git config user.name "Your Name"
git config user.email "you@example.com"
git add .
git commit -m "Deploy ComfyHub"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/comfyhub.git
git push -u origin main
```

If the remote already exists, replace the `git remote add` line with:

```powershell
git remote set-url origin https://github.com/YOUR_USERNAME/comfyhub.git
```

Verify secrets are ignored:

```powershell
git check-ignore -v server\.env ComfyHub-Portable.zip PUBLIC-LINK.txt
```

You should see matching ignore rules. If `server/.env` is not ignored, stop and fix it before pushing.

---

## 2. Generate two fresh backend secrets

Run this twice in PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

You need two **different** values:

```text
JWT_SECRET=<paste-first-value>
CSRF_SECRET=<paste-second-value>
```

They must be at least 32 characters. Changing them logs everyone out, which is fine for a fresh deployment.

---

## 3. Deploy the backend on Render

### 3.1 Create the Web Service

1. Go to <https://dashboard.render.com>
2. Click **New + → Web Service**
3. Connect your GitHub repository
4. Configure:

| Setting | Value |
|---|---|
| Name | `comfyhub-api` |
| Root Directory | `server` |
| Runtime | `Node` |
| Branch | `main` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |
| Plan | Free is OK; Starter avoids cold starts |

> Use `npm install`, not `npm ci --omit=dev`. The migration command needs `drizzle-kit`.

### 3.2 Add Render environment variables

In the Render service, open **Environment** and add:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | your Neon pooled connection string, ending with `?sslmode=require` |
| `JWT_SECRET` | first random value from step 2 |
| `CSRF_SECRET` | second random value from step 2 |
| `CLIENT_ORIGIN` | your Vercel origin, e.g. `https://comfyhub.vercel.app` |
| `TRUST_PROXY` | `true` |
| `SEED_DEMO_DATA` | `false` |
| `ALLOW_IN_MEMORY_DB` | `false` |

Important:

- `CLIENT_ORIGIN` must be the **exact frontend origin** — no trailing slash, no `/api`, no wildcards.
- Do not set `PORT`; Render injects it automatically.
- If you need several origins later, separate them with commas:
  `https://comfyhub.vercel.app,https://www.yourdomain.com`

### 3.3 Run database migrations

If you are reusing your current Neon database, the tables already exist, but running migrations is still safe.

In Render, add a **Pre Deploy Command**:

```bash
npm run db:migrate
```

Alternatively, run it once from your computer:

```powershell
cd C:\Users\User\OneDrive\Desktop\Comfy\server
$env:DATABASE_URL="postgresql://user:password@host.neon.tech/db?sslmode=require"
npm.cmd run db:migrate
```

### 3.4 Demo accounts on a brand-new Neon database

Production seeding is disabled by default. If you want the demo accounts on a fresh database:

1. set `SEED_DEMO_DATA=true` temporarily
2. deploy/restart the API once
3. confirm login works
4. set `SEED_DEMO_DATA=false` and redeploy again

If you reuse the current Neon database, skip this.

### 3.5 Verify the API

After Render finishes deploying, open:

```text
https://YOUR-RENDER-SERVICE.onrender.com/api/health
```

You should see:

```json
{"success":true,"data":{"ok":true,"database":"neon","environment":"production"}}
```

Copy the Render base URL. You need it for Vercel:

```text
https://YOUR-RENDER-SERVICE.onrender.com
```

---

## 4. Deploy the frontend on Vercel

### 4.1 Import the repository

1. Go to <https://vercel.com/new>
2. Import the same GitHub repository
3. Configure:

| Setting | Value |
|---|---|
| Root Directory | `front-end` |
| Framework Preset | `Vite` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

A `front-end/vercel.json` file is already included so direct links like `/admin`, `/login`, and `/counselor` reload correctly. It serves real files first, then falls back to `index.html`, so `/assets/*.js` is never replaced by the HTML shell.

### 4.2 Add the frontend environment variable

Before deploying, add:

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://YOUR-RENDER-SERVICE.onrender.com/api` |

No trailing slash. Use the **Render** URL, not the Vercel URL. The `/api` suffix is required; the client now also appends it automatically if you forget it.

This is baked into the build by Vite. If you change it later, you must redeploy the frontend.

### 4.3 Deploy

Click **Deploy**. Then open the Vercel URL, for example:

```text
https://comfyhub.vercel.app
```

---

## 5. Go back and finalize Render CORS

After Vercel gives you the final URL, make sure Render has:

```text
CLIENT_ORIGIN=https://YOUR-VERCEL-APP.vercel.app
```

Then restart/redeploy the Render service if you changed it.

Cross-site cookies are already handled in production:

- `Secure`
- `SameSite=None`
- `withCredentials: true`
- CORS `credentials: true`

Both sides must be HTTPS.

---

## 6. Verify the full flow

### API health

```powershell
curl.exe https://YOUR-RENDER-SERVICE.onrender.com/api/health
```

Expected:

```json
{"success":true,"data":{"ok":true,"database":"neon","environment":"production"}}
```

### Frontend

Open the Vercel URL and check:

1. landing page loads
2. `/login` loads
3. `/admin` shows **Admin log in**
4. admin login works with your deployed admin credentials
5. open DevTools → Network:
   - `/api/auth/csrf` → `200`
   - `/api/auth/login` → `200`
   - requests go to the Render domain
   - responses include `Access-Control-Allow-Credentials: true`

### Messaging

Test with one student account and one counselor account:

1. student sends a message
2. counselor sees it within about 2.5 seconds
3. unread badge updates
4. refresh the page and confirm the message is still there

---

## 7. Troubleshooting

| Problem | Fix |
|---|---|
| CORS error in console | `CLIENT_ORIGIN` must match the Vercel origin. The backend now ignores trailing slashes, but `https://app.vercel.app` is preferred over `https://app.vercel.app/`. Redeploy Render after changing it. |
| Login returns 401 or cookies are not saved | Confirm `VITE_API_BASE_URL` ends with `/api`, both sites are HTTPS, and the latest backend with `SameSite=None` is deployed. |
| `/admin` gives 404 after refresh | Confirm `front-end/vercel.json` was committed and the frontend rebuilt. |
| Frontend is a plain white page | Root Directory must be `front-end`. Confirm `/assets/*.js` returns JavaScript, not `text/html`; recommit the updated `vercel.json` and redeploy. |
| UI shows for 1 second, then disappears | `VITE_API_BASE_URL` is wrong. It must be the Render URL, not the Vercel URL, and must resolve to `/api`. Check the Console for `BAD_API_RESPONSE`, fix the variable, then redeploy Vercel. |
| Render first request is very slow | Free plan cold start. Upgrade to Starter or keep polling active. |
| Database errors | Check the Neon `DATABASE_URL`, use the pooled host, and run `npm run db:migrate`. |
| Demo accounts missing | Set `SEED_DEMO_DATA=true` once on a fresh Neon database, then set it back to `false`. |
| Login rate limited (429) | Wait a minute. Rate limiting is enabled. |

---

## 8. Recommended custom domains

The default `*.vercel.app` → `*.onrender.com` setup works in Chrome because cookies use `SameSite=None`.

For the most reliable setup, use custom domains under the same parent domain:

```text
https://comfyhub.yourschool.edu     → Vercel frontend
https://comfyhub-api.yourschool.edu → Render backend
```

Then set:

```text
VITE_API_BASE_URL=https://comfyhub-api.yourschool.edu/api
CLIENT_ORIGIN=https://comfyhub.yourschool.edu
```

Add both domains in Vercel and Render before switching.

---

## 9. Before sharing publicly

These are still demo/audit items, not deployment blockers for a controlled classroom demo:

- change the default admin password
- rotate any passwords that were shared for testing
- `xlsx@0.18.5` still has a high advisory with no npm fix
- school ID + birthday password reset is a demo design; use email/OTP for real public accounts
- mood/journal are still browser-local
- do not commit or share `server/.env` or `ComfyHub-Portable.zip`
