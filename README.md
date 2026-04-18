# Digital Heroes Golf Club

A modern golf performance tracker built for the socially conscious. Track your scores, support leading charities, and enter our monthly prize draw.

## Features

- **Golf Score Tracking**: Log up to 5 scores per month and view your performance statistics.
- **Charity Support**: Choose a charity to support, with at least 10% of your subscription going directly to your chosen cause.
- **Monthly Prize Draw**: Your 5 latest scores become your lottery numbers for an algorithmic draw.
- **Subscription Management**: Manage your monthly or yearly subscription.
- **User Authentication**: Secure login and registration using Supabase Auth.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Email**: Resend

## Setup

### Prerequisites

- Node.js (v18+)
- npm
- A Supabase account
- A Stripe account
- A Resend account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd golf-draw-platform
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the `server` directory based on the example:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your actual credentials:
   ```env
   PORT=5001
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
   STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id
   STRIPE_YEARLY_PRICE_ID=price_your_yearly_price_id
   JWT_SECRET=your_jwt_secret_here
   EMAIL_FROM=noreply@digitalherosgolf.com
   RESEND_API_KEY=re_your_resend_api_key
   CLIENT_URL=http://localhost:5173
   PRIZE_CONTRIBUTION_PER_SUBSCRIBER=2
   ```

4. **Database Setup**
   Run the SQL script to create the necessary tables:
   ```bash
   psql -h <host> -U <user> -d <database> -f supabase_schema.sql
   ```
   Or use the Supabase SQL Editor to run the script.

5. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

6. **Environment Variables**
   Create a `.env` file in the `client` directory:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your actual credentials:
   ```env
   VITE_API_URL=http://localhost:5001
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Running the Application

1. **Start the backend**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend**
   ```bash
   cd ../client
   npm run dev
   ```

3. **Access the application**
   Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

1. **Register/Login**: Create an account or log in to your existing account.
2. **Subscribe**: Choose a monthly or yearly subscription plan.
3. **Track Scores**: Navigate to the dashboard and enter your golf scores.
4. **View Results**: Check your performance statistics and monthly draw results.

## License

MIT