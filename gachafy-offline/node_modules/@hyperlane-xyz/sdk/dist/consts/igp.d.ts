import { BigNumber } from 'ethers';
import { ProtocolType } from '@hyperlane-xyz/utils';
export declare const TOKEN_EXCHANGE_RATE_DECIMALS_ETHEREUM = 10;
export declare const TOKEN_EXCHANGE_RATE_SCALE_ETHEREUM: BigNumber;
export declare const TOKEN_EXCHANGE_RATE_DECIMALS_SEALEVEL = 19;
export declare const TOKEN_EXCHANGE_RATE_SCALE_SEALEVEL: BigNumber;
export declare const TOKEN_EXCHANGE_RATE_DECIMALS_COSMOS = 10;
export declare const TOKEN_EXCHANGE_RATE_SCALE_COSMOS: BigNumber;
export declare function getProtocolExchangeRateDecimals(protocolType: ProtocolType): number;
export declare function getProtocolExchangeRateScale(protocolType: ProtocolType): BigNumber;
//# sourceMappingURL=igp.d.ts.map