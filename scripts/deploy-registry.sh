#!/bin/bash
set -euo pipefail

echo "=== Building CareRegistry Contract ==="
export CARGO_TARGET_DIR="C:\Users\rohit\Documents\New project\contracts\target"
cargo build --target wasm32-unknown-unknown --release --package care_registry

WASM_PATH="contracts/target/wasm32v1-none/release/care_registry.wasm"
if [ ! -f "$WASM_PATH" ]; then
    WASM_PATH="contracts/target/wasm32-unknown-unknown/release/care_registry.wasm"
fi
if [ ! -f "$WASM_PATH" ]; then
    WASM_PATH="contracts/target/wasm32-none-any/release/care_registry.wasm"
fi
if [ ! -f "$WASM_PATH" ]; then
    WASM_PATH="target/wasm32-unknown-unknown/release/care_registry.wasm"
fi
if [ ! -f "$WASM_PATH" ]; then
    WASM_PATH="target/wasm32-none-any/release/care_registry.wasm"
fi

echo "=== Generating/Funding Deployer Key ==="
if ! stellar keys address carecredits-deployer &>/dev/null; then
    stellar keys generate carecredits-deployer --network testnet --fund
else
    echo "Deployer key already exists."
fi

DEPLOYER_ADDR=$(stellar keys address carecredits-deployer)
echo "Deployer Address: $DEPLOYER_ADDR"

echo "=== Deploying CareRegistry ==="
REGISTRY_ID=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source carecredits-deployer \
  --network testnet)

echo "CareRegistry Deployed. Registry ID: $REGISTRY_ID"

echo "=== Initializing CareRegistry ==="
stellar contract invoke \
  --id "$REGISTRY_ID" \
  --source carecredits-deployer \
  --network testnet \
  -- \
  initialize \
  --admin "$DEPLOYER_ADDR"

echo "=== CareRegistry Deployment Completed Successfully ==="
echo "REGISTRY_ID=$REGISTRY_ID"
