#!/bin/bash
# Deploy marketplace canisters locally for development
# Usage: ./scripts/deploy_local.sh

set -e

# Navigate to project root if we're in scripts dir
if [ -d "../src" ]; then
    cd ..
fi

echo "🚀 Deploying Marketplace locally..."

# Start dfx if not running
if ! dfx ping &>/dev/null; then
    echo "Starting dfx..."
    dfx start --background --clean
    sleep 2
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -q -r requirements.txt

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd src/marketplace_frontend && npm install && cd ../..

# Deploy all canisters
echo "Deploying canisters..."
dfx deploy

# Get canister IDs
BACKEND_ID=$(dfx canister id marketplace_backend)
FRONTEND_ID=$(dfx canister id marketplace_frontend)

echo ""
echo "✅ Local deployment successful!"
echo ""
echo "Backend canister:  $BACKEND_ID"
echo "Frontend canister: $FRONTEND_ID"
echo ""
echo "Frontend URL: http://${FRONTEND_ID}.localhost:4943/"
echo ""

# Verify deployment
echo "Verifying deployment..."
dfx canister call marketplace_backend get_name
dfx canister call marketplace_backend is_test_mode
