import { db } from './db';
import { 
  mockAnimals, 
  mockDietas, 
  mockRegistrosSanitarios, 
  mockLotes, 
  mockPastos 
} from '../data/mockData';

export const seedDatabase = async () => {
  try {
    const animaisCount = await db.animais.count();
    if (animaisCount === 0) {
      console.log('Seeding Database...');
      await Promise.all([
        db.lotes.bulkPut(mockLotes),
        db.pastos.bulkPut(mockPastos),
        db.animais.bulkPut(mockAnimals),
        db.dietas.bulkPut(mockDietas),
        db.registrosSanitarios.bulkPut(mockRegistrosSanitarios)
      ]);
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
};
