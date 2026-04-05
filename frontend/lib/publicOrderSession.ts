/**
 * Token and cart session management for public/customer self-ordering
 * Uses localStorage with SSR-safe checks
 */

const TOKEN_KEY = 'coffee-leo-public-token';
const CART_KEY_PREFIX = 'coffee-leo-cart:';

/**
 * Get the stored public order token from localStorage
 */
export function getPublicOrderToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    console.warn('Failed to read token from localStorage:', e);
    return null;
  }
}

/**
 * Set the public order token in localStorage
 */
export function setPublicOrderToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.warn('Failed to save token to localStorage:', e);
  }
}

/**
 * Clear the public order token
 */
export function clearPublicOrderToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.warn('Failed to clear token from localStorage:', e);
  }
}

/**
 * Load cart for a specific token from localStorage
 * Generic typed version
 */
export function loadPublicOrderCart<T = any>(token: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = `${CART_KEY_PREFIX}${token}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.warn(`Failed to load cart for token ${token}:`, e);
    return [];
  }
}

/**
 * Save cart for a specific token to localStorage
 * Generic typed version
 */
export function savePublicOrderCart<T = any>(token: string, cart: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `${CART_KEY_PREFIX}${token}`;
    localStorage.setItem(key, JSON.stringify(cart));
  } catch (e) {
    console.warn(`Failed to save cart for token ${token}:`, e);
  }
}

/**
 * Clear cart for a specific token
 */
export function clearPublicOrderCart(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = `${CART_KEY_PREFIX}${token}`;
    localStorage.removeItem(key);
  } catch (e) {
    console.warn(`Failed to clear cart for token ${token}:`, e);
  }
}
