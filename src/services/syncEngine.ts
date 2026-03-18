import { db, SyncItem } from './db';
import { supabase } from './supabase';

export const syncEngine = {
  async processQueue() {
    if (!navigator.onLine) return;

    const items = await db.sync_queue.orderBy('timestamp').toArray();
    if (items.length === 0) return;

    console.log(`SyncEngine: Processing ${items.length} items...`);

    for (const item of items) {
      try {
        await this.syncItem(item);
        await db.sync_queue.delete(item.id!);
      } catch (error) {
        console.error('SyncEngine: Error syncing item', item, error);
        // Retrying later (could implement exponential backoff here)
        break; 
      }
    }
  },

  async syncItem(item: SyncItem) {
    const { table, action, data } = item;

    if (action === 'CREATE' || action === 'UPDATE') {
      const { error } = await supabase
        .from(table)
        .upsert(data);
      if (error) throw error;
    } else if (action === 'DELETE') {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', data.id);
      if (error) throw error;
    }
  },

  init() {
    window.addEventListener('online', () => this.processQueue());
    // Periodically check if online but missed the event
    setInterval(() => this.processQueue(), 30000);
  }
};
