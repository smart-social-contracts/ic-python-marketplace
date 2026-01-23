from enum import Enum

from kybra import (
    init, float64, nat64, Opt, Principal, query, Record, StableBTreeMap,
    update, Variant, Vec, void, ic,
)
from kybra_simple_db import Database, Entity, Float, String, ManyToOne, OneToMany
from kybra_simple_logging import get_logger

logger = get_logger(__name__)

storage = StableBTreeMap[str, str](memory_id=1, max_key_size=100, max_value_size=10000)
Database.init(db_storage=storage)


# =============================================================================
# Entities
# =============================================================================

class Asset(Entity):
    __alias__ = "id"
    id = String()
    principal = String()
    standard = String()
    asset_pairs_1 = OneToMany("AssetPair", "asset1")
    asset_pairs_2 = OneToMany("AssetPair", "asset2")


class AssetPair(Entity):
    __alias__ = "id"
    id = String()
    asset1 = ManyToOne("Asset", "asset_pairs_1")
    asset2 = ManyToOne("Asset", "asset_pairs_2")
    trades = OneToMany("Trade", "asset_pair")


class TRADE_STATUS(Enum):
    QUOTE = "quote"
    CONFIRMED = "confirmed"
    ERROR = "error"


class Trade(Entity):
    __alias__ = "id"
    id = String()
    asset_pair = ManyToOne("AssetPair", "trades")
    status = String()
    price = Float()
    owner1 = String()
    owner2 = String()


# =============================================================================
# Candid Types
# =============================================================================

class AssetRecord(Record):
    id: str
    principal: str
    standard: str


class AssetPairRecord(Record):
    id: str
    asset1: str
    asset2: str


class TradeRecord(Record):
    id: str
    asset_pair: str
    owner1: str
    owner2: str
    price: float64
    status: str


class MarketplaceStatsRecord(Record):
    assets: Vec[str]
    asset_pairs: Vec[str]
    trades: Vec[str]


class ResponseData(Variant, total=False):
    AssetRecords: Vec[AssetRecord]
    AssetPairRecords: Vec[AssetPairRecord]
    TradeRecords: Vec[TradeRecord]
    MarketplaceStats: MarketplaceStatsRecord
    Error: str
    Message: str


class Response(Record):
    success: bool
    data: ResponseData


# =============================================================================
# Lifecycle
# =============================================================================

@init
def init_() -> void:
    logger.info("Marketplace initialized")


# =============================================================================
# Queries
# =============================================================================

@query
def get_stats() -> MarketplaceStatsRecord:
    assets = Asset.instances()
    asset_pairs = AssetPair.instances()
    trades = Trade.instances()
    return {
        "assets": [a.id for a in assets],
        "asset_pairs": [ap.id for ap in asset_pairs],
        "trades": [t._id for t in trades],
    }


# =============================================================================
# Updates - Assets
# =============================================================================

@update
def add_asset(id: str, principal: Principal, standard: str) -> Response:
    try:
        if Asset[id]:
            return Response(success=False, data=ResponseData(Error=f"Asset {id} already exists"))
        asset = Asset(id=id, principal=principal.to_str(), standard=standard)
        return Response(
            success=True,
            data=ResponseData(AssetRecords=[AssetRecord(
                id=id, principal=principal.to_str(), standard=standard
            )])
        )
    except Exception as e:
        return Response(success=False, data=ResponseData(Error=str(e)))


@update
def add_asset_pair(asset1: str, asset2: str) -> Response:
    try:
        a1 = Asset[asset1]
        a2 = Asset[asset2]
        if not a1:
            return Response(success=False, data=ResponseData(Error=f"Asset {asset1} not found"))
        if not a2:
            return Response(success=False, data=ResponseData(Error=f"Asset {asset2} not found"))
        pair_id = f"{asset1}_{asset2}"
        if AssetPair[pair_id]:
            return Response(success=False, data=ResponseData(Error=f"AssetPair {pair_id} already exists"))
        asset_pair = AssetPair(id=pair_id, asset1=a1, asset2=a2)
        return Response(
            success=True,
            data=ResponseData(AssetPairRecords=[AssetPairRecord(
                id=pair_id, asset1=asset1, asset2=asset2
            )])
        )
    except Exception as e:
        return Response(success=False, data=ResponseData(Error=str(e)))


# =============================================================================
# Updates - Trading
# =============================================================================

@update
def send_quote(asset_pair_id: str, price: float64) -> Response:
    try:
        pair = AssetPair[asset_pair_id]
        if not pair:
            return Response(success=False, data=ResponseData(Error=f"AssetPair {asset_pair_id} not found"))
        caller = ic.caller().to_str()
        trade_id = f"{asset_pair_id}_{ic.time()}"
        trade = Trade(
            id=trade_id,
            asset_pair=pair,
            status=TRADE_STATUS.QUOTE.value,
            price=price,
            owner1=caller,
            owner2=""
        )
        return Response(
            success=True,
            data=ResponseData(TradeRecords=[TradeRecord(
                id=trade_id, asset_pair=asset_pair_id, owner1=caller,
                owner2="", price=price, status=TRADE_STATUS.QUOTE.value
            )])
        )
    except Exception as e:
        return Response(success=False, data=ResponseData(Error=str(e)))


@update
def accept_quote(trade_id: str) -> Response:
    try:
        trade = Trade[trade_id]
        if not trade:
            return Response(success=False, data=ResponseData(Error=f"Trade {trade_id} not found"))
        if trade.status != TRADE_STATUS.QUOTE.value:
            return Response(success=False, data=ResponseData(Error="Trade not in quote status"))
        caller = ic.caller().to_str()
        if trade.owner1 == caller:
            return Response(success=False, data=ResponseData(Error="Cannot accept own quote"))
        trade.owner2 = caller
        trade.status = TRADE_STATUS.CONFIRMED.value
        return Response(
            success=True,
            data=ResponseData(TradeRecords=[TradeRecord(
                id=trade_id, asset_pair=trade.asset_pair._id,
                owner1=trade.owner1, owner2=caller,
                price=trade.price, status=trade.status
            )])
        )
    except Exception as e:
        return Response(success=False, data=ResponseData(Error=str(e)))
