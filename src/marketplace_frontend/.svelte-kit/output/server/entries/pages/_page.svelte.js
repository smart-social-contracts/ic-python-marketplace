import { c as create_ssr_component } from "../../chunks/ssr.js";
import { HttpAgent, Actor } from "@dfinity/agent";
import { e as escape } from "../../chunks/escape.js";
const idlFactory = ({ IDL }) => {
  IDL.Record({
    "name": IDL.Text,
    "test": IDL.Opt(IDL.Bool),
    "description": IDL.Opt(IDL.Text)
  });
  const GenericError = IDL.Record({
    "message": IDL.Text,
    "error_code": IDL.Nat
  });
  const AcceptOfferResult = IDL.Variant({
    "Ok": IDL.Nat64,
    "Err": GenericError
  });
  const CreateOfferArg = IDL.Record({
    "price_amount": IDL.Nat64,
    "price_canister_id": IDL.Text,
    "resource_id": IDL.Nat64
  });
  const OfferInfo = IDL.Record({
    "id": IDL.Nat64,
    "status": IDL.Text,
    "updated_at": IDL.Nat64,
    "created_at": IDL.Nat64,
    "seller": IDL.Text,
    "price_amount": IDL.Nat64,
    "price_canister_id": IDL.Text,
    "resource_id": IDL.Nat64
  });
  const ExchangeInfo = IDL.Record({
    "id": IDL.Nat64,
    "seller": IDL.Text,
    "price_amount": IDL.Nat64,
    "offer_id": IDL.Nat64,
    "resource_id": IDL.Nat64,
    "buyer": IDL.Text,
    "completed_at": IDL.Nat64
  });
  const ResourceInfo = IDL.Record({
    "id": IDL.Nat64,
    "token_id": IDL.Opt(IDL.Nat64),
    "owner": IDL.Text,
    "canister_id": IDL.Text,
    "created_at": IDL.Nat64,
    "resource_type": IDL.Text,
    "amount": IDL.Nat64
  });
  const PublicLogEntry = IDL.Record({
    "level": IDL.Text,
    "logger_name": IDL.Text,
    "message": IDL.Text,
    "timestamp": IDL.Nat64
  });
  const MarketplaceStats = IDL.Record({
    "test_mode": IDL.Bool,
    "total_resources": IDL.Nat64,
    "total_offers": IDL.Nat64,
    "active_offers": IDL.Nat64,
    "total_exchanges": IDL.Nat64
  });
  const CreateResourceArg = IDL.Record({
    "token_id": IDL.Opt(IDL.Nat64),
    "canister_id": IDL.Text,
    "resource_type": IDL.Text,
    "amount": IDL.Nat64
  });
  return IDL.Service({
    "accept_offer": IDL.Func([IDL.Nat64], [AcceptOfferResult], []),
    "cancel_offer": IDL.Func([IDL.Nat64], [AcceptOfferResult], []),
    "create_offer": IDL.Func([CreateOfferArg], [AcceptOfferResult], []),
    "get_active_offers": IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(OfferInfo)],
      ["query"]
    ),
    "get_admin": IDL.Func([], [IDL.Text], ["query"]),
    "get_all_exchanges": IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(ExchangeInfo)],
      ["query"]
    ),
    "get_all_offers": IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(OfferInfo)],
      ["query"]
    ),
    "get_all_resources": IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(ResourceInfo)],
      ["query"]
    ),
    "get_description": IDL.Func([], [IDL.Text], ["query"]),
    "get_exchange": IDL.Func([IDL.Nat64], [IDL.Opt(ExchangeInfo)], ["query"]),
    "get_exchanges_by_user": IDL.Func(
      [IDL.Text, IDL.Nat64, IDL.Nat64],
      [IDL.Vec(ExchangeInfo)],
      ["query"]
    ),
    "get_logs": IDL.Func(
      [IDL.Nat64, IDL.Nat64],
      [IDL.Vec(PublicLogEntry)],
      ["query"]
    ),
    "get_name": IDL.Func([], [IDL.Text], ["query"]),
    "get_offer": IDL.Func([IDL.Nat64], [IDL.Opt(OfferInfo)], ["query"]),
    "get_offers_by_seller": IDL.Func(
      [IDL.Text, IDL.Nat64, IDL.Nat64],
      [IDL.Vec(OfferInfo)],
      ["query"]
    ),
    "get_resource": IDL.Func([IDL.Nat64], [IDL.Opt(ResourceInfo)], ["query"]),
    "get_resources_by_owner": IDL.Func(
      [IDL.Text, IDL.Nat64, IDL.Nat64],
      [IDL.Vec(ResourceInfo)],
      ["query"]
    ),
    "get_stats": IDL.Func([], [MarketplaceStats], ["query"]),
    "is_test_mode": IDL.Func([], [IDL.Bool], ["query"]),
    "register_resource": IDL.Func(
      [CreateResourceArg],
      [AcceptOfferResult],
      []
    ),
    "set_admin": IDL.Func([IDL.Text], [IDL.Bool], []),
    "test_clear_all": IDL.Func([], [IDL.Bool], [])
  });
};
const host = "http://127.0.0.1:4943";
const agent = new HttpAgent({ host });
{
  agent.fetchRootKey().catch(console.error);
}
const canisterId = "lqy7q-dh777-77777-aaaaq-cai";
Actor.createActor(idlFactory, {
  agent,
  canisterId
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<main><div class="dashboard"><div class="dashboard-header"><h1>${escape("Marketplace")}</h1> <span class="badge" data-svelte-h="svelte-1pbs73r">ICRC-1</span> <span class="badge" data-svelte-h="svelte-1h0dy8d">ICRC-7</span> ${``}</div> ${`<div class="loading" data-svelte-h="svelte-i8a02q">Loading marketplace data...</div>`}</div></main>`;
});
export {
  Page as default
};
