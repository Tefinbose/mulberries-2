# Mulberries production domains

| Application | Public URL | Required process / web root |
| --- | --- | --- |
| Storefront | `https://demo.mulberries.shop` | Next.js frontend on port `3000` |
| API | `https://api.mulberries.shop` | Node/Express backend on port `5007` |
| Dashboard | `https://dashboard.mulberries.shop` | Admin Vite build (`dashboard/admin/dist`) |

## Production environment

Set these values on the VPS before restarting the backend:

```env
NODE_ENV=production
CLIENT_URL=https://demo.mulberries.shop
DASHBOARD_URL=https://dashboard.mulberries.shop
```

The frontend uses `frontend/.env.production`; it points to
`https://api.mulberries.shop/api` at build time. The dashboard has the same
production API fallback in its Axios configuration and can be overridden with
`VITE_API_URL` if necessary.

## DNS and reverse proxy checklist

Create three DNS `A` records pointing to the VPS public IP:

```text
demo       -> VPS_IP
api        -> VPS_IP
dashboard  -> VPS_IP
```

Configure HTTPS certificates for all three hostnames. Proxy `demo` to the
Next.js process on port `3000`, proxy `api` to the Express process on port
`5007`, and serve `dashboard/admin/dist` from the `dashboard` virtual host.

After updating the environment values, rebuild the two frontends and restart
the backend/Next.js processes:

```bash
cd frontend && npm ci && npm run build
cd ../dashboard/admin && npm ci && npm run build
cd ../../backend && npm ci
```

Use the process manager already installed on the VPS (for example PM2) to
restart the backend and frontend after their builds complete.

## Verification

```text
https://api.mulberries.shop/api/health
https://demo.mulberries.shop
https://dashboard.mulberries.shop
```

The API health endpoint must return a successful JSON response before testing
storefront search, checkout, and dashboard login.
