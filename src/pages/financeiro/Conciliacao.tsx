import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Filter, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Download,
  Upload,
  Link,
  Unlink,
  Check,
  ChevronRight,
  ChevronLeft,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_BANKS } from '../../data/bankData';
import { parseOFX } from '../../services/ofxParser';
import { ColumnFilters } from '../../components/ColumnFilters';
import { TableFilters } from '../../components/TableFilters';
import './Conciliacao.css';

interface Transaction {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: 'ENTRADA' | 'SAIDA';
  banco?: string;
  status: 'PENDENTE' | 'CONCILIADO';
  matchId?: string;
}

const MOCK_EXTRATO: Transaction[] = [
  { id: 'E1', data: '2024-03-19', descricao: 'DOC RECEBIDO - PIX CLIENTE', valor: 12500.00, tipo: 'ENTRADA', status: 'PENDENTE' },
  { id: 'E2', data: '2024-03-18', descricao: 'PAGTO BOLETO - ENERGIA', valor: 850.40, tipo: 'SAIDA', status: 'PENDENTE' },
  { id: 'E3', data: '2024-03-17', descricao: 'TAR MANUTENCAO CONTA', valor: 45.00, tipo: 'SAIDA', status: 'PENDENTE' },
  { id: 'E4', data: '2024-03-16', descricao: 'TRANSFERENCIA RECEBIDA', valor: 5500.00, tipo: 'ENTRADA', status: 'PENDENTE' },
];

const MOCK_ERP: Transaction[] = [
  { id: 'S1', data: '2024-03-19', descricao: 'Venda de Bezerras - Lote 45', valor: 12500.00, tipo: 'ENTRADA', status: 'PENDENTE' },
  { id: 'S2', data: '2024-03-18', descricao: 'Energia Elétrica - Março/24', valor: 850.40, tipo: 'SAIDA', status: 'PENDENTE' },
  { id: 'S3', data: '2024-03-15', descricao: 'Compra de Medicamentos', valor: 2200.00, tipo: 'SAIDA', status: 'PENDENTE' },
  { id: 'S4', data: '2024-03-16', descricao: 'Liquidação - NF 1234', valor: 5500.00, tipo: 'SAIDA', status: 'PENDENTE' },
];

