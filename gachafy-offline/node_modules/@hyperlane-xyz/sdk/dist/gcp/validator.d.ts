import { Announcement, BaseValidator, S3Announcement, S3CheckpointWithId, ValidatorConfig, ValidatorMetadata } from '@hyperlane-xyz/utils';
import { GcpStorageWrapper, StorageConfig } from './storage.js';
export declare const GCP_LOCATION_PREFIX = "gs://";
/**
 * Extension of BaseValidator that includes GCP Cloud Storage utilities.
 */
export declare class GcpValidator extends BaseValidator {
    validatorConfig: ValidatorConfig;
    storageConfig: StorageConfig;
    storage: GcpStorageWrapper;
    constructor(validatorConfig: ValidatorConfig, storageConfig: StorageConfig);
    static fromStorageLocation(storageLocation: string): Promise<GcpValidator>;
    getAnnouncement(): Promise<Announcement>;
    getSignedAnnouncement(): Promise<S3Announcement>;
    getMetadata(): Promise<ValidatorMetadata>;
    getCheckpoint(index: number): Promise<S3CheckpointWithId | void>;
    getLatestCheckpointIndex(): Promise<number>;
    storageLocation(): string;
    getLatestCheckpointUrl(): string;
}
//# sourceMappingURL=validator.d.ts.map