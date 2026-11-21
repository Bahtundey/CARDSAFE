# CARDSAFE

A production-quality gift card trading platform.

- **Frontend** — Next.js 14 (App Router), TypeScript, Tailwind CSS, Apollo Client
- **Backend** — Node.js, Express, TypeScript, GraphQL (Apollo Server), MongoDB (Mongoose)
- **Auth** — Single JWT-based system for both `USER` and `ADMIN` roles (roles come exclusively from MongoDB)
- **Media** — Cloudinary for all platform-uploaded images (secrets stay server-side)

## Repository layout

```
CARDSAFE/
├── backend/                 # Express + GraphQL + MongoDB
│   ├── src/
│   │   ├── config/          # env + database connection
│   │   ├── constants/       # role definitions
│   │   ├── graphql/         # typeDefs (.graphql) + resolvers + context
│   │   ├── middleware/      # requireAuth / requireRole / requireAdmin
│   │   ├── models/          # Mongoose models (User, Media)
│   │   ├── routes/          # REST upload endpoint (/api/upload)
│   │   ├── services/        # auth, user, cloudinary
│   │   ├── types/           # shared TypeScript types
│   │   └── index.ts         # server entry point
│   ├── scripts/             # optional seed + e2e smoke test
│   ├── .env.example
│   └── .env                 # gitignored
└── frontend/                # Next.js app
    ├── src/app/             # landing, login, register, dashboard
    ├── src/components/      # ui, auth, upload, dashboard
    ├── src/lib/             # apollo client, auth store/context, graphql ops
    ├── .env.example
    └── .env.local           # gitignored
```

## Prerequisites

- Node.js 18+
- A running MongoDB (local or Atlas)
- Cloudinary account (optional — uploads are disabled until configured)

## Backend setup

```bash
cd backend
cp .env.example .env          # fill in MONGODB_URI and JWT_SECRET/JWT_REFRESH_SECRET
npm install
npm run dev                   # starts on http://localhost:4000/graphql
```

Optional: create an admin account (role is stored in MongoDB, never set by the client):

```bash
SEED_ADMIN_NAME="Admin" \
SEED_ADMIN_EMAIL="admin@example.com" \
SEED_ADMIN_PASSWORD="a-strong-password" \
npm run seed
```

## Frontend setup

```bash
cd frontend
cp .env.example .env.local    # set NEXT_PUBLIC_API_URL to the backend URL
npm install
npm run dev                   # starts on http://localhost:3000
```

## Environment variables

All secrets live in `backend/.env` (never exposed to the browser). See `backend/.env.example`
for the full list: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`,
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `PORT`, `CORS_ORIGIN`.

The frontend only needs `NEXT_PUBLIC_API_URL` (the backend origin).

## Security model

- Roles are **never** accepted from the client. `register` always creates a `USER`; the
  backend loads the role from MongoDB on every authenticated request and enforces it with
  `requireAuth()` / `requireRole('ADMIN')` / `requireRole('USER')`.
- Access tokens are short-lived JWTs; refresh tokens are rotated, stored in an httpOnly
  cookie, and revoked server-side via a per-user `tokenVersion`.
- Passwords are hashed with bcrypt (12 rounds). Error messages never leak account state.
- Cloudinary API secrets never reach the browser — uploads flow through the backend.

## GraphQL surface

Auth (Batch 1) — queries: `me`, `users` (admin-only), `media`; mutations: `register`, `login`,
`logout`, `refreshToken`, `updateProfile`, `changePassword`.

Trading (Batch 2) — queries: `giftCardBrands`, `giftCardBrand`, `tradingRates`, `tradeEstimate`,
`myTrades`, `trade`, `allTrades` (admin); mutations: `createTrade`, `cancelTrade`,
`uploadGiftCardImage`, and admin-only `createGiftCardBrand`, `updateGiftCardBrand`,
`disableGiftCardBrand`, `updateTradingRate`, `approveTrade`, `rejectTrade`.

Finance (Batch 3) — queries: `wallet`, `transactions`, `myTrustTier`, `withdrawals`, `kycStatus`,
`notifications`, `unreadNotificationsCount`, and admin-only `allWithdrawals`, `allKyc`,
`adminDashboardStats`, `allUsers`, `allTransactions`, `auditLogs`; mutations: `requestWithdrawal`,
`cancelWithdrawal`, `submitKYC`, `markNotificationRead`, `markAllNotificationsRead`, and
admin-only `approveWithdrawal`, `completeWithdrawal`, `rejectWithdrawal`, `approveKYC`,
`rejectKYC`, `suspendUser`, `activateUser`, `adjustWallet`.

## Domain models

`User`, `Media`, `GiftCardBrand`, `GiftCard`, `Trade`, `TradingRate`, `Wallet`, `Transaction`,
`Withdrawal`, `KYC`, `AuditLog`, `Notification`.

The trade workflow: submit a card → `PENDING` → admin approves (`approveTrade`) → wallet credited
and transaction recorded, or admin rejects. Rates are stored in MongoDB per
(brand, country, card type, currency) and are editable without redeploying.

The finance layer: wallets track `balance`, `availableBalance` and `pendingBalance` (holds).
Withdrawals hold funds on request, settle them on admin completion, and release them on
reject/cancel. Trust tiers (`TIER_1/2/3`) are computed server-side from KYC status and gate
withdrawal limits. Every balance mutation creates a ledger transaction and a notification;
sensitive actions are written to the audit log.

## Testing

```bash
# backend typecheck
cd backend && npm run typecheck

# seed admin + sample brands/rates (optional)
cd backend && SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=... npm run seed

# end-to-end auth smoke test (requires the backend running)
cd backend && bash scripts/e2e-test.sh
```
