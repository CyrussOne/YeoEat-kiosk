// App Configuration
export const APP_CONFIG = {
  KIOSK_WIDTH: 1080,
  KIOSK_HEIGHT: 1920,
  AUTO_RETURN_DELAY: 15000, // 15 seconds
} as const;

// Language Configuration
export const LANGUAGES = {
  ENGLISH: 'en',
  GERMAN: 'de',
} as const;

export const DEFAULT_LANGUAGE = LANGUAGES.GERMAN;

// Service Types
export const SERVICE_TYPES = {
  EAT_IN: 'eat-in',
  TAKE_AWAY: 'take-away',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  CASHIER: 'cashier',
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Product Categories
export const CATEGORIES = {
  BURGERS: 'Burgers',
  SIDES: 'Sides',
  DRINKS: 'Drinks',
  DESSERTS: 'Desserts',
} as const;

// Font Sizes (Accessibility)
export const FONT_SIZES = {
  NORMAL: 'normal',
  LARGE: 'large',
  EXTRA_LARGE: 'extra-large',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  LANGUAGE: 'language',
  SERVICE_TYPE: 'serviceType',
  CART: 'cart',
  PAYMENT_METHOD: 'paymentMethod',
  FONT_SIZE: 'fontSize',
} as const;

// Tax Configuration
export const TAX_RATE = 0.19; // 19% VAT (Germany)

// Printer Configuration
export const PRINTER_CONFIG = {
  PAPER_WIDTH: 58, // mm
  FONT_SIZE_NORMAL: 0,
  FONT_SIZE_LARGE: 1,
  ALIGNMENT_LEFT: 0,
  ALIGNMENT_CENTER: 1,
  ALIGNMENT_RIGHT: 2,
} as const;

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;
