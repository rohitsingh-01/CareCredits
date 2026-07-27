import * as StellarSdk from "@stellar/stellar-sdk";

export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const RPC_URL = "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

export const horizonServer = new StellarSdk.Horizon.Server(HORIZON_URL);

export function getRpcServer() {
  const rpcNamespace = StellarSdk.SorobanRpc || StellarSdk.rpc;
  return new rpcNamespace.Server(RPC_URL);
}

export function getRpcNamespace() {
  return StellarSdk.SorobanRpc || StellarSdk.rpc;
}

export async function fetchNativeBalance(address, server = horizonServer) {
  const account = await server.loadAccount(address);
  const nativeBalance = account.balances.find((balance) => balance.asset_type === "native");
  return nativeBalance ? Number(nativeBalance.balance).toFixed(4) : "0.0000";
}

export async function buildNativePaymentTransaction({
  sourceAddress,
  destination,
  amount,
  memo,
  server = horizonServer,
}) {
  const sourceAccount = await server.loadAccount(sourceAddress);
  let builder = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  }).addOperation(
    StellarSdk.Operation.payment({
      destination,
      asset: StellarSdk.Asset.native(),
      amount: Number(amount).toFixed(7),
    }),
  );

  if (memo) {
    builder = builder.addMemo(StellarSdk.Memo.text(memo.slice(0, 28)));
  }

  return builder.setTimeout(StellarSdk.TimeoutInfinite).build();
}

export async function submitClassicTransaction(signedTxXdr, server = horizonServer) {
  const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
  return server.submitTransaction(signedTransaction);
}

export { StellarSdk };
