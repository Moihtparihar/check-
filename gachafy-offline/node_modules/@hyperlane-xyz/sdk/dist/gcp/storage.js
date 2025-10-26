export const GCS_BUCKET_REGEX = /^(?:(?:https?:\/\/)?([^/]+)\.storage\.googleapis\.com\/?|gs:\/\/([^/]+))$/;
export class GcpStorageWrapper {
    config;
    bucket;
    cache;
    baseUrl;
    static fromBucketUrl(bucketUrl) {
        const match = bucketUrl.match(GCS_BUCKET_REGEX);
        if (!match)
            throw new Error('Could not parse bucket url');
        return new GcpStorageWrapper({
            // Handle both http and gs:// formats
            bucket: match[1] || match[2],
            caching: true,
        });
    }
    constructor(config) {
        this.config = config;
        this.bucket = config.bucket;
        this.baseUrl = `https://storage.googleapis.com/storage/v1/b/${this.bucket}/o`;
        if (config.caching) {
            this.cache = {};
        }
    }
    formatKey(key) {
        return this.config.folder ? `${this.config.folder}/${key}` : key;
    }
    getCachedObject(key) {
        return this.cache?.[key];
    }
    setCachedObject(key, value) {
        if (this.cache) {
            this.cache[key] = value;
        }
    }
    async fetchMetadata(key) {
        const url = new URL(`${this.baseUrl}/${encodeURIComponent(key)}`);
        const response = await fetch(url.toString());
        if (response.status === 404)
            return undefined;
        if (!response.ok) {
            const responseText = await response.text();
            throw new Error(`Failed to fetch object metadata: ${response.statusText}. ${responseText}`);
        }
        return response.json();
    }
    async fetchContent(key) {
        const url = `${this.baseUrl}/${encodeURIComponent(key)}?alt=media`;
        const response = await fetch(url);
        const responseText = await response.text();
        if (!response.ok) {
            throw new Error(`Failed to fetch object content: ${response.statusText}. ${responseText}`);
        }
        return responseText;
    }
    async getObject(key) {
        const formattedKey = this.formatKey(key);
        const cachedObject = this.getCachedObject(formattedKey);
        if (cachedObject) {
            return cachedObject;
        }
        try {
            const metadata = await this.fetchMetadata(formattedKey);
            if (!metadata)
                return undefined;
            const body = await this.fetchContent(formattedKey);
            const result = {
                data: JSON.parse(body),
                // If no updated date is provided, use the Unix epoch start
                // 0 = Unix epoch start (1970-01-01T00:00:00.000Z)
                modified: new Date(metadata.updated ?? 0),
            };
            this.setCachedObject(formattedKey, result);
            return result;
        }
        catch (e) {
            if (e.status === 404) {
                return undefined;
            }
            throw e;
        }
    }
    url(key) {
        const formattedKey = this.formatKey(key);
        return `https://storage.googleapis.com/${this.bucket}/${formattedKey}`;
    }
}
//# sourceMappingURL=storage.js.map