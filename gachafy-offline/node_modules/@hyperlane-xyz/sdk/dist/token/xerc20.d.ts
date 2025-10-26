import { Logger } from 'pino';
import { Address } from '@hyperlane-xyz/utils';
import { MultiProvider } from '../providers/MultiProvider.js';
import { ChainNameOrId } from '../types.js';
import { XERC20TokenExtraBridgesLimits } from './types.js';
export type GetExtraLockboxesOptions = {
    chain: ChainNameOrId;
    xERC20Address: Address;
    multiProvider: MultiProvider;
    explorerUrl: string;
    apiKey?: string;
    logger?: Logger;
};
export declare function getExtraLockBoxConfigs({ xERC20Address, chain, multiProvider, logger, }: Omit<GetExtraLockboxesOptions, 'explorerUrl' | 'apiKey'>): Promise<XERC20TokenExtraBridgesLimits[]>;
//# sourceMappingURL=xerc20.d.ts.map