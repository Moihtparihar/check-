import { AccountMeta, PublicKey, Transaction } from '@solana/web3.js';
import { Address, Domain } from '@hyperlane-xyz/utils';
import { BaseSealevelAdapter } from '../../app/MultiProtocolApp.js';
import { MultiProtocolProvider } from '../../providers/MultiProtocolProvider.js';
import { ChainName } from '../../types.js';
import { SealevelIgpData, SealevelOverheadIgpData } from './serialization.js';
export interface IgpPaymentKeys {
    programId: PublicKey;
    igpAccount: PublicKey;
    overheadIgpAccount?: PublicKey;
}
export declare abstract class SealevelIgpProgramAdapter extends BaseSealevelAdapter {
    readonly chainName: ChainName;
    readonly multiProvider: MultiProtocolProvider;
    readonly addresses: {
        programId: Address;
    };
    protected readonly programId: PublicKey;
    constructor(chainName: ChainName, multiProvider: MultiProtocolProvider, addresses: {
        programId: Address;
    });
    abstract getPaymentKeys(): Promise<IgpPaymentKeys>;
    quoteGasPayment(destination: Domain, gasAmount: bigint, payerKey: PublicKey): Promise<bigint>;
    static deriveIgpProgramPda(igpProgramId: string | PublicKey): PublicKey;
    static deriveGasPaymentPda(igpProgramId: string | PublicKey, randomWalletPubKey: PublicKey): PublicKey;
}
export declare class SealevelIgpAdapter extends SealevelIgpProgramAdapter {
    readonly chainName: ChainName;
    readonly multiProvider: MultiProtocolProvider;
    readonly addresses: {
        igp: Address;
        programId: Address;
    };
    protected readonly igp: PublicKey;
    constructor(chainName: ChainName, multiProvider: MultiProtocolProvider, addresses: {
        igp: Address;
        programId: Address;
    });
    getPaymentKeys(): Promise<IgpPaymentKeys>;
    getAccountInfo(): Promise<SealevelIgpData>;
    getClaimInstructionKeyList(beneficiary: PublicKey): Array<AccountMeta>;
    /**
     * Constructs a Transaction for .
     * @param {PublicKey} beneficiary - The IGP's configured beneficiary.
     * @returns {Promise<TransactionInstruction>} The claim instruction.
     */
    populateClaimTx(beneficiary: PublicKey): Promise<Transaction>;
}
export declare class SealevelOverheadIgpAdapter extends SealevelIgpProgramAdapter {
    readonly chainName: ChainName;
    readonly multiProvider: MultiProtocolProvider;
    readonly addresses: {
        overheadIgp: Address;
        programId: Address;
    };
    protected readonly overheadIgp: PublicKey;
    constructor(chainName: ChainName, multiProvider: MultiProtocolProvider, addresses: {
        overheadIgp: Address;
        programId: Address;
    });
    getAccountInfo(): Promise<SealevelOverheadIgpData>;
    getPaymentKeys(): Promise<IgpPaymentKeys>;
}
//# sourceMappingURL=SealevelIgpAdapter.d.ts.map