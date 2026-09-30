# Tulvane — demo flower shop app

A mobile app and web app for a (made-up) flower shop. Built as a portfolio case: a real shop flow with card payments and an AI helper.

## Features
- Shop with photos, categories and product pages
- **"Which bouquet for which moment?"** guide (birthday, thank you, sorry, and more)
- Cart, delivery day, card message
- **Stripe payments** (test mode) on a secure Stripe page
- **AI chat helper** (Claude) that recommends bouquets and answers questions about delivery and orders
- Orders saved in a database (SQLite); customers see live order status in the app
- **Owner admin page** (`/admin`, password protected): see orders, change status (Preparing, On the way, Delivered)
- Stripe **webhook** support, so orders are marked paid even if the customer closes the page

## Tech
- App: React Native + Expo (one code base for iOS, Android and web), TypeScript, React Navigation
- Server: Node.js + Express
- Payments: Stripe Checkout (prices are set on the server, not in the app)
- AI: Claude API (Anthropic), called only from the server, so the key stays secret
- Safety: rate limit, input checks, test-mode-only Stripe key check

## Run it
1. `npm install`
2. Copy `.env.example` to `.env` and add your Stripe TEST key (`sk_test_...`) and Claude key (`sk-ant-...`). Without keys, the app runs in demo mode.
3. Start the server: `npm run server` (port 8787)
4. Start the app: `npm run web` (port 8081), or `npx expo start` for a phone with Expo Go

Test card: `4242 4242 4242 4242`, any future date, any 3-digit CVC.

## Notes
- This is a demo. No real payments, and the shop is not a real business.
- Photos are from Unsplash (see `assets/photos/CREDITS.md`). The logo is original artwork (`scripts/make-icons.mjs`).
