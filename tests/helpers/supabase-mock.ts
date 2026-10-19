/**
 * Mock Supabase Implementation for Vitest
 * Simulates Supabase Client Query Builder entirely in-memory.
 */
function getFieldValue(row: any, fieldName: string) {
  if (row[fieldName] !== undefined) return row[fieldName];
  // Check snake_case
  const snake = fieldName.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
  if (row[snake] !== undefined) return row[snake];
  // Check camelCase
  const camel = fieldName.replace(/_([a-z0-9])/g, (_, l) => l.toUpperCase());
  if (row[camel] !== undefined) return row[camel];

  // Interop between project_id and workspace_id
  if (fieldName === "project_id" || fieldName === "projectId") {
    if (row.workspace_id !== undefined) return row.workspace_id;
    if (row.workspaceId !== undefined) return row.workspaceId;
  }
  if (fieldName === "workspace_id" || fieldName === "workspaceId") {
    if (row.project_id !== undefined) return row.project_id;
    if (row.projectId !== undefined) return row.projectId;
  }

  return undefined;
}

function unifyRecordKeys(existing: any, updates: any, id: string): Record<string, any> {
  const base = { ...(existing || {}) };
  for (const [k, v] of Object.entries(updates || {})) {
    const camel = k.replace(/_([a-z0-9])/g, (_, l) => l.toUpperCase());
    const snake = k.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
    base[k] = v;
    base[camel] = v;
    base[snake] = v;
  }
  base.id = id;
  return base;
}

export class MockSupabase {
  // Store data as: tableName -> recordId -> recordData
  public store: Record<string, Record<string, any>> = {};
  public mirrorTarget?: any;

  clear() {
    this.store = {};
  }

  seed(table: string, id: string, data: any) {
    if (!this.store[table]) {
      this.store[table] = {};
    }
    const unified = unifyRecordKeys({}, data, id);
    this.store[table][id] = unified;
    if (this.mirrorTarget?.store) {
      if (!this.mirrorTarget.store[table]) this.mirrorTarget.store[table] = {};
      this.mirrorTarget.store[table][id] = unified;
    }
  }

  getTableData(table: string): Record<string, any> {
    return this.store[table] || {};
  }

  from(table: string) {
    const store = this.store;
    if (!store[table]) {
      store[table] = {};
    }

    const filters: Array<{ field: string; op: "eq" | "in"; value: any }> = [];
    let orderByField: string | undefined;
    let ascending = true;
    let limitCount: number | undefined;

    const builder: any = {
      select: (_cols?: string) => builder,
      eq: (field: string, value: any) => {
        filters.push({ field, op: "eq", value });
        return builder;
      },
      in: (field: string, values: any[]) => {
        filters.push({ field, op: "in", value: values });
        return builder;
      },
      order: (field: string, options?: { ascending?: boolean }) => {
        orderByField = field;
        ascending = options?.ascending ?? true;
        return builder;
      },
      limit: (count: number) => {
        limitCount = count;
        return builder;
      },
      single: async () => {
        const { data, error } = await builder._execute();
        if (error) return { data: null, error };
        if (!data || data.length === 0) {
          return { data: null, error: { message: "Row not found", code: "PGRST116" } };
        }
        return { data: data[0], error: null };
      },
      maybeSingle: async () => {
        const { data, error } = await builder._execute();
        if (error) return { data: null, error };
        return { data: data && data.length > 0 ? data[0] : null, error: null };
      },
      insert: async (records: any | any[]) => {
        const recordList = Array.isArray(records) ? records : [records];
        for (const record of recordList) {
          const id = record.id || crypto.randomUUID();
          const unified = unifyRecordKeys({}, record, id);
          store[table][id] = unified;
          if (this.mirrorTarget?.store) {
            if (!this.mirrorTarget.store[table]) this.mirrorTarget.store[table] = {};
            this.mirrorTarget.store[table][id] = unified;
          }
        }
        return { data: recordList, error: null };
      },
      upsert: async (records: any | any[]) => {
        const recordList = Array.isArray(records) ? records : [records];
        for (const record of recordList) {
          const id = record.id || crypto.randomUUID();
          const unified = unifyRecordKeys(store[table][id], record, id);
          store[table][id] = unified;
          if (this.mirrorTarget?.store) {
            if (!this.mirrorTarget.store[table]) this.mirrorTarget.store[table] = {};
            this.mirrorTarget.store[table][id] = unified;
          }
        }
        return { data: recordList, error: null };
      },
      update: (payload: any) => {
        return {
          eq: async (field: string, value: any) => {
            let updated = 0;
            for (const id of Object.keys(store[table])) {
              const item = store[table][id];
              if (getFieldValue(item, field) === value) {
                const unified = unifyRecordKeys(item, payload, id);
                store[table][id] = unified;
                if (this.mirrorTarget?.store?.[table]) {
                  this.mirrorTarget.store[table][id] = unified;
                }
                updated++;
              }
            }
            return { data: null, error: null, count: updated };
          },
        };
      },
      delete: () => {
        return {
          eq: async (field: string, value: any) => {
            for (const id of Object.keys(store[table])) {
              const item = store[table][id];
              if (getFieldValue(item, field) === value) {
                delete store[table][id];
                if (this.mirrorTarget?.store?.[table]) {
                  delete this.mirrorTarget.store[table][id];
                }
              }
            }
            return { data: null, error: null };
          },
        };
      },
      _execute: async () => {
        let rows = Object.values(store[table] || {});

        for (const filter of filters) {
          rows = rows.filter((row) => {
            const val = getFieldValue(row, filter.field);
            if (filter.op === "eq") {
              return val === filter.value;
            }
            if (filter.op === "in") {
              return Array.isArray(filter.value) && filter.value.includes(val);
            }
            return true;
          });
        }

        if (orderByField) {
          rows.sort((a, b) => {
            const valA = getFieldValue(a, orderByField!);
            const valB = getFieldValue(b, orderByField!);
            if (valA === undefined) return 1;
            if (valB === undefined) return -1;
            if (valA === valB) return 0;
            const comp = valA > valB ? 1 : -1;
            return ascending ? comp : -comp;
          });
        }

        if (limitCount !== undefined) {
          rows = rows.slice(0, limitCount);
        }

        return { data: rows.map((r) => ({ ...r })), error: null };
      },
      then: (resolve: any, reject: any) => {
        return builder._execute().then(resolve, reject);
      },
    };

    return builder;
  }
}
