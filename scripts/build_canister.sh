#!/bin/bash
# Build marketplace backend canister and extract wasm/did artifacts
# Usage: ./scripts/build_canister.sh [output_dir]
#
# Note: Only builds backend. Frontend requires all token canisters for dfx generate.

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

# Build backend canister only
echo "Building marketplace_backend canister..."
dfx canister create marketplace_backend
dfx build marketplace_backend

# Copy backend artifacts
cp .basilisk/marketplace_backend/marketplace_backend.wasm "$OUTPUT_DIR/"
cp src/marketplace_backend/marketplace_backend.did "$OUTPUT_DIR/"
gzip -k "$OUTPUT_DIR/marketplace_backend.wasm"

# Build info
echo "Marketplace Build Date: $(date -u)" >> "$OUTPUT_DIR/BUILD_INFO.txt"

echo "✅ Backend artifacts built successfully:"
ls -la "$OUTPUT_DIR/"*