export const Conciliacao = () => {
  const navigate = useNavigate();
  const [selectedBankId, setSelectedBankId] = useState(MOCK_BANKS[0].id);
  const [extrato, setExtrato] = useState<Transaction[]>(MOCK_EXTRATO);
  const [erp, setErp] = useState<Transaction[]>(MOCK_ERP);
  const [selectedExtrato, setSelectedExtrato] = useState<string | null>(null);
  const [selectedErp, setSelectedErp] = useState<string | null>(null);
  const [conciliados, setConciliados] = useState<number>(0);
  const [isImporting, setIsImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [columnFilters, setColumnFilters] = useState({
    data: '',
    descricao: '',
    valor: '',
    tipo: 'Todos'
  });

  const selectedBank = MOCK_BANKS.find(b => b.id === selectedBankId);

  // Auto-Match logic
  useEffect(() => {
    const autoMatch = () => {
      let matchCount = 0;
      const newExtrato = [...extrato];
      const newErp = [...erp];

      newExtrato.forEach(ext => {
        const match = newErp.find(e => 
          e.valor === ext.valor && 
          Math.abs(new Date(e.data).getTime() - new Date(ext.data).getTime()) <= 86400000 * 3 && // 3 days max
          e.status === 'PENDENTE' &&
          ext.status === 'PENDENTE'
        );

        if (match) {
          ext.status = 'CONCILIADO';
          ext.matchId = match.id;
          match.status = 'CONCILIADO';
          match.matchId = ext.id;
          matchCount++;
        }
      });

      setExtrato(newExtrato);
      setErp(newErp);
      setConciliados(matchCount);
    };

    const timer = setTimeout(autoMatch, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleManualMatch = () => {
    if (selectedExtrato && selectedErp) {
      const newExtrato = [...extrato];
      const newErp = [...erp];
      
      const extIdx = newExtrato.findIndex(e => e.id === selectedExtrato);
      const erpIdx = newErp.findIndex(e => e.id === selectedErp);

      if (extIdx !== -1 && erpIdx !== -1) {
        newExtrato[extIdx].status = 'CONCILIADO';
        newExtrato[extIdx].matchId = selectedErp;
        newErp[erpIdx].status = 'CONCILIADO';
        newErp[erpIdx].matchId = selectedExtrato;

        setExtrato(newExtrato);
        setErp(newErp);
        setConciliados(prev => prev + 1);
        setSelectedExtrato(null);
        setSelectedErp(null);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseOFX(content);
        if (parsed.length > 0) {
          setExtrato(parsed);
          setConciliados(0); // Reset matches when new statement is loaded
        } else {
          alert('Nenhuma transação encontrada no arquivo OFX.');
        }
      }
      setIsImporting(false);
    };
    reader.onerror = () => {
      alert('Erro ao ler o arquivo.');
      setIsImporting(false);
    };
    reader.readAsText(file);
  };

  const applyFilters = (list: Transaction[]) => {
    return list.filter(t => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = t.descricao.toLowerCase().includes(searchLower) || 
                           t.valor.toString().includes(searchLower) ||
                           t.data.includes(searchLower);

      const matchesColumnFilters = 
        (columnFilters.data === '' || t.data.includes(columnFilters.data)) &&
        (columnFilters.descricao === '' || t.descricao.toLowerCase().includes(columnFilters.descricao.toLowerCase())) &&
        (columnFilters.valor === '' || t.valor.toString().includes(columnFilters.valor)) &&
        (columnFilters.tipo === 'Todos' || t.tipo === columnFilters.tipo);

      const matchesStatus = filterStatus === 'Todos' || t.status === filterStatus;

      return matchesSearch && matchesColumnFilters && matchesStatus;
    });
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <button className="action-btn-global btn-view h-12 w-12" onClick={() => navigate('/financeiro/bancos')}>
            <ArrowLeft size={28} strokeWidth={3} />
          </button>
          <div className="icon-badge emerald">
            <Zap size={36} strokeWidth={2.5} />
          </div>
          <div>
            <h1>Conciliação Avançada</h1>
            <p className="description">Processamento inteligente de extratos bancários</p>
          </div>
        </div>

        <div className="bank-selector-pane">
           <div className="selector-label">
              <Building2 size={20} className="text-slate-400" />
              <span>Conta Corrente:</span>
           </div>
           <select 
             className="premium-select" 
             value={selectedBankId} 
             onChange={(e) => setSelectedBankId(e.target.value)}
           >
             {MOCK_BANKS.map(bank => (
               <option key={bank.id} value={bank.id}>
                 {bank.banco} — CC: {bank.conta}
               </option>
             ))}
           </select>
        </div>

        <div className="action-buttons flex items-center gap-6">
          <div className="conciliacao-stats flex gap-8 border-r border-white/10 pr-8">
            <div className="stat flex flex-col items-end">
              <span className="label text-[10px] uppercase font-black tracking-widest text-slate-500">Pendentes</span>
              <span className="value text-2xl font-black text-amber-600">{(extrato.length + erp.length) - (conciliados * 2)}</span>
            </div>
            <div className="stat flex flex-col items-end">
              <span className="label text-[10px] uppercase font-black tracking-widest text-slate-500">Pareados</span>
              <span className="value text-2xl font-black text-emerald-600">{conciliados}</span>
            </div>
          </div>
          <button 
            className={`btn-premium-outline h-11 px-6 ${isFiltersOpen ? 'filter-active' : ''}`}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter size={18} strokeWidth={3} />
            <span>{isFiltersOpen ? 'Fechar Filtros' : 'Filtros Avançados'}</span>
          </button>
          <button className="btn-premium-solid indigo" disabled={conciliados === 0}>
            <ShieldCheck size={18} strokeWidth={3} />
            <span>Finalizar Conciliação</span>
          </button>
        </div>
      </div>


      <div className="conciliacao-grid">
        {/* Left Side: Extrato Bancário */}
        <div className="reconciliation-panel">
          <div className="panel-header">
            <div className="header-info">
              <Download size={18} />
              <h3>Extrato Bancário</h3>
              <input 
                type="file" 
                id="ofx-upload" 
                className="hidden-input" 
                accept=".ofx" 
                onChange={handleFileUpload}
              />
              <button 
                className="action-btn-global btn-add h-9 px-4 gap-2 text-xs" 
                onClick={() => document.getElementById('ofx-upload')?.click()}
                disabled={isImporting}
              >
                <Upload size={16} strokeWidth={3} />
                {isImporting ? 'Importando...' : 'Importar OFX'}
              </button>
            </div>
            <div className="search-box-mini">
              <Search size={14} />
              <input 
                type="text" 
                placeholder="Filtrar extrato..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isFiltersOpen && (
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <ColumnFilters
                columns={[
                  { key: 'data', type: 'text', placeholder: 'Data...' },
                  { key: 'descricao', type: 'text', placeholder: 'Descrição...' },
                  { key: 'valor', type: 'text', placeholder: 'Valor...' },
                  { key: 'tipo', type: 'select', options: ['ENTRADA', 'SAIDA'] }
                ]}
                values={columnFilters}
                onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
              />
            </div>
          )}
          
          <div className="transaction-list">
            {applyFilters(extrato).map(item => (
              <div 
                key={item.id} 
                className={`transaction-card ${item.status.toLowerCase()} ${selectedExtrato === item.id ? 'selected' : ''}`}
                onClick={() => item.status === 'PENDENTE' && setSelectedExtrato(item.id)}
              >
                <div className="card-top">
                  <span className="date">{new Date(item.data).toLocaleDateString()}</span>
                  <span className={`type-badge ${item.tipo.toLowerCase()}`}>{item.tipo}</span>
                </div>
                <div className="card-main">
                  <span className="description">{item.descricao}</span>
                  <span className="value">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                {item.status === 'CONCILIADO' && (
                  <div className="match-info">
                    <Check size={12} /> Conciliado com ERP
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Center: Connect Area */}
        <div className="connection-center">
            <div className={`connect-actions ${selectedExtrato && selectedErp ? 'active' : ''}`}>
                <div className="connect-line"></div>
                <button className="manual-match-btn" onClick={handleManualMatch} disabled={!selectedExtrato || !selectedErp}>
                    <Link size={20} />
                    <span>Parear Lançamentos</span>
                </button>
            </div>
        </div>

        {/* Right Side: ERP Registers */}
        <div className="reconciliation-panel">
          <div className="panel-header">
            <div className="header-info">
              <ShieldCheck size={18} />
              <h3>Registros ERP</h3>
            </div>
            <div className="search-box-mini">
              <Search size={14} />
              <input 
                type="text" 
                placeholder="Filtrar ERP..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isFiltersOpen && (
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <ColumnFilters
                columns={[
                  { key: 'data', type: 'text', placeholder: 'Data...' },
                  { key: 'descricao', type: 'text', placeholder: 'Descrição...' },
                  { key: 'valor', type: 'text', placeholder: 'Valor...' },
                  { key: 'tipo', type: 'select', options: ['ENTRADA', 'SAIDA'] }
                ]}
                values={columnFilters}
                onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
              />
            </div>
          )}

          <div className="transaction-list">
            {applyFilters(erp).map(item => (
              <div 
                key={item.id} 
                className={`transaction-card ${item.status.toLowerCase()} ${selectedErp === item.id ? 'selected' : ''}`}
                onClick={() => item.status === 'PENDENTE' && setSelectedErp(item.id)}
              >
                <div className="card-top">
                  <span className="date">{new Date(item.data).toLocaleDateString()}</span>
                  <span className={`type-badge ${item.tipo.toLowerCase()}`}>{item.tipo}</span>
                </div>
                <div className="card-main">
                  <span className="description">{item.descricao}</span>
                  <span className="value">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                {item.status === 'CONCILIADO' && (
                  <div className="match-info">
                    <Check size={12} /> Pareado com Extrato
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

