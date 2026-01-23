<script>
  import { onMount } from 'svelte';
  import { backend } from '$lib/canisters';

  let loading = true;
  let error = null;
  
  // Marketplace info
  let marketplaceName = '';
  let testMode = false;
  let stats = null;
  
  // Active tab
  let activeTab = 'offers';
  
  // Data
  let offers = [];
  let resources = [];
  let exchanges = [];
  
  // Forms
  let showRegisterForm = false;
  let showOfferForm = false;
  
  // Register Resource Form
  let registerForm = {
    resource_type: 'ICRC1',
    canister_id: '',
    token_id: '',
    amount: 1
  };
  let registering = false;
  let registerSuccess = null;
  let registerError = null;
  
  // Create Offer Form
  let offerForm = {
    resource_id: '',
    price_canister_id: '',
    price_amount: 0
  };
  let creatingOffer = false;
  let offerSuccess = null;
  let offerError = null;

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    try {
      loading = true;
      error = null;
      
      const [name, test, statsData, offersData, resourcesData, exchangesData] = await Promise.all([
        backend.get_name(),
        backend.is_test_mode().catch(() => false),
        backend.get_stats(),
        backend.get_active_offers(0n, 50n),
        backend.get_all_resources(0n, 50n),
        backend.get_all_exchanges(0n, 50n)
      ]);
      
      marketplaceName = name;
      testMode = test;
      stats = statsData;
      offers = offersData;
      resources = resourcesData;
      exchanges = exchangesData;
      
    } catch (e) {
      console.error('Failed to load data:', e);
      error = e.message || 'Failed to load data';
    } finally {
      loading = false;
    }
  }

  async function handleRegisterResource() {
    try {
      registering = true;
      registerSuccess = null;
      registerError = null;
      
      const result = await backend.register_resource({
        resource_type: registerForm.resource_type,
        canister_id: registerForm.canister_id,
        token_id: registerForm.token_id ? [BigInt(registerForm.token_id)] : [],
        amount: BigInt(registerForm.amount)
      });
      
      if ('Ok' in result) {
        registerSuccess = `Resource registered with ID: ${result.Ok}`;
        registerForm = { resource_type: 'ICRC1', canister_id: '', token_id: '', amount: 1 };
        await loadData();
      } else {
        registerError = result.Err?.message || 'Registration failed';
      }
    } catch (e) {
      console.error('Register failed:', e);
      registerError = e.message || 'Registration failed';
    } finally {
      registering = false;
    }
  }

  async function handleCreateOffer() {
    try {
      creatingOffer = true;
      offerSuccess = null;
      offerError = null;
      
      const result = await backend.create_offer({
        resource_id: BigInt(offerForm.resource_id),
        price_canister_id: offerForm.price_canister_id,
        price_amount: BigInt(offerForm.price_amount)
      });
      
      if ('Ok' in result) {
        offerSuccess = `Offer created with ID: ${result.Ok}`;
        offerForm = { resource_id: '', price_canister_id: '', price_amount: 0 };
        await loadData();
      } else {
        offerError = result.Err?.message || 'Failed to create offer';
      }
    } catch (e) {
      console.error('Create offer failed:', e);
      offerError = e.message || 'Failed to create offer';
    } finally {
      creatingOffer = false;
    }
  }

  async function handleAcceptOffer(offerId) {
    try {
      const result = await backend.accept_offer(BigInt(offerId));
      
      if ('Ok' in result) {
        alert(`Exchange completed! ID: ${result.Ok}`);
        await loadData();
      } else {
        alert(`Failed: ${result.Err?.message || 'Unknown error'}`);
      }
    } catch (e) {
      console.error('Accept offer failed:', e);
      alert(`Failed: ${e.message}`);
    }
  }

  async function handleCancelOffer(offerId) {
    if (!confirm('Are you sure you want to cancel this offer?')) return;
    
    try {
      const result = await backend.cancel_offer(BigInt(offerId));
      
      if ('Ok' in result) {
        await loadData();
      } else {
        alert(`Failed: ${result.Err?.message || 'Unknown error'}`);
      }
    } catch (e) {
      console.error('Cancel offer failed:', e);
      alert(`Failed: ${e.message}`);
    }
  }

  function truncateAddress(addr) {
    if (!addr || addr.length <= 16) return addr;
    return addr.slice(0, 8) + '...' + addr.slice(-6);
  }

  function formatAmount(amount) {
    return Number(amount).toLocaleString();
  }

  function formatTime(timestamp) {
    if (!timestamp) return '-';
    try {
      const date = new Date(Number(timestamp) / 1_000_000);
      return date.toLocaleString();
    } catch {
      return '-';
    }
  }
