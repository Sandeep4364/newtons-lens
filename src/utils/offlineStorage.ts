// Offline storage utilities using IndexedDB
const DB_NAME = 'newtons-lens-offline';
const DB_VERSION = 1;
const STORE_ANALYSIS = 'analysis-history';

export interface AnalysisRecord {
  id?: number;
  experimentId: string;
  experimentType: string;
  timestamp: Date;
  imageData: string;
  analysis: {
    observations: string;
    components: Array<{
      type: string;
      properties: Record<string, string | number | boolean>;
      position: string;
    }>;
    predicted_outcome: string;
    safety_warnings: Array<{
      severity: string;
      message: string;
      recommendation: string;
    }>;
    guidance: Array<{
      step: number;
      instruction: string;
    }>;
    confidence_score: number;
  };
  synced: boolean;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(STORE_ANALYSIS)) {
          const analysisStore = db.createObjectStore(STORE_ANALYSIS, {
            keyPath: 'id',
            autoIncrement: true,
          });
          analysisStore.createIndex('timestamp', 'timestamp', { unique: false });
          analysisStore.createIndex('experimentType', 'experimentType', { unique: false });
          analysisStore.createIndex('synced', 'synced', { unique: false });
        }
      };
    });
  }

  // Analysis history methods
  async saveAnalysis(analysis: AnalysisRecord): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_ANALYSIS], 'readwrite');
      const store = transaction.objectStore(STORE_ANALYSIS);
      const request = store.add(analysis);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllAnalyses(): Promise<AnalysisRecord[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_ANALYSIS], 'readonly');
      const store = transaction.objectStore(STORE_ANALYSIS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getStorageSize(): Promise<{ analysis: number }> {
    if (!this.db) await this.init();

    const analysis = await this.getStoreCount(STORE_ANALYSIS);

    return { analysis };
  }

  private async getStoreCount(storeName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorage();

// Check if the app is online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
}

// Listen for online/offline events
export function setupOnlineListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}
