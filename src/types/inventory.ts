
export interface Insumo {
  id: string;
  nome: string;
  categoria: string;
  unidade: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  valorUnitario: number;
  ultimaEntrada: string;
  status: 'Ok' | 'Baixo' | 'Crítico';
  estoquePorLocal: Record<string, number>;
  custoMedioPorLocal: Record<string, number>;
  controlaEstoque: boolean;
  paraVenda: boolean;
  paraCompra: boolean;
}
