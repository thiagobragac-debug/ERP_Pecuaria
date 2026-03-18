export interface BankAccount {
  id: string;
  banco: string;
  agencia: string;
  conta: string;
  tipo: 'Corrente' | 'Poupança' | 'Investimento' | 'Caixa';
  saldo: number;
  status: 'Ativa' | 'Inativa';
  color?: string;
  brandColor?: string;
}

export const MOCK_BANKS: BankAccount[] = [
  {
    id: 'B1',
    banco: 'Banco do Brasil',
    agencia: '3244-1',
    conta: '45.678-x',
    tipo: 'Corrente',
    saldo: 154200.50,
    status: 'Ativa',
    color: '#fbbf24', // Amarelo BB
    brandColor: '#0038a8' // Azul BB
  },
  {
    id: 'B2',
    banco: 'Itaú Unibanco',
    agencia: '0455',
    conta: '22.341-8',
    tipo: 'Corrente',
    saldo: 89300.20,
    status: 'Ativa',
    color: '#ec6608', // Laranja Itaú
    brandColor: '#003399' // Azul Itaú
  },
  {
    id: 'B3',
    banco: 'Santander',
    agencia: '1288',
    conta: '13.004567-9',
    tipo: 'Investimento',
    saldo: 450000.00,
    status: 'Ativa',
    color: '#ec1c24', // Vermelho Santander
    brandColor: '#ffffff'
  }
];
