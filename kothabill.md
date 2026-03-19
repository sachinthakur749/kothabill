# KothaBill — Room Expense Manager for Nepal
**Version 1.0 | Confidential Project Document**

> A mobile app for room owners and tenants in Nepal.
> Built for the thousands of students and workers who come to Kathmandu for study and work.
> KothaBill replaces messy WhatsApp bills and paper receipts with a clean, bilingual mobile app that connects owners and tenants around monthly expenses.

- **2** User roles
- **4** Bill categories
- **1** Room code link

---

## 1. Project Overview

KothaBill is a React Native mobile application targeting the rental housing market in Nepal, particularly Kathmandu. The app digitises the monthly billing process between room owners and their tenants — covering the four standard charges common in Nepali rentals.

### 1.1 Problem Statement

Currently, most landlords in Kathmandu send monthly bills over WhatsApp or on paper. This leads to disputes about amounts, lost records, and no transparency for tenants. Tenants also have no easy way to track what they owe across months.

**Real scenario:** A tenant in Koteshwor receives a WhatsApp message every month with numbers but no breakdown. They cannot check past months or compare electricity usage over time. KothaBill solves this by giving both sides a shared, structured record.

### 1.2 Target Users

| User Type | Description | Primary Need |
|-----------|-------------|--------------|
| Room Owner (मालिक) | Owns one or more rental rooms/floors in Nepal | Enter & track monthly bills for all tenants |
| Tenant (भाडावाला) | Rents a room, often a student or working professional | See current bills and past payment history |

---

## 2. Core Features

### 2.1 Bill Categories

Every month, the owner can enter amounts for exactly four expense types:

| Category | Nepali Name | Description | Frequency |
|----------|-------------|-------------|-----------|
| Room Rent | कोठा भाडा | Fixed monthly rent for the room | Monthly |
| Electricity | बिजुली बिल | Based on meter reading (units used) | Monthly |
| Water | पानी बिल | Municipal or private water supply charge | Monthly |
| Dustbin | फोहोर बिल | Waste collection fee charged by owner | Monthly |

### 2.2 Owner Features vs Tenant Features

| Owner (मालिक) | Tenant (भाडावाला) |
|---------------|-------------------|
| View all tenants across rooms | View current month's bill breakdown |
| Add/remove tenants, assign rooms | See owner's name, phone, address |
| Enter monthly bill (4 categories) | Get push notification for new bills |
| See full payment history per tenant | View past months' bill history |
| Send push notification when bill added | See total amount due for the month |
| View tenant contact details | View per-category cost over time |
| Edit or correct a submitted bill | |

---

## 3. User Flows & App Screens

### 3.1 Authentication & Onboarding

1. Open app — select role: **Owner** or **Tenant**
2. Register with phone number + OTP verification
3. **(Owner):** Profile set up — name, address, phone. System generates a unique Room Code (e.g. `KTM-4829`)
4. **(Tenant):** Enter owner's Room Code to link account. Now connected to that owner's property
5. Both users land on their respective dashboards

### 3.2 Monthly Billing Flow (Owner)

1. Owner taps **'Add Bill'** for a specific tenant
2. Enters 4 fields: Room Rent (Rs.), Electricity (Rs.), Water (Rs.), Dustbin (Rs.)
3. Optionally adds a note (e.g. `'Electricity up due to winter'`)
4. Taps **Submit** — bill is saved to database
5. Tenant automatically receives a push notification
6. Bill appears in both owner's history and tenant's dashboard

### 3.3 Screen List

| Screen | Role | Description |
|--------|------|-------------|
| Login / Register | Both | Phone number + OTP, role selection |
| Owner Dashboard | Owner | List of all tenants with room numbers and last bill date |
| Add Bill | Owner | Form with 4 fields + optional note, month selector |
| Tenant Detail | Owner | Individual tenant info, all bills, payment status |
| Manage Tenants | Owner | Add/remove tenants, share Room Code |
| Tenant Home | Tenant | Current month total + category breakdown card |
| Bill History | Tenant | Past months listed with total and per-item detail |
| Owner Info | Tenant | Owner name, phone, address, profile photo |
| Notifications | Both | In-app notification feed for new bills |
| Profile / Settings | Both | Edit personal info, change language (NP/EN) |

