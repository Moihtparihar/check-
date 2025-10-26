import { assert, ensure0x, messageId, pollAsync, } from '@hyperlane-xyz/utils';
import { BaseCosmosAdapter } from '../../app/MultiProtocolApp.js';
import { ProviderType, } from '../../providers/ProviderType.js';
const MESSAGE_DISPATCH_EVENT_TYPE = 'hyperlane.core.v1.Dispatch';
const MESSAGE_ATTRIBUTE_KEY = 'message';
const MESSAGE_DESTINATION_ATTRIBUTE_KEY = 'destination';
export class CosmNativeCoreAdapter extends BaseCosmosAdapter {
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
        assert(sourceTx.type === ProviderType.CosmJsNative, `Unsupported provider type for CosmNativeCoreAdapter ${sourceTx.type}`);
        const dispatchEvents = sourceTx.receipt.events.filter((e) => e.type === MESSAGE_DISPATCH_EVENT_TYPE);
        return dispatchEvents.map((event) => {
            const findAttribute = (key) => event.attributes.find((a) => a.key === key);
            const messageAttribute = findAttribute(MESSAGE_ATTRIBUTE_KEY);
            const destAttribute = findAttribute(MESSAGE_DESTINATION_ATTRIBUTE_KEY);
            assert(messageAttribute, 'No message attribute found in dispatch event');
            assert(destAttribute, 'No destination attribute found in dispatch event');
            return {
                messageId: ensure0x(messageId(messageAttribute.value)),
                destination: this.multiProvider.getChainName(destAttribute.value),
            };
        });
    }
    async waitForMessageProcessed(messageId, destination, delayMs, maxAttempts) {
        const provider = await this.multiProvider.getCosmJsNativeProvider(destination);
        await pollAsync(async () => {
            this.logger.debug(`Checking if message ${messageId} was processed`);
            const { delivered } = await provider.query.core.Delivered({
                id: this.addresses.mailbox,
                message_id: messageId,
            });
            assert(delivered, `Message ${messageId} not yet processed`);
            this.logger.info(`Message ${messageId} was processed`);
            return delivered;
        }, delayMs, maxAttempts);
        return true;
    }
}
//# sourceMappingURL=CosmNativeCoreAdapter.js.map