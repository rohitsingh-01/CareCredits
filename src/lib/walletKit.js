import { connectFreighterWallet, disconnectFreighterWallet, signWithFreighter } from "./freighterWallet.js";

export async function connectWalletForPool() {
  return connectFreighterWallet();
}

export function disconnectWalletForPool() {
  disconnectFreighterWallet();
}

export async function signPoolTransaction(transactionXdr, address) {
  return signWithFreighter(transactionXdr, address);
}
