# scripts/deploy-all.ps1 — Native Windows PowerShell deployment orchestration
# Usage: .\scripts\deploy-all.ps1 <CAREGIVER_PUBLIC_KEY> <GOAL_IN_STROOPS>

param(
    [Parameter(Mandatory=$true)]
    [string]$CaregiverKey,
    
    [Parameter(Mandatory=$true)]
    [string]$GoalStroops
)

$ErrorActionPreference = "Stop"

$workspaceRoot = Resolve-Path "$PSScriptRoot\.."

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Starting Full Orchestrated Windows Deployment" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# 1. Build contracts
Write-Host "=== Building Contracts ===" -ForegroundColor Green
$env:CARGO_TARGET_DIR = "$workspaceRoot\contracts\target"
Set-Location "$workspaceRoot\contracts"
stellar contract build
Set-Location $workspaceRoot

$registryWasm = "$workspaceRoot\contracts\target\wasm32v1-none\release\care_registry.wasm"
if (-not (Test-Path $registryWasm)) {
    $registryWasm = "$workspaceRoot\contracts\target\wasm32-unknown-unknown\release\care_registry.wasm"
}
if (-not (Test-Path $registryWasm)) {
    $registryWasm = "$workspaceRoot\contracts\target\wasm32-none-any\release\care_registry.wasm"
}

$poolWasm = "$workspaceRoot\contracts\target\wasm32v1-none\release\care_fund_pool.wasm"
if (-not (Test-Path $poolWasm)) {
    $poolWasm = "$workspaceRoot\contracts\target\wasm32-unknown-unknown\release\care_fund_pool.wasm"
}
if (-not (Test-Path $poolWasm)) {
    $poolWasm = "$workspaceRoot\contracts\target\wasm32-none-any\release\care_fund_pool.wasm"
}

# 2. Fund Deployer Key
Write-Host "=== Generating/Funding Deployer Key ===" -ForegroundColor Green
$deployerExists = stellar keys address carecredits-deployer 2>$null
if (-not $deployerExists) {
    stellar keys generate carecredits-deployer --network testnet --fund
} else {
    Write-Host "Deployer key already exists."
}

$deployerAddr = (stellar keys address carecredits-deployer).Trim()
Write-Host "Deployer Address: $deployerAddr"

# 3. Deploy CareRegistry
Write-Host "=== Deploying CareRegistry ===" -ForegroundColor Green
$registryId = (stellar contract deploy --wasm $registryWasm --source carecredits-deployer --network testnet).Trim()
Write-Host "CareRegistry Deployed. Registry ID: $registryId"

# 4. Initialize CareRegistry
Write-Host "=== Initializing CareRegistry ===" -ForegroundColor Green
stellar contract invoke --id $registryId --source carecredits-deployer --network testnet -- initialize --admin $deployerAddr

# 5. Deploy CareFundPool
Write-Host "=== Deploying CareFundPool ===" -ForegroundColor Green
$poolId = (stellar contract deploy --wasm $poolWasm --source carecredits-deployer --network testnet).Trim()
Write-Host "CareFundPool Deployed. Pool ID: $poolId"

# 6. Resolve Native Token SAC
Write-Host "=== Resolving Native Token SAC ID ===" -ForegroundColor Green
$tokenId = (stellar contract asset id --asset native --network testnet).Trim()
Write-Host "Token ID (XLM SAC): $tokenId"

# 7. Initialize CareFundPool
Write-Host "=== Initializing CareFundPool ===" -ForegroundColor Green
stellar contract invoke --id $poolId --source carecredits-deployer --network testnet -- initialize --caregiver $CaregiverKey --admin $deployerAddr --goal $GoalStroops --token $tokenId --registry $registryId

# 8. Pre-verify Caregiver
Write-Host "=== Pre-verifying Caregiver on Registry ===" -ForegroundColor Green
stellar contract invoke --id $registryId --source carecredits-deployer --network testnet -- set_verified --admin $deployerAddr --caregiver $CaregiverKey --verified true

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Orchestration Finished Successfully!" -ForegroundColor Cyan
Write-Host "REGISTRY_ID=$registryId" -ForegroundColor Yellow
Write-Host "POOL_ID=$poolId" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Cyan
