
import { Insumo } from '../types/inventory';

export const MOCK_INSUMOS: Insumo[] = [
  { 
    id: '1', 
    nome: 'Sal Mineral 80 - Engorda', 
    categoria: 'Mineral', 
    unidade: 'kg', 
    estoqueAtual: 1200, 
    estoqueMinimo: 500, 
    valorUnitario: 3.55, 
    ultimaEntrada: '2024-03-01', 
    status: 'Ok',
    estoquePorLocal: { 'Depósito Central': 1000, 'Galpão de Nutrição': 200 },
    custoMedioPorLocal: { 'Depósito Central': 3.50, 'Galpão de Nutrição': 3.80 },
    controlaEstoque: true,
    paraVenda: false,
    paraCompra: true
  },
  { 
    id: '2', 
    nome: 'Vacina Aftosa 50ml', 
    categoria: 'Medicamento', 
    unidade: 'frasco', 
    estoqueAtual: 15, 
    estoqueMinimo: 20, 
    valorUnitario: 85.0, 
    ultimaEntrada: '2024-02-15', 
    status: 'Baixo',
    estoquePorLocal: { 'Farmácia Veterinária': 15 },
    custoMedioPorLocal: { 'Farmácia Veterinária': 85.0 },
    controlaEstoque: true,
    paraVenda: false,
    paraCompra: true
  },
  { 
    id: '3', 
    nome: 'Farelo de Soja (Proteico)', 
    categoria: 'Ração', 
    unidade: 'ton', 
    estoqueAtual: 2.5, 
    estoqueMinimo: 5, 
    valorUnitario: 2420.0, 
    ultimaEntrada: '2024-03-05', 
    status: 'Crítico',
    estoquePorLocal: { 'Depósito Central': 1.5, 'Galpão de Nutrição': 1.0 },
    custoMedioPorLocal: { 'Depósito Central': 2400.0, 'Galpão de Nutrição': 2450.0 },
    controlaEstoque: true,
    paraVenda: true,
    paraCompra: true
  },
  { 
    id: '4', 
    nome: 'Ivermectina 1%', 
    categoria: 'Medicamento', 
    unidade: 'frasco', 
    estoqueAtual: 50, 
    estoqueMinimo: 10, 
    valorUnitario: 118.0, 
    ultimaEntrada: '2024-01-20', 
    status: 'Ok',
    estoquePorLocal: { 'Farmácia Veterinária': 50 },
    custoMedioPorLocal: { 'Farmácia Veterinária': 118.0 },
    controlaEstoque: true,
    paraVenda: false,
    paraCompra: true
  },
];
