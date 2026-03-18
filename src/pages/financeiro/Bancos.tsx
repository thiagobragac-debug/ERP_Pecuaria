import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MoreVertical,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Wallet,
  Landmark,
  Info,
  ChevronRight,
  ChevronLeft,
  User,
  Hash,
  Activity,
  Check,
  Globe,
  FileText,
  Repeat
} from 'lucide-react';
import { MOCK_BANKS, BankAccount } from '../../data/bankData';
import { StandardModal } from '../../components/StandardModal';
import { TransferModal } from '../../components/TransferModal';
import { ExtratoModal } from '../../components/ExtratoModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import './Financeiro.css';

const mockTransactions = [
  { id: 'T1', data: '2024-03-20', descricao: 'Liquidação - NF 1234', valor: -5500.00, bancoId: 'B1', tipo: 'Saída' },
  { id: 'T2', data: '2024-03-19', descricao: 'Venda de Bezerras', valor: 12500.00, bancoId: 'B1', tipo: 'Entrada' },
  { id: 'T3', data: '2024-03-18', descricao: 'Ajuste de Saldo', valor: 100.00, bancoId: 'B2', tipo: 'Entrada' },
];

const BANK_COLORS = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'BB Yellow', value: '#fbbf24' },
  { name: 'Itaú Orange', value: '#ec6608' },
  { name: 'Santander Red', value: '#ec1c24' },
  { name: 'Nu Purple', value: '#8a05be' },
  { name: 'Inter Orange', value: '#ff7a00' },
  { name: 'Slate', value: '#1e293b' },
];

