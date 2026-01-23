import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Account {
  'owner' : Principal,
  'subaccount' : [] | [Uint8Array | number[]],
}
export interface AccountTransaction {
  'id' : bigint,
  'transaction' : IndexerTransaction,
}
export interface GetAccountTransactionsRequest {
  'max_results' : bigint,
  'start' : [] | [bigint],
  'account' : Account,
}
export interface GetAccountTransactionsResponse {
  'balance' : bigint,
  'transactions' : Array<AccountTransaction>,
  'oldest_tx_id' : [] | [bigint],
}
export type GetTransactionsResult = { 'Ok' : GetAccountTransactionsResponse } |
  { 'Err' : string };
export interface HolderInfo { 'balance' : bigint, 'address' : string }
export interface IndexerBurn {
  'from' : Account,
  'memo' : [] | [Uint8Array | number[]],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
  'spender' : [] | [Account],
}
export interface IndexerMint {
  'to' : Account,
  'memo' : [] | [Uint8Array | number[]],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
}
export interface IndexerTransaction {
  'burn' : [] | [IndexerBurn],
  'kind' : string,
  'mint' : [] | [IndexerMint],
  'approve' : [] | [bigint],
  'timestamp' : bigint,
  'transfer' : [] | [IndexerTransfer],
}
export interface IndexerTransfer {
  'to' : Account,
  'fee' : [] | [bigint],
  'from' : Account,
  'memo' : [] | [Uint8Array | number[]],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
  'spender' : [] | [Account],
}
export interface InitArgs {
  'fee' : bigint,
  'decimals' : number,
  'name' : string,
  'test' : [] | [boolean],
  'total_supply' : bigint,
  'symbol' : string,
}
export interface MintArgs { 'to' : Account, 'amount' : bigint }
export interface MintResult {
  'block_index' : [] | [bigint],
  'error' : [] | [string],
  'new_balance' : [] | [bigint],
  'success' : boolean,
}
export interface TokenDistribution {
  'holder_count' : bigint,
  'holders' : Array<HolderInfo>,
  'total_supply' : bigint,
}
export interface TokenMetadataRecord {
  'fee' : bigint,
  'decimals' : number,
  'name' : string,
  'total_supply' : bigint,
  'symbol' : string,
}
export interface TransactionDetailResponse {
  'id' : bigint,
  'fee' : bigint,
  'to_owner' : string,
  'to_subaccount' : string,
  'from_owner' : string,
  'kind' : string,
  'memo' : string,
  'from_subaccount' : string,
  'timestamp' : bigint,
  'amount' : bigint,
}
export interface TransactionInfo {
  'id' : bigint,
  'fee' : bigint,
  'kind' : string,
  'to_address' : string,
  'from_address' : string,
  'timestamp' : bigint,
  'amount' : bigint,
}
export interface TransactionListResponse {
  'page_size' : bigint,
  'page' : bigint,
  'transactions' : Array<TransactionInfo>,
  'total_count' : bigint,
  'has_more' : boolean,
}
export interface TransferArgs {
  'to' : Account,
  'fee' : [] | [bigint],
  'memo' : [] | [Uint8Array | number[]],
  'from_subaccount' : [] | [Uint8Array | number[]],
  'created_at_time' : [] | [bigint],
  'amount' : bigint,
}
export interface TransferResult {
  'block_index' : [] | [bigint],
  'error' : [] | [string],
  'success' : boolean,
}
export interface _SERVICE {
  'get_account_transactions' : ActorMethod<
    [GetAccountTransactionsRequest],
    GetTransactionsResult
  >,
  'get_my_balance' : ActorMethod<[], bigint>,
  'get_my_principal' : ActorMethod<[], string>,
  'get_owner' : ActorMethod<[], string>,
  'get_token_distribution' : ActorMethod<[], TokenDistribution>,
  'get_token_info' : ActorMethod<[], TokenMetadataRecord>,
  'get_top_holders' : ActorMethod<[bigint], Array<HolderInfo>>,
  'get_transaction' : ActorMethod<[bigint], [] | [TransactionDetailResponse]>,
  'get_transactions' : ActorMethod<[bigint, bigint], TransactionListResponse>,
  'icrc1_balance_of' : ActorMethod<[Account], bigint>,
  'icrc1_decimals' : ActorMethod<[], number>,
  'icrc1_fee' : ActorMethod<[], bigint>,
  'icrc1_metadata' : ActorMethod<[], Array<[string, string]>>,
  'icrc1_minting_account' : ActorMethod<[], [] | [Account]>,
  'icrc1_name' : ActorMethod<[], string>,
  'icrc1_supported_standards' : ActorMethod<[], Array<[string, string]>>,
  'icrc1_symbol' : ActorMethod<[], string>,
  'icrc1_total_supply' : ActorMethod<[], bigint>,
  'icrc1_transfer' : ActorMethod<[TransferArgs], TransferResult>,
  'is_test_mode' : ActorMethod<[], boolean>,
  'mint' : ActorMethod<[MintArgs], MintResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
