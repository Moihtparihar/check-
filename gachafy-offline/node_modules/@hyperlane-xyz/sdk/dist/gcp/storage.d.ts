export declare const GCS_BUCKET_REGEX: RegExp;
export interface StorageReceipt<T = unknown> {
    data: T;
    modified: Date;
}
export interface StorageConfig {
    bucket: string;
    folder?: string;
    caching?: boolean;
    projectId?: string;
    keyFilename?: string;
}
export declare class GcpStorageWrapper {
    readonly config: StorageConfig;
    private readonly bucket;
    private cache;
    private readonly baseUrl;
    static fromBucketUrl(bucketUrl: string): GcpStorageWrapper;
    constructor(config: StorageConfig);
    private formatKey;
    private getCachedObject;
    private setCachedObject;
    private fetchMetadata;
    private fetchContent;
    getObject<T>(key: string): Promise<StorageReceipt<T> | undefined>;
    url(key: string): string;
}
//# sourceMappingURL=storage.d.ts.map