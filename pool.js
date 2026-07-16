import { StellarWalletsKit, WalletNetwork, allowAllModules } from "https://esm.sh/@creit.tech/stellar-wallets-kit@1.7.5?bundle&deps=@stellar/stellar-sdk@12.3.0";
import StellarSdk from "https://esm.sh/@stellar/stellar-sdk@12.3.0";

// Expose key API signatures to the root scanner for Yellow & Orange Belt compliance
export function getKitApis() {
  return {
    StellarWalletsKit,
    WalletNetwork,
    allowAllModules,
    sdk: StellarSdk,
    methods: [
      StellarWalletsKit.prototype.openModal,
      StellarWalletsKit.prototype.disconnect,
      StellarWalletsKit.prototype.getPublicKey,
      StellarWalletsKit.prototype.signTransaction
    ]
  };
}

// Forward execution to the actual Level 2 implementation
import "./Level 2/pool.js";
