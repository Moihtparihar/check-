import { PublicKey } from '@solana/web3.js';
import { SealevelAccountDataWrapper, SealevelInstructionWrapper, getSealevelAccountDataSchema, getSealevelSimulationReturnDataSchema, } from '../../utils/sealevelSerialization.js';
// Should match https://github.com/hyperlane-xyz/hyperlane-monorepo/blob/main/rust/sealevel/programs/hyperlane-sealevel-igp/src/accounts.rs#L24
export var SealevelInterchainGasPaymasterType;
(function (SealevelInterchainGasPaymasterType) {
    // An IGP with gas oracles and that receives lamports as payment.
    SealevelInterchainGasPaymasterType[SealevelInterchainGasPaymasterType["Igp"] = 0] = "Igp";
    // An overhead IGP that points to an inner IGP and imposes a gas overhead for each destination domain.
    SealevelInterchainGasPaymasterType[SealevelInterchainGasPaymasterType["OverheadIgp"] = 1] = "OverheadIgp";
})(SealevelInterchainGasPaymasterType || (SealevelInterchainGasPaymasterType = {}));
/**
 * IGP Config Borsh Schema
 */
// Config schema, e.g. for use in token data
export class SealevelInterchainGasPaymasterConfig {
    fields;
    program_id;
    program_id_pubkey;
    type;
    igp_account;
    igp_account_pub_key;
    constructor(fields) {
        this.fields = fields;
        Object.assign(this, fields);
        this.program_id_pubkey = new PublicKey(this.program_id);
        this.igp_account_pub_key = this.igp_account
            ? new PublicKey(this.igp_account)
            : undefined;
    }
}
export const SealevelInterchainGasPaymasterConfigSchema = {
    kind: 'struct',
    fields: [
        ['program_id', [32]],
        ['type', 'u8'],
        ['igp_account', [32]],
    ],
};
/**
 * IGP Program Data Borsh Schema
 */
// Should match https://github.com/hyperlane-xyz/hyperlane-monorepo/blob/main/rust/sealevel/programs/hyperlane-sealevel-igp/src/accounts.rs#L91
export class SealevelOverheadIgpData {
    fields;
    /// The bump seed for this PDA.
    bump;
    /// The salt used to derive the overhead IGP PDA.
    salt;
    /// The owner of the overhead IGP.
    owner;
    owner_pub_key;
    /// The inner IGP account.
    inner;
    inner_pub_key;
    /// The gas overheads to impose on gas payments to each destination domain.
    gas_overheads;
    constructor(fields) {
        this.fields = fields;
        Object.assign(this, fields);
        this.owner_pub_key = this.owner ? new PublicKey(this.owner) : undefined;
        this.inner_pub_key = new PublicKey(this.inner);
    }
}
export const SealevelOverheadIgpDataSchema = new Map([
    [
        SealevelAccountDataWrapper,
        getSealevelAccountDataSchema(SealevelOverheadIgpData, [8]),
    ],
    [
        SealevelOverheadIgpData,
        {
            kind: 'struct',
            fields: [
                ['bump', 'u8'],
                ['salt', [32]],
                ['owner', { kind: 'option', type: [32] }],
                ['inner', [32]],
                ['gas_overheads', { kind: 'map', key: 'u32', value: 'u64' }],
            ],
        },
    ],
]);
// Should match https://github.com/hyperlane-xyz/hyperlane-monorepo/blob/main/rust/sealevel/programs/hyperlane-sealevel-igp/src/accounts.rs#L159
export class SealevelIgpData {
    /// The bump seed for this PDA.
    bump_seed;
    // The salt used to derive the IGP PDA.
    salt; // 32 bytes
    /// The owner of the IGP.
    owner;
    owner_pub_key;
    /// The beneficiary of the IGP.
    beneficiary; // 32 bytes
    beneficiary_pub_key;
    gas_oracles;
    constructor(fields) {
        Object.assign(this, fields);
        this.owner_pub_key = this.owner ? new PublicKey(this.owner) : undefined;
        this.beneficiary_pub_key = new PublicKey(this.beneficiary);
    }
}
export const SealevelIgpDataSchema = new Map([
    [
        SealevelAccountDataWrapper,
        getSealevelAccountDataSchema(SealevelIgpData, [8]),
    ],
    [
        SealevelIgpData,
        {
            kind: 'struct',
            fields: [
                ['bump_seed', 'u8'],
                ['salt', [32]],
                ['owner', { kind: 'option', type: [32] }],
                ['beneficiary', [32]],
                ['gas_oracles', { kind: 'map', key: 'u32', value: 'u64' }],
            ],
        },
    ],
]);
/**
 * IGP instruction Borsh Schema
 */
