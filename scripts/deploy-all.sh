#!/bin/bash
set -euo pipefail

if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <CAREGIVER_PUBLIC_KEY> <GOAL_IN_STROOPS>"
    exit 1
fi

CAREGIVER_KEY=$1
GOAL_STROOPS=$2

# Load deploy scripts relative directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "==========================================="
echo "Starting Full Orchestrated Deployment"
echo "==========================================="

# 1. Deploy registry
REGISTRY_OUTPUT=$("$DIR/deploy-registry.sh")
echo "$REGISTRY_OUTPUT"
REGISTRY_ID=$(echo "$REGISTRY_OUTPUT" | grep "REGISTRY_ID=" | cut -d'=' -f2)

if [ -z "$REGISTRY_ID" ]; then
    echo "Error: Failed to retrieve REGISTRY_ID"
    exit 1
fi

# 2. Deploy fund pool
POOL_OUTPUT=$("$DIR/deploy-fund-pool.sh" "$REGISTRY_ID" "$CAREGIVER_KEY" "$GOAL_STROOPS")
echo "$POOL_OUTPUT"
POOL_ID=$(echo "$POOL_OUTPUT" | grep "POOL_ID=" | cut -d'=' -f2)

if [ -z "$POOL_ID" ]; then
    echo "Error: Failed to retrieve POOL_ID"
    exit 1
fi

# 3. Call set_verified on registry so caregiver is pre-verified for demo ease
echo "=== Pre-verifying Caregiver on Registry ==="
DEPLOYER_ADDR=$(stellar keys address carecredits-deployer)
stellar contract invoke \
  --id "$REGISTRY_ID" \
  --source carecredits-deployer \
  --network testnet \
  -- \
  set_verified \
  --admin "$DEPLOYER_ADDR" \
  --caregiver "$CAREGIVER_KEY" \
  --verified true

echo "==========================================="
echo "Orchestration Finished Successfully!"
echo "REGISTRY_ID=$REGISTRY_ID"
echo "POOL_ID=$POOL_ID"
echo "==========================================="
