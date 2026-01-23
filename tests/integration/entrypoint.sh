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

# Install frontend dependencies  
echo "Installing frontend dependencies..."
cd src/marketplace_frontend && npm install && cd ../..

# Deploy canisters
echo "Deploying canisters..."
dfx deploy

# Get canister IDs
BACKEND_ID=$(dfx canister id marketplace_backend)
echo "Backend canister: $BACKEND_ID"

# Run basic tests
echo ""
echo "=== Running Tests ==="

# Test 1: Get marketplace name
echo -n "Test 1: Get marketplace name... "
NAME=$(dfx canister call marketplace_backend get_name)
if [[ "$NAME" == *"Simple Marketplace"* ]]; then
    echo "PASSED"
else
    echo "FAILED: Expected 'Simple Marketplace', got $NAME"
    exit 1
fi

# Test 2: Check test mode
echo -n "Test 2: Check test mode... "
TEST_MODE=$(dfx canister call marketplace_backend is_test_mode)
if [[ "$TEST_MODE" == *"true"* ]]; then
    echo "PASSED"
else
    echo "FAILED: Expected true, got $TEST_MODE"
    exit 1
fi

# Test 3: Get stats (should be empty initially)
echo -n "Test 3: Get initial stats... "
STATS=$(dfx canister call marketplace_backend get_stats)
if [[ "$STATS" == *"total_resources = 0"* ]]; then
    echo "PASSED"
else
    echo "FAILED: Expected empty stats, got $STATS"
    exit 1
fi

# Test 4: Register a resource
echo -n "Test 4: Register resource... "
RESULT=$(dfx canister call marketplace_backend register_resource '(record { resource_type = "ICRC1"; canister_id = "ryjl3-tyaaa-aaaaa-aaaba-cai"; token_id = null; amount = 1000 })')
if [[ "$RESULT" == *"Ok"* ]]; then
    echo "PASSED"
else
    echo "FAILED: $RESULT"
    exit 1
fi

# Test 5: Get resources
echo -n "Test 5: Get resources... "
RESOURCES=$(dfx canister call marketplace_backend get_all_resources '(0, 10)')
if [[ "$RESOURCES" == *"ICRC1"* ]]; then
    echo "PASSED"
else
    echo "FAILED: Expected resource, got $RESOURCES"
    exit 1
fi

# Test 6: Create offer
echo -n "Test 6: Create offer... "
RESULT=$(dfx canister call marketplace_backend create_offer '(record { resource_id = 1; price_canister_id = "ryjl3-tyaaa-aaaaa-aaaba-cai"; price_amount = 100 })')
if [[ "$RESULT" == *"Ok"* ]]; then
    echo "PASSED"
else
    echo "FAILED: $RESULT"
    exit 1
fi

# Test 7: Get active offers
echo -n "Test 7: Get active offers... "
OFFERS=$(dfx canister call marketplace_backend get_active_offers '(0, 10)')
if [[ "$OFFERS" == *"Active"* ]]; then
    echo "PASSED"
else
    echo "FAILED: Expected active offer, got $OFFERS"
    exit 1
fi

# Test 8: Cancel offer
echo -n "Test 8: Cancel offer... "
RESULT=$(dfx canister call marketplace_backend cancel_offer '(1)')
if [[ "$RESULT" == *"Ok"* ]]; then
    echo "PASSED"
else
    echo "FAILED: $RESULT"
    exit 1
fi

# Test 9: Verify offer cancelled
echo -n "Test 9: Verify offer cancelled... "
OFFER=$(dfx canister call marketplace_backend get_offer '(1)')
if [[ "$OFFER" == *"Cancelled"* ]]; then
    echo "PASSED"
else
    echo "FAILED: Expected Cancelled status, got $OFFER"
    exit 1
fi

# Test 10: Get updated stats
echo -n "Test 10: Get updated stats... "
STATS=$(dfx canister call marketplace_backend get_stats)
if [[ "$STATS" == *"total_resources = 1"* ]] && [[ "$STATS" == *"total_offers = 1"* ]]; then
    echo "PASSED"
else
    echo "FAILED: $STATS"
    exit 1
fi

echo ""
echo "=== All Tests Passed! ==="

# Stop dfx
dfx stop
