/**
 * Modern Light Theme Color Constants
 * Centralized color definitions for consistent theming across the app
 */

export const Colors = {
  // Primary Colors - Modern blue palette
  primary: '#2563EB',      // Modern vibrant blue
  primaryDark: '#1D4ED8',  // Darker blue variant
  primaryLight: '#EFF6FF', // Very light blue background
  primarySoft: '#DBEAFE', // Soft blue for backgrounds
  
  // Status Colors - Modern, softer tones
  success: '#10B981',      // Modern green
  error: '#EF4444',        // Modern red
  warning: '#F59E0B',      // Modern amber
  info: '#3B82F6',         // Modern blue for info
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Modern Gray Scale
  gray50: '#F9FAFB',       // Very light gray
  gray100: '#F3F4F6',      // Light background
  gray200: '#E5E7EB',      // Border color
  gray300: '#D1D5DB',      // Light border
  gray400: '#9CA3AF',      // Placeholder text
  gray500: '#6B7280',      // Secondary text
  gray600: '#4B5563',      // Tertiary text
  gray700: '#374151',      // Primary text
  gray800: '#1F2937',      // Dark text
  gray900: '#111827',      // Darkest text
  
  // Semantic Colors - Modern light theme
  background: '#F9FAFB',   // Very light gray background
  surface: '#FFFFFF',      // Pure white surfaces
  surfaceElevated: '#FFFFFF', // Elevated surfaces
  border: '#E5E7EB',       // Light border
  borderLight: '#F3F4F6',  // Very light border
  shadow: '#000000',       // Shadow color
  
  // Text Colors - Better contrast and hierarchy
  textPrimary: '#111827',    // Dark gray for primary text
  textSecondary: '#6B7280',  // Medium gray for secondary text
  textTertiary: '#9CA3AF',   // Light gray for tertiary text
  textInverse: '#FFFFFF',    // White text on dark backgrounds
  textPlaceholder: '#9CA3AF', // Placeholder text
  
  // Status Badge Colors - Updated to match new palette
  statusActive: '#2563EB',
  statusSuccess: '#10B981',
  statusFailure: '#EF4444',
  statusUpcoming: '#6B7280',
  
  // Interactive Colors
  interactive: '#2563EB',     // For buttons, links
  interactiveHover: '#1D4ED8', // Hover state
  interactivePressed: '#1E40AF', // Pressed state
  
  // Background Variants
  backgroundSecondary: '#F3F4F6', // Slightly darker background
  backgroundAccent: '#EFF6FF',    // Accent background
} as const;

// Type for color keys
export type ColorKey = keyof typeof Colors;