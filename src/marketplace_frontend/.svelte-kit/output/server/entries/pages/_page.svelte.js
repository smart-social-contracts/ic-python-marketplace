import { c as create_ssr_component } from "../../chunks/ssr.js";
import { HttpAgent, Actor } from "@dfinity/agent";
import "@dfinity/principal";
const idlFactory = ({ IDL }) => {
  const AssetRecord = IDL.Record({
    "id": IDL.Text,
    "principal": IDL.Text,
    "standard": IDL.Text
  });
  const AssetPairRecord = IDL.Record({
    "id": IDL.Text,
    "asset1": IDL.Text,
    "asset2": IDL.Text
  });
  const TradeRecord = IDL.Record({
    "id": IDL.Text,
    "status": IDL.Text,
    "asset_pair": IDL.Text,
    "owner1": IDL.Text,
    "owner2": IDL.Text,
    "price": IDL.Float64
  });
  const MarketplaceStatsRecord = IDL.Record({
    "asset_pairs": IDL.Vec(IDL.Text),
    "trades": IDL.Vec(IDL.Text),
    "assets": IDL.Vec(IDL.Text)
  });
  const ResponseData = IDL.Variant({
    "Error": IDL.Text,
    "AssetRecords": IDL.Vec(AssetRecord),
    "AssetPairRecords": IDL.Vec(AssetPairRecord),
    "Message": IDL.Text,
    "TradeRecords": IDL.Vec(TradeRecord),
    "MarketplaceStats": MarketplaceStatsRecord
  });
  const Response = IDL.Record({ "data": ResponseData, "success": IDL.Bool });
  return IDL.Service({
    "accept_quote": IDL.Func([IDL.Text], [Response], []),
    "add_asset": IDL.Func([IDL.Text, IDL.Principal, IDL.Text], [Response], []),
    "add_asset_pair": IDL.Func([IDL.Text, IDL.Text], [Response], []),
    "get_stats": IDL.Func([], [MarketplaceStatsRecord], ["query"]),
    "send_quote": IDL.Func([IDL.Text, IDL.Float64], [Response], [])
  });
};
const host = "http://127.0.0.1:8000";
const agent = new HttpAgent({ host });
{
  agent.fetchRootKey().catch(console.error);
}
const canisterId = "ulvla-h7777-77774-qaacq-cai";
Actor.createActor(idlFactory, {
  agent,
  canisterId
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<main><div class="dashboard"><div class="dashboard-header" data-svelte-h="svelte-97ubbd"><h1>Marketplace</h1> <span class="badge">ICRC-1</span> <span class="badge">ICRC-7</span></div> ${`<div class="loading" data-svelte-h="svelte-i8a02q">Loading marketplace data...</div>`}</div></main>`;
});
export {
  Page as default
};
