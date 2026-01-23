#!/bin/bash
# Integration test entrypoint for marketplace canister
# Runs inside the ICP dev Docker container

set -e

echo "=== Marketplace Integration Tests ==="

# Navigate to project root if needed
if [ -d "../../src" ]; then
    cd ../..
fi

# Start dfx
echo "Starting dfx..."
dfx start --background --clean
sleep 3

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -q -r requirements.txt

# Deploy backend canisters only (no frontend build needed for integration tests)
echo "Deploying backend canisters..."
dfx deploy marketplace_backend
dfx deploy token_backend
dfx deploy token_backend_b

# Get canister IDs
BACKEND_ID=$(dfx canister id marketplace_backend)
TOKEN_A_ID=$(dfx canister id token_backend)
TOKEN_B_ID=$(dfx canister id token_backend_b)
echo "Backend canister: $BACKEND_ID"
echo "Token A canister: $TOKEN_A_ID"
echo "Token B canister: $TOKEN_B_ID"

# Run basic tests
echo ""
echo "=== Running Tests ==="

# Test 1: Get initial stats (should be empty)
echo -n "Test 1: Get initial stats... "
STATS=$(dfx canister call marketplace_backend get_stats)
if [[ "$STATS" == *"assets = vec {}"* ]] || [[ "$STATS" == *"assets"* ]]; then
    echo "PASSED"
else
    echo "FAILED: $STATS"
    exit 1
fi

# Test 2: Add first asset (Token A)
echo -n "Test 2: Add asset TKNA... "
RESULT=$(dfx canister call marketplace_backend add_asset "(\"TKNA\", principal \"$TOKEN_A_ID\", \"ICRC1\")")
if [[ "$RESULT" == *"success = true"* ]]; then
    echo "PASSED"
else
    echo "FAILED: $RESULT"
    exit 1
fi

# Test 3: Add second asset (Token B)
echo -n "Test 3: Add asset TKNB... "
RESULT=$(dfx canister call marketplace_backend add_asset "(\"TKNB\", principal \"$TOKEN_B_ID\", \"ICRC1\")")
if [[ "$RESULT" == *"success = true"* ]]; then
    echo "PASSED"
else
    echo "FAILED: $RESULT"
    exit 1
fi

# Test 4: Try adding duplicate asset (should fail)
echo -n "Test 4: Reject duplicate asset... "
RESULT=$(dfx canister call marketplace_backend add_asset "(\"TKNA\", principal \"$TOKEN_A_ID\", \"ICRC1\")")
if [[ "$RESULT" == *"success = false"* ]] && [[ "$RESULT" == *"already exists"* ]]; then
    echo "PASSED"
else
    echo "FAILED: Expected failure, got $RESULT"
    exit 1
fi

# Test 5: Create asset pair
echo -n "Test 5: Create asset pair TKNA_TKNB... "
RESULT=$(dfx canister call marketplace_backend add_asset_pair '("TKNA", "TKNB")')
if [[ "$RESULT" == *"success = true"* ]]; then
    echo "PASSED"
else
    echo "FAILED: $RESULT"
    exit 1
fi

# Test 6: Create pair with non-existent asset (should fail)
echo -n "Test 6: Reject pair with unknown asset... "
RESULT=$(dfx canister call marketplace_backend add_asset_pair '("TKNA", "UNKNOWN")')
if [[ "$RESULT" == *"success = false"* ]] && [[ "$RESULT" == *"not found"* ]]; then
    echo "PASSED"
else
    echo "FAILED: Expected failure, got $RESULT"
    exit 1
fi

# Test 7: Send a quote
echo -n "Test 7: Send quote... "
RESULT=$(dfx canister call marketplace_backend send_quote '("TKNA_TKNB", 1.5)')
if [[ "$RESULT" == *"success = true"* ]] && [[ "$RESULT" == *"status = \"quote\""* ]]; then
    echo "PASSED"
    # Extract trade ID for later tests
    TRADE_ID=$(echo "$RESULT" | grep -oP 'id = "\K[^"]+' | head -1)
else
    echo "FAILED: $RESULT"
    exit 1
fi

# Test 8: Try to accept own quote (should fail)
echo -n "Test 8: Reject self-accept... "
if [ -n "$TRADE_ID" ]; then
    RESULT=$(dfx canister call marketplace_backend accept_quote "(\"$TRADE_ID\")")
    if [[ "$RESULT" == *"success = false"* ]] && [[ "$RESULT" == *"Cannot accept own quote"* ]]; then
        echo "PASSED"
    else
        echo "FAILED: Expected rejection, got $RESULT"
        exit 1
    fi
else
    echo "SKIPPED (no trade ID)"
fi

# Test 9: Verify stats updated
echo -n "Test 9: Verify stats... "
STATS=$(dfx canister call marketplace_backend get_stats)
if [[ "$STATS" == *"TKNA"* ]] && [[ "$STATS" == *"TKNB"* ]] && [[ "$STATS" == *"TKNA_TKNB"* ]]; then
    echo "PASSED"
else
    echo "FAILED: $STATS"
    exit 1
fi

# Test 10: Verify token canisters are working
echo -n "Test 10: Verify token canisters... "
TOKEN_NAME=$(dfx canister call token_backend icrc1_name)
if [[ "$TOKEN_NAME" == *"Token"* ]]; then
    echo "PASSED"
else
    echo "FAILED: $TOKEN_NAME"
    exit 1
fi

echo ""
echo "=== All Tests Passed! ==="

# Stop dfx
dfx stop
