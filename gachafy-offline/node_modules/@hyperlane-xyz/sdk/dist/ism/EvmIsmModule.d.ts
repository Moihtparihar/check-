import { Logger } from 'pino';
import { Address, Domain, EvmChainId, ProtocolType } from '@hyperlane-xyz/utils';
import { CCIPContractCache } from '../ccip/utils.js';
import { HyperlaneAddresses } from '../contracts/types.js';
import { HyperlaneModule, HyperlaneModuleParams } from '../core/AbstractHyperlaneModule.js';
import { ProxyFactoryFactories } from '../deploy/contracts.js';
import { ContractVerifier } from '../deploy/verify/ContractVerifier.js';
import { MultiProvider } from '../providers/MultiProvider.js';
import { AnnotatedEV5Transaction } from '../providers/ProviderType.js';
import { ChainName, ChainNameOrId } from '../types.js';
import { EvmIsmReader } from './EvmIsmReader.js';
import { HyperlaneIsmFactory } from './HyperlaneIsmFactory.js';
import { DeployedIsm, DomainRoutingIsmConfig, IsmConfig } from './types.js';
type IsmModuleAddresses = {
    deployedIsm: Address;
    mailbox: Address;
};
export declare class EvmIsmModule extends HyperlaneModule<ProtocolType.Ethereum, IsmConfig, HyperlaneAddresses<ProxyFactoryFactories> & IsmModuleAddresses> {
    protected readonly multiProvider: MultiProvider;
    protected readonly contractVerifier?: ContractVerifier | undefined;
    protected readonly logger: import("pino").default.Logger<never>;
    protected readonly reader: EvmIsmReader;
    protected readonly ismFactory: HyperlaneIsmFactory;
    protected readonly mailbox: Address;
    readonly chain: ChainName;
    readonly chainId: EvmChainId;
    readonly domainId: Domain;
    constructor(multiProvider: MultiProvider, params: HyperlaneModuleParams<IsmConfig, HyperlaneAddresses<ProxyFactoryFactories> & IsmModuleAddresses>, ccipContractCache?: CCIPContractCache, contractVerifier?: ContractVerifier | undefined);
    read(): Promise<IsmConfig>;
    update(targetConfig: IsmConfig): Promise<AnnotatedEV5Transaction[]>;
    static create({ chain, config, proxyFactoryFactories, mailbox, multiProvider, ccipContractCache, contractVerifier, }: {
        chain: ChainNameOrId;
        config: IsmConfig;
        proxyFactoryFactories: HyperlaneAddresses<ProxyFactoryFactories>;
        mailbox: Address;
        multiProvider: MultiProvider;
        ccipContractCache?: CCIPContractCache;
        contractVerifier?: ContractVerifier;
    }): Promise<EvmIsmModule>;
    protected updateRoutingIsm({ current, target, logger, }: {
        current: DomainRoutingIsmConfig;
        target: DomainRoutingIsmConfig;
        logger: Logger;
    }): Promise<AnnotatedEV5Transaction[]>;
    protected deploy({ config, }: {
        config: IsmConfig;
    }): Promise<DeployedIsm>;
}
export {};
//# sourceMappingURL=EvmIsmModule.d.ts.map