/**
 * Explora Design Tokens — TypeScript constants
 *
 * Use these when you need colors in JS (e.g. Recharts, inline styles, dynamic values).
 * For CSS/Tailwind, use the CSS variables defined in globals.css instead.
 *
 * Changing a value here AND in globals.css keeps the entire app in sync.
 */

export const theme = {
  colors: {
    // Primary (Teal)
    primary: '#14B8A6',
    primaryHover: '#0D9488',
    primaryLight: '#CCFBF1',
    primaryDark: '#0F766E',

    // Semantic
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',

    // Sidebar
    sidebar: {
      bg: '#0F172A',
      text: '#94A3B8',
      active: '#14B8A6',
      activeBg: 'rgba(20, 184, 166, 0.12)',
      hover: '#1E293B',
      divider: '#1E293B',
    },

    // Text
    text: {
      heading: '#0F172A',
      body: '#334155',
      secondary: '#64748B',
      muted: '#94A3B8',
    },

    // Backgrounds
    bg: {
      page: '#F8FAFC',
      card: '#FFFFFF',
      cardBorder: '#E2E8F0',
      section: '#F1F5F9',
    },
  },

  // Chart-specific colors for Recharts
  charts: {
    primary: '#14B8A6',
    secondary: '#0D9488',
    tertiary: '#5EEAD4',
    grid: '#E2E8F0',
    tooltip: {
      bg: '#0F172A',
      text: '#F8FAFC',
    },
    // For multi-series charts
    series: ['#14B8A6', '#0D9488', '#5EEAD4', '#99F6E4', '#2DD4BF'],
  },

  // Status colors for badges
  status: {
    active: { bg: '#D1FAE5', text: '#065F46' },
    pending: { bg: '#FEF3C7', text: '#92400E' },
    confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
    completed: { bg: '#D1FAE5', text: '#065F46' },
    cancelled: { bg: '#FEE2E2', text: '#991B1B' },
    draft: { bg: '#F1F5F9', text: '#475569' },
    archived: { bg: '#F1F5F9', text: '#64748B' },
    processing: { bg: '#EDE9FE', text: '#5B21B6' },
    paid: { bg: '#D1FAE5', text: '#065F46' },
    approved: { bg: '#DBEAFE', text: '#1E40AF' },
    rejected: { bg: '#FEE2E2', text: '#991B1B' },
    failed: { bg: '#FEE2E2', text: '#991B1B' },
    refunded: { bg: '#EDE9FE', text: '#5B21B6' },
    open: { bg: '#FEF3C7', text: '#92400E' },
    in_progress: { bg: '#DBEAFE', text: '#1E40AF' },
    resolved: { bg: '#D1FAE5', text: '#065F46' },
  },
} as const

// Type helpers
export type ThemeColor = keyof typeof theme.colors
export type StatusKey = keyof typeof theme.status
