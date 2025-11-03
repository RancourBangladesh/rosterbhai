/**
 * Utility functions for getting tenant-specific shift definitions
 */

import { SHIFT_MAP } from './constants';

/**
 * Get shift definition for display
 * This is a client-side function that should be called with pre-loaded shift definitions
 */
export function getShiftLabel(shiftCode: string, shiftDefinitions?: Record<string, string>): string {
  if (!shiftCode || shiftCode === 'N/A' || shiftCode === 'Empty') return 'N/A';
  
  // Use tenant-specific definitions if available, otherwise fall back to defaults
  const definitions = shiftDefinitions || SHIFT_MAP;
  return definitions[shiftCode] || shiftCode;
}

/**
 * Get all shift codes from definitions
 */
export function getShiftCodes(shiftDefinitions?: Record<string, string>): string[] {
  const definitions = shiftDefinitions || SHIFT_MAP;
  return Object.keys(definitions).filter(code => code !== '');
}

/**
 * Check if a shift code is valid
 */
export function isValidShiftCode(code: string, shiftDefinitions?: Record<string, string>): boolean {
  const definitions = shiftDefinitions || SHIFT_MAP;
  return code in definitions;
}
