import { ethers } from 'ethers';
import { AmountRoutingHook__factory, ArbL2ToL1Hook__factory, CCIPHook__factory, DefaultHook__factory, DomainRoutingHook__factory, FallbackDomainRoutingHook__factory, IPostDispatchHook__factory, InterchainGasPaymaster__factory, MerkleTreeHook__factory, OPStackHook__factory, PausableHook__factory, ProtocolFee__factory, StaticAggregationHook__factory, StorageGasOracle__factory, } from '@hyperlane-xyz/core';
import { assert, concurrentMap, eqAddress, getLogLevel, objMap, promiseObjAll, rootLogger, } from '@hyperlane-xyz/utils';
import { DEFAULT_CONTRACT_READ_CONCURRENCY } from '../consts/concurrency.js';
import { HyperlaneReader } from '../utils/HyperlaneReader.js';
import { HookType, OnchainHookType, } from './types.js';
export class EvmHookReader extends HyperlaneReader {
    multiProvider;
    chain;
    concurrency;
    messageContext;
    logger = rootLogger.child({ module: 'EvmHookReader' });
    /**
     * HookConfig cache for already retrieved configs. Useful to avoid recomputing configs
     * when they have already been retrieved in previous calls where `deriveHookConfig` was called by
     * the specific hook methods.
     */
    _cache = new Map();
    constructor(multiProvider, chain, concurrency = multiProvider.tryGetRpcConcurrency(chain) ?? DEFAULT_CONTRACT_READ_CONCURRENCY, messageContext) {
        super(multiProvider, chain);
        this.multiProvider = multiProvider;
        this.chain = chain;
        this.concurrency = concurrency;
        this.messageContext = messageContext;
    }
    async deriveHookConfigFromAddress(address) {
        this.logger.debug('Deriving HookConfig:', { address });
        const cachedValue = this._cache.get(address);
        if (cachedValue) {
            this.logger.debug(`Cache hit for HookConfig on chain ${this.chain} at: ${address}`);
            return cachedValue;
        }
        this.logger.debug(`Cache miss for HookConfig on chain ${this.chain} at: ${address}`);
        let onchainHookType = undefined;
        let derivedHookConfig;
        try {
            const hook = IPostDispatchHook__factory.connect(address, this.provider);
            this.logger.debug('Deriving HookConfig:', { address });
            // Temporarily turn off SmartProvider logging
            // Provider errors are expected because deriving will call methods that may not exist in the Bytecode
            this.setSmartProviderLogLevel('silent');
            onchainHookType = await hook.hookType();
            switch (onchainHookType) {
                case OnchainHookType.ROUTING:
                    derivedHookConfig = await this.deriveDomainRoutingConfig(address);
                    break;
                case OnchainHookType.AGGREGATION:
                    derivedHookConfig = await this.deriveAggregationConfig(address);
                    break;
                case OnchainHookType.MERKLE_TREE:
                    derivedHookConfig = await this.deriveMerkleTreeConfig(address);
                    break;
                case OnchainHookType.INTERCHAIN_GAS_PAYMASTER:
                    derivedHookConfig = await this.deriveIgpConfig(address);
                    break;
                case OnchainHookType.FALLBACK_ROUTING:
                    derivedHookConfig = await this.deriveFallbackRoutingConfig(address);
                    break;
                case OnchainHookType.PAUSABLE:
                    derivedHookConfig = await this.derivePausableConfig(address);
                    break;
                case OnchainHookType.PROTOCOL_FEE:
                    derivedHookConfig = await this.deriveProtocolFeeConfig(address);
                    break;
                case OnchainHookType.ID_AUTH_ISM:
                    derivedHookConfig = await this.deriveIdAuthIsmConfig(address);
                    break;
                case OnchainHookType.ARB_L2_TO_L1:
                    derivedHookConfig = await this.deriveArbL2ToL1Config(address);
                    break;
                case OnchainHookType.AMOUNT_ROUTING:
                    derivedHookConfig = await this.deriveAmountRoutingHookConfig(address);
                    break;
                case OnchainHookType.MAILBOX_DEFAULT_HOOK:
                    derivedHookConfig =
                        await this.deriveMailboxDefaultHookConfig(address);
                    break;
                default:
                    throw new Error(`Unsupported HookType: ${OnchainHookType[onchainHookType]}`);
            }
        }
        catch (e) {
            let customMessage = `Failed to derive ${onchainHookType} hook (${address})`;
            if (!onchainHookType &&
                e.message.includes('Invalid response from provider')) {
                customMessage = customMessage.concat(` [The provided hook contract might be outdated and not support hookType()]`);
                this.logger.info(`${customMessage}:\n\t${e}`);
            }
            else {
                this.logger.debug(`${customMessage}:\n\t${e}`);
            }
            throw new Error(`${customMessage}:\n\t${e}`);
        }
        finally {
            this.setSmartProviderLogLevel(getLogLevel()); // returns to original level defined by rootLogger
        }
        return derivedHookConfig;
    }
    /**
     *  Recursively resolves the HookConfigs as addresses, e.g.
     *  hook:
     *     type: aggregationHook
     *     hooks:
     *       - "0x7937CB2886f01F38210506491A69B0D107Ea0ad9"
     *       - beneficiary: "0x865BA5789D82F2D4C5595a3968dad729A8C3daE6"
     *         maxProtocolFee: "100000000000000000000"
     *         owner: "0x865BA5789D82F2D4C5595a3968dad729A8C3daE6"
     *         protocolFee: "50000000000000000"
     *         type: protocolFee
     *
     * This may throw if the Hook address is not a derivable hook (e.g. Custom Hook)
     */
    async deriveHookConfig(config) {
        if (typeof config === 'string')
            return this.deriveHookConfigFromAddress(config);
        // Extend the inner hooks
        switch (config.type) {
            case HookType.FALLBACK_ROUTING:
            case HookType.ROUTING:
                config.domains = await promiseObjAll(objMap(config.domains, async (_, hook) => this.deriveHookConfig(hook)));
                if (config.type === HookType.FALLBACK_ROUTING)
                    config.fallback = await this.deriveHookConfig(config.fallback);
                break;
            case HookType.AGGREGATION:
                config.hooks = await Promise.all(config.hooks.map(async (hook) => this.deriveHookConfig(hook)));
                break;
            case HookType.AMOUNT_ROUTING:
                [config.lowerHook, config.upperHook] = await Promise.all([
                    this.deriveHookConfig(config.lowerHook),
                    this.deriveHookConfig(config.upperHook),
                ]);
                break;
        }
        return config;
    }
    async deriveMailboxDefaultHookConfig(address) {
        const hook = DefaultHook__factory.connect(address, this.provider);
        this.assertHookType(await hook.hookType(), OnchainHookType.MAILBOX_DEFAULT_HOOK);
        const config = {
            address,
            type: HookType.MAILBOX_DEFAULT,
        };
        this._cache.set(address, config);
        return config;
    }
    async deriveIdAuthIsmConfig(address) {
        // First check if it's a CCIP hook
        try {
            const ccipHook = CCIPHook__factory.connect(address, this.provider);
            // This method only exists on CCIPHook
            await ccipHook.ccipDestination();
            return this.deriveCcipConfig(address);
        }
        catch {
            // Not a CCIP hook, try OPStack
            try {
                const opStackHook = OPStackHook__factory.connect(address, this.provider);
                // This method only exists on OPStackHook
                await opStackHook.l1Messenger();
                return this.deriveOpStackConfig(address);
            }
            catch {
                throw new Error(`Could not determine hook type - neither CCIP nor OPStack methods found`);
            }
        }
    }
    async deriveCcipConfig(address) {
        const ccipHook = CCIPHook__factory.connect(address, this.provider);
        const destinationDomain = await ccipHook.destinationDomain();
        const destinationChain = this.multiProvider.getChainName(destinationDomain);
        const config = {
            address,
            type: HookType.CCIP,
            destinationChain,
        };
        this._cache.set(address, config);
        return config;
    }
    async deriveMerkleTreeConfig(address) {
        const hook = MerkleTreeHook__factory.connect(address, this.provider);
        this.assertHookType(await hook.hookType(), OnchainHookType.MERKLE_TREE);
        const config = {
            address,
            type: HookType.MERKLE_TREE,
        };
        this._cache.set(address, config);
        return config;
    }
    async deriveAggregationConfig(address) {
        const hook = StaticAggregationHook__factory.connect(address, this.provider);
        this.assertHookType(await hook.hookType(), OnchainHookType.AGGREGATION);
        const hooks = await hook.hooks(ethers.constants.AddressZero);
        const hookConfigs = await concurrentMap(this.concurrency, hooks, (hook) => this.deriveHookConfig(hook));
        const config = {
            address,
            type: HookType.AGGREGATION,
            hooks: hookConfigs,
        };
        this._cache.set(address, config);
        return config;
    }
    possibleDomainIds() {
        const isTestnet = !!this.multiProvider.getChainMetadata(this.chain)
            .isTestnet;
        return this.messageContext
            ? [this.messageContext.parsed.destination]
            : // filter to only domains that are the same testnet/mainnet
                this.multiProvider
                    .getKnownChainNames()
                    .filter((chainName) => !!this.multiProvider.getChainMetadata(chainName).isTestnet ===
                    isTestnet)
                    .map((chainName) => this.multiProvider.getDomainId(chainName));
    }
    async deriveIgpConfig(address) {
        const hook = InterchainGasPaymaster__factory.connect(address, this.provider);
        this.assertHookType(await hook.hookType(), OnchainHookType.INTERCHAIN_GAS_PAYMASTER);
        const owner = await hook.owner();
        const beneficiary = await hook.beneficiary();
        const overhead = {};
        const oracleConfig = {};
        let oracleKey;
        const allKeys = await concurrentMap(this.concurrency, this.possibleDomainIds(), async (domainId) => {
            const { name: chainName, nativeToken } = this.multiProvider.getChainMetadata(domainId);
            try {
                const { tokenExchangeRate, gasPrice } = await hook.getExchangeRateAndGasPrice(domainId);
                const domainGasOverhead = await hook.destinationGasLimit(domainId, 0);
                overhead[chainName] = domainGasOverhead.toNumber();
                oracleConfig[chainName] = {
                    tokenExchangeRate: tokenExchangeRate.toString(),
                    gasPrice: gasPrice.toString(),
                    tokenDecimals: nativeToken?.decimals,
                };
                const { gasOracle } = await hook.destinationGasConfigs(domainId);
                const oracle = StorageGasOracle__factory.connect(gasOracle, this.provider);
                return oracle.owner();
            }
            catch {
                this.logger.debug('Domain not configured on IGP Hook', domainId, chainName);
                return null;
            }
        });
        const resolvedOracleKeys = allKeys.filter((key) => key !== null);
        if (resolvedOracleKeys.length > 0) {
            const allKeysMatch = resolvedOracleKeys.every((key) => eqAddress(resolvedOracleKeys[0], key));
            assert(allKeysMatch, 'Not all oracle keys match');
            oracleKey = resolvedOracleKeys[0];
        }
        const config = {
            owner,
            address,
            type: HookType.INTERCHAIN_GAS_PAYMASTER,
            beneficiary,
            oracleKey: oracleKey ?? owner,
            overhead,
            oracleConfig,
        };
        this._cache.set(address, config);
        return config;
    }
    async deriveProtocolFeeConfig(address) {
        const hook = ProtocolFee__factory.connect(address, this.provider);
        this.assertHookType(await hook.hookType(), OnchainHookType.PROTOCOL_FEE);
        const owner = await hook.owner();
        const maxProtocolFee = await hook.MAX_PROTOCOL_FEE();
        const protocolFee = await hook.protocolFee();
        const beneficiary = await hook.beneficiary();
        const config = {
            owner,
            address,
            type: HookType.PROTOCOL_FEE,
            maxProtocolFee: maxProtocolFee.toString(),
            protocolFee: protocolFee.toString(),
            beneficiary,
        };
        this._cache.set(address, config);
        return config;
    }
    async deriveOpStackConfig(address) {
        const hook = OPStackHook__factory.connect(address, this.provider);
        const owner = await hook.owner();
        this.assertHookType(await hook.hookType(), OnchainHookType.ID_AUTH_ISM);
        const messengerContract = await hook.l1Messenger();
        const destinationDomain = await hook.destinationDomain();
        const destinationChainName = this.multiProvider.getChainName(destinationDomain);
        const config = {
            owner,
            address,
            type: HookType.OP_STACK,
            nativeBridge: messengerContract,
            destinationChain: destinationChainName,
        };
        this._cache.set(address, config);
        return config;
    }
    async deriveArbL2ToL1Config(address) {
        const hook = ArbL2ToL1Hook__factory.connect(address, this.provider);
        const arbSys = await hook.arbSys();
        const destinationDomain = await hook.destinationDomain();
        const destinationChainName = this.multiProvider.getChainName(destinationDomain);
        const childHookAddress = await hook.childHook();
        const childHookConfig = await this.deriveHookConfig(childHookAddress);
        const config = {
            address,
            type: HookType.ARB_L2_TO_L1,
            destinationChain: destinationChainName,
            arbSys,
            childHook: childHookConfig,
        };
        this._cache.set(address, config);
        return config;
    }
    async deriveDomainRoutingConfig(address) {
        const hook = DomainRoutingHook__factory.connect(address, this.provider);
        this.assertHookType(await hook.hookType(), OnchainHookType.ROUTING);
        const owner = await hook.owner();
        const domainHooks = await this.fetchDomainHooks(hook);
        const config = {
            owner,
            address,
            type: HookType.ROUTING,
            domains: domainHooks,
        };
        this._cache.set(address, config);
        return config;
    }
    async deriveFallbackRoutingConfig(address) {
        const hook = FallbackDomainRoutingHook__factory.connect(address, this.provider);
        this.assertHookType(await hook.hookType(), OnchainHookType.FALLBACK_ROUTING);
        const owner = await hook.owner();
        const domainHooks = await this.fetchDomainHooks(hook);
        const fallbackHook = await hook.fallbackHook();
        const fallbackHookConfig = await this.deriveHookConfig(fallbackHook);
        const config = {
            owner,
            address,
            type: HookType.FALLBACK_ROUTING,
            domains: domainHooks,
            fallback: fallbackHookConfig,
        };
        this._cache.set(address, config);
        return config;
    }
    async fetchDomainHooks(hook) {
        const domainHooks = {};
        await concurrentMap(this.concurrency, this.possibleDomainIds(), async (domainId) => {
            const chainName = this.multiProvider.getChainName(domainId);
            try {
                const domainHook = await hook.hooks(domainId);
                if (domainHook !== ethers.constants.AddressZero) {
                    domainHooks[chainName] = await this.deriveHookConfig(domainHook);
                }
            }
            catch {
                this.logger.debug(`Domain not configured on ${hook.constructor.name}`, domainId, chainName);
            }
        });
        return domainHooks;
    }
    async derivePausableConfig(address) {
        const hook = PausableHook__factory.connect(address, this.provider);
        this.assertHookType(await hook.hookType(), OnchainHookType.PAUSABLE);
        const owner = await hook.owner();
        const paused = await hook.paused();
        const config = {
            owner,
            address,
            paused,
            type: HookType.PAUSABLE,
        };
        this._cache.set(address, config);
        return config;
    }
    async deriveAmountRoutingHookConfig(address) {
        const hook = AmountRoutingHook__factory.connect(address, this.provider);
        this.assertHookType(await hook.hookType(), OnchainHookType.AMOUNT_ROUTING);
        const [threshold, lowerHook, upperHook] = await Promise.all([
            hook.threshold(),
            hook.lower(),
            hook.upper(),
        ]);
        const config = {
            address,
            type: HookType.AMOUNT_ROUTING,
            threshold: threshold.toNumber(),
            lowerHook: await this.deriveHookConfig(lowerHook),
            upperHook: await this.deriveHookConfig(upperHook),
        };
        this._cache.set(address, config);
        return config;
    }
    assertHookType(hookType, expectedType) {
        assert(hookType === expectedType, `expected hook type to be ${expectedType}, got ${hookType}`);
    }
}
//# sourceMappingURL=EvmHookReader.js.map