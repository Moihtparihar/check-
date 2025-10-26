import { BaseValidator, isS3CheckpointWithId, } from '@hyperlane-xyz/utils';
import { GcpStorageWrapper } from './storage.js';
const checkpointWithMessageIdKey = (checkpointIndex) => `checkpoint_${checkpointIndex}_with_id.json`;
const LATEST_KEY = 'gcsLatestIndexKey';
const ANNOUNCEMENT_KEY = 'gcsAnnouncementKey';
const METADATA_KEY = 'gcsMetadataKey';
export const GCP_LOCATION_PREFIX = 'gs://';
/**
 * Extension of BaseValidator that includes GCP Cloud Storage utilities.
 */
export class GcpValidator extends BaseValidator {
    validatorConfig;
    storageConfig;
    storage;
    constructor(validatorConfig, storageConfig) {
        super(validatorConfig);
        this.validatorConfig = validatorConfig;
        this.storageConfig = storageConfig;
        this.storage = new GcpStorageWrapper(storageConfig);
    }
    static async fromStorageLocation(storageLocation) {
        // Remove trailing key if present
        if (storageLocation.endsWith(ANNOUNCEMENT_KEY)) {
            storageLocation = storageLocation.slice(0, -ANNOUNCEMENT_KEY.length);
            // Remove trailing slash if present after removing key
            if (storageLocation.endsWith('/')) {
                storageLocation = storageLocation.slice(0, -1);
            }
        }
        if (storageLocation.startsWith(GCP_LOCATION_PREFIX)) {
            const bucketName = storageLocation.slice(GCP_LOCATION_PREFIX.length);
            const pieces = bucketName.split('/');
            if (pieces.length >= 1) {
                const storageFolder = pieces.length > 1 ? pieces.slice(1).join('/') : undefined;
                const storageConfig = {
                    bucket: pieces[0],
                    folder: storageFolder,
                    caching: true,
                };
                const storage = new GcpStorageWrapper(storageConfig);
                const announcement = await storage.getObject(ANNOUNCEMENT_KEY);
                if (!announcement) {
                    throw new Error('No announcement found');
                }
                const validatorConfig = {
                    address: announcement.data.value.validator,
                    localDomain: announcement.data.value.mailbox_domain,
                    mailbox: announcement.data.value.mailbox_address,
                };
                return new GcpValidator(validatorConfig, storageConfig);
            }
        }
        throw new Error(`Unable to parse location ${storageLocation}`);
    }
    async getAnnouncement() {
        const { value } = await this.getSignedAnnouncement();
        return value;
    }
    async getSignedAnnouncement() {
        const resp = await this.storage.getObject(ANNOUNCEMENT_KEY);
        if (!resp) {
            throw new Error(`No announcement found for ${this.config.localDomain}`);
        }
        return resp.data;
    }
    async getMetadata() {
        const resp = await this.storage.getObject(METADATA_KEY);
        if (!resp) {
            throw new Error(`No metadata found for ${this.config.localDomain}`);
        }
        return resp.data;
    }
    async getCheckpoint(index) {
        const key = checkpointWithMessageIdKey(index);
        const checkpoint = await this.storage.getObject(key);
        if (!checkpoint) {
            return;
        }
        if (isS3CheckpointWithId(checkpoint.data)) {
            return checkpoint.data;
        }
        else {
            throw new Error('Failed to parse checkpoint');
        }
    }
    async getLatestCheckpointIndex() {
        const latestCheckpointIndex = await this.storage.getObject(LATEST_KEY);
        if (!latestCheckpointIndex)
            return -1;
        return latestCheckpointIndex.data;
    }
    storageLocation() {
        return `${GCP_LOCATION_PREFIX}${this.storage.config.bucket}${this.storage.config.folder ? '/' + this.storage.config.folder : ''}`;
    }
    getLatestCheckpointUrl() {
        return this.storage.url(LATEST_KEY);
    }
}
//# sourceMappingURL=validator.js.map