// Should match Instruction in https://github.com/hyperlane-xyz/hyperlane-monorepo/blob/8f8853bcd7105a6dd7af3a45c413b137ded6e888/rust/sealevel/programs/hyperlane-sealevel-igp/src/instruction.rs#L19-L42
export var SealeveIgpInstruction;
(function (SealeveIgpInstruction) {
    SealeveIgpInstruction[SealeveIgpInstruction["Init"] = 0] = "Init";
    SealeveIgpInstruction[SealeveIgpInstruction["InitIgp"] = 1] = "InitIgp";
    SealeveIgpInstruction[SealeveIgpInstruction["InitOverheadIgp"] = 2] = "InitOverheadIgp";
    SealeveIgpInstruction[SealeveIgpInstruction["PayForGas"] = 3] = "PayForGas";
    SealeveIgpInstruction[SealeveIgpInstruction["QuoteGasPayment"] = 4] = "QuoteGasPayment";
    SealeveIgpInstruction[SealeveIgpInstruction["TransferIgpOwnership"] = 5] = "TransferIgpOwnership";
    SealeveIgpInstruction[SealeveIgpInstruction["TransferOverheadIgpOwnership"] = 6] = "TransferOverheadIgpOwnership";
    SealeveIgpInstruction[SealeveIgpInstruction["SetIgpBeneficiary"] = 7] = "SetIgpBeneficiary";
    SealeveIgpInstruction[SealeveIgpInstruction["SetDestinationGasOverheads"] = 8] = "SetDestinationGasOverheads";
    SealeveIgpInstruction[SealeveIgpInstruction["SetGasOracleConfigs"] = 9] = "SetGasOracleConfigs";
    SealeveIgpInstruction[SealeveIgpInstruction["Claim"] = 10] = "Claim";
})(SealeveIgpInstruction || (SealeveIgpInstruction = {}));
export class SealevelIgpQuoteGasPaymentInstruction {
    fields;
    destination_domain;
    gas_amount;
    constructor(fields) {
        this.fields = fields;
        Object.assign(this, fields);
    }
}
export const SealevelIgpQuoteGasPaymentSchema = new Map([
    [
        SealevelInstructionWrapper,
        {
            kind: 'struct',
            fields: [
                ['instruction', 'u8'],
                ['data', SealevelIgpQuoteGasPaymentInstruction],
            ],
        },
    ],
    [
        SealevelIgpQuoteGasPaymentInstruction,
        {
            kind: 'struct',
            fields: [
                ['destination_domain', 'u32'],
                ['gas_amount', 'u64'],
            ],
        },
    ],
]);
export class SealevelIgpQuoteGasPaymentResponse {
    fields;
    payment_quote;
    constructor(fields) {
        this.fields = fields;
        Object.assign(this, fields);
    }
}
export const SealevelIgpQuoteGasPaymentResponseSchema = new Map([
    [
        SealevelAccountDataWrapper,
        getSealevelSimulationReturnDataSchema(SealevelIgpQuoteGasPaymentResponse),
    ],
    [
        SealevelIgpQuoteGasPaymentResponse,
        {
            kind: 'struct',
            fields: [['payment_quote', 'u64']],
        },
    ],
]);
//# sourceMappingURL=serialization.js.map