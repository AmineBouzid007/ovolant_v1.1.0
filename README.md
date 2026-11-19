# Ovolant — École de conduite (ovolant.ca)

Next.js 16 + Tailwind 4 + Supabase (Postgres + Storage) on Vercel. French (default) and English.

## Features
- Public site: futuristic dark design, live "next course" gauge, upcoming courses with seats left, schedule photo(s), how-to, instructors & reviews (shown when added), FAQ, map, WhatsApp button, SEO (metadata, sitemap, JSON-LD), privacy page (Law 25).
- Booking: choose a course (or "another date"), name / phone / email, consent. Seats are checked inside a database transaction (no overbooking).
- Admin (`/admin`): dashboard, bookings (search, filters, status, delete, CSV/Excel export), courses & dates (seats, price, visibility), schedule photo upload (Supabase Storage), instructors & reviews, settings.
- Emails (Resend): client "request received", school "new booking", client "confirmed / cancelled" when you change the status.

## Setup
1. `.env` — fill the lines marked `<<< FILL ME` (see comments inside).
2. `npm install` then `npm run dev` → http://localhost:3000 (set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` locally).
3. Open `/admin/login`. Tables are created automatically on first load.
4. Deploy: push to GitHub, import in Vercel, copy every `.env` variable into Vercel → Settings → Environment Variables, redeploy.
5. Resend: add `ovolant.ca` under Domains and add the DNS records.

## Notes
- All course times are Montréal time (America/Toronto).
- Language is stored in a cookie (`ovolant_lang`), French by default.
