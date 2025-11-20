// App Title Constants
export const APP_TITLE = {
  MAIN: 'EmpChartIO'
} as const;

// Page Title Constants
export const PAGE_TITLES = {
  LOGIN: 'Sign in to your account',
  REGISTER: 'Create your account',
  HOME: 'Organization Chart',
  WELCOME: 'Welcome back',
} as const;

// Button Text Constants
export const BUTTON_TEXT = {
  SIGN_IN: 'Sign in',
  SIGN_UP: 'Sign up',
  SIGNING_IN: 'Signing in...',
  CREATING_ACCOUNT: 'Creating account...',
  LOGOUT: 'Logout',
} as const;

// Form Label Constants
export const FORM_LABELS = {
  EMAIL: 'Email address',
  PASSWORD: 'Password',
  CONFIRM_PASSWORD: 'Confirm password',
  FULL_NAME: 'Full name',
  PHONE: 'Phone number',
  DEPARTMENT: 'Department',
  DESIGNATION: 'Designation',
} as const;

// Placeholder Constants
export const PLACEHOLDERS = {
  EMAIL: 'you@example.com',
  PASSWORD: '••••••••',
  FULL_NAME: 'John Doe',
  PHONE: '+1-555-0100',
  DESIGNATION: 'Software Engineer',
  SELECT_DEPARTMENT: 'Select a department',
} as const;

// Link Text Constants
export const LINK_TEXT = {
  HAVE_ACCOUNT: 'Already have an account?',
  NO_ACCOUNT: "Don't have an account?",
  SIGN_IN_LINK: 'Sign in',
  SIGN_UP_LINK: 'Sign up',
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
} as const;

// Department Constants
export const DEPARTMENTS = [
  { value: 'TECHNOLOGY', label: 'Technology' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'EXECUTIVE', label: 'Executive' },
] as const;

// Helper Text
export const HELPER_TEXT = {
  PASSWORD_REQUIREMENT: 'Minimum 8 characters',
  CHART_COMING_SOON: 'Chart coming soon...',
  LOGGED_IN_MESSAGE: "You're logged in! The organization chart will be displayed here.",
  IMAGE_UPLOAD_REQUIREMENTS: 'JPG, JPEG or PNG. Max 2MB.',
  SELECT_DEPARTMENT_FIRST: 'Please select a department to view available designations',
} as const;

// Route Paths
export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  HOME: '/',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  FULL_NAME_REQUIRED: 'Full name is required',
  EMAIL_REQUIRED: 'Email is required',
  PHONE_REQUIRED: 'Phone number is required',
  DEPARTMENT_REQUIRED: 'Please select a department',
  DESIGNATION_REQUIRED: 'Please select a designation',
  PASSWORD_REQUIRED: 'Password is required',
  INVALID_IMAGE_TYPE: 'Invalid file type. Only JPG, JPEG, and PNG are allowed.',
  IMAGE_SIZE_EXCEEDED: 'File size exceeds 2MB limit.',
  IMAGE_PROCESSING_FAILED: 'Failed to process image',
  LOADING_CHART: 'Loading organization chart...',
  ERROR_LOADING_CHART: 'Error loading chart',
  NO_ORG_DATA: 'No organizational data available',
  FAILED_TO_READ_FILE: 'Failed to read file.',
  API_ERROR: 'An error occurred',
} as const;

// Step Titles
export const STEP_TITLES = {
  PROFILE_INFO: 'Profile & Personal Info',
  WORK_INFO: 'Work Information',
  SECURITY: 'Security',
} as const;

// Labels and Text
export const LABELS = {
  PROFILE_PHOTO: 'Profile Photo (Optional)',
  UPLOAD_PHOTO: 'Upload Photo',
  LEVEL: 'Level',
  ORGANIZATION_HIERARCHY: 'Organization Hierarchy',
  ORGANIZATION_STRUCTURE: 'Organization Structure',
  MY_REPORTING_LINE: 'My Reporting Line',
  ALL_EMPLOYEES: 'All Employees',
  EMPLOYEES: 'Employees',
  DEPARTMENTS: 'Departments',
  LOADING_DEPARTMENTS: 'Loading departments...',
  NO_DEPARTMENTS: 'No departments available',
  LOADING_DESIGNATIONS: 'Loading...',
  SELECT_DESIGNATION: 'Select a designation',
  UNKNOWN_EMPLOYEE: 'Unknown',
  NO_TITLE: 'No Title',
} as const;

// Button Labels
export const BUTTON_LABELS = {
  NEXT: 'Next',
  BACK: 'Back',
  ZOOM_IN: 'Zoom In',
  ZOOM_OUT: 'Zoom Out',
  RESET_VIEW: 'Reset View',
  CONFIRM: 'Confirm',
  CANCEL: 'Cancel',
  PROCESSING: 'Processing...',
} as const;

// Confirmation Messages
export const CONFIRMATION_MESSAGES = {
  REASSIGNMENT_TITLE: 'Confirm Manager Reassignment',
  REASSIGNMENT_DESCRIPTION: (employeeName: string, managerName: string) => 
    `Are you sure you want to reassign ${employeeName} to report to ${managerName}?\n\nThis will change the organizational hierarchy.`,
  UPDATING_ORG_CHART: 'Updating organization chart...',
} as const;

// View Modes
export const VIEW_MODES = {
  MY_TEAM: 'myTeam',
  ALL: 'all',
} as const;
