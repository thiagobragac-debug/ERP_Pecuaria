export interface AssetFinancial {
  valorCompra: number;
  dataCompra: string;
  vidaUtilAnos: number;
  depreciacaoAnual: number;
}

export interface Asset {
  id: string;
  nome: string;
  categoria: string;
  marca: string;
  modelo: string;
  ano: number;
  placaOuSerie: string;
  status: 'Operacional' | 'Manutenção' | 'Inativo';
  usoAtual: number; // Horas ou KM
  tipoUso: 'Horas' | 'KM';
  empresaId: string;
  proximaRevisao: string;
  financeiro: AssetFinancial;
}

export const mockCompanies = [
  { id: 'M1', nome: 'Agropecuária Horizonte S.A. (Matriz)' },
  { id: 'F1', nome: 'Agropecuária Horizonte - Unidade Sinop' },
];

export const mockAssets: Asset[] = [
  {
    id: '1',
    nome: 'Trator John Deere 6125J',
    categoria: 'Trator',
    marca: 'John Deere',
    modelo: '6125J',
    ano: 2022,
    placaOuSerie: 'JD-6125J-001',
    status: 'Operacional',
    usoAtual: 1250,
    tipoUso: 'Horas',
    empresaId: 'M1',
    proximaRevisao: '12/04/2026',
    financeiro: {
      valorCompra: 450000,
      dataCompra: '10/01/2022',
      vidaUtilAnos: 10,
      depreciacaoAnual: 10
    }
  },
  {
    id: '2',
    nome: 'Caminhão Scania R450',
    categoria: 'Caminhão',
    marca: 'Scania',
    modelo: 'R450',
    ano: 2021,
    placaOuSerie: 'ABC-1234',
    status: 'Manutenção',
    usoAtual: 85000,
    tipoUso: 'KM',
    empresaId: 'F1',
    proximaRevisao: '20/03/2026',
    financeiro: {
      valorCompra: 680000,
      dataCompra: '15/05/2021',
      vidaUtilAnos: 8,
      depreciacaoAnual: 12.5
    }
  }
];
