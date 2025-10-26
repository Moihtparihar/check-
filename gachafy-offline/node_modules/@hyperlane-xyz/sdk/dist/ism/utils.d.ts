import { Address } from '@hyperlane-xyz/utils';
import { HyperlaneContracts } from '../contracts/types.js';
import { ProxyFactoryFactories } from '../deploy/contracts.js';
import { ChainTechnicalStack } from '../metadata/chainMetadataTypes.js';
import { MultiProvider } from '../providers/MultiProvider.js';
import { ChainName } from '../types.js';
import { DomainRoutingIsmConfig, IsmConfig, IsmType, RoutingIsmConfig, RoutingIsmDelta } from './types.js';
export declare function calculateDomainRoutingDelta(current: DomainRoutingIsmConfig, target: DomainRoutingIsmConfig): {
    domainsToEnroll: ChainName[];
    domainsToUnenroll: ChainName[];
};
export declare function moduleCanCertainlyVerify(destModule: Address | IsmConfig, multiProvider: MultiProvider, origin: ChainName, destination: ChainName): Promise<boolean>;
export declare function moduleMatchesConfig(chain: ChainName, moduleAddress: Address, config: IsmConfig, multiProvider: MultiProvider, contracts: HyperlaneContracts<ProxyFactoryFactories>, mailbox?: Address): Promise<boolean>;
export declare function routingModuleDelta(destination: ChainName, moduleAddress: Address, config: RoutingIsmConfig, multiProvider: MultiProvider, contracts: HyperlaneContracts<ProxyFactoryFactories>, mailbox?: Address): Promise<RoutingIsmDelta>;
export declare function collectValidators(origin: ChainName, config: IsmConfig): Set<string>;
/**
 * Checks if the given ISM type requires static deployment
 *
 * @param {IsmType} ismType - The type of Interchain Security Module (ISM)
 * @returns {boolean} True if the ISM type requires static deployment, false otherwise
 */
export declare function isStaticIsm(ismType: IsmType): boolean;
/**
 * Determines if static ISM deployment is supported on a given chain's technical stack
 * @dev Currently, only ZkSync does not support static deployments
 * @param chainTechnicalStack - The technical stack of the target chain
 * @returns boolean - true if static deployment is supported, false for ZkSync
 */
export declare function isStaticDeploymentSupported(chainTechnicalStack: ChainTechnicalStack | undefined): boolean;
/**
 * Checks if the given ISM type is compatible with the chain's technical stack.
 *
 * @param {IsmType} params.ismType - The type of Interchain Security Module (ISM)
 * @param {ChainTechnicalStack | undefined} params.chainTechnicalStack - The technical stack of the chain
 * @returns {boolean} True if the ISM type is compatible with the chain, false otherwise
 */
export declare function isIsmCompatible({ chainTechnicalStack, ismType, }: {
    chainTechnicalStack: ChainTechnicalStack | undefined;
    ismType: IsmType;
}): boolean;
//# sourceMappingURL=utils.d.ts.map