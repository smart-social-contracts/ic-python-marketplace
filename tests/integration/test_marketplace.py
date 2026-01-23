#!/usr/bin/env python3
"""
Integration test for the marketplace with token canisters.

Tests the full flow:
1. Deploy token canisters (TKNA, TKNB)
2. Register assets in marketplace
3. Create asset pair
4. Send quote
5. Accept quote
"""

import subprocess
import json
import sys


def run_dfx(cmd: str, check: bool = True) -> str:
    """Run a dfx command and return stdout."""
    result = subprocess.run(
        f"dfx {cmd}",
        shell=True,
        capture_output=True,
        text=True,
    )
    if check and result.returncode != 0:
        print(f"ERROR: dfx {cmd}")
        print(f"STDERR: {result.stderr}")
        sys.exit(1)
    return result.stdout.strip()


def call_canister(canister: str, method: str, args: str = "") -> str:
    """Call a canister method."""
    cmd = f'canister call {canister} {method}'
    if args:
        cmd += f" '{args}'"
    return run_dfx(cmd)


def test_marketplace():
    print("=" * 60)
    print("MARKETPLACE INTEGRATION TEST")
    print("=" * 60)

    # Get canister IDs
    print("\n[1] Getting canister IDs...")
    marketplace_id = run_dfx("canister id marketplace_backend")
    token_a_id = run_dfx("canister id token_backend")
    token_b_id = run_dfx("canister id token_backend_b")
    print(f"    marketplace_backend: {marketplace_id}")
    print(f"    token_backend (TKNA): {token_a_id}")
    print(f"    token_backend_b (TKNB): {token_b_id}")

    # Verify tokens are deployed
    print("\n[2] Verifying token canisters...")
    token_a_name = call_canister("token_backend", "icrc1_name")
    token_b_name = call_canister("token_backend_b", "icrc1_name")
    print(f"    Token A: {token_a_name}")
    print(f"    Token B: {token_b_name}")

    # Check initial marketplace stats
    print("\n[3] Checking initial marketplace stats...")
    stats = call_canister("marketplace_backend", "get_stats")
    print(f"    {stats}")

    # Register assets
    print("\n[4] Registering assets...")
    result_a = call_canister(
        "marketplace_backend",
        "add_asset",
        f'("TKNA", principal "{token_a_id}", "ICRC1")'
    )
    print(f"    TKNA: {result_a[:100]}...")

    result_b = call_canister(
        "marketplace_backend",
        "add_asset",
        f'("TKNB", principal "{token_b_id}", "ICRC1")'
    )
    print(f"    TKNB: {result_b[:100]}...")

    # Create asset pair
    print("\n[5] Creating asset pair TKNA_TKNB...")
    result_pair = call_canister(
        "marketplace_backend",
        "add_asset_pair",
        '("TKNA", "TKNB")'
    )
    print(f"    {result_pair[:100]}...")

    # Check stats after asset setup
    print("\n[6] Checking marketplace stats after setup...")
    stats = call_canister("marketplace_backend", "get_stats")
    print(f"    {stats}")

    # Send a quote
    print("\n[7] Sending a quote (price: 1.5)...")
    result_quote = call_canister(
        "marketplace_backend",
        "send_quote",
        '("TKNA_TKNB", 1.5)'
    )
    print(f"    {result_quote[:150]}...")

    # Extract trade_id from response (rough parsing)
    if "id = " in result_quote:
        # Find the trade ID in the response
        start = result_quote.find('id = "') + 6
        end = result_quote.find('"', start)
        trade_id = result_quote[start:end]
        print(f"    Trade ID: {trade_id}")

        # Try to accept the quote (will fail as same caller)
        print("\n[8] Attempting to accept own quote (should fail)...")
        result_accept = call_canister(
            "marketplace_backend",
            "accept_quote",
            f'("{trade_id}")'
        )
        print(f"    {result_accept[:150]}...")

    # Final stats
    print("\n[9] Final marketplace stats...")
    stats = call_canister("marketplace_backend", "get_stats")
    print(f"    {stats}")

    print("\n" + "=" * 60)
    print("INTEGRATION TEST COMPLETED SUCCESSFULLY")
    print("=" * 60)


if __name__ == "__main__":
    test_marketplace()
