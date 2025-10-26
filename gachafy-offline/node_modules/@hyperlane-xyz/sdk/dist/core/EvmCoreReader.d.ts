import { providers } from 'ethers';
import { Address } from '@hyperlane-xyz/utils';
import { EvmHookReader } from '../hook/EvmHookReader.js';
import { EvmIcaRouterReader } from '../ica/EvmIcaReader.js';
import { EvmIsmReader } from '../ism/EvmIsmReader.js';
import { MultiProvider } from '../providers/MultiProvider.js';
import { ChainNameOrId } from '../types.js';
import { CoreConfig, DerivedCoreConfig } from './types.js';
interface CoreReader {
    deriveCoreConfig(contracts: {
        mailbox: Address;
        interchainAccountRouter: Address;
    }): Promise<CoreConfig>;
}
export declare class EvmCoreReader implements CoreReader {
    protected readonly multiProvider: MultiProvider;
    protected readonly chain: ChainNameOrId;
    protected readonly concurrency: number;
    readonly provider: providers.Provider;
    readonly evmHookReader: EvmHookReader;
    readonly evmIsmReader: EvmIsmReader;
    readonly evmIcaRouterReader: EvmIcaRouterReader;
    protected readonly logger: import("pino").default.Logger<never>;
    constructor(multiProvider: MultiProvider, chain: ChainNameOrId, concurrency?: number);
    /**
     * Derives the core configuration for a given Mailbox address.
     *
     * @param address - The address of the Mailbox contract.
     * @returns A promise that resolves to the CoreConfig object, containing the owner, default ISM, default Hook, and required Hook configurations.
     */
    deriveCoreConfig({ mailbox, interchainAccountRouter, }: {
        mailbox: Address;
        interchainAccountRouter?: Address;
    }): Promise<DerivedCoreConfig>;
    private getProxyAdminConfig;
}
export {};
//# sourceMappingURL=EvmCoreReader.d.ts.map