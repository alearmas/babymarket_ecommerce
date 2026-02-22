/**
 * Shipping configuration.
 *
 * Pricing logic (margins, sale price calculation) has been moved to the backend.
 * This module now only handles shipping fees.
 */

/** Shipping fee charged for orders below the free-shipping threshold. */
export const SHIPPING_FEE = 1_000;

/** Orders equal to or above this amount qualify for free shipping. */
export const FREE_SHIPPING_THRESHOLD = 30_000;

/** Returns the shipping cost for a given subtotal. */
export function calcShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}
