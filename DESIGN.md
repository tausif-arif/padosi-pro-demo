# Design & Architecture

This document covers the tech stack and architectural decisions made for this project.

## Tech Stack

**Backend:** Node.js, Express, TypeScript, and Prisma (PostgreSQL). Prisma provides good type safety, and Zod is used for request validation before hitting the database.

**Mobile:** React Native with Expo. The project uses a feature-based folder structure (`src/screens/{feature}`) to keep things organized. State management is handled by Zustand since it's minimal, and `expo-secure-store` is used for securely persisting the auth token.

**Frontend Engineering Guidelines:** To maintain a clean and scalable architecture, I included a `RULES.md` file (`client/parosiprodemo/RULES.md`). These represent the strict frontend engineering conventions I use in my current org across all React, Next.js, and React Native projects. I generated this specific document using AI by providing it with my exact architectural instructions and preferences.

## Architectural Decisions & Trade-offs

1. **JWTs instead of Sessions:** 
   I used stateless JWTs passed via the Authorization header. Managing cookie-based sessions and CORS across mobile clients can be difficult, so JWTs were a more straightforward solution for this use case.

2. **Real SMTP with Master Code Fallback:**
   Instead of mocking emails with Ethereal, I wired up Gmail SMTP using Google App Passwords so users actually receive the OTP in their inbox. However, because free email providers sometimes rate-limit or delay emails during heavy testing, the trade-off I made was implementing a master bypass code (`999999`). This ensures app can bes tested easily buts it's only for testing purpose.

3. **Zustand over Redux Toolkit:**
   Zustand is used for global state (mainly auth) instead of Redux Toolkit. Redux adds a lot of boilerplate, which isn't necessary for an app of this size where we mostly just track the login state.

4. **Standard SectionList vs FlashList:**
   The task catalogue uses the standard React Native `SectionList`. Since there are only 20-30 tasks currently, adding a dependency like Shopify's `FlashList` isn't needed yet. If the list grows significantly, migrating to FlashList would be an easy optimization.

## Pending Items

- **Refresh Tokens:** Currently, a single JWT is used. In production, this should be split into short-lived access tokens and longer-lived refresh tokens.
- **Request Cancellation:** Need to add `AbortController` to cancel pending API requests if a user navigates away from a screen, avoiding race conditions.
- **Rate Limiting:** The OTP endpoint has basic limits (5 attempts, 30s cooldown), but global rate limiting should be added to the Express server to prevent abuse.

## Future Improvements

1. **Analytics & Crash Reporting(THE MOST IMPORTANT):** I will add Sentry to track app crashes so we know exactly why the app freezes or closes on a user's phone, instead of waiting for bad App Store reviews. I'll also use PostHog to monitor overall user engagement and how users book tasks.

2. **AI Advantage:** Integrate an AI agent to act like a human guide within the app. This way, users always feel supported and can quickly find exactly the right service o they need without getting lost.

3. **React Query:** Replace standard `useState`/`useEffect` data fetching with React Query for built-in caching, background refetching, and easier loading state management.

4. **Push Notifications:** Integrate Expo Push Notifications to alert users when a task status changes or remind user and for announcements .

5. **CI/CD:** Add GitHub Actions to run tests, TypeScript checks, and automated EAS builds on pull requests.

6. **Offline Support:** Implement local caching (e.g., MMKV + React Query) so the app remains partially usable without a network connection.

7. **E2E Testing:** Add basic Detox tests to cover the core onboarding and OTP flows.

8. **Real-time Chat:** Implement WebSockets (using Socket.io) so users can securely chat directly with their assigned task worker in real-time.

9. **Map & Location Features:** Integrate `react-native-maps` so users can visually see where nearby task workers are located and track their live arrival.
