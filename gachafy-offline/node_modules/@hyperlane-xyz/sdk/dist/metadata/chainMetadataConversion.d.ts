import type { AssetList, Chain as CosmosChain } from '@chain-registry/types';
import { Chain as StarknetChain } from '@starknet-react/chains';
import { Chain } from 'viem';
import { ChainMetadata } from '../metadata/chainMetadataTypes.js';
export declare function chainMetadataToViemChain(metadata: ChainMetadata): Chain;
export declare function chainMetadataToCosmosChain(metadata: ChainMetadata): {
    chain: CosmosChain;
    assets: AssetList;
};
export declare function chainMetadataToStarknetChain(metadata: ChainMetadata): StarknetChain;
//# sourceMappingURL=chainMetadataConversion.d.ts.map