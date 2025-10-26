import { Address, HexString } from '@hyperlane-xyz/utils';
import { BaseStarknetAdapter } from '../../app/MultiProtocolApp.js';
import { MultiProtocolProvider } from '../../providers/MultiProtocolProvider.js';
import { StarknetJsTransactionReceipt } from '../../providers/ProviderType.js';
import { ChainName } from '../../types.js';
import { ICoreAdapter } from './types.js';
export declare class StarknetCoreAdapter extends BaseStarknetAdapter implements ICoreAdapter {
    readonly chainName: ChainName;
    readonly multiProvider: MultiProtocolProvider;
    readonly addresses: {
        mailbox: Address;
    };
    constructor(chainName: ChainName, multiProvider: MultiProtocolProvider, addresses: {
        mailbox: Address;
    });
    extractMessageIds(sourceTx: StarknetJsTransactionReceipt): Array<{
        messageId: string;
        destination: ChainName;
    }>;
    waitForMessageProcessed(messageId: HexString, destination: ChainName, delayMs?: number, maxAttempts?: number): Promise<boolean>;
}
//# sourceMappingURL=StarknetCoreAdapter.d.ts.map