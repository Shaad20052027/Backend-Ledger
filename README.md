# Backend Ledger

A backend-only **double-entry ledger system** built with Node.js, Express, and MongoDB. It models accounts, transactions, and immutable ledger entries the way a real financial ledger works — every transfer is recorded as a matching debit and credit, and account balances are always derived from the ledger, never stored directly.

**Live:** [backend-ledger-kk2y.onrender.com](https://backend-ledger-kk2y.onrender.com)

## Features

- **JWT-based authentication** — register, login, logout, with token blacklisting on logout
- **Accounts** — each user can hold one or more accounts (`ACTIVE`, `FROZEN`, `CLOSED`), each with a currency
- **Double-entry ledger** — every transaction writes one `DEBIT` and one `CREDIT` ledger entry; ledger entries are immutable (updates/deletes are blocked at the schema level)
- **Balance derivation** — account balance is computed on demand from the ledger (`credits - debits`) via a MongoDB aggregation, not stored as a mutable field
- **Idempotent transfers** — every transaction requires an `idempotencyKey` so retries never double-process a transfer
- **MongoDB transactions/sessions** — transfers use a session so the debit + credit ledger entries are written atomically
- **Email notifications** — registration and transaction emails via Nodemailer (Gmail OAuth2)

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | MongoDB + Mongoose |
| Auth | JWT (`jsonwebtoken`), `bcryptjs` for password hashing |
| Email | Nodemailer (Gmail OAuth2) |
| Dev | Nodemon |

## Project Structure

```
Backend-Ledger/
├── server.js                     # Entry point — connects to DB, starts the server
├── src/
│   ├── app.js                    # Express app setup & route mounting
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── account.controller.js
│   │   └── transaction.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT auth + system-user auth guards
│   ├── models/
│   │   ├── user.model.js
│   │   ├── account.model.js
│   │   ├── transaction.model.js  # Transaction schema
│   │   ├── ledger.model.js       # Immutable ledger entry schema
│   │   └── blackList.model.js    # Blacklisted (logged-out) tokens, TTL-indexed
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── account.routes.js
│   │   └── transaction.routes.js
│   └── services/
│       └── email.service.js
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A MongoDB instance (local or Atlas)
- A Gmail account with OAuth2 credentials (only needed for email notifications)

### Installation

```bash
git clone https://github.com/Shaad20052027/Backend-Ledger.git
cd Backend-Ledger
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail_address
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
REFRESH_TOKEN=your_google_oauth_refresh_token
```

### Run

```bash
# development (auto-restart with nodemon)
npm run dev

# production
npm start
```

The server starts on `http://localhost:3000`.

## API Overview

### Auth — `/api/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create a new user account |
| POST | `/login` | Log in and receive a JWT (set as a cookie) |
| POST | `/logout` | Blacklist the current token |

### Accounts — `/api/accounts` (protected)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create a new ledger account for the logged-in user |
| GET | `/` | List all accounts for the logged-in user |
| GET | `/balance/:accountId` | Get the derived balance of an account |

### Transactions — `/api/transactions` (protected)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Transfer funds between two accounts (idempotent) |
| POST | `/initial-funds` | Credit a user account from the system account (system-user only) |

Example transfer request:

```json
{
  "fromAccount": "<accountId>",
  "toAccount": "<accountId>",
  "amount": 500,
  "idempotencyKey": "unique-request-id"
}
```

## How the Ledger Works

Instead of storing a mutable `balance` field on the account, every transfer writes two immutable entries to the `ledger` collection:

1. A `DEBIT` entry against the sender's account
2. A `CREDIT` entry against the receiver's account

An account's balance is then always the sum of its credits minus its debits, computed live via aggregation. This keeps the system auditable — nothing overwrites history, and every rupee/dollar movement is traceable back to a transaction.

## License

ISC
