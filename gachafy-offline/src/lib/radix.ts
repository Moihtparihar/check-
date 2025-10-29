import { RadixDappToolkit, RadixNetwork, DataRequestBuilder } from '@radixdlt/radix-dapp-toolkit';
import { withRetry, withTimeout, NetworkError, TransactionError } from './errorHandling';
import { validateInput, walletAddressSchema, balanceSchema, nonceSchema } from './validation';
import { logger } from './logger';
import { rateLimiter } from './rateLimiter';

// Stokenet configuration
export const STOKENET_CONFIG = {
  networkId: RadixNetwork.Stokenet, // Use the correct enum
  dAppDefinitionAddress: 'account_tdx_2_129vr3rwyz7gnwf35kkuxvx0fs4hkz0n5hem9utaejqra3sxf0m5wej',
  rpcUrl: 'https://stokenet.radixdlt.com',
  gatewayUrl: 'https://babylon-stokenet-gateway.radixdlt.com',
};

// XRD resource address on Stokenet
export const XRD_RESOURCE_ADDRESS = 'resource_tdx_2_1tknxxxxxxxxxradxrdxxxxxxxxx009923554798xxxxxxxxxtfd2jc';

// Gacha package and component addresses (these would need to be deployed)
export const GACHA_PACKAGE_ADDRESS = 'package_tdx_2_1p4r8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p';
export const GACHA_COMPONENT_ADDRESS = 'component_tdx_2_1cp4r8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p8p';

class RadixService {
  private rdt: RadixDappToolkit | null = null;
  private initialized = false;
  private walletDataListeners = new Set<(data: any) => void>();

  onWalletData(listener: (data: any) => void) {
    this.walletDataListeners.add(listener);
    return () => this.walletDataListeners.delete(listener);
  }

  async initialize() {
    if (this.initialized) return;

    try {
      logger.info('Initializing Radix DApp Toolkit with mobile support', null, 'RadixService');
      this.rdt = RadixDappToolkit({
        dAppDefinitionAddress: STOKENET_CONFIG.dAppDefinitionAddress,
        networkId: STOKENET_CONFIG.networkId,
        applicationName: 'GachaFi',
        applicationVersion: '1.0.0',
      });

      // Configure button appearance and request data
      try {
        this.rdt.buttonApi.setMode('dark');
      } catch {}

      // Request at least one account by default so the √ Connect button knows what to ask for
      await this.rdt.walletApi.setRequestData(
        DataRequestBuilder.accounts().atLeast(1)
      );

      // Subscribe to wallet connection state changes
      this.rdt.walletApi.walletData$.subscribe((walletData) => {
        logger.info('Wallet data updated', { walletData }, 'RadixService');
        // Notify listeners (e.g., React context)
        this.walletDataListeners.forEach((cb) => {
          try { cb(walletData); } catch {}
        });
      });

      logger.info('Radix DApp Toolkit initialized successfully with mobile deep linking', null, 'RadixService');
      this.initialized = true;
    } catch (error) {
      logger.error('Failed to initialize Radix DApp Toolkit', error, 'RadixService');
      throw new NetworkError('Failed to initialize wallet connection');
    }
  }

  async connectWallet(): Promise<any> {
    if (!this.rdt) await this.initialize();

    // Rate limit check
    if (!rateLimiter.check('wallet_connect', { maxRequests: 3, windowMs: 60000, keyPrefix: 'radix' })) {
      logger.warn('Wallet connection rate limited', null, 'RadixService');
      return null;
    }

    try {
      logger.info('Attempting wallet connection', null, 'RadixService');

      // Prepare request and trigger wallet
      await this.rdt!.walletApi.setRequestData(
        DataRequestBuilder.accounts().atLeast(1)
      );
      const result = await this.rdt!.walletApi.sendRequest();

      logger.info('Wallet connection successful', null, 'RadixService');
      return result;
    } catch (error) {
      logger.error('Wallet connection failed', error, 'RadixService');
      return null;
    }
  }

  async getBalance(accountAddress: string): Promise<number> {
    // Validate input
    validateInput(walletAddressSchema, accountAddress, 'Invalid wallet address');

    return await withRetry(
      async () => {
        const response = await withTimeout(
          fetch(`${STOKENET_CONFIG.gatewayUrl}/state/entity/details`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              addresses: [accountAddress],
              aggregation_level: 'Vault',
              opt_ins: {
                fungible_resource_balances: true,
              },
            }),
          }),
          10000,
          'Balance fetch timed out'
        );

        if (!response.ok) {
          throw new NetworkError(`Failed to fetch balance: ${response.statusText}`);
        }

        const data = await response.json();
        // --- Patch for correct Stokenet response parsing ---
        const fungibleResources = data.items[0]?.fungible_resources?.items || [];
        const xrdResource = fungibleResources.find(
          (resource: any) => resource.resource_address === XRD_RESOURCE_ADDRESS
        );
        let balance = 0;
        if (xrdResource && xrdResource.vaults?.items?.length > 0) {
          balance = xrdResource.vaults.items.reduce(
            (sum: number, v: any) => sum + parseFloat(v.amount || '0'),
            0
          );
        }
        logger.info('Parsed XRD balance: ' + balance);

