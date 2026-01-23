export const idlFactory = ({ IDL }) => {
  const AssetRecord = IDL.Record({
    'id' : IDL.Text,
    'principal' : IDL.Text,
    'standard' : IDL.Text,
  });
  const AssetPairRecord = IDL.Record({
    'id' : IDL.Text,
    'asset1' : IDL.Text,
    'asset2' : IDL.Text,
  });
  const TradeRecord = IDL.Record({
    'id' : IDL.Text,
    'status' : IDL.Text,
    'asset_pair' : IDL.Text,
    'owner1' : IDL.Text,
    'owner2' : IDL.Text,
    'price' : IDL.Float64,
  });
  const MarketplaceStatsRecord = IDL.Record({
    'asset_pairs' : IDL.Vec(IDL.Text),
    'trades' : IDL.Vec(IDL.Text),
    'assets' : IDL.Vec(IDL.Text),
  });
  const ResponseData = IDL.Variant({
    'Error' : IDL.Text,
    'AssetRecords' : IDL.Vec(AssetRecord),
    'AssetPairRecords' : IDL.Vec(AssetPairRecord),
    'Message' : IDL.Text,
    'TradeRecords' : IDL.Vec(TradeRecord),
    'MarketplaceStats' : MarketplaceStatsRecord,
  });
  const Response = IDL.Record({ 'data' : ResponseData, 'success' : IDL.Bool });
  return IDL.Service({
    'accept_quote' : IDL.Func([IDL.Text], [Response], []),
    'add_asset' : IDL.Func([IDL.Text, IDL.Principal, IDL.Text], [Response], []),
    'add_asset_pair' : IDL.Func([IDL.Text, IDL.Text], [Response], []),
    'get_stats' : IDL.Func([], [MarketplaceStatsRecord], ['query']),
    'send_quote' : IDL.Func([IDL.Text, IDL.Float64], [Response], []),
  });
};
export const init = ({ IDL }) => { return []; };
