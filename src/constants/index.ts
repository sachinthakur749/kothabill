// src/constants/index.ts
// App-wide design tokens and constants for KothaBill

// ── Brand colors ──────────────────────────────────────────────────────────────
export const COLORS = {
  // Primary teal (owner brand)
  primary:       '#1D9E75',
  primaryDark:   '#0F6E56',
  primaryLight:  '#E1F5EE',

  // Purple (tenant brand)
  tenant:        '#534AB7',
  tenantDark:    '#3C3489',
  tenantLight:   '#EEEDFE',

  // Amber (alerts, notifications)
  amber:         '#BA7517',
  amberLight:    '#FAEEDA',

  // Neutrals
  white:         '#FFFFFF',
  background:    '#F8F9FA',
  surface:       '#FFFFFF',
  border:        '#E0E0E0',
  divider:       '#F0F0F0',

  // Text
  textPrimary:   '#2C2C2A',
  textSecondary: '#5F5E5A',
  textMuted:     '#9E9D97',
  textOnPrimary: '#FFFFFF',

  // Semantic
  success:       '#1D9E75',
  error:         '#E24B4A',
  warning:       '#BA7517',
  info:          '#185FA5',
} as const;

// ── Bill category colors ──────────────────────────────────────────────────────
export const BILL_COLORS = {
  rent:        '#1D9E75',
  electricity: '#BA7517',
  water:       '#185FA5',
  dustbin:     '#5F5E5A',
} as const;

// ── Bill category labels (English + Nepali) ───────────────────────────────────
export const BILL_LABELS = {
  rent:        { en: 'Room Rent',   np: 'कोठा भाडा' },
  electricity: { en: 'Electricity', np: 'बिजुली बिल' },
  water:       { en: 'Water',       np: 'पानी बिल' },
  dustbin:     { en: 'Dustbin',     np: 'फोहोर बिल' },
} as const;

// ── Spacing ───────────────────────────────────────────────────────────────────
export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

// ── Border radius ─────────────────────────────────────────────────────────────
export const RADIUS = {
  sm:  6,
  md:  10,
  lg:  16,
  xl:  24,
  full: 999,
} as const;

// ── Font sizes ────────────────────────────────────────────────────────────────
export const FONT_SIZE = {
  xs:  11,
  sm:  13,
  md:  15,
  lg:  17,
  xl:  20,
  xxl: 26,
  h1:  30,
} as const;

// ── Shadow (Android elevation + iOS shadow) ───────────────────────────────────
export const SHADOW = {
  sm: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius:  3,
    elevation:     2,
  },
  md: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius:  6,
    elevation:     4,
  },
} as const;

// ── App strings ───────────────────────────────────────────────────────────────
export const APP_NAME = 'KothaBill';
export const APP_TAGLINE = 'कोठा Expense Manager';

// ── Firestore collection names ────────────────────────────────────────────────
export const COLLECTIONS = {
  USERS:         'users',
  ROOMS:         'rooms',
  TENANTS:       'tenants',
  BILLS:         'bills',
  NOTIFICATIONS: 'notifications',
} as const;
