import { ChainMap } from '../types.js';
export type CCIPAddresses = {
    armProxy: {
        address: string;
        version: string;
    };
    chainSelector: string;
    feeTokens: string[];
    registryModule: {
        address: string;
        version: string;
    };
    router: {
        address: string;
        version: string;
    };
    tokenAdminRegistry: {
        address: string;
        version: string;
    };
};
export declare const CCIP_ROUTER_CLIENT_ABI: string[];
export declare const CCIP_NETWORKS: ChainMap<CCIPAddresses>;
//# sourceMappingURL=consts.d.ts.map