// Pure helper functions for CareCredits frontend

/**
 * Converts stroops (integer) to XLM (string / float representation).
 * 1 XLM = 10,000,000 Stroops (10^7).
 */
export function stroopsToXlm(stroops) {
  const parsed = parseInt(stroops, 10);
  if (isNaN(parsed)) return "0";
  return (parsed / 10000000).toString();
}

/**
 * Converts XLM (string or number) to stroops (integer).
 */
export function xlmToStroops(xlm) {
  const val = parseFloat(xlm);
  if (isNaN(val) || val < 0) return 0;
  return Math.round(val * 10000000);
}

/**
 * Calculates progress percentage, capped between 0 and 100.
 * Handles goal=0 without throwing NaN or Infinity.
 */
export function calculateProgressPercent(raised, goal) {
  const raisedVal = parseFloat(raised);
  const goalVal = parseFloat(goal);
  if (isNaN(goalVal) || goalVal <= 0) return 0;
  if (isNaN(raisedVal) || raisedVal <= 0) return 0;
  const pct = Math.floor((raisedVal / goalVal) * 100);
  return Math.min(Math.max(pct, 0), 100);
}

/**
 * Truncates a Stellar public key or contract address to 'G...XXXX'.
 */
export function truncateAddress(address) {
  if (!address || typeof address !== 'string') return "";
  if (address.length <= 10) return address;
  return address.substring(0, 6) + "..." + address.substring(address.length - 4);
}

/**
 * Classifies an error into a user-friendly code.
 */
export function classifyError(err) {
  const msg = (err?.message || err || "").toString();
  if (msg.includes("Freighter") || msg.includes("wallet not found") || msg.includes("not found")) {
    return "WALLET_NOT_FOUND";
  }
  if (msg.includes("User rejected") || msg.includes("reject") || msg.includes("cancel") || msg.includes("declined")) {
    return "USER_REJECTED";
  }
  if (msg.includes("insufficient balance") || msg.includes("insufficient funds") || msg.includes("underfunded")) {
    return "INSUFFICIENT_BALANCE";
  }
  return "UNKNOWN_ERROR";
}

/**
 * Returns a user-friendly error message for a given error code.
 */
export function errorMessageFor(code) {
  switch (code) {
    case "WALLET_NOT_FOUND":
      return "Freighter wallet was not detected. Please ensure it is installed and unlocked.";
    case "USER_REJECTED":
      return "The transaction request was rejected or cancelled in the wallet browser extension.";
    case "INSUFFICIENT_BALANCE":
      return "Your connected account has insufficient XLM balance to complete this transaction.";
    default:
      return "An unexpected error occurred. Please check the console logs for details.";
  }
}
