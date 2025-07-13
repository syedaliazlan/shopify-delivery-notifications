
# Shopify Delivery Notifications App

A custom embedded Shopify app built with Remix and deployed on DigitalOcean, designed to send real-time delivery updates to customers using Twilio SMS integration.

---

## 🚀 Features

- Embedded Shopify admin UI via Shopify App Bridge
- Webhooks for:
  - `orders/create`
  - `app/uninstalled`
  - `fulfillments/update`
  - `app/scopes/update`
- Twilio SMS integration to notify customers of fulfillment events
- Secure OAuth flow using Shopify Remix Auth
- PostgreSQL database via Prisma
- Admin UI to view message history and settings

---

## 🔧 Tech Stack

- Remix (Node.js + Vite)
- Shopify Remix App Bridge
- Twilio Messaging API
- Prisma + PostgreSQL
- DigitalOcean App Platform

---

## 📂 Project Structure

```
app/
├── routes/                     # Remix route files
│   ├── app.jsx                 # Embedded app UI with nav menu
│   ├── index.jsx               # Shopify callback route
│   └── route.jsx               # App login screen (manual shop entry)
├── webhooks/                   # Shopify webhook handlers
│   ├── app.orders-create.jsx
│   ├── app.uninstalled.jsx
│   ├── fulfillments-update.jsx
│   └── scopes_update.jsx
├── prisma/                     # Prisma schema and DB setup
├── styles/                     # CSS modules
├── entry.server.jsx            # Remix server entry
├── root.jsx                    # App shell and layout
├── shopify.server.js           # Shopify API setup, token logic
├── db.server.js                # Database handler
public/                         # Static files
```

---

## ⚙️ Environment Variables

| Key | Description |
|-----|-------------|
| `SHOPIFY_API_KEY` | Your Shopify App API Key |
| `SHOPIFY_API_SECRET` | Shopify App Secret |
| `SCOPES` | App scopes, e.g. `read_orders,write_orders` |
| `SHOPIFY_APP_URL` | Public URL of the deployed app (no trailing slash) |
| `DATABASE_URL` | PostgreSQL connection string |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_MESSAGING_SERVICE_SID` | Messaging SID used to send SMS |
| `SHOPIFY_STORE_DOMAIN` | Shopify store domain (e.g. `yourstore.myshopify.com`) |
| `SHOPIFY_ACCESS_TOKEN` | Long-lived access token (optional, used in server API logic) |

---

## 🧪 Running Locally

```bash
npm install
npm run dev
```

For local Shopify auth to work, use [ngrok](https://ngrok.com/) or similar to expose your localhost.

```bash
ngrok http 3000
```

---

## 🛠️ Webhooks

Webhook handlers live in `app/webhooks/`. Each file is named after its topic:
- Orders → `/webhooks/app.orders-create.jsx`
- Fulfillment → `/webhooks/app.fulfillments-update.jsx`
- etc.

They are automatically registered after OAuth using the `shopify.server.js` logic.

---

## 🧪 Routes Summary

| Route | Purpose |
|-------|---------|
| `/` | Manual shop login UI |
| `/app` | Main embedded app UI |
| `/app/history` | View SMS logs from database |
| `/app/settings` | App configuration (placeholder) |
| `/auth/login` | Handles Shopify OAuth |
| `/webhooks/...` | Webhook endpoints handled dynamically |

---

## 🐳 Deployment (DigitalOcean)

1. Create a new App in App Platform
2. Connect GitHub repo and select branch
3. Add all ENV variables
4. Enable “Autodeploy” (optional)
5. Set build & run commands: Remix defaults work

> Ensure the `SHOPIFY_APP_URL` **matches** the DigitalOcean live URL

---

## 📜 License

MIT — Feel free to use and extend.

---

## ✍️ Author

Made with ❤️ by Ali Azlan  
[GitHub: syedaliazlan](https://github.com/syedaliazlan)
