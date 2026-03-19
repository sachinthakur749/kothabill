# KothaBill 🏠
**कोठा Expense Manager** — Room billing app for Nepal

---

## Phase 1 Setup — What's in this folder

```
kothabill/
├── App.tsx                          ← Root entry, Firebase auth listener
├── app.json                         ← Expo config
├── package.json                     ← All dependencies
├── tsconfig.json                    ← TypeScript config
├── babel.config.js                  ← Babel + path aliases
└── src/
    ├── config/
    │   └── firebase.ts              ← 🔴 PASTE YOUR FIREBASE CONFIG HERE
    ├── constants/
    │   └── index.ts                 ← Colors, spacing, fonts, app strings
    ├── types/
    │   └── index.ts                 ← All TypeScript interfaces
    ├── store/
    │   └── authStore.ts             ← Zustand global auth state
    ├── navigation/
    │   ├── RootNavigator.tsx        ← Auth vs App routing
    │   ├── OwnerTabs.tsx            ← Owner bottom tabs
    │   └── TenantTabs.tsx           ← Tenant bottom tabs
    └── screens/
        ├── auth/
        │   ├── WelcomeScreen.tsx    ← ✅ Full welcome screen
        │   ├── LoginScreen.tsx      ← Placeholder (Phase 1 bullet 2)
        │   └── RegisterScreen.tsx   ← Placeholder (Phase 1 bullet 2)
        ├── owner/                   ← Placeholders (Phase 2)
        └── tenant/                  ← Placeholders (Phase 2)
```

---

## Getting Started

### Step 1 — Firebase setup

1. Go to [firebase.google.com](https://firebase.google.com) → Create project `KothaBill`
2. Add a Web app → copy the `firebaseConfig`
3. Open `src/config/firebase.ts` and paste your config values
4. In Firebase Console:
   - **Authentication** → Enable **Phone** sign-in
   - **Firestore** → Create database → **Test mode** → region: `asia-south1`

### Step 2 — Install dependencies

```bash
cd kothabill
npm install
```

### Step 3 — Run the app

```bash
npx expo start
```

- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator  
- Scan QR code with **Expo Go** app on your phone

---

## What you'll see

When you run the app:
- **Welcome screen** loads with KothaBill branding
- **Get Started** → goes to Register (placeholder for now)
- **Login** → goes to Login (placeholder for now)
- After login, app routes to **Owner tabs** or **Tenant tabs** based on role

---

## Next Steps (Phase 1 — Bullet 2)

Next session we'll build:
- **LoginScreen** — phone number input + OTP verify
- **RegisterScreen** — name, role selection (Owner/Tenant), room code entry
- Full Firebase Phone Auth integration

---

## Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Framework  | React Native (Expo 51)  |
| Language   | TypeScript              |
| Auth       | Firebase Authentication |
| Database   | Firebase Firestore      |
| State      | Zustand                 |
| Navigation | React Navigation v6     |
| UI         | React Native Paper      |
