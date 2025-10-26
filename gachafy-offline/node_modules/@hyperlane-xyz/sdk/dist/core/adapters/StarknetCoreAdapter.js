import { CallData, events as eventsUtils, } from 'starknet';
import { getCompiledContract } from '@hyperlane-xyz/starknet-core';
import { pollAsync } from '@hyperlane-xyz/utils';
import { BaseStarknetAdapter } from '../../app/MultiProtocolApp.js';
import { ProviderType, } from '../../providers/ProviderType.js';
import { getStarknetMailboxContract, parseStarknetDispatchEvents, } from '../../utils/starknet.js';
export class StarknetCoreAdapter extends BaseStarknetAdapter {
    chainName;
    multiProvider;
    addresses;
    constructor(chainName, multiProvider, addresses) {
        super(chainName, multiProvider, addresses);
        this.chainName = chainName;
        this.multiProvider = multiProvider;
        this.addresses = addresses;
    }
    extractMessageIds(sourceTx) {
        if (sourceTx.type !== ProviderType.Starknet) {
            throw new Error(`Unsupported provider type for StarknetCoreAdapter ${sourceTx.type}`);
        }
        let parsedEvents = [];
        sourceTx.receipt.match({
            success: (txR) => {
                const emittedEvents = txR.events?.map((event) => {
                    return {
                        block_hash: txR.block_hash,
                        block_number: txR.block_number,
                        transaction_hash: txR.transaction_hash,
                        ...event,
                    };
                }) || [];
                if (emittedEvents.length === 0)
                    return;
                const mailboxAbi = getCompiledContract('mailbox').abi;
                parsedEvents = eventsUtils.parseEvents(emittedEvents, eventsUtils.getAbiEvents(mailboxAbi), CallData.getAbiStruct(mailboxAbi), CallData.getAbiEnum(mailboxAbi));
            },
            _: () => {
                throw Error('This transaction was not successful.');
            },
        });
        if (!parsedEvents || parsedEvents.length === 0)
            return [];
        const messages = parseStarknetDispatchEvents(parsedEvents, (domain) => this.multiProvider.tryGetChainName(domain) ?? undefined);
        return messages.map(({ id, parsed }) => ({
            messageId: id,
            destination: this.multiProvider.getChainName(parsed.destination),
        }));
    }
    async waitForMessageProcessed(messageId, destination, delayMs = 5000, maxAttempts = 60) {
        const destAdapter = new StarknetCoreAdapter(destination, this.multiProvider, { mailbox: this.addresses.mailbox });
        const mailboxContract = getStarknetMailboxContract(destAdapter.addresses.mailbox, destAdapter.getProvider());
        await pollAsync(async () => {
            const isDelivered = await mailboxContract.call('delivered', [
                messageId,
            ]);
            if (!isDelivered) {
                throw new Error(`Message ${messageId} not yet delivered on ${destination}`);
            }
            this.logger.debug(`Message ${messageId} confirmed delivered on ${destination}`);
            return isDelivered;
        }, delayMs, maxAttempts);
        return true;
    }
}
//# sourceMappingURL=StarknetCoreAdapter.js.map