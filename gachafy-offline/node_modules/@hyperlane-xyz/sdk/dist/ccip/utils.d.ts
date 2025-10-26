import { CCIPHook, CCIPIsm } from '@hyperlane-xyz/core';
import { HyperlaneAddressesMap } from '../contracts/types.js';
import { MultiProvider } from '../providers/MultiProvider.js';
import { ChainName } from '../types.js';
/**
 * Gets the chain name from a CCIP chain selector value
 * @param chainSelector The CCIP chain selector value
 * @returns The chain name if found, undefined otherwise
 */
export declare function getChainNameFromCCIPSelector(chainSelector: string): string | undefined;
/**
 * Gets the CCIP chain selector value for a given chain name
 * @param chainName The name of the chain
 * @returns The CCIP chain selector if found, undefined otherwise
 */
export declare function getCCIPChainSelector(chainName: string): string | undefined;
/**
 * Gets the CCIP router address for a given chain name
 * @param chainName The name of the chain
 * @returns The CCIP router address if found, undefined otherwise
 */
export declare function getCCIPRouterAddress(chainName: string): string | undefined;
/**
 * Gets the list of chains supported by CCIP
 * @returns The list of chain names
 */
export declare function getCCIPChains(): string[];
export declare const CCIP_HOOK_KEY_PREFIX = "ccipHook";
export declare const CCIP_ISM_KEY_PREFIX = "ccipIsm";
export declare class CCIPContractCache {
    private cachedAddresses;
    constructor(addressesMap?: HyperlaneAddressesMap<any>);
    cacheAddressesMap(addressesMap: HyperlaneAddressesMap<any>): void;
    getAddressesMap(): HyperlaneAddressesMap<any>;
    writeBack(cachedAddresses: HyperlaneAddressesMap<any>): void;
    setHook(origin: ChainName, destination: ChainName, ccipHook: CCIPHook): void;
    setIsm(origin: ChainName, destination: ChainName, ccipIsm: CCIPIsm): void;
    getHook(origin: ChainName, destination: ChainName): string | undefined;
    getIsm(origin: ChainName, destination: ChainName): string | undefined;
}
export declare function isSupportedCCIPLane({ origin, destination, multiProvider, }: {
    origin: ChainName;
    destination: ChainName;
    multiProvider: MultiProvider;
}): Promise<boolean>;
//# sourceMappingURL=utils.d.ts.map