---

## 4. Technical Architecture

### 4.1 Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React Native (Expo) | Single codebase for Android + iOS. Expo simplifies builds and OTA updates. Large ecosystem. |
| Auth | Firebase Authentication | Phone number OTP built-in. Free tier handles thousands of users. Secure. |
| Database | Firebase Firestore | Real-time updates — tenant sees new bill instantly. NoSQL fits the data model. |
| Notifications | Firebase Cloud Messaging (FCM) | Free push notifications to Android and iOS. Integrates directly with Firestore triggers. |
| State Mgmt | Zustand | Lightweight, simpler than Redux. Good for this app's size. |
| Navigation | React Navigation v6 | Standard navigation library for React Native. Stack + tab navigators. |
| UI Library | React Native Paper | Material Design components, well-maintained, supports dark mode. |
| Language | TypeScript | Type safety prevents bugs in bill amount handling and user data. |

### 4.2 Data Model

Firestore collections and their key fields:

```
users/
  Fields: uid, name, phone, role (owner|tenant), roomCode, photoURL, createdAt

rooms/
  Fields: roomId, ownerId, roomNumber, address, roomCode (unique 8-char code)

tenants/
  Fields: tenantId, ownerId, roomId, userId, joinedAt, isActive

bills/
  Fields: billId, roomId, ownerId, tenantId, month (YYYY-MM), rent, electricity, water, dustbin, note, createdAt, total

notifications/
  Fields: notifId, toUserId, billId, message, isRead, createdAt
```

### 4.3 Owner–Tenant Linking

When an owner registers and sets up their profile, the app automatically generates a unique **Room Code** (e.g. `KTM-A482`). The owner shares this code with their tenant. When the tenant enters the code during signup, their account is linked to that owner's room. No complex admin portal needed — just a code, like joining a WiFi network.

---

## 5. Development Roadmap

### Phase 1 — Foundation *(2–3 weeks)*

- Project setup: Expo + TypeScript + Firebase config
- Auth screens: login, register, role selection, OTP verify
- Basic navigation shell (owner tabs, tenant tabs)
- User profile creation and Firestore write

### Phase 2 — Core Features *(3–4 weeks)*

- Owner: Add tenant screen + Room Code generation
- Owner: Add Bill form (4 fields + month picker)
- Tenant: Home screen showing current month's bill
- Tenant: Owner Info screen
- Real-time Firestore listeners for bill updates

### Phase 3 — History & Notifications *(2–3 weeks)*

- Owner: Payment history list per tenant
- Tenant: Past bills history screen
- Firebase Cloud Messaging push notifications
- In-app notification feed

### Phase 4 — Polish *(1–2 weeks)*

- Nepali language support (i18n)
- Dark mode
- Bill summary totals and simple charts
- App icon, splash screen, Play Store listing

---

## 6. Future Ideas (V2)

- **eSewa / Khalti payment** — Tenants pay rent directly through the app using popular Nepal payment methods
- **Meter reading photo** — Owner uploads a photo of the electricity meter to support the bill
- **PDF bill export** — Generate a printable PDF receipt for each month's bill
- **Multi-property support** — Owners with multiple buildings manage all from one account
- **Tenant rating** — Owners can leave notes/ratings on tenant history for future reference
- **SMS fallback** — For tenants without smartphones, send bill summary via SMS

---

## 7. Additional Notes

- **Language:** The app supports both Nepali (नेपाली) and English from the first release, as many room owners prefer Nepali while younger tenants may prefer English.
- **Currency:** All amounts are in Nepali Rupees (Rs. / NPR). No multi-currency support needed.
- **Offline:** The app should gracefully handle poor connectivity — common in parts of Kathmandu — by caching the latest bill data locally so tenants can view it without internet.
- **Privacy:** Tenants should only see their own bills and their owner's public profile. Owners should only see tenants linked to their rooms. No cross-owner data leakage.

---

*Document prepared as part of KothaBill v1.0 project planning. | Built for Nepal.*