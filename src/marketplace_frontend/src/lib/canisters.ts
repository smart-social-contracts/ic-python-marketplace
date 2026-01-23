import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "declarations/marketplace_backend/marketplace_backend.did.js";

const isLocal = !process.env.DFX_NETWORK || process.env.DFX_NETWORK === "local";
const host = isLocal ? "http://127.0.0.1:4943" : "https://icp0.io";

const agent = new HttpAgent({ host });

if (isLocal) {
  agent.fetchRootKey().catch(console.error);
}

const canisterId = process.env.CANISTER_ID_MARKETPLACE_BACKEND;

export const backend = Actor.createActor(idlFactory, {
  agent,
  canisterId,
});