</script>

<main>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>{marketplaceName || 'Marketplace'}</h1>
      <span class="badge">ICRC-1</span>
      <span class="badge">ICRC-7</span>
      {#if testMode}
        <span class="badge test">TEST MODE</span>
      {/if}
    </div>

    {#if loading}
      <div class="loading">Loading marketplace data...</div>
    {:else if error}
      <div class="error">{error}</div>
    {:else}
      <!-- Stats Grid -->
      {#if stats}
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Resources</div>
            <div class="stat-value">{stats.total_resources}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Active Offers</div>
            <div class="stat-value supply">{stats.active_offers}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Offers</div>
            <div class="stat-value">{stats.total_offers}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Exchanges</div>
            <div class="stat-value">{stats.total_exchanges}</div>
          </div>
        </div>
      {/if}

      <!-- Tabs -->
      <div class="tabs">
        <button class:active={activeTab === 'offers'} on:click={() => activeTab = 'offers'}>
          Active Offers
        </button>
        <button class:active={activeTab === 'resources'} on:click={() => activeTab = 'resources'}>
          Resources
        </button>
        <button class:active={activeTab === 'exchanges'} on:click={() => activeTab = 'exchanges'}>
          Exchanges
        </button>
      </div>

      <!-- Active Offers Tab -->
      {#if activeTab === 'offers'}
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h2>Active Offers</h2>
            <button class="btn btn-primary" on:click={() => showOfferForm = !showOfferForm}>
              {showOfferForm ? 'Cancel' : '+ Create Offer'}
            </button>
          </div>
          
          {#if showOfferForm}
            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
              <div class="form-row">
                <div class="form-group">
                  <label for="resource_id">Resource ID</label>
                  <input 
                    id="resource_id"
                    type="number" 
                    bind:value={offerForm.resource_id}
                    placeholder="1"
                    disabled={creatingOffer}
                  />
                </div>
                <div class="form-group">
                  <label for="price_canister">Payment Token Canister</label>
                  <input 
                    id="price_canister"
                    type="text" 
                    bind:value={offerForm.price_canister_id}
                    placeholder="ryjl3-tyaaa-aaaaa-aaaba-cai"
                    disabled={creatingOffer}
                  />
                </div>
                <div class="form-group">
                  <label for="price_amount">Price Amount</label>
                  <input 
                    id="price_amount"
                    type="number" 
                    bind:value={offerForm.price_amount}
                    placeholder="1000000"
                    disabled={creatingOffer}
                  />
                </div>
              </div>
              <button 
                class="btn btn-primary" 
                on:click={handleCreateOffer}
                disabled={creatingOffer || !offerForm.resource_id || !offerForm.price_canister_id}
              >
                {creatingOffer ? 'Creating...' : 'Create Offer'}
              </button>
              {#if offerSuccess}
                <div class="success-message">{offerSuccess}</div>
              {/if}
              {#if offerError}
                <div class="error-message">{offerError}</div>
              {/if}
            </div>
          {/if}
          
          {#if offers.length === 0}
            <div class="no-data">No active offers</div>
          {:else}
            <div class="offers-grid">
              {#each offers as offer}
                <div class="offer-card">
                  <div class="offer-header">
                    <span class="offer-id">Offer #{offer.id}</span>
                    <span class="badge active">{offer.status}</span>
                  </div>
                  <div class="offer-price">{formatAmount(offer.price_amount)}</div>
                  <div class="offer-resource">Resource #{offer.resource_id}</div>
                  <div class="offer-seller">Seller: {truncateAddress(offer.seller)}</div>
                  <div class="offer-actions">
                    <button class="btn btn-success" on:click={() => handleAcceptOffer(offer.id)}>
                      Buy
                    </button>
                    <button class="btn btn-danger" on:click={() => handleCancelOffer(offer.id)}>
                      Cancel
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      <!-- Resources Tab -->
      {#if activeTab === 'resources'}
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h2>Resources</h2>
            <button class="btn btn-primary" on:click={() => showRegisterForm = !showRegisterForm}>
              {showRegisterForm ? 'Cancel' : '+ Register Resource'}
            </button>
          </div>
          
          {#if showRegisterForm}
            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
              <div class="form-row">
                <div class="form-group">
                  <label for="resource_type">Type</label>
                  <select id="resource_type" bind:value={registerForm.resource_type} disabled={registering}>
                    <option value="ICRC1">ICRC-1 (Fungible)</option>
                    <option value="ICRC7">ICRC-7 (NFT)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="canister_id">Token Canister ID</label>
                  <input 
                    id="canister_id"
                    type="text" 
                    bind:value={registerForm.canister_id}
                    placeholder="ryjl3-tyaaa-aaaaa-aaaba-cai"
                    disabled={registering}
                  />
                </div>
                {#if registerForm.resource_type === 'ICRC7'}
                  <div class="form-group">
                    <label for="token_id">Token ID</label>
                    <input 
                      id="token_id"
                      type="number" 
                      bind:value={registerForm.token_id}
                      placeholder="1"
                      disabled={registering}
                    />
                  </div>
                {/if}
                <div class="form-group">
                  <label for="amount">Amount</label>
                  <input 
                    id="amount"
                    type="number" 
                    bind:value={registerForm.amount}
                    placeholder="1"
                    disabled={registering}
                  />
                </div>
              </div>
              <button 
                class="btn btn-primary" 
                on:click={handleRegisterResource}
                disabled={registering || !registerForm.canister_id}
              >
                {registering ? 'Registering...' : 'Register Resource'}
              </button>
              {#if registerSuccess}
                <div class="success-message">{registerSuccess}</div>
              {/if}
              {#if registerError}
                <div class="error-message">{registerError}</div>
              {/if}
            </div>
          {/if}
          
          {#if resources.length === 0}
            <div class="no-data">No resources registered</div>
          {:else}
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Canister</th>
                  <th>Token ID</th>
                  <th>Amount</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {#each resources as resource}
                  <tr>
                    <td>{resource.id}</td>
                    <td><span class="badge">{resource.resource_type}</span></td>
                    <td class="address">{truncateAddress(resource.canister_id)}</td>
                    <td>{resource.token_id?.[0] ?? '-'}</td>
                    <td>{formatAmount(resource.amount)}</td>
                    <td class="address">{truncateAddress(resource.owner)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {/if}
        </div>
      {/if}

      <!-- Exchanges Tab -->
      {#if activeTab === 'exchanges'}
        <div class="card">
          <h2>Recent Exchanges</h2>
          {#if exchanges.length === 0}
            <div class="no-data">No exchanges yet</div>
          {:else}
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Offer</th>
                  <th>Resource</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Price</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {#each exchanges as exchange}
                  <tr>
                    <td>{exchange.id}</td>
                    <td>#{exchange.offer_id}</td>
                    <td>#{exchange.resource_id}</td>
                    <td class="address">{truncateAddress(exchange.buyer)}</td>
                    <td class="address">{truncateAddress(exchange.seller)}</td>
                    <td>{formatAmount(exchange.price_amount)}</td>
                    <td>{formatTime(exchange.completed_at)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
</main>
