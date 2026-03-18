
import { Supplier } from '../types/supplier';

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'F1',
    nome: 'AgroQuímica Brasil S.A.',
    nomeFantasia: 'AgroQuímica',
    documento: '12.345.678/0001-90',
    inscricaoEstadual: '123456789',
    regimeTributario: 'Lucro Real',
    tipoLogradouro: 'Rua',
    logradouro: 'das Indústrias',
    numero: '1500',
    complemento: 'Pavilhão A',
    bairro: 'Polo Industrial',
    cidade: 'São Paulo',
    estado: 'SP',
    pais: 'Brasil',
    cep: '01000-000',
    telefone: '(11) 3344-5566',
    email: 'vendas@agroquimica.com.br',
    responsavel: 'Ricardo Oliveira',
    condicaoPagamentoPadrao: '30/60/90 dias',
    prazoEntregaMedio: '5 dias',
    status: 'Ativo'
  },
  {
    id: 'F2',
    nome: 'Nutrição Animal Pantanal LTDA',
    nomeFantasia: 'Nutri Pantanal',
    documento: '11.222.333/0001-44',
    inscricaoEstadual: '333444555',
    regimeTributario: 'Lucro Presumido',
    tipoLogradouro: 'Rodovia',
    logradouro: 'MT-040',
    numero: 'S/N',
    complemento: 'Fazenda Rio Verde',
    bairro: 'Zona Rural',
    cidade: 'Rondonópolis',
    estado: 'MT',
    pais: 'Brasil',
    cep: '78700-000',
    telefone: '(66) 3421-9988',
    email: 'comercial@nutripantanal.com.br',
    responsavel: 'Sérgio Mendes',
    condicaoPagamentoPadrao: '30 dias',
    prazoEntregaMedio: '3 dias',
    status: 'Ativo'
  }
];
