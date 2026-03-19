
import { Animal, RegistroSanitario, Dieta, Lote, Pasto } from '../types';

export const mockLotes: Lote[] = [
  { id: '1', nome: 'Lote 01 - Recria Nelore', status: 'Ativo', empresaId: 'M1', tenant_id: 'default' },
  { id: '2', nome: 'Lote 02 - Engorda Machos', status: 'Ativo', empresaId: 'M1', tenant_id: 'default' },
];

export const mockPastos: Pasto[] = [
  { id: '1', nome: 'Pasto Formoso', area_ha: 50, capacidade_ua: 80, empresaId: 'M1', tenant_id: 'default', status: 'Ocupado' },
  { id: '2', nome: 'Piquete 04', area_ha: 15, capacidade_ua: 30, empresaId: 'M1', tenant_id: 'default', status: 'Ocupado' },
];

export const mockAnimals: Animal[] = [
  { 
    id: '1', 
    brinco: '8922', 
    sexo: 'M', 
    raca: 'Nelore', 
    lote: 'Lote 02 - Engorda Machos', 
    pasto: 'Piquete 04', 
    lote_id: '2',
    pasto_id: '2',
    peso: 420, 
    dataNasc: '2023-11-20',
    custoAquisicao: 2500,
    custoNutricao: 850,
    custoSanidade: 120,
    custoReproducao: 0,
    custoConfinamento: 120,
    custoOperacional: 300,
    statusEmAbate: false,
    status: 'Ativo',
    categoria: 'Garrote',
    empresaId: 'M1',
    historicoCustos: []
  },
  { 
    id: '2', 
    brinco: '8925', 
    sexo: 'M', 
    raca: 'Nelore', 
    lote: 'Lote 02 - Engorda Machos', 
    pasto: 'Piquete 04', 
    lote_id: '2',
    pasto_id: '2',
    peso: 415, 
    dataNasc: '2023-11-22',
    custoAquisicao: 2450,
    custoNutricao: 820,
    custoSanidade: 100,
    custoReproducao: 0,
    custoConfinamento: 120,
    custoOperacional: 300,
    statusEmAbate: false,
    status: 'Ativo',
    categoria: 'Garrote',
    empresaId: 'M1',
    historicoCustos: []
  },
  { 
    id: '3', 
    brinco: '7741', 
    sexo: 'F', 
    raca: 'Nelore', 
    lote: 'Lote 01 - Recria Nelore', 
    pasto: 'Pasto Formoso', 
    lote_id: '1',
    pasto_id: '1',
    peso: 285, 
    dataNasc: '2024-06-15',
    custoAquisicao: 1800,
    custoNutricao: 450,
    custoSanidade: 95,
    custoReproducao: 0,
    custoConfinamento: 0,
    custoOperacional: 220,
    statusEmAbate: false,
    status: 'Ativo',
    categoria: 'Novilha',
    empresaId: 'M1',
    historicoCustos: []
  },
  { 
    id: '4', 
    brinco: '7745', 
    sexo: 'F', 
    raca: 'Nelore', 
    lote: 'Lote 01 - Recria Nelore', 
    pasto: 'Pasto Formoso', 
    lote_id: '1',
    pasto_id: '1',
    peso: 278, 
    dataNasc: '2024-06-18',
    custoAquisicao: 1750,
    custoNutricao: 430,
    custoSanidade: 85,
    custoReproducao: 0,
    custoConfinamento: 0,
    custoOperacional: 220,
    statusEmAbate: false,
    status: 'Ativo',
    categoria: 'Novilha',
    empresaId: 'M1',
    historicoCustos: []
  },
];

export const mockDietas: Dieta[] = [
  { 
    id: '1', 
    nome: 'Dieta Acabamento Grão Inteiro', 
    categoria: 'Engorda Intensiva', 
    loteId: '2', 
    pesoMedioLote: 450,
    cmsProjetado: 10.5,
    custoPorCab: 12.80,
    status: 'Ativa',
    empresaId: 'M1',
    ingredientes: [
      { id: '1', nome: 'Milho Grão Inteiro', proporcao: 85, custoUnitario: 1.10 },
      { id: '2', nome: 'Núcleo Confinamento 15%', proporcao: 15, custoUnitario: 3.50 }
    ],
    historicoTrato: [
      { id: 'lt1', data: '2024-03-13', loteId: '2', quantidadeEntregue: 890, status: 'Entregue' },
      { id: 'lt2', data: '2024-03-14', loteId: '2', quantidadeEntregue: 900, status: 'Entregue' }
    ]
  },
  { 
    id: '2', 
    nome: 'Dieta Recria Pasto + Suplemento', 
    categoria: 'Recria', 
    pesoMedioLote: 280,
    cmsProjetado: 6.2,
    custoPorCab: 4.50,
    status: 'Ativa',
    empresaId: 'M1',
    ingredientes: [
      { id: '3', nome: 'Sal Mineral Energético', proporcao: 100, custoUnitario: 2.80 }
    ],
    historicoTrato: []
  },
];

export const mockRegistrosSanitarios: RegistroSanitario[] = [
  { 
    id: '1', 
    loteId: '2', 
    tipo: 'Vacinação', 
    doenca_motivo: 'Aftosa / Brucelose', 
    data: '2026-03-10', 
    careencia_fim: '2026-04-20', 
    status: 'Concluído',
    empresaId: 'M1',
    medicamentos: [
      { id: '1', nome: 'Vacina Aftosa 50ml', dose: '2ml/cab', quantidade: 170 }
    ]
  },
];
