import Dexie, { Table } from 'dexie';
import { Animal, Dieta, RegistroSanitario, Lote, Pasto } from '../types';

export interface SyncItem {
  id?: number;
  table: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
}

export class PecuariaDB extends Dexie {
  animais!: Table<Animal>;
  lotes!: Table<Lote>;
  pastos!: Table<Pasto>;
  dietas!: Table<Dieta>;
  registrosSanitarios!: Table<RegistroSanitario>;
  sync_queue!: Table<SyncItem>;

  constructor() {
    super('PecuariaDB');
    this.version(2).stores({
      animais: 'id, brinco, lote_id, pasto_id, status',
      lotes: 'id, nome, tenant_id',
      pastos: 'id, nome, tenant_id',
      dietas: 'id, nome, tenant_id, status',
      registrosSanitarios: 'id, animal_id, lote_id, status, tenant_id',
      sync_queue: '++id, table, action, timestamp'
    });
  }
}

export const db = new PecuariaDB();
