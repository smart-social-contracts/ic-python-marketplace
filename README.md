# IC Python Marketplace

A simple marketplace for trading ICRC-1 (fungible) and ICRC-7 (non-fungible) tokens on the Internet Computer.

## Features

- **Resource Registration**: Register ICRC-1 and ICRC-7 tokens for trading
- **Public Offers**: Create and manage sell offers with custom pricing
- **Secure Exchanges**: Complete trades with full audit trail
- **Modern Frontend**: SvelteKit-based dashboard for marketplace interaction

## Core Entities

### Resource
Represents any owned resource (fungible or non-fungible token):
- `resource_type`: "ICRC1" or "ICRC7"
- `canister_id`: Principal of the token canister
- `token_id`: For NFTs, the specific token ID
- `amount`: Amount of tokens (1 for NFTs)
- `owner`: Principal of the current owner

### Offer
A public offer to sell a resource for a given price:
- `resource_id`: Reference to the Resource being sold
- `seller`: Principal of the seller
- `price_canister_id`: Token canister for payment (ICRC-1)
- `price_amount`: Price in smallest token unit
- `status`: Active, Cancelled, or Completed

### Exchange
A completed exchange between two users:
- `offer_id`: Reference to the fulfilled Offer
- `buyer`: Principal of the buyer
- `seller`: Principal of the seller
- `resource_id`: The traded Resource
- `price_amount`: Final price paid

## Prerequisites

- [DFX](https://internetcomputer.org/docs/building-apps/getting-started/install) >= 0.29.0
- Python 3.10+
- Node.js 18+

## Quick Start

### Local Development

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd src/marketplace_frontend && npm install && cd ../..

# Start local replica and deploy
dfx start --background --clean
dfx deploy

# Get canister URLs
dfx canister id marketplace_frontend
# Access frontend at http://<canister_id>.localhost:4943/
```

### Using Scripts

```bash
# Deploy locally (starts dfx if needed)
./scripts/deploy_local.sh

# Deploy to staging
./scripts/deploy_staging.sh

# Build artifacts
./scripts/build_canister.sh
```

## API Reference

### Marketplace Info
- `get_name() -> text`: Get marketplace name
- `get_description() -> text`: Get marketplace description
- `is_test_mode() -> bool`: Check if in test mode
- `get_stats() -> MarketplaceStats`: Get marketplace statistics

### Resources
- `register_resource(CreateResourceArg) -> CreateResourceResult`: Register a new resource
- `get_resource(nat64) -> opt ResourceInfo`: Get resource by ID
- `get_resources_by_owner(text, nat64, nat64) -> vec ResourceInfo`: Get resources by owner
- `get_all_resources(nat64, nat64) -> vec ResourceInfo`: List all resources

### Offers
- `create_offer(CreateOfferArg) -> CreateOfferResult`: Create a new sell offer
- `cancel_offer(nat64) -> CancelOfferResult`: Cancel an active offer
- `accept_offer(nat64) -> AcceptOfferResult`: Accept an offer and complete exchange
- `get_offer(nat64) -> opt OfferInfo`: Get offer by ID
- `get_active_offers(nat64, nat64) -> vec OfferInfo`: List active offers
- `get_offers_by_seller(text, nat64, nat64) -> vec OfferInfo`: Get offers by seller

### Exchanges
- `get_exchange(nat64) -> opt ExchangeInfo`: Get exchange by ID
- `get_exchanges_by_user(text, nat64, nat64) -> vec ExchangeInfo`: Get exchanges by user
- `get_all_exchanges(nat64, nat64) -> vec ExchangeInfo`: List all exchanges

## Project Structure

```
ic-python-marketplace/
├── src/
│   ├── marketplace_backend/
│   │   ├── src/main.py          # Backend canister implementation
│   │   └── marketplace_backend.did  # Candid interface
│   └── marketplace_frontend/
│       ├── src/                 # SvelteKit frontend
│       ├── package.json
│       └── vite.config.js
├── tests/
│   └── integration/
│       └── entrypoint.sh        # Integration test script
├── scripts/
│   ├── build_canister.sh        # Build artifacts
│   ├── deploy_local.sh          # Local deployment
│   ├── deploy_staging.sh        # Staging deployment
│   └── bump_version.sh          # Version bumping
├── .github/workflows/
│   ├── ci.yml                   # CI workflow
│   ├── deploy-staging.yml       # Staging deployment
│   └── release.yml              # Release workflow
├── dfx.json                     # DFX configuration
├── requirements.txt             # Python dependencies
└── version.txt                  # Current version
```

## Dependencies

- [basilisk](https://github.com/smart-social-contracts/basilisk) - Python CDK for ICP
- [ic-python-db](https://github.com/smart-social-contracts/ic-python-db) - Entity database
- [ic-python-logging](https://github.com/smart-social-contracts/ic-python-logging) - Logging

## CI/CD

The project includes GitHub Actions workflows:

- **CI**: Runs integration tests on push/PR to main
- **Deploy Staging**: Manual deployment to staging network
- **Release**: Creates versioned releases with build artifacts

## License

MIT
