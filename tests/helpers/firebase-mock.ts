/**
 * Mock Firestore Implementation
 * Runs entirely in-memory to simulate Firestore DB behavior in tests.
 */
export class MockFirestore {
  // Store data as: collectionName -> docId -> documentData
  private store: Record<string, Record<string, any>> = {};

  /**
   * Reset all collection data.
   */
  clear() {
    this.store = {};
  }

  /**
   * Seed direct data into the mock store (useful for test setup).
   */
  seed(collectionName: string, id: string, data: any) {
    if (!this.store[collectionName]) {
      this.store[collectionName] = {};
    }
    this.store[collectionName][id] = { ...data, id };
  }

  /**
   * Get direct raw data of a collection (useful for assertions).
   */
  getCollectionData(collectionName: string): Record<string, any> {
    return this.store[collectionName] || {};
  }

  collection(collectionName: string) {
    const store = this.store;
    if (!store[collectionName]) {
      store[collectionName] = {};
    }

    const filters: Array<{ field: string; op: string; value: any }> = [];
    let orderByField: string | undefined;
    let orderDir: "asc" | "desc" = "asc";
    let limitCount: number | undefined;

    const queryChain = {
      where: (field: string, op: string, value: any) => {
        filters.push({ field, op, value });
        return queryChain;
      },
      orderBy: (field: string, dir: "asc" | "desc" = "asc") => {
        orderByField = field;
        orderDir = dir;
        return queryChain;
      },
      limit: (count: number) => {
        limitCount = count;
        return queryChain;
      },
      get: async () => {
        let docs = Object.values(store[collectionName] || {});

        // Apply filters
        for (const filter of filters) {
          docs = docs.filter((doc) => {
            const val = doc[filter.field];
            if (filter.op === "==") {
              return val === filter.value;
            }
            if (filter.op === "in") {
              return Array.isArray(filter.value) && filter.value.includes(val);
            }
            return true;
          });
        }

        // Apply sorting
        if (orderByField) {
          docs.sort((a, b) => {
            const valA = a[orderByField!];
            const valB = b[orderByField!];
            if (valA === undefined) return 1;
            if (valB === undefined) return -1;
            if (valA === valB) return 0;
            const comparison = valA > valB ? 1 : -1;
            return orderDir === "desc" ? -comparison : comparison;
          });
        }

        // Apply limit
        if (limitCount !== undefined) {
          docs = docs.slice(0, limitCount);
        }

        return {
          docs: docs.map((doc) => ({
            exists: true,
            id: doc.id,
            data: () => ({ ...doc }),
          })),
        };
      },
      doc: (id: string) => {
        return {
          get: async () => {
            const doc = store[collectionName]?.[id];
            return {
              exists: doc !== undefined,
              id,
              data: () => (doc ? { ...doc } : undefined),
            };
          },
          set: async (payload: any) => {
            if (!store[collectionName]) {
              store[collectionName] = {};
            }
            // Overwrite doc, preserving ID
            store[collectionName][id] = { ...payload, id };
          },
          update: async (payload: any) => {
            if (!store[collectionName]?.[id]) {
              throw new Error(`Document ${id} not found in collection ${collectionName}`);
            }
            // Merge update
            store[collectionName][id] = {
              ...store[collectionName][id],
              ...payload,
            };
          },
          delete: async () => {
            if (store[collectionName]) {
              delete store[collectionName][id];
            }
          },
        };
      },
    };

    return queryChain;
  }
}
