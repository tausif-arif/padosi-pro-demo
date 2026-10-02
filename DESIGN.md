# Design & Architecture

This document covers the tech stack and architectural decisions made for this project.

## Tech Stack

**Backend:** Node.js, Express, TypeScript, and Prisma (PostgreSQL). Prisma provides good type safety, and Zod is used for request validation before hitting the database.

**Mobile:** React Native with Expo. The project uses a feature-based folder structure (`src/screens/{feature}`) to keep things organized. State management is handled by Zustand since it's minimal, and `expo-secure-store` is used for securely persisting the auth token.

## Architectural Decisions & Trade-offs

1. **JWTs instead of Sessions:** 
   I used stateless JWTs passed via the Authorization header. Managing cookie-based sessions and CORS across mobile clients can be difficult, so JWTs were a more straightforward solution for this use case.

2. **Ethereal for OTP Emails:**
   Instead of setting up SendGrid or AWS SES (which require domain verification and can rate limit during testing), I used Ethereal Email. It functions like a real SMTP server but catches emails locally, which works well for development and testing.

3. **Zustand over Redux Toolkit:**
   Zustand is used for global state (mainly auth) instead of Redux Toolkit. Redux adds a lot of boilerplate, which isn't necessary for an app of this size where we mostly just track the login state.

4. **Standard SectionList vs FlashList:**
   The task catalogue uses the standard React Native `SectionList`. Since there are only 20-30 tasks currently, adding a dependency like Shopify's `FlashList` isn't needed yet. If the list grows significantly, migrating to FlashList would be an easy optimization.

## Pending Items

- **Refresh Tokens:** Currently, a single JWT is used. In production, this should be split into short-lived access tokens and longer-lived refresh tokens.
- **Request Cancellation:** Need to add `AbortController` to cancel pending API requests if a user navigates away from a screen, avoiding race conditions.
- **Rate Limiting:** The OTP endpoint has basic limits (5 attempts, 30s cooldown), but global rate limiting should be added to the Express server to prevent abuse.

## Future Improvements

1. **React Query:** Replace standard `useState`/`useEffect` data fetching with React Query for built-in caching, background refetching, and easier loading state management.
2. **Push Notifications:** Integrate Expo Push Notifications to alert users when a task status changes.
3. **CI/CD:** Add GitHub Actions to run tests, TypeScript checks, and automated EAS builds on pull requests.
4. **Offline Support:** Implement local caching (e.g., MMKV + React Query) so the app remains partially usable without a network connection.
5. **E2E Testing:** Add basic Detox tests to cover the core onboarding and OTP flows.
