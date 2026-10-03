# PadosiPro Assignment

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Hey! This is my submission for the PadosiPro assignment. It's a full-stack project with a React Native (Expo) mobile app and a Node.js/PostgreSQL backend.

## Quick Start (Backend)

The backend is built with Express and Prisma. 

1. `cd server`
2. `npm install`
3. Copy `.env.example` to `.env` (`cp .env.example .env`)
4. Spin up the Postgres database using Docker: `docker-compose up -d`
5. Push the schema and seed the tasks:
   ```
   npm run db:push
   npm run db:seed
   ```
6. Start the server: `npm run dev` (runs on port 3000)

**Note on Emails:** I used Ethereal to catch the OTP emails locally without dealing with actual SMTP limits. When you trigger an OTP, check the backend console – it prints a URL where you can view the fake email and get the 6-digit code.

## Quick Start (Mobile App)

1. `cd client/parosiprodemo`
2. `npm install`
3. Set up your `.env`. Copy the `.env.example` to `.env`. Make sure `EXPO_PUBLIC_API_URL` points to your machine's local IP (like `http://192.168.1.x:3000/api`) if you're testing on a real device.
4. Run `npm run start` and scan the QR code with Expo Go, or press `i` for iOS simulator / `a` for Android.

## Building the APK

I set it up to build a local APK via Expo EAS:

1. `npm install -g eas-cli`
2. `eas login`
3. `eas build -p android --profile preview` (this profile specifically outputs an .apk instead of an .aab)
4. Download the APK from the link it spits out and drag it into your emulator.

## Tests

I wrote Jest tests for the critical OTP and auth flows on the backend. Just run `npm run test` inside the `server` folder to check them out.
