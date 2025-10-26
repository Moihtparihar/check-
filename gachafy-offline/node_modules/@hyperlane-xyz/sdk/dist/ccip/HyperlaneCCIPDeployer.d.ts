import { HyperlaneAddressesMap, HyperlaneContracts } from '../contracts/types.js';
import { CoreAddresses } from '../core/contracts.js';
import { HyperlaneDeployer } from '../deploy/HyperlaneDeployer.js';
import { ContractVerifier } from '../deploy/verify/ContractVerifier.js';
import { MultiProvider } from '../providers/MultiProvider.js';
import { ChainMap, ChainName } from '../types.js';
export declare class HyperlaneCCIPDeployer extends HyperlaneDeployer<Set<ChainName>, {}> {
    readonly core: ChainMap<Partial<CoreAddresses>>;
    private ccipContractCache;
    constructor(multiProvider: MultiProvider, core: ChainMap<Partial<CoreAddresses>>, contractVerifier?: ContractVerifier);
    cacheAddressesMap(addressesMap: HyperlaneAddressesMap<any>): void;
    deployContracts(origin: ChainName, config: Set<ChainName>): Promise<HyperlaneContracts<{}>>;
    private checkCCIPLanesSupport;
    private authorizeHook;
    protected deployCCIPIsm(origin: ChainName, destination: ChainName): Promise<void>;
    protected deployCCIPHook(origin: ChainName, destination: ChainName): Promise<void>;
}
//# sourceMappingURL=HyperlaneCCIPDeployer.d.ts.map