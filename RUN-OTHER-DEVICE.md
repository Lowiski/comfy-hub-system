# Run ComfyHub on another device

## Public link — works even when the LAN link fails

If the `192.168.1.x` link will not open, use a temporary public link instead. It works from any network, including cellular data.

On the host computer:

```powershell
.\start-public-link.ps1
```

It prints a link like:

```text
https://intl-phone-segment-magnificent.trycloudflare.com
```

Open that link on the phone or another laptop. The link also gets saved to `PUBLIC-LINK.txt`.

> The link changes every time the tunnel restarts. Do not share it with other people — anyone with the link can reach the app.

The `ComfyHub Watchdog` startup shortcut keeps ports `4000` and `4100` running. If the API stops, it restarts automatically within about 15 seconds. You can check or start everything manually with:

```powershell
.\ensure-comfyhub.ps1
```

## Option 1 — Use this computer as the host (easiest)

Both devices must be on the same Wi-Fi.

1. Install Node.js **22+** on this computer if it is not installed.
2. Run:

   ```powershell
   .\start-comfyhub.ps1
   ```

   On macOS/Linux:

   ```bash
   chmod +x ./start-comfyhub.sh
   ./start-comfyhub.sh
   ```

3. The script prints a LAN address like:

   ```text
   On same Wi-Fi: http://192.168.1.23:5173
   ```

4. Open that address on the other device.
5. If Windows Firewall asks, allow Node.js on **Private networks**.
6. Keep both terminal windows open while testing.

## Option 2 — Run the built app with only one server

The API also serves the built frontend from `front-end/dist`.

```powershell
cd server
npm install
npm run build
npm start
```

Then open `http://<THIS_COMPUTER_IP>:4000` on the other device.

> Run `npm run build` inside `front-end` first if `front-end/dist` is missing or old.

## Option 3 — Copy the project to the other device

Use `ComfyHub-Portable.zip` (or copy this folder). It includes `server/.env`, so the Neon database connection comes with it.

1. Extract the folder.
2. Install Node.js **22+**.
3. Run `start-comfyhub.ps1` (Windows) or `start-comfyhub.sh` (macOS/Linux).
4. The first run installs npm dependencies automatically.

If the API stays on the original computer but the frontend runs on the other device, create `front-end/.env.local` on the other device:

```env
VITE_API_PROXY_TARGET=http://<ORIGINAL_COMPUTER_IP>:4000
```

## Phone on the same Wi-Fi

1. Connect the phone to the **same Wi-Fi** as this computer. Turn off cellular data/VPN if the page will not load.
2. This computer’s LAN address is currently `192.168.1.2`.
3. Open this on the phone:

   ```text
   http://192.168.1.2:4000
   ```

   `http://192.168.1.2:5173` is only for the Vite development server.

4. If Windows blocks the connection, run this as Administrator on the computer:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\allow-phone-firewall.ps1
   ```

   It removes any `Node.js JavaScript Runtime` block rules, allows ports `5173` and `4000` from any device on the local network, and enables blocked-connection logging.

5. If the IP changes later, run `start-comfyhub.ps1` again and use the new LAN address it prints.

## Accounts

| Role | Login | Password |
|---|---|---|
| Student | `20240748` | `123456` on first login |
| Teacher | `20240941` | `123456` on first login |
| Admin | Open `/admin`, then `admin@test.com` | `admin123` |

First student/teacher login asks for birthday verification using the calendar, then forces a password reset. After that, use the new password you set. Student birthdays in the current seed data include `2006-01-17` (Louie) and `2006-03-10` (Mika). Teacher `20240941` uses `2005-09-29`.

Admin is a separate account. It manages accounts and shared resources only. It cannot chat, and private messages, appointments, and wellness entries are never shown to it.

## Before a real production deployment

- For GitHub + Vercel + Render deployment, follow `DEPLOY-GITHUB-VERCEL-RENDER.md`.
- Set `NODE_ENV=production` and `CLIENT_ORIGIN=https://your-final-domain.com` in `server/.env`; production will not start without it.
- In production, cookies use `SameSite=None; Secure`, so both the frontend and API must be HTTPS.
- Set `TRUST_PROXY=true` when the API is behind Cloudflare or another reverse proxy.
- Keep `DATABASE_URL` pointed at Neon. Production now refuses to start with a blank value unless `ALLOW_IN_MEMORY_DB=true` is explicitly set.
- Demo seeding is disabled in production by default. Enable it only for a controlled demo database with `SEED_DEMO_DATA=true`.
- Generate fresh `JWT_SECRET` and `CSRF_SECRET` values; never ship the sample secrets.
- Run `npm run build` in `front-end`, then start the API from `server` with all dependencies installed.
- Change the default admin password and force students/teachers to finish their first-login reset.
- Rate limiting is enabled for login, account recovery, refresh, bulk import, and message creation.
- The current school-ID + birthday reset flow is a classroom/demo design. For public use, replace it with a verified email/OTP reset flow.
- Mood check-ins and journal entries are still stored in the browser only. For shared devices or long-term records, move them behind authenticated server APIs.
- Do not expose `server/.env`, `ComfyHub-Portable.zip`, `PUBLIC-LINK.txt`, or a Cloudflare quick-tunnel URL publicly.

## Important

- `server/.env` contains the Neon connection string. Keep the copied folder/zip private.
- Do not use `allowedHosts: true` or the development CORS fallback in a public production deployment.
