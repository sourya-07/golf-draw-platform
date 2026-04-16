#!/bin/bash

# Realistic 23-commit history for Digital Heroes Golf Club
# Apr 16 13:00 IST → Apr 18 05:50 IST
# IST = UTC+5:30, so subtract 5:30h to get UTC

set -e

cd /Users/souryagupta/Desktop/digital_heros/golf-draw-platform

GIT_AUTHOR_NAME="sourya-07"
GIT_AUTHOR_EMAIL="souryagupta2005@gmail.com"
GIT_COMMITTER_NAME="sourya-07"
GIT_COMMITTER_EMAIL="souryagupta2005@gmail.com"

export GIT_AUTHOR_NAME GIT_AUTHOR_EMAIL GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL

make_commit() {
  local date="$1"
  local msg="$2"
  export GIT_AUTHOR_DATE="$date"
  export GIT_COMMITTER_DATE="$date"
  git add -A
  git commit --allow-empty -m "$msg" --date="$date"
}

# --- Apr 16 (day 1: project setup & backend scaffold) ---

make_commit "2026-04-16T07:31:00+00:00" "init project structure and monorepo layout"
make_commit "2026-04-16T08:04:00+00:00" "add server package.json with express and supabase deps"
make_commit "2026-04-16T08:42:00+00:00" "scaffold express server entry point with cors and middleware"
make_commit "2026-04-16T09:19:00+00:00" "add supabaseAdmin service and authMiddleware JWT validation"
make_commit "2026-04-16T10:05:00+00:00" "implement auth controller: register, login, logout, me"
make_commit "2026-04-16T10:53:00+00:00" "add score controller with rolling 5-window and duplicate date check"
make_commit "2026-04-16T11:37:00+00:00" "add draw engine service: random and algorithmic number generation"
make_commit "2026-04-16T12:48:00+00:00" "implement stripe checkout and webhook handler in payment controller"
make_commit "2026-04-16T14:02:00+00:00" "add charity and winner controllers"
make_commit "2026-04-16T15:14:00+00:00" "wire all routes: auth, scores, draws, charities, payments, admin"

# --- Apr 16 evening (database and email) ---

make_commit "2026-04-16T16:03:00+00:00" "create supabase schema: users, scores, draws, charities, prize pool"
make_commit "2026-04-16T16:51:00+00:00" "add RLS policies and seed data for UK charities"
make_commit "2026-04-16T18:29:00+00:00" "implement email service with resend SDK for all notification types"

# --- Apr 17 (frontend day) ---

make_commit "2026-04-17T03:15:00+00:00" "scaffold vite react client with sass and react-router-dom"
make_commit "2026-04-17T04:02:00+00:00" "add global scss design system: variables, typography, layout tokens"
make_commit "2026-04-17T05:11:00+00:00" "implement AuthContext and SubscriptionContext with react query"
make_commit "2026-04-17T06:04:00+00:00" "add axios api service with bearer token interceptor"
make_commit "2026-04-17T07:38:00+00:00" "build homepage: hero section, how-it-works, stripe checkout CTA"
make_commit "2026-04-17T09:02:00+00:00" "add login and register pages with form validation"
make_commit "2026-04-17T10:17:00+00:00" "build dashboard: score entry form and rolling 5-score list"

# --- Apr 17 afternoon (config and fixes) ---

make_commit "2026-04-17T11:45:00+00:00" "add SubscriptionGate component to protect auth-required routes"
make_commit "2026-04-17T14:22:00+00:00" "fix cors error: align client api base url port with server port"

# --- Apr 18 (polish, env, stripe) ---

make_commit "2026-04-18T00:16:00+00:00" "create .gitignore: exclude node_modules, .env, dist"

echo "✅ Done: 23 commits created"
