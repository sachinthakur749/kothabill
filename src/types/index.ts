// src/types/index.ts
// Central type definitions for KothaBill

// ── User roles ────────────────────────────────────────────────────────────────
export type UserRole = 'owner' | 'tenant';

// ── User (stored in Firestore: /users/{uid}) ──────────────────────────────────
export interface KothaBillUser {
  uid:         string;
  name:        string;
  email:       string;
  phone:       string;
  role:        UserRole;
  roomCode?:   string;   // Owner: their generated code | Tenant: the code they joined with
  photoURL?:   string;
  address?:    string;
  createdAt:   number;   // Unix timestamp
}

// ── Room (stored in Firestore: /rooms/{roomId}) ───────────────────────────────
export interface Room {
  roomId:    string;
  ownerId:   string;
  roomCode:  string;    // Unique 8-char code e.g. "KTM-A482"
  address:   string;
  createdAt: number;
}

// ── Tenant link (stored in Firestore: /tenants/{tenantId}) ───────────────────
export interface TenantLink {
  tenantId:  string;
  ownerId:   string;
  roomId:    string;
  userId:    string;    // The tenant's Firebase uid
  joinedAt:  number;
  isActive:  boolean;
}

// ── Bill (stored in Firestore: /bills/{billId}) ───────────────────────────────
export interface Bill {
  billId:       string;
  roomId:       string;
  ownerId:      string;
  tenantId:     string;   // TenantLink id
  tenantUid:    string;   // Tenant's Firebase uid
  month:        string;   // Format: "YYYY-MM" e.g. "2025-06"
  rent:         number;   // Room rent in NPR
  electricity:  number;   // Electricity bill in NPR
  water:        number;   // Water bill in NPR
  dustbin:      number;   // Dustbin/waste collection in NPR
  note?:        string;   // Optional note from owner
  total:        number;   // Auto-calculated sum
  createdAt:    number;
}

// ── Notification (stored in Firestore: /notifications/{notifId}) ──────────────
export interface AppNotification {
  notifId:   string;
  toUserId:  string;
  billId:    string;
  message:   string;
  isRead:    boolean;
  createdAt: number;
}

// ── Navigation param types ────────────────────────────────────────────────────
export type RootStackParamList = {
  Welcome:      undefined;
  Login:        undefined;
  Register:     undefined;
  OwnerTabs:    undefined;
  TenantTabs:   undefined;
};

export type OwnerTabParamList = {
  Dashboard:    undefined;
  AddBill:      { tenantUid?: string } | undefined;
  History:      undefined;
  Profile:      undefined;
};

export type TenantTabParamList = {
  Home:         undefined;
  BillHistory:  undefined;
  OwnerInfo:    undefined;
  Profile:      undefined;
};
