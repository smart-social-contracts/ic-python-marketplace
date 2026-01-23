"""
Simple Marketplace - Minimal Working Version
Uses direct StableBTreeMap storage with proper Opt handling.
"""

from kybra import (
    init, nat64, Opt, Principal, query, Record, StableBTreeMap,
    update, Variant, Vec, void, ic, post_upgrade, pre_upgrade,
)
from kybra_simple_logging import get_logger, get_logs as _get_logs
import json

logger = get_logger("marketplace")

# Storage - all use string keys and values
data_storage = StableBTreeMap[str, str](memory_id=1, max_key_size=100, max_value_size=50_000)

# =============================================================================
# Type Definitions
# =============================================================================

class InitArg(Record):
    name: str
    description: Opt[str]
    test: Opt[bool]

class ResourceInfo(Record):
    id: nat64
    resource_type: str
    canister_id: str
    token_id: Opt[nat64]
    amount: nat64
    owner: str
    created_at: nat64

class OfferInfo(Record):
    id: nat64
    resource_id: nat64
    seller: str
    price_canister_id: str
    price_amount: nat64
    status: str
    created_at: nat64
    updated_at: nat64

class ExchangeInfo(Record):
    id: nat64
    offer_id: nat64
    buyer: str
    seller: str
    resource_id: nat64
    price_amount: nat64
    completed_at: nat64

class CreateResourceArg(Record):
    resource_type: str
    canister_id: str
    token_id: Opt[nat64]
    amount: nat64

class CreateOfferArg(Record):
    resource_id: nat64
    price_canister_id: str
    price_amount: nat64

class MarketplaceError(Record):
    error_code: nat64
    message: str

class CreateResourceResult(Variant, total=False):
    Ok: nat64
    Err: MarketplaceError

class CreateOfferResult(Variant, total=False):
    Ok: nat64
    Err: MarketplaceError

class CancelOfferResult(Variant, total=False):
    Ok: nat64
    Err: MarketplaceError

class AcceptOfferResult(Variant, total=False):
    Ok: nat64
    Err: MarketplaceError

class MarketplaceStats(Record):
    total_resources: nat64
    total_offers: nat64
    active_offers: nat64
    total_exchanges: nat64
    test_mode: bool

class PublicLogEntry(Record):
    timestamp: nat64
    level: str
    logger_name: str
    message: str

# =============================================================================
# Storage Helpers - handle Opt return properly
# =============================================================================

def _get_value(key: str) -> str:
    """Get value from storage, handling Opt return type"""
    result = data_storage.get(key)
    if result is None:
        return None
    # Kybra returns Opt as the value directly (not wrapped in list)
    return result

def _set_value(key: str, value: str):
    """Set value in storage"""
    data_storage.insert(key, value)

def _get_config() -> dict:
    """Get marketplace config"""
    val = _get_value("config")
    if val:
        return json.loads(val)
    return {"name": "Simple Marketplace", "description": "", "test_mode": False, "admin": "", "counters": {"r": 0, "o": 0, "e": 0}}

def _set_config(config: dict):
    """Save marketplace config"""
    _set_value("config", json.dumps(config))

def _get_entity(prefix: str, entity_id: int) -> dict:
    """Get entity by type and id"""
    val = _get_value(f"{prefix}:{entity_id}")
    if val:
        return json.loads(val)
    return None

def _set_entity(prefix: str, entity_id: int, data: dict):
    """Save entity"""
    _set_value(f"{prefix}:{entity_id}", json.dumps(data))

def _get_all_entities(prefix: str, max_id: int) -> list:
    """Get all entities of a type"""
    results = []
    for i in range(1, max_id + 1):
        e = _get_entity(prefix, i)
        if e:
            results.append(e)
    return results

# =============================================================================
# Lifecycle
# =============================================================================

@init
def init_(arg: InitArg) -> void:
    config = _get_config()
    config["name"] = arg["name"]
    config["description"] = arg.get("description") or ""
    config["test_mode"] = arg.get("test") or False
    config["admin"] = ic.caller().to_str()
    _set_config(config)
    logger.info(f"Marketplace initialized: {config['name']}, test_mode={config['test_mode']}")

@pre_upgrade
def pre_upgrade_() -> void:
    pass  # Data is already in stable storage