        // Validate balance
        return validateInput(balanceSchema, balance, 'Invalid balance received');
      },
      { maxAttempts: 3, delayMs: 1000 }
    ).catch(error => {
      logger.error('Error fetching balance', error, 'RadixService');
      console.log('Fetch balance for:', accountAddress, 'Looking for resource:', XRD_RESOURCE_ADDRESS);

      return 0;
    });
  }

  async mintGachaBadge(accountAddress: string, tier: string, amount: number): Promise<string> {
    if (!this.rdt) await this.initialize();

    // Validate inputs
    validateInput(walletAddressSchema, accountAddress, 'Invalid wallet address');
    validateInput(balanceSchema, amount, 'Invalid amount');

    if (!['common', 'rare', 'epic'].includes(tier)) {
      throw new TransactionError('Invalid tier');
    }

    // Rate limit minting
    if (!rateLimiter.check(`mint_${accountAddress}`, { maxRequests: 5, windowMs: 60000, keyPrefix: 'mint' })) {
      throw new TransactionError('Too many mint requests. Please wait before trying again.');
    }

    // Generate a simple nonce for VDF (in real implementation, this would be more complex)
    const nonce = validateInput(nonceSchema, Math.floor(Math.random() * 1000000));
    
    // Create the transaction manifest
    const manifest = `
      CALL_METHOD
      Address("${GACHA_COMPONENT_ADDRESS}")
      "get_badge";
    `;

    try {
      logger.info('Submitting mint transaction', { tier, amount }, 'RadixService');

      const result = await this.rdt!.walletApi.sendTransaction({
        transactionManifest: manifest,
        version: 1,
      });

      const txHash = (result as any)?.value?.transactionIntentHash;
      if (!txHash) {
        throw new TransactionError("Transaction could not be submitted—check contract address and manifest.");
      }

      logger.info('Transaction submitted', { txHash }, 'RadixService');

      return txHash;
    } catch (error) {
      logger.error('Transaction submission failed', error, 'RadixService');
      throw new TransactionError('Failed to submit transaction');
    }
  }

  async getTransactionStatus(txHash: string): Promise<'success' | 'failed' | 'pending'> {
    return await withRetry(
      async () => {
        const response = await withTimeout(
          fetch(`${STOKENET_CONFIG.gatewayUrl}/transaction/status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              intent_hash: txHash,
            }),
          }),
          10000,
          'Transaction status check timed out'
        );

        if (!response.ok) {
          throw new NetworkError('Failed to check transaction status');
        }

        const data = await response.json();

        if (data.status === 'CommittedSuccess') return 'success';
        if (data.status === 'CommittedFailure') return 'failed';
        return 'pending';
      },
      { maxAttempts: 2, delayMs: 500 }
    ).catch(error => {
      logger.warn('Error checking transaction status', error, 'RadixService');
      return 'pending' as const;
    });
  }

  // Creator earnings methods
  async getUserCapsules(walletAddress: string): Promise<any[]> {
    try {
      console.log('Fetching user capsules for:', walletAddress);

      // Query user's NFT holdings to find created Capsules
      const response = await fetch(`${STOKENET_CONFIG.gatewayUrl}/state/entity/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addresses: [walletAddress],
          aggregation_level: 'Vault',
          opt_ins: {
            ancestor_identities: false,
            component_royalty_vault_balance: false,
            package_royalty_vault_balance: false,
            non_fungible_include_nfids: true,
            explicit_metadata: []
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user capsules: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('User capsules data:', data);

      // Filter for Capsule NFTs (would need specific resource address)
      return data.items || [];
    } catch (error) {
      console.error('Error fetching user capsules:', error);
      return [];
    }
  }

  async getCapsuleEarnings(capsuleId: string): Promise<{ today: number; allTime: number; totalOpens: number }> {
    try {
      console.log('Calculating earnings for capsule:', capsuleId);

      // Query transaction history for this Capsule
      // Calculate 0.5% of SP from opens
      // This would involve complex RPC queries to:
      // 1. Find all transactions involving this Capsule
      // 2. Parse transaction manifests for SP amounts
      // 3. Calculate creator share (0.5%)
      // 4. Aggregate by time periods

      // For demo, return simulated data
      return {
        today: Math.random() * 10,
        allTime: Math.random() * 1000,
        totalOpens: Math.floor(Math.random() * 2000),
      };
    } catch (error) {
      console.error('Error calculating capsule earnings:', error);
      return { today: 0, allTime: 0, totalOpens: 0 };
    }
  }
}

export const radixService = new RadixService();

// Helper function to shorten transaction hash for display
export const shortenTxHash = (hash: string): string => {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};
