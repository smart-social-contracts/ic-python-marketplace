<script>
  import { onMount } from 'svelte';
  import { backend } from '$lib/canisters';
  import { Principal } from '@dfinity/principal';

  let loading = true;
  let error = null;
  
  // Stats
  let stats = { assets: [], asset_pairs: [], trades: [] };
  
  // Active tab
  let activeTab = 'trades';
  
  // Forms
  let showAssetForm = false;
  let showPairForm = false;
  let showQuoteForm = false;
  
  // Add Asset Form
  let assetForm = {
    id: '',
    principal: '',
    standard: 'ICRC1'
  };
  let addingAsset = false;
  let assetSuccess = null;
  let assetError = null;
  
  // Add Asset Pair Form
  let pairForm = {
    asset1: '',
    asset2: ''
  };
  let addingPair = false;
  let pairSuccess = null;
  let pairError = null;
  
  // Send Quote Form
  let quoteForm = {
    asset_pair_id: '',
    price: 1.0
  };
  let sendingQuote = false;
  let quoteSuccess = null;
  let quoteError = null;

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    try {
      loading = true;
      error = null;
      
      stats = await backend.get_stats();
      
    } catch (e) {
      console.error('Failed to load data:', e);
      error = e.message || 'Failed to load data';
    } finally {
      loading = false;
    }
  }

  async function handleAddAsset() {
    try {
      addingAsset = true;
      assetSuccess = null;
      assetError = null;
      
      const result = await backend.add_asset(
        assetForm.id,
        Principal.fromText(assetForm.principal),
        assetForm.standard
      );
      
      if (result.success) {
        assetSuccess = `Asset "${assetForm.id}" added successfully`;
        assetForm = { id: '', principal: '', standard: 'ICRC1' };
        await loadData();
      } else {
        assetError = result.data?.Error || 'Failed to add asset';
      }
    } catch (e) {
      console.error('Add asset failed:', e);
      assetError = e.message || 'Failed to add asset';
    } finally {
      addingAsset = false;
    }
  }

  async function handleAddPair() {
    try {
      addingPair = true;
      pairSuccess = null;
      pairError = null;
      
      const result = await backend.add_asset_pair(pairForm.asset1, pairForm.asset2);
      
      if (result.success) {
        pairSuccess = `Asset pair "${pairForm.asset1}_${pairForm.asset2}" created`;
        pairForm = { asset1: '', asset2: '' };
        await loadData();
      } else {
        pairError = result.data?.Error || 'Failed to create pair';
      }
    } catch (e) {
      console.error('Add pair failed:', e);
      pairError = e.message || 'Failed to create pair';
    } finally {
      addingPair = false;
    }
  }

  async function handleSendQuote() {
    try {
      sendingQuote = true;
      quoteSuccess = null;
      quoteError = null;
      
      const result = await backend.send_quote(quoteForm.asset_pair_id, quoteForm.price);
      
      if (result.success) {
        quoteSuccess = 'Quote sent successfully';
        quoteForm = { asset_pair_id: '', price: 1.0 };
        await loadData();
      } else {
        quoteError = result.data?.Error || 'Failed to send quote';
      }
    } catch (e) {
      console.error('Send quote failed:', e);
      quoteError = e.message || 'Failed to send quote';
    } finally {
      sendingQuote = false;
    }
  }

  async function handleAcceptQuote(tradeId) {
    try {
      const result = await backend.accept_quote(tradeId);
      
      if (result.success) {
        alert('Quote accepted!');
        await loadData();
      } else {
        alert(`Failed: ${result.data?.Error || 'Unknown error'}`);
      }
    } catch (e) {
      console.error('Accept quote failed:', e);
      alert(`Failed: ${e.message}`);
    }
  }

  function truncateAddress(addr) {
    if (!addr || addr.length <= 16) return addr;
    return addr.slice(0, 8) + '...' + addr.slice(-6);
  }
</script>

