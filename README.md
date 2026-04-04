# WishLink 🎉

> Send personalised QR wishes for birthdays, anniversaries, weddings and more — free forever.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Create Supabase project
- Go to [supabase.com](https://supabase.com) → create free project
- Open SQL Editor → run `supabase-schema.sql`

### 3. Configure environment
```bash
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key
```

### 4. Run locally
```bash
npm run dev
# Open http://localhost:3000
```

### 5. Deploy
```bash
npx vercel
# Add env vars in Vercel dashboard
```

## Project Structure
```
app/
  page.jsx                 ← Create wish (home)
  my-wishes/page.jsx       ← Dashboard
  v/[id]/page.jsx          ← Public reveal page (recipients see this)
  api/wishes/route.js      ← Create + list wishes
  api/wishes/[id]/route.js ← Get + delete wish
  api/qr/route.js          ← QR code generator
components/
  OccasionPicker.jsx
  RevealCard.jsx
  BottomNav.jsx
lib/
  supabase.js
  occasions.js
supabase-schema.sql        ← Run in Supabase SQL editor
.env.local.example         ← Copy to .env.local
```

## Stack
- **Next.js 15** (App Router) — frontend + API in one project
- **Tailwind CSS** — mobile-first styling
- **Supabase** — Postgres database, free tier
- **qrcode** — server-side QR generation
- **nanoid** — 8-char unique wish IDs
- **Vercel** — one-click deploy
