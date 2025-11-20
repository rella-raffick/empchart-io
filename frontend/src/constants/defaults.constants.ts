/**
 * Default avatar as base64-encoded SVG
 * A simple user icon that will be used when no profile image is provided
 */
export const DEFAULT_AVATAR = `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#6366f1"/>
  <circle cx="100" cy="75" r="35" fill="white" opacity="0.9"/>
  <path d="M 100 120 Q 60 120 40 160 L 160 160 Q 140 120 100 120" fill="white" opacity="0.9"/>
</svg>
`)}`;

export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

// API Configuration
export const API_CONFIG = {
  DEFAULT_BASE_URL: 'http://localhost:3000',
  TIMEOUT: 30000, // 30 seconds
} as const;

// Org Chart Layout Constants
export const ORG_CHART_LAYOUT = {
  NODE_WIDTH: 280,
  NODE_HEIGHT: 140,
  HORIZONTAL_SPACING: 120,
  VERTICAL_SPACING: 150,
} as const;

// Zoom Configuration
export const ZOOM_CONFIG = {
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 1.5,
  DEFAULT_ZOOM: 0.8,
  FIT_VIEW_PADDING: 0.2,
} as const;

// SVG ViewBox Constants
export const SVG_VIEWBOX = {
  ICON_20: '0 0 20 20',
  AVATAR_200: '0 0 200 200',
} as const;

// Drag and Drop Configuration
export const DRAG_CONFIG = {
  ACTIVATION_DISTANCE: 15,
  SCROLL_SPEED: 1.5,
  SCROLL_THRESHOLD: 50,
} as const;

// Update intervals
export const UPDATE_INTERVALS = {
  ZOOM_UPDATE: 100, // milliseconds
} as const;
