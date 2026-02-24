import * as Interfaces from "../interfaces";

const DB_NAME = "inventory_manager_db";
const STORE_NAME = "cache_store";
const DB_VERSION = 2;

// Cache TTL en milisegundos (24 horas)
const CATALOG_CACHE_TTL = 24 * 60 * 60 * 1000;
// Estado de comparación TTL (1 hora)
const COMPARISON_STATE_TTL = 60 * 60 * 1000;

let db: IDBDatabase;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        // Crear índices para TTL y tipo de datos
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("type", "type", { unique: false });
      }
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject("Error opening IndexedDB: " + (event.target as IDBOpenDBRequest).error);
    };
  });
}

async function ensureDB(): Promise<IDBDatabase> {
  if (!db) {
    db = await openDB();
  }
  return db;
}

// Función auxiliar para limpiar entradas expiradas
async function cleanupExpiredEntries(): Promise<void> {
  const database = await ensureDB();
  const transaction = database.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index("timestamp");
  
  const now = Date.now();
  const range = IDBKeyRange.upperBound(now - 1000); // Un segundo en el pasado
  
  const request = index.openCursor(range);
  
  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const entry = cursor.value;
        if (entry.timestamp && now - entry.timestamp > CATALOG_CACHE_TTL) {
          cursor.delete();
        }
        cursor.continue();
      } else {
        resolve();
      }
    };
    
    request.onerror = (event) => {
      reject("Error cleaning up expired entries: " + (event.target as IDBRequest).error);
    };
  });
}

// Función para obtener datos con validación de TTL
async function getDataWithTTL<T>(id: string, ttl: number): Promise<T | null> {
  try {
    await ensureDB();
    await cleanupExpiredEntries();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        const now = Date.now();
        if (result.timestamp && now - result.timestamp > ttl) {
          // Entrada expirada, eliminarla
          const deleteTransaction = db.transaction([STORE_NAME], "readwrite");
          const deleteStore = deleteTransaction.objectStore(STORE_NAME);
          deleteStore.delete(id);
          resolve(null);
        } else {
          resolve(result.data);
        }
      };

      request.onerror = (event) => {
        reject("Error getting data from IndexedDB: " + (event.target as IDBRequest).error);
      };
    });
  } catch (error) {
    console.warn("Error accessing IndexedDB, falling back to memory:", error);
    return null;
  }
}

// Función para guardar datos con timestamp
async function saveDataWithTTL<T>(id: string, data: T, type: string): Promise<void> {
  try {
    await ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ 
        id, 
        data, 
        timestamp: Date.now(),
        type 
      });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = (event) => {
        reject("Error saving data to IndexedDB: " + (event.target as IDBRequest).error);
      };
    });
  } catch (error) {
    console.warn("Error saving to IndexedDB:", error);
  }
}

// Funciones específicas mejoradas
export async function getCatalogFromIndexedDB(): Promise<Interfaces.IProducto[] | null> {
  return getDataWithTTL<Interfaces.IProducto[]>("catalog", CATALOG_CACHE_TTL);
}

export async function saveCatalogToIndexedDB(catalog: Interfaces.IProducto[]): Promise<void> {
  return saveDataWithTTL("catalog", catalog, "catalog");
}

// Nueva función para estado de comparación
export interface ComparisonState {
  productos: Interfaces.IProductoEditado[];
  competidores: string[];
  formData: Record<string, unknown>;
  timestamp: number;
}

export async function getComparisonState(): Promise<ComparisonState | null> {
  return getDataWithTTL<ComparisonState>("comparison_state", COMPARISON_STATE_TTL);
}

export async function saveComparisonState(state: Omit<ComparisonState, 'timestamp'>): Promise<void> {
  return saveDataWithTTL("comparison_state", { ...state, timestamp: Date.now() }, "comparison");
}

export async function clearComparisonState(): Promise<void> {
  const database = await ensureDB();
  const transaction = database.transaction([STORE_NAME], "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  const request = store.delete("comparison_state");
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      reject("Error clearing comparison state: " + (event.target as IDBRequest).error);
    };
  });
}

// Función para obtener estadísticas de caché
export async function getCacheStats(): Promise<{ catalogSize?: number; hasComparisonState: boolean }> {
  try {
    const catalog = await getCatalogFromIndexedDB();
    const comparison = await getComparisonState();
    
    return {
      catalogSize: catalog?.length,
      hasComparisonState: !!comparison
    };
  } catch (error) {
    console.warn("Error getting cache stats:", error);
    return { hasComparisonState: false };
  }
}

export async function clearIndexedDB(): Promise<void> {
  if (!db) {
    db = await openDB();
  }
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      reject("Error clearing IndexedDB: " + (event.target as IDBRequest).error);
    };
  });
}
