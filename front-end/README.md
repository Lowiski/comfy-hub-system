# ComfyHub front-end

React + TypeScript + Tailwind UI for a school counseling portal.

## Run

```bash
npm run dev
```

Open `http://localhost:5173`.

School accounts are issued with a unique ID. The login page defaults to **Log in as Student**;
teachers switch to **Log in as Teacher**. Both use their school ID. First login requires birthday
verification and a new password. Admin access is hidden at `/admin`.

## Messages and deployment

Messages, conversations, notifications, and appointments are stored by the API in `../server`; there is no SMS/Twilio integration. The browser calls relative `/api` routes, which Vite proxies to the server during development. For a built deployment, run `npm run build` in this folder, then start the API from `../server` so it serves `front-end/dist`.

Do not run `npm run dev` or the Vite dev server as the public deployment. Use the Express server on port `4000`.

See `../server/README.md` for backend setup and `../RUN-OTHER-DEVICE.md` for LAN/public-link instructions.
