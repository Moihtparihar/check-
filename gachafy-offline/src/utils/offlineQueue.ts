// IndexedDB utility for offline mint requests
export interface MintRequest {
  id: string;
  tier: {
    id: string;
    name: string;
    price: number;
    rarity: string;
  };
  timestamp: number;
  nonce: number;
  userId?: string;
}

class OfflineQueueDB {
  private dbName = 'GachaFiOfflineQueue';
  private dbVersion = 1;
  private storeName = 'mintRequests';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('nonce', 'nonce', { unique: true });
        }
      };
    });
  }

  async addMintRequest(request: MintRequest): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const addRequest = store.add(request);

      addRequest.onerror = () => reject(addRequest.error);
      addRequest.onsuccess = () => resolve();
    });
  }

  async getAllMintRequests(): Promise<MintRequest[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        // Sort by timestamp to maintain order
        const results = request.result.sort((a, b) => a.timestamp - b.timestamp);
        resolve(results);
      };
    });
  }

  async removeMintRequest(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const deleteRequest = store.delete(id);

      deleteRequest.onerror = () => reject(deleteRequest.error);
      deleteRequest.onsuccess = () => resolve();
    });
  }

  async clearAllRequests(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const clearRequest = store.clear();

      clearRequest.onerror = () => reject(clearRequest.error);
      clearRequest.onsuccess = () => resolve();
    });
  }

  async getNextNonce(): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('nonce');
      const request = index.openCursor(null, 'prev'); // Get highest nonce

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          resolve(cursor.value.nonce + 1);
        } else {
          resolve(1); // Start from 1 if no requests exist
        }
      };
    });
  }
}

export const offlineQueueDB = new OfflineQueueDB();