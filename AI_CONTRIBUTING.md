# AI Contributing Guide

This document provides context for AI assistants working on this codebase.

## Project Overview

IC Python Marketplace is a marketplace for trading ICRC-1 and ICRC-7 tokens on the Internet Computer, built with Basilisk (Python CDK).

## Key Technologies

- **Backend**: Python with Basilisk CDK
- **Frontend**: SvelteKit with TypeScript
- **Database**: ic-python-db (entity-relational storage)
- **Logging**: ic-python-logging
- **Infrastructure**: DFX, GitHub Actions

## Core Entities

1. **Resource** - Owned tokens (fungible or NFT)
2. **Offer** - Public sell offers
3. **Exchange** - Completed trades

## Important Files

- `src/marketplace_backend/src/main.py` - Main backend logic
- `src/marketplace_backend/marketplace_backend.did` - Candid interface
- `src/marketplace_frontend/src/routes/+page.svelte` - Main frontend page
- `dfx.json` - Canister configuration

## Development Workflow

```bash
# Local development
./scripts/deploy_local.sh

# Run tests
./tests/integration/entrypoint.sh

# Deploy to staging (CI)
./scripts/deploy_staging.sh
```

## Testing

Integration tests are in `tests/integration/entrypoint.sh` and run inside the ICP dev Docker container.

## Notes

- The marketplace uses test mode by default (configurable via init args)
- Cross-canister token transfers are simplified in the current implementation
- canister_ids.json must have staging entries before deploying to staging
