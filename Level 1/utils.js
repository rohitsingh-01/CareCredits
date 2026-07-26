/**
 * utils.js — Helper utilities for Level 1 White Belt.
 */

export function stroopsToXlm(stroops) {
  const b = BigInt(stroops || 0);
  const integerPart = b / 10000000n;
  const fractionalPart = (b % 10000000n).toString().padStart(7, "0");
  return `${integerPart}.${fractionalPart}`;
}

export function xlmToStroops(xlmStr) {
  const parts = String(xlmStr).split(".");
  const integerPart = BigInt(parts[0] || "0");
  const fracString = (parts[1] || "").slice(0, 7).padEnd(7, "0");
  const fractionalPart = BigInt(fracString);
  return integerPart * 10000000n + fractionalPart;
}

export function truncateAddress(address) {
  if (!address || typeof address !== "string") return "";
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}
