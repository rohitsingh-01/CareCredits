param (
    [Parameter(Mandatory=$true)]
    [string]$CaregiverKey,
    [Parameter(Mandatory=$true)]
    [string]$GoalStroops
)

$ErrorActionPreference = "Stop"

Write-Host "=== Adding Wasm Target ==="
rustup target add wasm32-unknown-unknown

Write-Host "=== Building Contract ==="
$env:CARGO_TARGET_DIR="C:\Users\rohit\Documents\New project\.cargo_target"
Push-Location contract
& cargo build --target wasm32-unknown-unknown --release
Pop-Location

$WasmPath = ".cargo_target\wasm32-unknown-unknown\release\care_fund_pool.wasm"
if (-not (Test-Path $WasmPath)) {
    $WasmPath = ".cargo_target\wasm32-none-any\release\care_fund_pool.wasm"
}
if (-not (Test-Path $WasmPath)) {
    $WasmPath = "target\wasm32-unknown-unknown\release\care_fund_pool.wasm"
}
if (-not (Test-Path $WasmPath)) {
    $WasmPath = "target\wasm32-none-any\release\care_fund_pool.wasm"
}

Write-Host "=== Generating and Funding Deployer Key ==="
$DeployerExists = $true
try {
    & stellar keys address carecredits-deployer *>$null
} catch {
    $DeployerExists = $false
}

# Double check if stellar keys command output actually succeeded
if ($LASTEXITCODE -ne 0) {
    $DeployerExists = $false
}

if (-not $DeployerExists) {
    & stellar keys generate carecredits-deployer --network testnet --fund
} else {
    Write-Host "Deployer key already exists."
}

$DeployerAddr = (& stellar keys address carecredits-deployer).Trim()
Write-Host "Deployer Address: $DeployerAddr"

Write-Host "=== Deploying Smart Contract ==="
$ContractId = (& stellar contract deploy --wasm $WasmPath --source carecredits-deployer --network testnet).Trim()
Write-Host "Contract Deployed. Contract ID: $ContractId"

Write-Host "=== Resolving Native Token SAC ID ==="
$TokenId = (& stellar contract asset id --asset native --network testnet).Trim()
Write-Host "Token ID (XLM SAC): $TokenId"

Write-Host "=== Initializing Contract ==="
& stellar contract invoke `
  --id $ContractId `
  --source carecredits-deployer `
  --network testnet `
  -- `
  initialize `
  --caregiver $CaregiverKey `
  --admin $DeployerAddr `
  --goal $GoalStroops `
  --token $TokenId

Write-Host "=== Deployment Completed Successfully ==="
Write-Host "CONTRACT_ID=$ContractId"
Write-Host "TOKEN_ID=$TokenId"
Write-Host "ADMIN_KEY=$DeployerAddr"
