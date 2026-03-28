# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Matektábor App — a React web application for "A Gondolkodás Öröme Alapítvány" (Hungarian mathematics education foundation). The main feature is the Barkochba game/story management interface with person and camp tracking, backed by Firebase.

## Commands

```bash
yarn start        # Start Firebase Emulators + Vite dev server with HMR (http://localhost:5173/)
yarn dev          # Start Vite dev server only (no emulators)
yarn build        # TypeScript compile + Vite production build (tsc -b && vite build)
yarn lint         # ESLint on src/ — must pass before merging PRs
yarn preview      # Preview production build locally
```

Node 18 required (see .nvmrc). Uses Yarn as package manager.

## Architecture

**Stack:** TypeScript, React 18, Vite, Firebase (Firestore, Auth, Storage, Functions), MUI v5, Redux (via redoodle)

**Key directories:**
- `src/components/` — React components. `matektaborApp.tsx` handles routing. `barkochba/` contains the main feature screens.
- `src/store/` — Redux state management using redoodle for type-safe actions. State shape defined in `state.ts`, selectors use reselect/re-reselect for memoization.
- `src/hooks/` — Custom hooks: `useDataService.ts` (Firestore data fetching), `useFirebaseAuthService.ts` (auth operations)
- `src/utils/` — Utilities for navigation, theming (MUI), authorization (role checking)
- `functions/` — Firebase Cloud Functions (scheduled Firestore backups)
- `seed-data/` — Test data imported by Firebase Emulator for safe local development

**Data flow:** Firebase Auth → role-based access (`loginProtector.tsx`) → Firestore real-time sync via ReactFire → Redux store → React components via selectors

**Routing:** `/signin`, `/barkochba` (main, protected), `/barkochba/manage`, `/barkochba/export`, `/terms-of-service`, `/privacy-policy`. Home redirects to `/barkochba`.

## Code Style

- 4-space indentation, double quotes
- Strict TypeScript (tsconfig.app.json)
- Unused variables prefixed with `_` are allowed
- ESLint flat config in `eslint.config.js`

## Local Testing with Firebase Emulator

When testing in a headless browser (e.g. Claude Preview), the Google sign-in popup will be blocked. To sign in programmatically against the Firebase Auth emulator:

1. Make sure the app is loaded from `localhost` (not `127.0.0.1`) so emulator connections work.
2. The seed data includes two test users (see `seed-data/auth_export/accounts.json`):
   - **Test User** (`test.user@email.com`, uid: `tZ9LlYdP4tvP3sbE4Hj3lsDNglrc`) — has viewer role
   - **No Access** (`no.access@email.com`, uid: `0Zo5giDXGAW8q4w2nKHGcjOM3hYG`) — no access
3. Sign in via the browser console using a fake Google credential (emulator accepts JSON as id_token):

```js
(async () => {
  const authModule = await import('/node_modules/.vite/deps/chunk-NF6UUSPI.js?v=325639f1');
  const auth = authModule.getAuth();
  await authModule.signOut(auth);
  const fakeIdToken = JSON.stringify({
    sub: 'tZ9LlYdP4tvP3sbE4Hj3lsDNglrc',
    email: 'test.user@email.com',
    email_verified: true,
    name: 'Test User'
  });
  await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=fake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      postBody: 'id_token=' + encodeURIComponent(fakeIdToken) + '&providerId=google.com',
      requestUri: 'http://localhost',
      returnIdpCredential: true,
      returnSecureToken: true
    })
  });
  const credential = authModule.GoogleAuthProvider.credential(fakeIdToken);
  const result = await authModule.signInWithCredential(auth, credential);
  console.log('Signed in as:', result.user.email, 'uid:', result.user.uid);
})();
```

> **Note:** The Vite chunk filename (`chunk-NF6UUSPI.js?v=325639f1`) may change after dependency updates. If the import fails, find the correct chunk by searching for `signInWithEmailAndPassword` in the browser's network/sources tab.

## Deployment

- Web app auto-deploys via GitHub Actions on merge to `main`
- Cloud Functions deployed manually via `firebase` CLI
- PRs get automatic preview deployments
