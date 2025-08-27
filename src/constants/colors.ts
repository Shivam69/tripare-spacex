/**
 * App Color Constants
 * Centralized color definitions for consistent theming across the app
 */

export const Colors = {
  // Primary Colors
  primary: '#007AFF',      // iOS system blue
  primaryDark: '#1976D2',  // Darker blue variant
  primaryLight: '#E3F2FD', // Light blue background
  
  // Status Colors
  success: '#34C759',      // Green for success states
  error: '#FF3B30',        // Red for error states
  warning: '#FF9500',      // Orange for warning states
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Gray Scale
  gray100: '#F2F2F7',     // Light background
  gray200: '#E5E5EA',     // Border color
  gray500: '#8E8E93',     // Secondary text
  
  // Semantic Colors
  background: '#F2F2F7',
  surface: '#FFFFFF',
  border: '#E5E5EA',
  shadow: '#000000',
  
  // Text Colors
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  textInverse: '#FFFFFF',
  
  // Status Badge Colors
  statusActive: '#007AFF',
  statusSuccess: '#34C759',
  statusFailure: '#FF3B30',
  statusUpcoming: '#8E8E93',
} as const;

// Type for color keys
export type ColorKey = keyof typeof Colors;