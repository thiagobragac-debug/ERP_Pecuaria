import { db, SyncItem } from './db';
import { supabase } from './supabase';

export const dataService = {
  // Generic Fetching with background revalidation
  async getItems<T>(table: string, queryFn?: any): Promise<T[]> {
    // 1. Get from Local DB
    const localData = await (db as any)[table].toArray();
    
    // 2. If online, fetch from remote and update local
    if (navigator.onLine) {
      this.revalidate(table, queryFn);
    }
    
    return localData;
  },

  async revalidate(table: string, queryFn?: any) {
    try {
      const { data, error } = queryFn 
        ? await queryFn 
        : await supabase.from(table).select('*');
        
      if (!error && data) {
        await (db as any)[table].clear();
        await (db as any)[table].bulkPut(data);
      }
    } catch (err) {
      console.error(`Error revalidating table ${table}:`, err);
    }
  },

  // Generic Save (Offline-ready)
  async saveItem<T extends { id: string }>(table: string, data: T) {
    // 1. Save to Local DB immediately
    await (db as any)[table].put(data);

    // 2. Add to Sync Queue
    const syncItem: SyncItem = {
      table,
      action: 'UPDATE', // Unified upsert
      data,
      timestamp: Date.now()
    };
    await db.sync_queue.add(syncItem);

    // 3. Trigger immediate sync attempt
    if (navigator.onLine) {
      // Background sync would be better, but we can trigger it
      import('./syncEngine').then(m => m.syncEngine.processQueue());
    }
    
    return data;
  },

  // Generic Delete (Offline-ready)
  async deleteItem(table: string, id: string) {
    // 1. Delete from Local DB
    await (db as any)[table].delete(id);

    // 2. Add to Sync Queue
    const syncItem: SyncItem = {
      table,
      action: 'DELETE',
      data: { id },
      timestamp: Date.now()
    };
    await db.sync_queue.add(syncItem);

    // 3. Trigger immediate sync attempt
    if (navigator.onLine) {
      import('./syncEngine').then(m => m.syncEngine.processQueue());
    }
  }
};