@post_upgrade
def post_upgrade_() -> void:
    pass  # Data is already in stable storage

# =============================================================================
# Query - Info
# =============================================================================

@query
def get_name() -> str:
    return _get_config()["name"]

@query
def get_description() -> str:
    return _get_config()["description"]

@query
def is_test_mode() -> bool:
    return _get_config()["test_mode"]

@query
def get_admin() -> str:
    return _get_config()["admin"]

@query
def get_stats() -> MarketplaceStats:
    config = _get_config()
    c = config["counters"]
    resources = _get_all_entities("r", c["r"])
    offers = _get_all_entities("o", c["o"])
    active = [o for o in offers if o.get("status") == "Active"]
    exchanges = _get_all_entities("e", c["e"])
    return {
        "total_resources": len(resources),
        "total_offers": len(offers),
        "active_offers": len(active),
        "total_exchanges": len(exchanges),
        "test_mode": config["test_mode"],
    }

# =============================================================================
# Query - Resources
# =============================================================================

@query
def get_resource(resource_id: nat64) -> Opt[ResourceInfo]:
    r = _get_entity("r", int(resource_id))
    if not r:
        return []
    return [{
        "id": r["id"],
        "resource_type": r["resource_type"],
        "canister_id": r["canister_id"],
        "token_id": [r["token_id"]] if r.get("token_id") else [],
        "amount": r["amount"],
        "owner": r["owner"],
        "created_at": r["created_at"],
    }]

@query
def get_resources_by_owner(owner: str, offset: nat64, limit: nat64) -> Vec[ResourceInfo]:
    config = _get_config()
    resources = [r for r in _get_all_entities("r", config["counters"]["r"]) if r["owner"] == owner]
    resources.sort(key=lambda x: x["id"], reverse=True)
    start, end = int(offset), int(offset) + int(limit)
    return [{
        "id": r["id"],
        "resource_type": r["resource_type"],
        "canister_id": r["canister_id"],
        "token_id": [r["token_id"]] if r.get("token_id") else [],
        "amount": r["amount"],
        "owner": r["owner"],
        "created_at": r["created_at"],
    } for r in resources[start:end]]

@query
def get_all_resources(offset: nat64, limit: nat64) -> Vec[ResourceInfo]:
    config = _get_config()
    resources = _get_all_entities("r", config["counters"]["r"])
    resources.sort(key=lambda x: x["id"], reverse=True)
    start, end = int(offset), int(offset) + int(limit)
    return [{
        "id": r["id"],
        "resource_type": r["resource_type"],
        "canister_id": r["canister_id"],
        "token_id": [r["token_id"]] if r.get("token_id") else [],
        "amount": r["amount"],
        "owner": r["owner"],
        "created_at": r["created_at"],
    } for r in resources[start:end]]

# =============================================================================
# Query - Offers
# =============================================================================

@query
def get_offer(offer_id: nat64) -> Opt[OfferInfo]:
    o = _get_entity("o", int(offer_id))
    if not o:
        return []
    return [{
        "id": o["id"],
        "resource_id": o["resource_id"],
        "seller": o["seller"],
        "price_canister_id": o["price_canister_id"],
        "price_amount": o["price_amount"],
        "status": o["status"],
        "created_at": o["created_at"],
        "updated_at": o["updated_at"],
    }]

@query
def get_active_offers(offset: nat64, limit: nat64) -> Vec[OfferInfo]:
    config = _get_config()
    offers = [o for o in _get_all_entities("o", config["counters"]["o"]) if o.get("status") == "Active"]
    offers.sort(key=lambda x: x["id"], reverse=True)
    start, end = int(offset), int(offset) + int(limit)
    return [{
        "id": o["id"],
        "resource_id": o["resource_id"],
        "seller": o["seller"],
        "price_canister_id": o["price_canister_id"],
        "price_amount": o["price_amount"],
        "status": o["status"],
        "created_at": o["created_at"],
        "updated_at": o["updated_at"],
    } for o in offers[start:end]]

