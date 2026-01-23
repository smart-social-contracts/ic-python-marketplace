import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AssetPairRecord {
  'id' : string,
  'asset1' : string,
  'asset2' : string,
}
export interface AssetRecord {
  'id' : string,
  'principal' : string,
  'standard' : string,
}
export interface MarketplaceStatsRecord {
  'asset_pairs' : Array<string>,
  'trades' : Array<string>,
  'assets' : Array<string>,
}
export interface Response { 'data' : ResponseData, 'success' : boolean }
export type ResponseData = { 'Error' : string } |
  { 'AssetRecords' : Array<AssetRecord> } |
  { 'AssetPairRecords' : Array<AssetPairRecord> } |
  { 'Message' : string } |
  { 'TradeRecords' : Array<TradeRecord> } |
  { 'MarketplaceStats' : MarketplaceStatsRecord };
export interface TradeRecord {
  'id' : string,
  'status' : string,
  'asset_pair' : string,
  'owner1' : string,
  'owner2' : string,
  'price' : number,
}
export interface _SERVICE {
  'accept_quote' : ActorMethod<[string], Response>,
  'add_asset' : ActorMethod<[string, Principal, string], Response>,
  'add_asset_pair' : ActorMethod<[string, string], Response>,
  'get_stats' : ActorMethod<[], MarketplaceStatsRecord>,
  'send_quote' : ActorMethod<[string, number], Response>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
