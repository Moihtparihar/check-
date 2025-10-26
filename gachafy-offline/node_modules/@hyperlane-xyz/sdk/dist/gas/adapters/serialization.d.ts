import { PublicKey } from '@solana/web3.js';
import { Domain } from '@hyperlane-xyz/utils';
export declare enum SealevelInterchainGasPaymasterType {
    Igp = 0,
    OverheadIgp = 1
}
/**
 * IGP Config Borsh Schema
 */
export declare class SealevelInterchainGasPaymasterConfig {
    readonly fields: any;
    program_id: Uint8Array;
    program_id_pubkey: PublicKey;
    type: SealevelInterchainGasPaymasterType;
    igp_account?: Uint8Array;
    igp_account_pub_key?: PublicKey;
    constructor(fields: any);
}
export declare const SealevelInterchainGasPaymasterConfigSchema: {
    kind: string;
    fields: (string | number[])[][];
};
/**
 * IGP Program Data Borsh Schema
 */
export declare class SealevelOverheadIgpData {
    readonly fields: any;
    bump: number;
    salt: Uint8Array;
    owner?: Uint8Array;
    owner_pub_key?: PublicKey;
    inner: Uint8Array;
    inner_pub_key: PublicKey;
    gas_overheads: Map<Domain, bigint>;
    constructor(fields: any);
}
export declare const SealevelOverheadIgpDataSchema: Map<any, any>;
export declare class SealevelIgpData {
    bump_seed: number;
    salt: Uint8Array;
    owner?: Uint8Array | null;
    owner_pub_key?: PublicKey;
    beneficiary: Uint8Array;
    beneficiary_pub_key: PublicKey;
    gas_oracles: Map<number, bigint>;
    constructor(fields: any);
}
export declare const SealevelIgpDataSchema: Map<any, any>;
/**
 * IGP instruction Borsh Schema
 */
export declare enum SealeveIgpInstruction {
    Init = 0,
    InitIgp = 1,
    InitOverheadIgp = 2,
    PayForGas = 3,
    QuoteGasPayment = 4,
    TransferIgpOwnership = 5,
    TransferOverheadIgpOwnership = 6,
    SetIgpBeneficiary = 7,
    SetDestinationGasOverheads = 8,
    SetGasOracleConfigs = 9,
    Claim = 10
}
export declare class SealevelIgpQuoteGasPaymentInstruction {
    readonly fields: any;
    destination_domain: number;
    gas_amount: bigint;
    constructor(fields: any);
}
export declare const SealevelIgpQuoteGasPaymentSchema: Map<any, any>;
export declare class SealevelIgpQuoteGasPaymentResponse {
    readonly fields: any;
    payment_quote: bigint;
    constructor(fields: any);
}
export declare const SealevelIgpQuoteGasPaymentResponseSchema: Map<any, any>;
//# sourceMappingURL=serialization.d.ts.map