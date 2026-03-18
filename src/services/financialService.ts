
import { RegistroSanitario, Dieta, Animal } from '../types';

/**
 * Service to handle financial calculations and cost inheritance
 * between lots and individual animals.
 */
export const financialService = {
  /**
   * Calculates the sanitation cost for a specific animal based on lot-level records
   * and individual treatments.
   */
  calculateSanitationCost: (animal: Animal, allSanitationRecords: RegistroSanitario[], lotPopulation: number = 85): number => {
    // 1. Costs from individual records
    const individualCost = allSanitationRecords
      .filter(r => r.animal === animal.brinco)
      .reduce((acc, r) => acc + financialService.calculateRecordCost(r), 0);

    // 2. Pro-rated costs from lot records
    const lotRecords = allSanitationRecords.filter(r => r.loteId === animal.lote);
    let proRatedLotCost = 0;

    lotRecords.forEach(record => {
      const recordTotal = financialService.calculateRecordCost(record);
      // In a real scenario, we'd fetch the actual animal count of that lot at the time of treatment
      proRatedLotCost += recordTotal / lotPopulation;
    });

    return individualCost + proRatedLotCost;
  },

  /**
   * Calculates the nutrition cost for a specific animal pro-rated by weight or per capita.
   */
  calculateNutritionCost: (
    animal: Animal, 
    diet: Dieta | undefined, 
    lotAnimals: Animal[], 
    days: number = 30,
    mode: 'fixed' | 'proportional' = 'proportional'
  ): number => {
    if (!diet) return 0;

    const totalLotDailyCost = diet.custoPorCab * lotAnimals.length;
    
    if (mode === 'proportional') {
      const totalWeight = lotAnimals.reduce((acc, a) => acc + a.peso, 0);
      const animalWeightFactor = animal.peso / (totalWeight || 1);
      return (totalLotDailyCost * animalWeightFactor) * days;
    }

    return diet.custoPorCab * days;
  },

  /**
   * Helper to calculate the total cost of a single sanitation record
   * based on medication prices (simulated).
   */
  calculateRecordCost: (record: RegistroSanitario): number => {
    // In a real app, medication prices would come from the inventory/purchase modules
    const simulatedPrices: Record<string, number> = {
      'Vacina Aftosa 50ml': 120.00,
      'Antibiótico Amoxicilina': 85.00,
      'Ivermectina 1%': 45.00,
      'Vacina': 75.00,
      'Medicamentos preventivos': 150.00
    };

    return record.medicamentos.reduce((acc, med) => {
      const price = simulatedPrices[med.nome] || 50.00; // Default simulated price
      return acc + (med.quantidade * price);
    }, 0);
  },

  /**
   * Calculates the total investment and ROI for an animal.
   */
  calculateTotalAnimalInvestment: (
    animal: Animal, 
    lotSanitationCost: number, 
    lotNutritionCost: number
  ): number => {
    return (
      animal.custoAquisicao +
      animal.custoNutricao + // Individual historical cost
      animal.custoSanidade + // Individual historical cost
      animal.custoReproducao +
      animal.custoConfinamento +
      animal.custoOperacional +
      lotSanitationCost +
      lotNutritionCost
    );
  }
};
