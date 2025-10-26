import { Address, HexString } from '@hyperlane-xyz/utils';
import { BaseCosmosAdapter } from '../../app/MultiProtocolApp.js';
import { MultiProtocolProvider } from '../../providers/MultiProtocolProvider.js';
import { TypedTransactionReceipt } from '../../providers/ProviderType.js';
import { ChainName } from '../../types.js';
import { ICoreAdapter } from './types.js';
export declare class CosmNativeCoreAdapter extends BaseCosmosAdapter implements ICoreAdapter {
    readonly chainName: ChainName;
    readonly multiProvider: MultiProtocolProvider<any>;
    readonly addresses: {
        mailbox: Address;
    };
    constructor(chainName: ChainName, multiProvider: MultiProtocolProvider<any>, addresses: {
        mailbox: Address;
    });
    extractMessageIds(sourceTx: TypedTransactionReceipt): Array<{
        messageId: string;
        destination: ChainName;
    }>;
    waitForMessageProcessed(messageId: HexString, destination: ChainName, delayMs?: number, maxAttempts?: number): Promise<boolean>;
}
//# sourceMappingURL=CosmNativeCoreAdapter.d.ts.map