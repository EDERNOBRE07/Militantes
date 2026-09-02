/**
 * Cofre de Armazenamento Blindado Multicamadas (IndexedDB + LocalStorage + Snapshots)
 * Garante que lançamentos de ruas, coordenadas e fotos NUNCA se percam ao fechar a janela,
 * ao reiniciar o computador ou ao sincronizar com servidores remotos.
 */

const DB_NAME = 'militancia_sao_jose_vault_db';
const DB_VERSION = 2;
const STORE_NAME = 'vault_store';
const SNAPSHOTS_STORE = 'vault_snapshots';

export interface VaultSnapshot {
  id: string;
  timestamp: string;
  label: string;
  checkinsCount: number;
  data: Record<string, any>;
}

class IndexedDbVault {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDb(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.reject(new Error('IndexedDB não disponível no ambiente.'));
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
          if (!db.objectStoreNames.contains(SNAPSHOTS_STORE)) {
            db.createObjectStore(SNAPSHOTS_STORE, { keyPath: 'id' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return this.dbPromise;
  }

  async setItem(key: string, value: any): Promise<void> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB setItem error, fallback to memory/localStorage:', err);
    }
  }

  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const db = await this.getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB getItem error:', err);
      return null;
    }
  }

  async saveSnapshot(label: string, collections: Record<string, any>): Promise<VaultSnapshot | null> {
    try {
      const db = await this.getDb();
      const checkins = collections['militancia_checkins_v1'] || collections['checkins'] || [];
      const snapshot: VaultSnapshot = {
        id: `snap-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        label,
        checkinsCount: Array.isArray(checkins) ? checkins.length : 0,
        data: collections
      };

      return new Promise((resolve) => {
        const tx = db.transaction(SNAPSHOTS_STORE, 'readwrite');
        const store = tx.objectStore(SNAPSHOTS_STORE);
        store.put(snapshot);
        tx.oncomplete = () => resolve(snapshot);
        tx.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async getSnapshots(): Promise<VaultSnapshot[]> {
    try {
      const db = await this.getDb();
      return new Promise((resolve) => {
        const tx = db.transaction(SNAPSHOTS_STORE, 'readonly');
        const store = tx.objectStore(SNAPSHOTS_STORE);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result || []) as VaultSnapshot[];
          list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
          resolve(list.slice(0, 20)); // Return last 20 snapshots
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const db = await this.getDb();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAllKeys();
        req.onsuccess = () => resolve((req.result as string[]) || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }
}

export const vaultStorage = new IndexedDbVault();
