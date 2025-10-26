import { Address, WithAddress } from '@hyperlane-xyz/utils';
import { DispatchedMessage } from '../core/types.js';
import { MultiProvider } from '../providers/MultiProvider.js';
import { ChainNameOrId } from '../types.js';
import { HyperlaneReader } from '../utils/HyperlaneReader.js';
import { AggregationHookConfig, ArbL2ToL1HookConfig, CCIPHookConfig, DerivedHookConfig, DomainRoutingHookConfig, FallbackRoutingHookConfig, HookConfig, IgpHookConfig, MailboxDefaultHookConfig, MerkleTreeHookConfig, OnchainHookType, OpStackHookConfig, PausableHookConfig, ProtocolFeeHookConfig } from './types.js';
export interface HookReader {
    deriveHookConfig(address: HookConfig): Promise<WithAddress<HookConfig>>;
    deriveMerkleTreeConfig(address: Address): Promise<WithAddress<MerkleTreeHookConfig>>;
    deriveAggregationConfig(address: Address): Promise<WithAddress<AggregationHookConfig>>;
    deriveIgpConfig(address: Address): Promise<WithAddress<IgpHookConfig>>;
    deriveProtocolFeeConfig(address: Address): Promise<WithAddress<ProtocolFeeHookConfig>>;
    deriveOpStackConfig(address: Address): Promise<WithAddress<OpStackHookConfig>>;
    deriveArbL2ToL1Config(address: Address): Promise<WithAddress<ArbL2ToL1HookConfig>>;
    deriveDomainRoutingConfig(address: Address): Promise<WithAddress<DomainRoutingHookConfig>>;
    deriveFallbackRoutingConfig(address: Address): Promise<WithAddress<FallbackRoutingHookConfig>>;
    derivePausableConfig(address: Address): Promise<WithAddress<PausableHookConfig>>;
    deriveIdAuthIsmConfig(address: Address): Promise<DerivedHookConfig>;
    deriveCcipConfig(address: Address): Promise<WithAddress<CCIPHookConfig>>;
    assertHookType(hookType: OnchainHookType, expectedType: OnchainHookType): void;
}
export declare class EvmHookReader extends HyperlaneReader implements HookReader {
    protected readonly multiProvider: MultiProvider;
    protected readonly chain: ChainNameOrId;
    protected readonly concurrency: number;
    protected readonly messageContext?: DispatchedMessage | undefined;
    protected readonly logger: import("pino").default.Logger<never>;
    /**
     * HookConfig cache for already retrieved configs. Useful to avoid recomputing configs
     * when they have already been retrieved in previous calls where `deriveHookConfig` was called by
     * the specific hook methods.
     */
    private _cache;
    constructor(multiProvider: MultiProvider, chain: ChainNameOrId, concurrency?: number, messageContext?: DispatchedMessage | undefined);
    deriveHookConfigFromAddress(address: Address): Promise<DerivedHookConfig>;
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
    deriveHookConfig(config: HookConfig): Promise<DerivedHookConfig>;
    deriveMailboxDefaultHookConfig(address: Address): Promise<WithAddress<MailboxDefaultHookConfig>>;
    deriveIdAuthIsmConfig(address: Address): Promise<DerivedHookConfig>;
    deriveCcipConfig(address: Address): Promise<WithAddress<CCIPHookConfig>>;
    deriveMerkleTreeConfig(address: Address): Promise<WithAddress<MerkleTreeHookConfig>>;
    deriveAggregationConfig(address: Address): Promise<WithAddress<AggregationHookConfig>>;
    possibleDomainIds(): number[];
    deriveIgpConfig(address: Address): Promise<WithAddress<IgpHookConfig>>;
    deriveProtocolFeeConfig(address: Address): Promise<WithAddress<ProtocolFeeHookConfig>>;
    deriveOpStackConfig(address: Address): Promise<WithAddress<OpStackHookConfig>>;
    deriveArbL2ToL1Config(address: Address): Promise<WithAddress<ArbL2ToL1HookConfig>>;
    deriveDomainRoutingConfig(address: Address): Promise<WithAddress<DomainRoutingHookConfig>>;
    deriveFallbackRoutingConfig(address: Address): Promise<WithAddress<FallbackRoutingHookConfig>>;
    private fetchDomainHooks;
    derivePausableConfig(address: Address): Promise<WithAddress<PausableHookConfig>>;
    private deriveAmountRoutingHookConfig;
    assertHookType(hookType: OnchainHookType, expectedType: OnchainHookType): void;
}
//# sourceMappingURL=EvmHookReader.d.ts.map