<main>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Marketplace</h1>
      <span class="badge">ICRC-1</span>
      <span class="badge">ICRC-7</span>
    </div>

    {#if loading}
      <div class="loading">Loading marketplace data...</div>
    {:else if error}
      <div class="error">{error}</div>
    {:else}
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Assets</div>
          <div class="stat-value">{stats.assets.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Trading Pairs</div>
          <div class="stat-value supply">{stats.asset_pairs.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Trades</div>
          <div class="stat-value">{stats.trades.length}</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class:active={activeTab === 'trades'} on:click={() => activeTab = 'trades'}>
          Trades
        </button>
        <button class:active={activeTab === 'pairs'} on:click={() => activeTab = 'pairs'}>
          Trading Pairs
        </button>
        <button class:active={activeTab === 'assets'} on:click={() => activeTab = 'assets'}>
          Assets
        </button>
      </div>

      <!-- Trades Tab -->
      {#if activeTab === 'trades'}
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h2>Trades</h2>
            <button class="btn btn-primary" on:click={() => showQuoteForm = !showQuoteForm}>
              {showQuoteForm ? 'Cancel' : '+ Send Quote'}
            </button>
          </div>
          
          {#if showQuoteForm}
            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
              <div class="form-row">
                <div class="form-group">
                  <label for="asset_pair_id">Asset Pair</label>
                  <select id="asset_pair_id" bind:value={quoteForm.asset_pair_id} disabled={sendingQuote}>
                    <option value="">Select pair...</option>
                    {#each stats.asset_pairs as pair}
                      <option value={pair}>{pair}</option>
                    {/each}
                  </select>
                </div>
                <div class="form-group">
                  <label for="price">Price</label>
                  <input 
                    id="price"
                    type="number" 
                    step="0.01"
                    bind:value={quoteForm.price}
                    placeholder="1.0"
                    disabled={sendingQuote}
                  />
                </div>
              </div>
              <button 
                class="btn btn-primary" 
                on:click={handleSendQuote}
                disabled={sendingQuote || !quoteForm.asset_pair_id}
              >
                {sendingQuote ? 'Sending...' : 'Send Quote'}
              </button>
              {#if quoteSuccess}
                <div class="success-message">{quoteSuccess}</div>
              {/if}
              {#if quoteError}
                <div class="error-message">{quoteError}</div>
              {/if}
            </div>
          {/if}
          
          {#if stats.trades.length === 0}
            <div class="no-data">No trades yet</div>
          {:else}
            <table class="data-table">
              <thead>
                <tr>
                  <th>Trade ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {#each stats.trades as trade}
                  <tr>
                    <td>{trade}</td>
                    <td>
                      <button class="btn btn-success btn-sm" on:click={() => handleAcceptQuote(trade)}>
                        Accept
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {/if}
        </div>
      {/if}

      <!-- Trading Pairs Tab -->
      {#if activeTab === 'pairs'}
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h2>Trading Pairs</h2>
            <button class="btn btn-primary" on:click={() => showPairForm = !showPairForm}>
              {showPairForm ? 'Cancel' : '+ Add Pair'}
            </button>
          </div>
          
          {#if showPairForm}
            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
              <div class="form-row">
                <div class="form-group">
                  <label for="asset1">Asset 1</label>
                  <select id="asset1" bind:value={pairForm.asset1} disabled={addingPair}>
                    <option value="">Select asset...</option>
                    {#each stats.assets as asset}
                      <option value={asset}>{asset}</option>
                    {/each}
                  </select>
                </div>
                <div class="form-group">
                  <label for="asset2">Asset 2</label>
                  <select id="asset2" bind:value={pairForm.asset2} disabled={addingPair}>
                    <option value="">Select asset...</option>
                    {#each stats.assets as asset}
                      <option value={asset}>{asset}</option>
                    {/each}
                  </select>
                </div>
              </div>
              <button 
                class="btn btn-primary" 
                on:click={handleAddPair}
                disabled={addingPair || !pairForm.asset1 || !pairForm.asset2}
              >
                {addingPair ? 'Creating...' : 'Create Pair'}
              </button>
              {#if pairSuccess}
                <div class="success-message">{pairSuccess}</div>
              {/if}
              {#if pairError}
                <div class="error-message">{pairError}</div>
              {/if}
            </div>
          {/if}
          
          {#if stats.asset_pairs.length === 0}
            <div class="no-data">No trading pairs</div>
          {:else}
            <table class="data-table">
              <thead>
                <tr>
                  <th>Pair ID</th>
                </tr>
              </thead>
              <tbody>
                {#each stats.asset_pairs as pair}
                  <tr>
                    <td>{pair}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {/if}
        </div>
      {/if}

      <!-- Assets Tab -->
      {#if activeTab === 'assets'}
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h2>Assets</h2>
            <button class="btn btn-primary" on:click={() => showAssetForm = !showAssetForm}>
              {showAssetForm ? 'Cancel' : '+ Add Asset'}
            </button>
          </div>
          
          {#if showAssetForm}
            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
              <div class="form-row">
                <div class="form-group">
                  <label for="asset_id">Asset ID</label>
                  <input 
                    id="asset_id"
                    type="text" 
                    bind:value={assetForm.id}
                    placeholder="TKNA"
                    disabled={addingAsset}
                  />
                </div>
                <div class="form-group">
                  <label for="principal">Token Canister Principal</label>
                  <input 
                    id="principal"
                    type="text" 
                    bind:value={assetForm.principal}
                    placeholder="ryjl3-tyaaa-aaaaa-aaaba-cai"
                    disabled={addingAsset}
                  />
                </div>
                <div class="form-group">
                  <label for="standard">Standard</label>
                  <select id="standard" bind:value={assetForm.standard} disabled={addingAsset}>
                    <option value="ICRC1">ICRC-1</option>
                    <option value="ICRC7">ICRC-7</option>
                  </select>
                </div>
              </div>
              <button 
                class="btn btn-primary" 
                on:click={handleAddAsset}
                disabled={addingAsset || !assetForm.id || !assetForm.principal}
              >
                {addingAsset ? 'Adding...' : 'Add Asset'}
              </button>
              {#if assetSuccess}
                <div class="success-message">{assetSuccess}</div>
              {/if}
              {#if assetError}
                <div class="error-message">{assetError}</div>
              {/if}
            </div>
          {/if}
          
          {#if stats.assets.length === 0}
            <div class="no-data">No assets registered</div>
          {:else}
            <table class="data-table">
              <thead>
                <tr>
                  <th>Asset ID</th>
                </tr>
              </thead>
              <tbody>
                {#each stats.assets as asset}
                  <tr>
                    <td>{asset}</td>
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
