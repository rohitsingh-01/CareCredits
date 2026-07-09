#!/bin/bash
set -euo pipefail

if [ "$#" -lt 3 ]; then
    echo "Usage: $0 <REGISTRY_ID> <CAREGIVER_PUBLIC_KEY> <GOAL_IN_STROOPS>"
    exit 1
fi

REGISTRY_ID=$1
CAREGIVER_KEY=$2
GOAL_STROOPS=$3

echo "=== Building CareFundPool Contract ==="
export CARGO_TARGET_DIR="C:\Users\rohit\Documents\New project\contracts\target"
cargo build --target wasm32-unknown-unknown --release --package care_fund_pool

WASM_PATH="contracts/target/wasm32v1-none/release/care_fund_pool.wasm"
if [ ! -f "$WASM_PATH" ]; then
    WASM_PATH="contracts/target/wasm32-unknown-unknown/release/care_fund_pool.wasm"
fi
if [ ! -f "$WASM_PATH" ]; then
    WASM_PATH="contracts/target/wasm32-none-any/release/care_fund_pool.wasm"
fi
if [ ! -f "$WASM_PATH" ]; then
    WASM_PATH="target/wasm32-unknown-unknown/release/care_fund_pool.wasm"
fi
if [ ! -f "$WASM_PATH" ]; then
    WASM_PATH="target/wasm32-none-any/release/care_fund_pool.wasm"
fi

DEPLOYER_ADDR=$(stellar keys address carecredits-deployer)
echo "Deployer Address: $DEPLOYER_ADDR"

echo "=== Deploying CareFundPool ==="
POOL_ID=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source carecredits-deployer \
  --network testnet)

echo "CareFundPool Deployed. Pool ID: $POOL_ID"

echo "=== Resolving Native Token SAC ID ==="
TOKEN_ID=$(stellar contract asset id --asset native --network testnet)
echo "Token ID (XLM SAC): $TOKEN_ID"

echo "=== Initializing CareFundPool ==="
stellar contract invoke \
  --id "$POOL_ID" \
  --source carecredits-deployer \
  --network testnet \
  -- \
  initialize \
  --caregiver "$CAREGIVER_KEY" \
  --admin "$DEPLOYER_ADDR" \
  --goal "$GOAL_STROOPS" \
  --token "$TOKEN_ID" \
  --registry "$REGISTRY_ID"

echo "=== CareFundPool Deployment Completed Successfully ==="
echo "POOL_ID=$POOL_ID"
