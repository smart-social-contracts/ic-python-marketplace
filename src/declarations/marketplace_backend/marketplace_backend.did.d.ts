import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type AcceptOfferResult = { 'Ok' : bigint } |
  { 'Err' : GenericError };
export interface CreateOfferArg {
  'price_amount' : bigint,
  'price_canister_id' : string,
  'resource_id' : bigint,
}
export interface CreateResourceArg {
  'token_id' : [] | [bigint],
  'canister_id' : string,
  'resource_type' : string,
  'amount' : bigint,
}
export interface ExchangeInfo {
  'id' : bigint,
  'seller' : string,
  'price_amount' : bigint,
  'offer_id' : bigint,
  'resource_id' : bigint,
  'buyer' : string,
  'completed_at' : bigint,
}
export interface GenericError { 'message' : string, 'error_code' : bigint }
export interface InitArg {
  'name' : string,
  'test' : [] | [boolean],
  'description' : [] | [string],
}
export interface MarketplaceStats {
  'test_mode' : boolean,
  'total_resources' : bigint,
  'total_offers' : bigint,
  'active_offers' : bigint,
  'total_exchanges' : bigint,
}
export interface OfferInfo {
  'id' : bigint,
  'status' : string,
  'updated_at' : bigint,
  'created_at' : bigint,
  'seller' : string,
  'price_amount' : bigint,
  'price_canister_id' : string,
  'resource_id' : bigint,
}
export interface PublicLogEntry {
  'level' : string,
  'logger_name' : string,
  'message' : string,
  'timestamp' : bigint,
}
export interface ResourceInfo {
  'id' : bigint,
  'token_id' : [] | [bigint],
  'owner' : string,
  'canister_id' : string,
  'created_at' : bigint,
  'resource_type' : string,
  'amount' : bigint,
}
export interface _SERVICE {
  'accept_offer' : ActorMethod<[bigint], AcceptOfferResult>,
  'cancel_offer' : ActorMethod<[bigint], AcceptOfferResult>,
  'create_offer' : ActorMethod<[CreateOfferArg], AcceptOfferResult>,
  'get_active_offers' : ActorMethod<[bigint, bigint], Array<OfferInfo>>,
  'get_admin' : ActorMethod<[], string>,
  'get_all_exchanges' : ActorMethod<[bigint, bigint], Array<ExchangeInfo>>,
  'get_all_offers' : ActorMethod<[bigint, bigint], Array<OfferInfo>>,
  'get_all_resources' : ActorMethod<[bigint, bigint], Array<ResourceInfo>>,
  'get_description' : ActorMethod<[], string>,
  'get_exchange' : ActorMethod<[bigint], [] | [ExchangeInfo]>,
  'get_exchanges_by_user' : ActorMethod<
    [string, bigint, bigint],
    Array<ExchangeInfo>
  >,
  'get_logs' : ActorMethod<[bigint, bigint], Array<PublicLogEntry>>,
  'get_name' : ActorMethod<[], string>,
  'get_offer' : ActorMethod<[bigint], [] | [OfferInfo]>,
  'get_offers_by_seller' : ActorMethod<
    [string, bigint, bigint],
    Array<OfferInfo>
  >,
  'get_resource' : ActorMethod<[bigint], [] | [ResourceInfo]>,
  'get_resources_by_owner' : ActorMethod<
    [string, bigint, bigint],
    Array<ResourceInfo>
  >,
  'get_stats' : ActorMethod<[], MarketplaceStats>,
  'is_test_mode' : ActorMethod<[], boolean>,
  'register_resource' : ActorMethod<[CreateResourceArg], AcceptOfferResult>,
  'set_admin' : ActorMethod<[string], boolean>,
  'test_clear_all' : ActorMethod<[], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
