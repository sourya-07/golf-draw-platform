# ⛳ Digital Heroes Golf Club
The next-generation subscription web platform combining golf performance tracking, transparent charity fundraising, and an exciting monthly prize draw. 

**React 18** · **Node.js** · **Supabase** · **Stripe**

---

## 🤔 What Does This App Do?
Digital Heroes Golf Club is designed to feel highly premium, moving away from clichéd golf website aesthetics. It introduces a unique gameplay loop:

1. **Subscribe** to the platform to unlock the dashboard.
2. **Track Scores** by entering your latest Stableford golf scores.
3. **Monthly Draws** automatically use your latest 5 scores as your lottery numbers for cash prizes!
4. **Choose a Charity** to support, with a predefined percentage of your fee going directly to them.

## ✨ Features

| Feature | Details |
| --- | --- |
| **Subscription Engine** | Robust monthly and yearly plans powered by Stripe. |
| **Score Experience** | Simple rolling log of your 5 most recent Stableford scores (1-45). |
| **Draw & Reward Engine** | Algorithmic and random matching for monthly prize pools, including jackpot rollovers. |
| **Charity Integration** | Member-directed contribution model supporting a directory of featured charities. |
| **Admin Portal** | Complete management console for users, draws, charity listings, and winner verification. |
| **Winner Verification** | Proof-upload system with manual admin payout approval. |

## 🔑 Admin Credentials
For evaluation and testing purposes, use the following credentials to access the Admin Portal:
- **Email:** `t1@gmail.com`
- **Password:** `12345678`

## 📋 Prerequisites
Before you begin local development, make sure you have:
- [Node.js](https://nodejs.org/en/) (v18+)
- A [Supabase](https://supabase.com/) project (Database & Auth)
- A [Stripe](https://stripe.com/) account (Payments & Webhooks)
- A [Resend](https://resend.com/) API key (Transactional Emails)

## 🚀 Quick Start

**Step 1: Clone and enter the project**
```bash
git clone https://github.com/sourya-07/golf-draw-platform.git
cd golf-draw-platform
```

**Step 2: Database Setup**
Execute the provided database schema in your Supabase SQL Editor:
```bash
# Run the contents of this file in your Supabase dashboard
cat supabase_schema.sql
```

**Step 3: Start the Backend**
```bash
cd server
npm install
cp .env.example .env
# Fill in your .env credentials including Stripe, Supabase, and Resend keys!
npm run dev
```
*The API will start on port 5001.*

**Step 4: Start the Frontend**
```bash
cd ../client
npm install
cp .env.example .env
# Fill in your VITE_API_BASE_URL and VITE_SUPABASE_* keys
npm run dev
```
*Open your browser to `http://localhost:5173` — you're ready to go! 🎉*

## 📖 How to Use the App

**For Users**
- Go to the homepage and click **Subscribe**. You will go through the Stripe checkout.
- Once subscribed, land in the **Clubhouse Dashboard**.
- Enter your latest golf score and date. Your oldest score automatically falls off after 5 entries.
- Select your charity in the Charities directory.

**For Admins**
- Log in with the Admin Credentials provided above.
- Click **Admin** in the top navigation bar.
- Manage users, simulate and publish monthly draws, verify winning proofs, and monitor subscription conversion rates in real-time.

## 📁 Project Structure

```text
.
├── client/                     # Frontend React SPA (Vite)
│   ├── src/pages/              # User-facing and Admin views
│   ├── src/components/         # Reusable UI & Gate logic (AdminGate, SubscriptionGate)
│   ├── src/services/           # API and Supabase client
│   └── src/styles/             # Custom SCSS Design System
├── server/                     # Backend API (Express.js)
│   ├── controllers/            # Logic for auth, payments, draws, charities
│   ├── services/               # Stripe webhook handling, Emails, Draw algorithms
│   ├── middleware/             # Admin checking & JWT auth verification
│   └── server.js               # Entry point
├── supabase_schema.sql         # Full PostgreSQL structure & RLS
├── render.yaml                 # Backend deployment configuration
└── vercel.json                 # Frontend deployment configuration
```

## 🏗️ Architecture & Deployment

**Frontend:** Deployed on Vercel. Configured as a Single Page Application with dynamic routing and TanStack React Query for state management. Uses standard JWT authorization headers.

**Backend:** Deployed on Render. Handles sensitive logic including Stripe Webhook verification, Supabase Service Role database modifications, completely isolated from frontend exposure.

**Database:** Supabase PostgreSQL with rigorous Row Level Security (RLS) policies.

## ⚙️ Configuration Reference

**Server (`server/.env`)**
| Variable | Description |
| --- | --- |
| `PORT` | Backend port (default 5001) |
| `CLIENT_URL` | Frontend URL for CORS and redirects |
| `NODE_ENV` | Environment (development | production) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase bypass key for admin actions |
| `STRIPE_SECRET_KEY` | Stripe back-end key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `JWT_SECRET` | Secret used strictly for fallback server side signing |
| `PRIZE_CONTRIBUTION_PER_SUBSCRIBER` | Amount allocated to prize pools (default 2) |

**Client (`client/.env`)**
| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Deployed backend URL |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public Supabase access key |

## 🧪 Testing Webhooks Locally
To test Stripe payments locally without deploying to Render, forward webhooks using the Stripe CLI:
```bash
stripe listen --forward-to localhost:5001/api/payments/webhook
```
*Copy the resulting `whsec_...` key into `server/.env`.*

## 🛣️ Roadmap
- User profile avatars and settings updates.
- Stripe Customer Portal integration for easy cancellation.
- Charity deep-dive pages and impact metrics.
- Automated monthly CRON jobs for draw execution.

## 📄 License
MIT