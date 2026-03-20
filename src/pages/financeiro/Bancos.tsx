import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MoreVertical,
  Landmark,
  Info,
  ChevronRight,
  Activity,
  Check,
  CheckCircle2,
  X,
  Globe,
  Hash,
  CreditCard
} from 'lucide-react';
import { ModernModal } from '../../components/ModernModal';
import { TransferModal } from '../../components/TransferModal';
import { ExtratoModal } from '../../components/ExtratoModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import { useOfflineQuery, useOfflineMutation } from '../../hooks/useOfflineSync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { BankAccount, Transacao } from '../../types';
import './Financeiro.css';
import { useAuth } from '../../contexts/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { SummaryCard } from '../../components/SummaryCard';

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
  const isOnline = useOnlineStatus();
  const { currentOrg } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBankIdOperacao, setSelectedBankIdOperacao] = useState<string | undefined>(undefined);
  const [isExtratoOpen, setIsExtratoOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);

  // Queries
  const { data: banks = [], isLoading: isLoadingBanks } = useOfflineQuery<BankAccount>(['bancos'], 'bancos');
  const { data: transactions = [] } = useOfflineQuery<Transacao>(['transacoes'], 'transacoes');
  
  // Mutations
  const saveMutation = useOfflineMutation<BankAccount>('bancos', [['bancos']]);
  const deleteMutation = useOfflineMutation<BankAccount>('bancos', [['bancos']], 'delete');

  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    data: '',
    descricao: '',
    banco: 'Todos',
    tipo: 'Todos',
    valor: ''
  });

  const recentTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 50);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return recentTransactions.filter(t => {
      const searchLower = searchTerm.toLowerCase();
      const bankName = banks.find(b => b.id === t.banco_id)?.banco || '';
      const matchesSearch = t.desc.toLowerCase().includes(searchLower) ||
             t.tipo.toLowerCase().includes(searchLower) ||
             t.valor.toString().includes(searchLower) ||
             t.data.toLowerCase().includes(searchLower) ||
             bankName.toLowerCase().includes(searchLower);

      const matchesColumnFilters = 
        (columnFilters.data === '' || t.data.toLowerCase().includes(columnFilters.data.toLowerCase())) &&
        (columnFilters.descricao === '' || t.desc.toLowerCase().includes(columnFilters.descricao.toLowerCase())) &&
        (columnFilters.banco === 'Todos' || bankName === columnFilters.banco) &&
        (columnFilters.tipo === 'Todos' || (t.tipo === 'in' ? 'Entrada' : 'Saída') === columnFilters.tipo) &&
        (columnFilters.valor === '' || t.valor.toString().includes(columnFilters.valor));

      return matchesSearch && matchesColumnFilters;
    });
  }, [recentTransactions, searchTerm, columnFilters, banks]);

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

  const handleSave = async () => {
    if (!bancoNome || !agencia || !conta) {
      alert('Por favor, preencha o nome do banco, agência e conta.');
      return;
    }

    try {
      const data: BankAccount = {
        ...(selectedBank || {}),
        id: selectedBank?.id || crypto.randomUUID(),
        banco: bancoNome,
        tipo,
        agencia,
        conta,
        saldo,
        color,
        status,
        tenant_id: currentOrg?.id || 'default'
      } as BankAccount;
      
      await saveMutation.mutateAsync(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving bank account:', error);
      alert('Erro ao salvar conta bancária.');
    }
  };

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/financeiro/fluxo">Financeiro & Controle</Link>
        <ChevronRight size={14} />
        <span>Contas Bancárias</span>
      </nav>

      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <Landmark size={32} strokeWidth={3} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1>Contas Bancárias</h1>
              <div className={`online-badge ${isOnline ? 'online' : 'offline'}`}>
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
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
      <div className="summary-grid mb-8">
        <SummaryCard 
          label="Saldo Consolidado"
          value={`R$ ${banks.reduce((acc, b) => acc + b.saldo, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="indigo"
          delay="0s"
        />
        <SummaryCard 
          label="Entradas (Mês)"
          value={`R$ ${transactions.filter(t => t.tipo === 'in').reduce((acc, t) => acc + t.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend={{ value: '+8%', type: 'up', icon: TrendingUp }}
          icon={TrendingUp}
          color="emerald"
          delay="0.1s"
        />
        <SummaryCard 
          label="Saídas (Mês)"
          value={`R$ ${transactions.filter(t => t.tipo === 'out').reduce((acc, t) => acc + t.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          trend={{ value: '+3%', type: 'down', icon: TrendingDown }}
          icon={TrendingDown}
          color="rose"
          delay="0.2s"
        />
      </div>

      <div className="bank-cards-grid">
        {banks.map(banco => (
          <div 
            key={banco.id} 
            className="bank-card glass animate-slide-up"
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
                className="btn-premium-outline flex-1" 
                onClick={() => {
                  setSelectedBankIdOperacao(banco.id);
                  setIsExtratoOpen(true);
                }}
              >
                <Activity size={16} strokeWidth={3} /> Extrato
              </button>
              <button 
                className="btn-premium-solid emerald flex-1"
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
                <th>Banco</th>
                <th>Tipo</th>
                <th className="text-right">Valor</th>
                <th className="text-center">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'data', type: 'text', placeholder: 'Data...' },
                    { key: 'descricao', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'banco', type: 'select', options: banks.map(b => b.banco) },
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
                    </div>
                  </td>
                  <td className="font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${t.tipo === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {t.tipo === 'in' ? <TrendingUp size={14} strokeWidth={3} /> : <TrendingDown size={14} strokeWidth={3} />}
                      </div>
                      {t.desc}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                       <Landmark size={14} strokeWidth={3} className="text-slate-400" />
                       <span className="text-sm font-semibold text-slate-600">{banks.find(b => b.id === t.banco_id)?.banco || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={t.tipo === 'in' ? 'Entrada' : 'Saída'} color={t.tipo === 'in' ? 'emerald' : 'rose'} />
                  </td>
                  <td className={`text-right font-black ${t.tipo === 'in' ? 'text-green-600' : 'text-slate-800'}`}>
                    {t.tipo === 'in' ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-center">
                    <div className="actions-cell justify-center">
                      <button className="action-btn-global btn-view" onClick={() => {
                        setSelectedBankIdOperacao(t.banco_id);
                        setIsExtratoOpen(true);
                      }}>
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

      <ModernModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedBank ? 'Configuração' : 'Nova Conta'}
        subtitle="Gerenciamento de contas bancárias."
        footer={
          <>
            <button type="button" className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>
              <X size={18} strokeWidth={3} />
              <span>Cancelar</span>
            </button>
            <button type="button" className="btn-premium-solid indigo" onClick={handleSave}>
              <span>{selectedBank ? 'Salvar Alterações' : 'Salvar Conta'}</span>
              {selectedBank ? <CheckCircle2 size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
            </button>
          </>
        }
      >
            <div className="modern-form-row three-cols">
              <div className="modern-form-group col-span-2">
                <label>Nome do Banco / Instituição</label>
                <div className="modern-input-wrapper">
                  <input className="modern-input" value={bancoNome} onChange={e => setBancoNome(e.target.value)} placeholder="Ex: Banco do Brasil" />
                  <Building2 size={18} className="modern-field-icon" />
                </div>
              </div>
              <div className="modern-form-group">
                <label>Tipo de Conta</label>
                <div className="modern-input-wrapper">
                  <select className="modern-input" value={tipo} onChange={e => setTipo(e.target.value as any)}>
                    <option value="Corrente">Corrente</option>
                    <option value="Poupança">Poupança</option>
                    <option value="Investimento">Investimento</option>
                    <option value="Caixa">Caixa</option>
                  </select>
                  <Activity size={18} className="modern-field-icon" />
                </div>
              </div>
            </div>

            <div className="modern-form-row three-cols mt-4">
              <div className="modern-form-group">
                <label>Agência</label>
                <div className="modern-input-wrapper">
                  <input className="modern-input" value={agencia} onChange={e => setAgencia(e.target.value)} placeholder="0000" />
                  <Hash size={18} className="modern-field-icon" />
                </div>
              </div>
              <div className="modern-form-group">
                <label>Número da Conta</label>
                <div className="modern-input-wrapper">
                  <input className="modern-input" value={conta} onChange={e => setConta(e.target.value)} placeholder="00000-0" />
                  <CreditCard size={18} className="modern-field-icon" />
                </div>
              </div>
              <div className="modern-form-group">
                <label>Saldo Inicial (R$)</label>
                <div className="modern-input-wrapper">
                  <input type="number" className="modern-input" value={saldo} onChange={e => setSaldo(parseFloat(e.target.value))} placeholder="0,00" />
                  <DollarSign size={18} className="modern-field-icon" />
                </div>
              </div>
            </div>

            <div className="modern-form-row mt-4">
              <div className="modern-form-group">
                 <label>Status da Conta</label>
                 <div className="modern-input-wrapper">
                   <select className="modern-input" value={status} onChange={e => setStatus(e.target.value as any)}>
                      <option value="Ativa">Ativa</option>
                      <option value="Inativa">Inativa</option>
                   </select>
                   <CheckCircle2 size={18} className="modern-field-icon" />
                 </div>
              </div>
            </div>
      </ModernModal>

      <TransferModal 
        isOpen={isTransferModalOpen} 
        onClose={() => setIsTransferModalOpen(false)} 
        initialSourceId={selectedBankIdOperacao}
      />

      <ExtratoModal 
        isOpen={isExtratoOpen} 
        onClose={() => setIsExtratoOpen(false)} 
        initialBankId={selectedBankIdOperacao}
      />
    </div>
  );
};
