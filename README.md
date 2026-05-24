# ScriptGenie Telugu Gaming

AI YouTube script generator for Telugu gaming creators.

## Stack

- Next.js app router
- Supabase auth and database
- Gemini API for script generation
- Razorpay for INR credit packs
- Vercel-ready deployment

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in Supabase, Gemini, and Razorpay keys in `.env.local`.

4. Run the SQL in `supabase/schema.sql` inside your Supabase SQL editor.

5. Start the app:

   ```bash
   npm run dev
   ```

## Credit Packs

- Starter: Rs 49 for 20 scripts
- Creator: Rs 99 for 60 scripts
- Pro: Rs 199 for 150 scripts

Payments are verified server-side before credits are added.
