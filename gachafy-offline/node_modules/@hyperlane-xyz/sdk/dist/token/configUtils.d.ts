import { Address } from '@hyperlane-xyz/utils';
import { MultiProvider } from '../providers/MultiProvider.js';
import { DestinationGas, RemoteRouters } from '../router/types.js';
import { ChainMap } from '../types.js';
import { WarpCoreConfig } from '../warp/types.js';
import { DerivedWarpRouteDeployConfig, HypTokenRouterConfig, HypTokenRouterVirtualConfig, WarpRouteDeployConfig, WarpRouteDeployConfigMailboxRequired } from './types.js';
/**
 * Returns default router addresses and gas values for cross-chain communication.
 * For each remote chain:
 * - Sets up router addresses for message routing
 * - Configures gas values for message processing
 */
export declare function getDefaultRemoteRouterAndDestinationGasConfig(multiProvider: MultiProvider, chain: string, deployedRoutersAddresses: ChainMap<Address>, warpDeployConfig: WarpRouteDeployConfig): [RemoteRouters, DestinationGas];
export declare function getRouterAddressesFromWarpCoreConfig(warpCoreConfig: WarpCoreConfig): ChainMap<Address>;
/**
 * Expands a Warp deploy config with additional data
 *
 * @param multiProvider
 * @param warpDeployConfig - The warp deployment config
 * @param deployedRoutersAddresses - Addresses of deployed routers for each chain
 * @param virtualConfig - Optional virtual config to include in the warpDeployConfig
 * @returns A promise resolving to an expanded Warp deploy config with derived and virtual metadata
 */
export declare function expandWarpDeployConfig(params: {
    multiProvider: MultiProvider;
    warpDeployConfig: WarpRouteDeployConfigMailboxRequired;
    deployedRoutersAddresses: ChainMap<Address>;
    expandedOnChainWarpConfig?: WarpRouteDeployConfigMailboxRequired;
}): Promise<WarpRouteDeployConfigMailboxRequired>;
export declare function expandVirtualWarpDeployConfig(params: {
    multiProvider: MultiProvider;
    onChainWarpConfig: DerivedWarpRouteDeployConfig;
    deployedRoutersAddresses: ChainMap<Address>;
}): Promise<DerivedWarpRouteDeployConfig & Record<string, Partial<HypTokenRouterVirtualConfig>>>;
/**
 * transforms the provided {@link HypTokenRouterConfig}, removing the address, totalSupply and ownerOverrides
 * field where they are not required for the config comparison
 */
export declare function transformConfigToCheck(obj: HypTokenRouterConfig): HypTokenRouterConfig;
/**
 * Splits warp deploy config into existing and extended configurations based on warp core chains
 * for the warp apply process.
 */
export declare function splitWarpCoreAndExtendedConfigs(warpDeployConfig: WarpRouteDeployConfigMailboxRequired, warpCoreChains: string[]): [
    WarpRouteDeployConfigMailboxRequired,
    WarpRouteDeployConfigMailboxRequired
];
//# sourceMappingURL=configUtils.d.ts.map