@query
def get_offers_by_seller(seller: str, offset: nat64, limit: nat64) -> Vec[OfferInfo]:
    config = _get_config()
    offers = [o for o in _get_all_entities("o", config["counters"]["o"]) if o["seller"] == seller]
    offers.sort(key=lambda x: x["id"], reverse=True)
    start, end = int(offset), int(offset) + int(limit)
    return [{
        "id": o["id"],
        "resource_id": o["resource_id"],
        "seller": o["seller"],
        "price_canister_id": o["price_canister_id"],
        "price_amount": o["price_amount"],
        "status": o["status"],
        "created_at": o["created_at"],
        "updated_at": o["updated_at"],
    } for o in offers[start:end]]

@query
def get_all_offers(offset: nat64, limit: nat64) -> Vec[OfferInfo]:
    config = _get_config()
    offers = _get_all_entities("o", config["counters"]["o"])
    offers.sort(key=lambda x: x["id"], reverse=True)
    start, end = int(offset), int(offset) + int(limit)
    return [{
        "id": o["id"],
        "resource_id": o["resource_id"],
        "seller": o["seller"],
        "price_canister_id": o["price_canister_id"],
        "price_amount": o["price_amount"],
        "status": o["status"],
        "created_at": o["created_at"],
        "updated_at": o["updated_at"],
    } for o in offers[start:end]]

# =============================================================================
# Query - Exchanges
# =============================================================================

@query
def get_exchange(exchange_id: nat64) -> Opt[ExchangeInfo]:
    e = _get_entity("e", int(exchange_id))
    if not e:
        return []
    return [{
        "id": e["id"],
        "offer_id": e["offer_id"],
        "buyer": e["buyer"],
        "seller": e["seller"],
        "resource_id": e["resource_id"],
        "price_amount": e["price_amount"],
        "completed_at": e["completed_at"],
    }]

@query
def get_exchanges_by_user(user: str, offset: nat64, limit: nat64) -> Vec[ExchangeInfo]:
    config = _get_config()
    exchanges = [e for e in _get_all_entities("e", config["counters"]["e"]) if e["buyer"] == user or e["seller"] == user]
    exchanges.sort(key=lambda x: x["id"], reverse=True)
    start, end = int(offset), int(offset) + int(limit)
    return [{
        "id": e["id"],
        "offer_id": e["offer_id"],
        "buyer": e["buyer"],
        "seller": e["seller"],
        "resource_id": e["resource_id"],
        "price_amount": e["price_amount"],
        "completed_at": e["completed_at"],
    } for e in exchanges[start:end]]

@query
def get_all_exchanges(offset: nat64, limit: nat64) -> Vec[ExchangeInfo]:
    config = _get_config()
    exchanges = _get_all_entities("e", config["counters"]["e"])
    exchanges.sort(key=lambda x: x["id"], reverse=True)
    start, end = int(offset), int(offset) + int(limit)
    return [{
        "id": e["id"],
        "offer_id": e["offer_id"],
        "buyer": e["buyer"],
        "seller": e["seller"],
        "resource_id": e["resource_id"],
        "price_amount": e["price_amount"],
        "completed_at": e["completed_at"],
    } for e in exchanges[start:end]]

# =============================================================================
# Update - Resources
# =============================================================================

@update
def register_resource(arg: CreateResourceArg) -> CreateResourceResult:
    caller = ic.caller().to_str()
    
    if arg["resource_type"] not in ["ICRC1", "ICRC7"]:
        return {"Err": {"error_code": 1, "message": "Invalid resource type"}}
    if arg["amount"] == 0:
        return {"Err": {"error_code": 2, "message": "Amount must be > 0"}}
    
    config = _get_config()
    config["counters"]["r"] += 1
    rid = config["counters"]["r"]
    
    token_id = int(arg["token_id"][0]) if arg["token_id"] else None
    
    resource = {
        "id": rid,
        "resource_type": arg["resource_type"],
        "canister_id": arg["canister_id"],
        "token_id": token_id,
        "amount": int(arg["amount"]),
        "owner": caller,
        "created_at": ic.time(),
    }
    _set_entity("r", rid, resource)
    _set_config(config)
    
    logger.info(f"Resource registered: id={rid}, type={arg['resource_type']}, owner={caller}")
    return {"Ok": rid}

# =============================================================================
# Update - Offers
# =============================================================================

