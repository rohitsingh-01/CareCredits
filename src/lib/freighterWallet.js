import {
  getAddress,
  getNetwork,
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";
import { NETWORK_PASSPHRASE } from "./stellar.js";

function parseInstalled(result) {
  if (typeof result === "boolean") return result;
  if (result && typeof result === "object" && "isConnected" in result) return Boolean(result.isConnected);
  return Boolean(result);
}

function getErrorMessage(error) {
  if (!error) return "";
  return error.message || String(error);
}

export async function connectFreighterWallet() {
  const connectionCheck = await isConnected();
  if (!parseInstalled(connectionCheck)) {
    throw new Error("Freighter wallet not found. Install Freighter, unlock it, and reload the app.");
  }

  const access = await requestAccess();
  if (access?.error) throw new Error(getErrorMessage(access.error));

  const addressResult = await getAddress();
  if (addressResult?.error) throw new Error(getErrorMessage(addressResult.error));
  const address = access?.address || addressResult?.address;
  if (!address) throw new Error("Freighter did not return a public address.");

  const networkResult = await getNetwork();
  if (networkResult?.error) throw new Error(getErrorMessage(networkResult.error));
  const network = networkResult?.network;
  if (network !== "TESTNET") {
    throw new Error(`Freighter is set to ${network || "an unknown network"}. Switch Freighter to TESTNET and reconnect.`);
  }

  try {
    localStorage.setItem("carecredits_wallet_address", address);
  } catch (_) {}

  window.CareWalletState = { address, network };
  return { address, network };
}

export function disconnectFreighterWallet() {
  try {
    localStorage.removeItem("carecredits_wallet_address");
  } catch (_) {}
  window.CareWalletState = { address: null, network: null };
}

export async function signWithFreighter(transactionXdr, address) {
  const result = await signTransaction(transactionXdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
    address,
  });
  if (result?.error) throw new Error(getErrorMessage(result.error));
  if (!result?.signedTxXdr) throw new Error("Freighter did not return a signed transaction.");
  return result.signedTxXdr;
}
