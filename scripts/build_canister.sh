#!/bin/bash
# Build marketplace canisters and extract wasm/did artifacts
# Usage: ./scripts/build_canister.sh [output_dir]

set -e

OUTPUT_DIR="${1:-artifacts}"

# Navigate to project root if we're in scripts dir
if [ -d "../src" ]; then
    cd ..
fi

mkdir -p "$OUTPUT_DIR"

# Start dfx if not running
if ! dfx ping &>/dev/null; then
    echo "Starting dfx..."
    dfx start --background --clean
    sleep 2
fi

# Build backend canister
echo "Building marketplace_backend canister..."
dfx canister create marketplace_backend
dfx build marketplace_backend

# Copy backend artifacts
cp .kybra/marketplace_backend/marketplace_backend.wasm "$OUTPUT_DIR/"
cp src/marketplace_backend/marketplace_backend.did "$OUTPUT_DIR/"
gzip -k "$OUTPUT_DIR/marketplace_backend.wasm"

# Build frontend canister
echo "Building marketplace_frontend canister..."
echo "Installing frontend dependencies..."
cd src/marketplace_frontend && npm install && cd ../..
dfx canister create marketplace_frontend
dfx build marketplace_frontend

# Copy frontend artifacts
cp .dfx/local/canisters/marketplace_frontend/assetstorage.wasm.gz "$OUTPUT_DIR/marketplace_frontend.wasm.gz"
gunzip -k "$OUTPUT_DIR/marketplace_frontend.wasm.gz"
cp .dfx/local/canisters/marketplace_frontend/assetstorage.did "$OUTPUT_DIR/marketplace_frontend.did"

# Build info
echo "Marketplace Build Date: $(date -u)" >> "$OUTPUT_DIR/BUILD_INFO.txt"

echo "✅ Marketplace artifacts built successfully:"
ls -la "$OUTPUT_DIR/marketplace_"*