@update
def create_offer(arg: CreateOfferArg) -> CreateOfferResult:
    caller = ic.caller().to_str()
    
    resource = _get_entity("r", int(arg["resource_id"]))
    if not resource:
        return {"Err": {"error_code": 1, "message": "Resource not found"}}
    if resource["owner"] != caller:
        return {"Err": {"error_code": 2, "message": "Not the resource owner"}}
    if arg["price_amount"] == 0:
        return {"Err": {"error_code": 3, "message": "Price must be > 0"}}
    
    config = _get_config()
    # Check for existing active offer
    for o in _get_all_entities("o", config["counters"]["o"]):
        if o["resource_id"] == int(arg["resource_id"]) and o.get("status") == "Active":
            return {"Err": {"error_code": 4, "message": "Active offer exists"}}
    
    config["counters"]["o"] += 1
    oid = config["counters"]["o"]
    now = ic.time()
    
    offer = {
        "id": oid,
        "resource_id": int(arg["resource_id"]),
        "seller": caller,
        "price_canister_id": arg["price_canister_id"],
        "price_amount": int(arg["price_amount"]),
        "status": "Active",
        "created_at": now,
        "updated_at": now,
    }
    _set_entity("o", oid, offer)
    _set_config(config)
    
    logger.info(f"Offer created: id={oid}, resource_id={arg['resource_id']}, seller={caller}")
    return {"Ok": oid}

@update
def cancel_offer(offer_id: nat64) -> CancelOfferResult:
    caller = ic.caller().to_str()
    config = _get_config()
    
    offer = _get_entity("o", int(offer_id))
    if not offer:
        return {"Err": {"error_code": 1, "message": "Offer not found"}}
    if offer["seller"] != caller and caller != config["admin"]:
        return {"Err": {"error_code": 2, "message": "Not authorized"}}
    if offer.get("status") != "Active":
        return {"Err": {"error_code": 3, "message": "Offer not active"}}
    
    offer["status"] = "Cancelled"
    offer["updated_at"] = ic.time()
    _set_entity("o", int(offer_id), offer)
    
    logger.info(f"Offer cancelled: id={offer_id}, by={caller}")
    return {"Ok": int(offer_id)}

@update
def accept_offer(offer_id: nat64) -> AcceptOfferResult:
    caller = ic.caller().to_str()
    
    offer = _get_entity("o", int(offer_id))
    if not offer:
        return {"Err": {"error_code": 1, "message": "Offer not found"}}
    if offer.get("status") != "Active":
        return {"Err": {"error_code": 2, "message": "Offer not active"}}
    if offer["seller"] == caller:
        return {"Err": {"error_code": 3, "message": "Cannot accept own offer"}}
    
    resource = _get_entity("r", offer["resource_id"])
    if not resource:
        return {"Err": {"error_code": 4, "message": "Resource not found"}}
    
    config = _get_config()
    config["counters"]["e"] += 1
    eid = config["counters"]["e"]
    now = ic.time()
    
    exchange = {
        "id": eid,
        "offer_id": int(offer_id),
        "buyer": caller,
        "seller": offer["seller"],
        "resource_id": offer["resource_id"],
        "price_amount": offer["price_amount"],
        "completed_at": now,
    }
    _set_entity("e", eid, exchange)
    
    offer["status"] = "Completed"
    offer["updated_at"] = now
    _set_entity("o", int(offer_id), offer)
    
    resource["owner"] = caller
    _set_entity("r", offer["resource_id"], resource)
    
    _set_config(config)
    
    logger.info(f"Exchange completed: id={eid}, offer={offer_id}, buyer={caller}")
    return {"Ok": eid}

# =============================================================================
# Admin
# =============================================================================

@update
def set_admin(new_admin: str) -> bool:
    config = _get_config()
    if ic.caller().to_str() != config["admin"]:
        return False
    config["admin"] = new_admin
    _set_config(config)
    return True

# =============================================================================
# Logging
# =============================================================================

@query
def get_logs(offset: nat64, limit: nat64) -> Vec[PublicLogEntry]:
    logs = _get_logs(int(offset), int(limit))
    return [
        PublicLogEntry(timestamp=log["timestamp"], level=log["level"],
                      logger_name=log["logger_name"], message=log["message"])
        for log in logs
    ]
