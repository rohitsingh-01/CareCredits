#!/bin/bash
set -euo pipefail

# Argument check
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <CAREGIVER_PUBLIC_KEY> <GOAL_IN_STROOPS>"
    exit 1
fi

CAREGIVER_KEY=$1
GOAL_STROOPS=$2

echo "=== Adding Wasm Target ==="
rustup target add wasm32-unknown-unknown

echo "=== Building Contract ==="
export CARGO_TARGET_DIR="C:\Users\rohit\Documents\New project\.cargo_target"
cd contract
cargo build --target wasm32-unknown-unknown --release
cd ..

WASM_PATH=".cargo_target/wasm32-unknown-unknown/release/care_fund_pool.wasm"
if [ ! -f "$WASM_PATH" ]; then
    WASM_PATH=".cargo_target/wasm32-none-any/release/care_fund_pool.wasm"
fi
if [ ! -f "$WASM_PATH" ]; then
    WASM_PATH="target/wasm32-unknown-unknown/release/care_fund_pool.wasm"
fi
if [ ! -f "$WASM_PATH" ]; then
    WASM_PATH="target/wasm32-none-any/release/care_fund_pool.wasm"
fi

echo "=== Generating and Funding Deployer Key ==="
if ! stellar keys address carecredits-deployer &>/dev/null; then
    stellar keys generate carecredits-deployer --network testnet --fund
else
    echo "Deployer key already exists."
fi

DEPLOYER_ADDR=$(stellar keys address carecredits-deployer)
echo "Deployer Address: $DEPLOYER_ADDR"

echo "=== Deploying Smart Contract ==="
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source carecredits-deployer \
  --network testnet)

echo "Contract Deployed. Contract ID: $CONTRACT_ID"

echo "=== Resolving Native Token SAC ID ==="
TOKEN_ID=$(stellar contract asset id --asset native --network testnet)
echo "Token ID (XLM SAC): $TOKEN_ID"

echo "=== Initializing Contract ==="
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source carecredits-deployer \
  --network testnet \
  -- \
  initialize \
  --caregiver "$CAREGIVER_KEY" \
  --admin "$DEPLOYER_ADDR" \
  --goal "$GOAL_STROOPS" \
  --token "$TOKEN_ID"

echo "=== Deployment Completed Successfully ==="
echo "CONTRACT_ID=$CONTRACT_ID"
echo "TOKEN_ID=$TOKEN_ID"
echo "ADMIN_KEY=$DEPLOYER_ADDR"
