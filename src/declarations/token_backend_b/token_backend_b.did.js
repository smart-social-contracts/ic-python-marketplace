export const idlFactory = ({ IDL }) => {
  const InitArgs = IDL.Record({
    'fee' : IDL.Nat,
    'decimals' : IDL.Nat8,
    'name' : IDL.Text,
    'test' : IDL.Opt(IDL.Bool),
    'total_supply' : IDL.Nat,
    'symbol' : IDL.Text,
  });
  const Account = IDL.Record({
    'owner' : IDL.Principal,
    'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const GetAccountTransactionsRequest = IDL.Record({
    'max_results' : IDL.Nat,
    'start' : IDL.Opt(IDL.Nat),
    'account' : Account,
  });
  const IndexerBurn = IDL.Record({
    'from' : Account,
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat),
    'amount' : IDL.Nat,
    'spender' : IDL.Opt(Account),
  });
  const IndexerMint = IDL.Record({
    'to' : Account,
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat),
    'amount' : IDL.Nat,
  });
  const IndexerTransfer = IDL.Record({
    'to' : Account,
    'fee' : IDL.Opt(IDL.Nat),
    'from' : Account,
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat),
    'amount' : IDL.Nat,
    'spender' : IDL.Opt(Account),
  });
  const IndexerTransaction = IDL.Record({
    'burn' : IDL.Opt(IndexerBurn),
    'kind' : IDL.Text,
    'mint' : IDL.Opt(IndexerMint),
    'approve' : IDL.Opt(IDL.Nat),
    'timestamp' : IDL.Nat,
    'transfer' : IDL.Opt(IndexerTransfer),
  });
  const AccountTransaction = IDL.Record({
    'id' : IDL.Nat,
    'transaction' : IndexerTransaction,
  });
  const GetAccountTransactionsResponse = IDL.Record({
    'balance' : IDL.Nat,
    'transactions' : IDL.Vec(AccountTransaction),
    'oldest_tx_id' : IDL.Opt(IDL.Nat),
  });
  const GetTransactionsResult = IDL.Variant({
    'Ok' : GetAccountTransactionsResponse,
    'Err' : IDL.Text,
  });
  const HolderInfo = IDL.Record({ 'balance' : IDL.Nat, 'address' : IDL.Text });
  const TokenDistribution = IDL.Record({
    'holder_count' : IDL.Nat,
    'holders' : IDL.Vec(HolderInfo),
    'total_supply' : IDL.Nat,
  });
  const TokenMetadataRecord = IDL.Record({
    'fee' : IDL.Nat,
    'decimals' : IDL.Nat8,
    'name' : IDL.Text,
    'total_supply' : IDL.Nat,
    'symbol' : IDL.Text,
  });
  const TransactionDetailResponse = IDL.Record({
    'id' : IDL.Nat,
    'fee' : IDL.Nat,
    'to_owner' : IDL.Text,
    'to_subaccount' : IDL.Text,
    'from_owner' : IDL.Text,
    'kind' : IDL.Text,
    'memo' : IDL.Text,
    'from_subaccount' : IDL.Text,
    'timestamp' : IDL.Nat,
    'amount' : IDL.Nat,
  });
  const TransactionInfo = IDL.Record({
    'id' : IDL.Nat,
    'fee' : IDL.Nat,
    'kind' : IDL.Text,
    'to_address' : IDL.Text,
    'from_address' : IDL.Text,
    'timestamp' : IDL.Nat,
    'amount' : IDL.Nat,
  });
  const TransactionListResponse = IDL.Record({
    'page_size' : IDL.Nat,
    'page' : IDL.Nat,
    'transactions' : IDL.Vec(TransactionInfo),
    'total_count' : IDL.Nat,
    'has_more' : IDL.Bool,
  });
  const TransferArgs = IDL.Record({
    'to' : Account,
    'fee' : IDL.Opt(IDL.Nat),
    'memo' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'from_subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'created_at_time' : IDL.Opt(IDL.Nat),
    'amount' : IDL.Nat,
  });
  const TransferResult = IDL.Record({
    'block_index' : IDL.Opt(IDL.Nat),
    'error' : IDL.Opt(IDL.Text),
    'success' : IDL.Bool,
  });
  const MintArgs = IDL.Record({ 'to' : Account, 'amount' : IDL.Nat });
  const MintResult = IDL.Record({
    'block_index' : IDL.Opt(IDL.Nat),
    'error' : IDL.Opt(IDL.Text),
    'new_balance' : IDL.Opt(IDL.Nat),
    'success' : IDL.Bool,
  });
  return IDL.Service({
    'get_account_transactions' : IDL.Func(
        [GetAccountTransactionsRequest],
        [GetTransactionsResult],
        ['query'],
      ),
    'get_my_balance' : IDL.Func([], [IDL.Nat], ['query']),
    'get_my_principal' : IDL.Func([], [IDL.Text], ['query']),
    'get_owner' : IDL.Func([], [IDL.Text], ['query']),
    'get_token_distribution' : IDL.Func([], [TokenDistribution], ['query']),
    'get_token_info' : IDL.Func([], [TokenMetadataRecord], ['query']),
    'get_top_holders' : IDL.Func([IDL.Nat], [IDL.Vec(HolderInfo)], ['query']),
    'get_transaction' : IDL.Func(
        [IDL.Nat],
        [IDL.Opt(TransactionDetailResponse)],
        ['query'],
      ),
    'get_transactions' : IDL.Func(
        [IDL.Nat, IDL.Nat],
        [TransactionListResponse],
        ['query'],
      ),
    'icrc1_balance_of' : IDL.Func([Account], [IDL.Nat], ['query']),
    'icrc1_decimals' : IDL.Func([], [IDL.Nat8], ['query']),
    'icrc1_fee' : IDL.Func([], [IDL.Nat], ['query']),
    'icrc1_metadata' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
        ['query'],
      ),
    'icrc1_minting_account' : IDL.Func([], [IDL.Opt(Account)], ['query']),
    'icrc1_name' : IDL.Func([], [IDL.Text], ['query']),
    'icrc1_supported_standards' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))],
        ['query'],
      ),
    'icrc1_symbol' : IDL.Func([], [IDL.Text], ['query']),
    'icrc1_total_supply' : IDL.Func([], [IDL.Nat], ['query']),
    'icrc1_transfer' : IDL.Func([TransferArgs], [TransferResult], []),
    'is_test_mode' : IDL.Func([], [IDL.Bool], ['query']),
    'mint' : IDL.Func([MintArgs], [MintResult], []),
  });
};
export const init = ({ IDL }) => {
  const InitArgs = IDL.Record({
    'fee' : IDL.Nat,
    'decimals' : IDL.Nat8,
    'name' : IDL.Text,
    'test' : IDL.Opt(IDL.Bool),
    'total_supply' : IDL.Nat,
    'symbol' : IDL.Text,
  });
  return [InitArgs];
};