export const Bancos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBankIdOperacao, setSelectedBankIdOperacao] = useState<string | undefined>(undefined);
  const [isExtratoOpen, setIsExtratoOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);

  // Handle query params for modals (from sidebar)
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const modal = params.get('modal');
    if (modal === 'extrato') {
      setIsExtratoOpen(true);
    } else if (modal === 'transfer') {
      setIsTransferModalOpen(true);
    }
  }, [location.search]);
  
  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todas');
  const [columnFilters, setColumnFilters] = useState({
    data: '',
    descricao: '',
    banco: 'Todos',
    tipo: 'Todos',
    valor: ''
  });

  const filteredTransactions = mockTransactions.filter(t => {
    const searchLower = searchTerm.toLowerCase();
    const bankName = MOCK_BANKS.find(b => b.id === t.bancoId)?.banco || '';
    const matchesSearch = t.descricao.toLowerCase().includes(searchLower) ||
           t.tipo.toLowerCase().includes(searchLower) ||
           t.valor.toString().includes(searchLower) ||
           t.data.toLowerCase().includes(searchLower) ||
           bankName.toLowerCase().includes(searchLower);

    const matchesColumnFilters = 
      (columnFilters.data === '' || t.data.toLowerCase().includes(columnFilters.data.toLowerCase())) &&
      (columnFilters.descricao === '' || t.descricao.toLowerCase().includes(columnFilters.descricao.toLowerCase())) &&
      (columnFilters.banco === 'Todos' || bankName === columnFilters.banco) &&
      (columnFilters.tipo === 'Todos' || t.tipo === columnFilters.tipo) &&
      (columnFilters.valor === '' || t.valor.toString().includes(columnFilters.valor));

    return matchesSearch && matchesColumnFilters;
  });

  const {
    currentPage,
    totalPages,
    paginatedData,
    itemsPerPage,
    setItemsPerPage,
    startIndex,
    endIndex,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
  } = usePagination({ data: filteredTransactions, initialItemsPerPage: 10 });

  // Form State
  const [bancoNome, setBancoNome] = useState('');
  const [tipo, setTipo] = useState<BankAccount['tipo']>('Corrente');
  const [agencia, setAgencia] = useState('');
  const [conta, setConta] = useState('');
  const [saldo, setSaldo] = useState(0);
  const [color, setColor] = useState(BANK_COLORS[0].value);
  const [status, setStatus] = useState<'Ativa' | 'Inativa'>('Ativa');

  const handleOpenModal = (bank: BankAccount | null = null) => {
    if (bank) {
      setSelectedBank(bank);
      setBancoNome(bank.banco);
      setTipo(bank.tipo);
      setAgencia(bank.agencia);
      setConta(bank.conta);
      setSaldo(bank.saldo);
      setColor(bank.color || BANK_COLORS[0].value);
      setStatus(bank.status);
    } else {
      setSelectedBank(null);
      setBancoNome('');
      setTipo('Corrente');
      setAgencia('');
      setConta('');
      setSaldo(0);
      setColor(BANK_COLORS[0].value);
      setStatus('Ativa');
    }
    setIsModalOpen(true);
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge emerald">
            <Landmark size={40} strokeWidth={3} />
          </div>
          <div>
            <h1>Contas Bancárias</h1>
            <p className="description">Gestão avançada de saldos, extratos e integração financeira.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-outline" onClick={() => navigate('/financeiro/conciliacao')}>
            <Globe size={18} strokeWidth={3} />
            <span>Conciliação</span>
          </button>
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Nova Conta</span>
          </button>
        </div>
      </div>

      <div className="bank-cards-grid">
        {MOCK_BANKS.map(banco => (
          <div 
            key={banco.id} 
            className="bank-card animate-slide-up"
            style={{ 
              '--bank-color': banco.color,
              '--bank-brand-color': banco.brandColor || banco.color 
            } as any}
          >
            <div className="bank-card-header">
              <div className="bank-brand-icon">
                {banco.banco.charAt(0)}
              </div>
              <div className="bank-info ml-4 flex-1">
                <span className="bank-name">{banco.banco}</span>
                <span className="account-type-tag">{banco.tipo}</span>
              </div>
              <div className="bank-actions">
                <button className="action-btn-global btn-view" onClick={() => handleOpenModal(banco)}>
                  <MoreVertical size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
            
            <div className="bank-card-body">
              <div className="balance-display">
                <span className="label">Saldo Disponível</span>
                <span className="amount">R$ {banco.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="account-number-block">
                <div className="detail-item">
                  <span className="dt-label">Agência</span>
                  <span className="dt-value">{banco.agencia}</span>
                </div>
                <div className="detail-item">
                  <span className="dt-label">Conta</span>
                  <span className="dt-value">{banco.conta}</span>
                </div>
              </div>
            </div>

            <div className="bank-card-footer">
              <button 
                className="premium-btn" 
                onClick={() => {
                  setSelectedBankIdOperacao(banco.id);
                  setIsExtratoOpen(true);
                }}
              >
                <Activity size={16} strokeWidth={3} /> Extrato
              </button>
              <button 
                className="premium-btn primary"
                onClick={() => {
                  setSelectedBankIdOperacao(banco.id);
                  setIsTransferModalOpen(true);
                }}
              >
                <DollarSign size={16} strokeWidth={3} /> Transferir
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="recent-transactions-section mb-8">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Filtrar movimentações..."
          onToggleAdvanced={() => setIsFiltersOpen(!isFiltersOpen)}
          isAdvancedOpen={isFiltersOpen}
        />
        
        <div className="data-section">
          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Banco de Origem</th>
                <th>Tipo</th>
                <th className="text-right">Valor Líquido</th>
                <th className="text-center">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'data', type: 'text', placeholder: 'Data...' },
                    { key: 'descricao', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'banco', type: 'select', options: MOCK_BANKS.map(b => b.banco) },
                    { key: 'tipo', type: 'select', options: ['Entrada', 'Saída'] },
                    { key: 'valor', type: 'text', placeholder: 'Valor...' }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map(t => (
                <tr key={t.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-700">{new Date(t.data).toLocaleDateString()}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-black bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">Hoje às 14:30</span>
                    </div>
                  </td>
                  <td className="font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${t.tipo === 'Entrada' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {t.tipo === 'Entrada' ? <TrendingUp size={14} strokeWidth={3} /> : <TrendingDown size={14} strokeWidth={3} />}
                      </div>
                      {t.descricao}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                       <Landmark size={14} strokeWidth={3} className="text-slate-400" />
                       <span className="text-sm font-semibold text-slate-600">{MOCK_BANKS.find(b => b.id === t.bancoId)?.banco}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${t.tipo === 'Entrada' ? 'recebido' : 'atrasado'}`}>
                       {t.tipo}
                    </span>
                  </td>
                  <td className={`text-right font-black ${t.valor > 0 ? 'text-green-600' : 'text-slate-800'}`}>
                    {t.valor > 0 ? '+' : '-'} R$ {Math.abs(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-center">
                    <div className="actions-cell justify-center">
                      <button className="action-btn-global btn-view">
                        <ChevronRight size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={totalItems}
          onPageChange={goToPage}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          onItemsPerPageChange={setItemsPerPage}
          label="registros"
        />
        </div>
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBank ? 'Configuração de Conta' : 'Nova Conta Bancária'}
        subtitle="Defina os parâmetros operacionais e identidade da conta."
        icon={Landmark}
        footer={
          <div className="footer-actions flex gap-3">
            <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button className="btn-premium-solid indigo px-8" onClick={() => setIsModalOpen(false)}>
              <Check size={18} strokeWidth={3} />
              <span>{selectedBank ? 'Salvar Alterações' : 'Criar Conta'}</span>
            </button>
          </div>
        }
        size="lg"
      >
        <div className="refined-form-container">
          {/* Section 1: Identificação */}
          <div className="form-block">
             <div className="form-block-header">
                <div className="icon-wrap"><Info size={18} strokeWidth={3} /></div>
                <h3>Identificação do Banco</h3>
             </div>
             <div className="form-grid-refined">
                <div className="form-field-wrapper col-span-8">
                   <label>Nome da Instituição</label>
                   <div className="input-with-icon">
                      <input 
                        type="text" 
                        placeholder="Ex: Banco do Brasil S.A." 
                        value={bancoNome}
                        onChange={(e) => setBancoNome(e.target.value)}
                      />
                      <Building2 size={18} strokeWidth={3} className="field-icon" />
                   </div>
                </div>
                <div className="form-field-wrapper col-span-4">
                   <label>Tipo de Conta</label>
                   <div className="input-with-icon">
                      <select value={tipo} onChange={(e) => setTipo(e.target.value as any)}>
                        <option value="Corrente">Conta Corrente</option>
                        <option value="Poupança">Poupança</option>
                        <option value="Investimento">Aplicações</option>
                        <option value="Caixa">Caixa (Espécie)</option>
                      </select>
                      <CreditCard size={18} strokeWidth={3} className="field-icon" />
                   </div>
                </div>
             </div>
          </div>

          {/* Section 2: Dados Bancários */}
          <div className="form-block border-t pt-8">
             <div className="form-block-header">
                <div className="icon-wrap"><Hash size={18} strokeWidth={3} /></div>
                <h3>Dados de Registro</h3>
             </div>
             <div className="form-grid-refined">
                <div className="form-field-wrapper col-span-4">
                   <label>Agência</label>
                   <div className="input-with-icon">
                      <input 
                        type="text" 
                        placeholder="0000-0" 
                        value={agencia}
                        onChange={(e) => setAgencia(e.target.value)}
                      />
                      <Landmark size={18} strokeWidth={3} className="field-icon" />
                   </div>
                </div>
                <div className="form-field-wrapper col-span-4">
                   <label>Número da Conta</label>
                   <div className="input-with-icon">
                      <input 
                        type="text" 
                        placeholder="000000-0" 
                        value={conta}
                        onChange={(e) => setConta(e.target.value)}
                      />
                      <Hash size={18} strokeWidth={3} className="field-icon" />
                   </div>
                </div>
                <div className="form-field-wrapper col-span-4">
                   <label>Saldo Inicial (R$)</label>
                   <div className="input-with-icon">
                      <input 
                        type="number" 
                        step="0.01" 
                        value={saldo}
                        onChange={(e) => setSaldo(parseFloat(e.target.value) || 0)}
                      />
                      <DollarSign size={18} strokeWidth={3} className="field-icon" />
                   </div>
                </div>
             </div>
          </div>

          {/* Section 3: Personalização Visual */}
          <div className="form-block border-t pt-8 bg-slate-50/50 -mx-6 px-6 py-8 rounded-b-3xl">
             <div className="form-block-header">
                <div className="icon-wrap"><Globe size={18} strokeWidth={3} /></div>
                <h3>Personalização & Status</h3>
             </div>
             <div className="grid grid-cols-2 gap-12">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase mb-4 block">Cor Sugerida para Marca</label>
                   <div className="color-picker-grid">
                      {BANK_COLORS.map(c => (
                        <div 
                          key={c.value}
                          className={`color-option ${color === c.value ? 'selected' : ''}`}
                          style={{ background: c.value }}
                          onClick={() => setColor(c.value)}
                        >
                          {color === c.value && <Check size={14} strokeWidth={3} color={c.name === 'BB Yellow' ? '#000' : '#fff'} />}
                        </div>
                      ))}
                   </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-4 block">Status Operacional</label>
                  <div className="flex gap-4">
                     <button 
                        className={`flex-1 p-3 rounded-xl border-2 transition-all font-bold text-sm ${status === 'Ativa' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-slate-200 text-slate-400'}`}
                        onClick={() => setStatus('Ativa')}
                     >
                        Ativa
                     </button>
                     <button 
                        className={`flex-1 p-3 rounded-xl border-2 transition-all font-bold text-sm ${status === 'Inativa' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-200 text-slate-400'}`}
                        onClick={() => setStatus('Inativa')}
                     >
                        Inativa
                     </button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </StandardModal>

      <TransferModal 
        isOpen={isTransferModalOpen} 
        onClose={() => {
          setIsTransferModalOpen(false);
          setSelectedBankIdOperacao(undefined);
        }} 
        initialSourceId={selectedBankIdOperacao}
      />

      <ExtratoModal 
        isOpen={isExtratoOpen} 
        onClose={() => {
          setIsExtratoOpen(false);
          setSelectedBankIdOperacao(undefined);
        }} 
        initialBankId={selectedBankIdOperacao}
      />
    </div>
  );
};

