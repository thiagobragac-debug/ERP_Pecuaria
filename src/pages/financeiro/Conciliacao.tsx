import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Search, 
  Filter, 
  Zap, 
  Upload, 
  Link, 
  Check,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { parseOFX } from '../../services/ofxParser';
import { ColumnFilters } from '../../components/ColumnFilters';
import { useOfflineQuery, useOfflineMutation } from '../../hooks/useOfflineSync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Transacao, BankAccount } from '../../types';
import './Conciliacao.css';

interface ReconciliationItem {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: 'ENTRADA' | 'SAIDA';
  status: 'PENDENTE' | 'CONCILIADO';
  matchId?: string;
}

export const Conciliacao = () => {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [selectedBankId, setSelectedBankId] = useState('');
  const [extrato, setExtrato] = useState<ReconciliationItem[]>([]);
  const [selectedExtrato, setSelectedExtrato] = useState<string | null>(null);
  const [selectedErp, setSelectedErp] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    data: '',
    descricao: '',
    valor: '',
    tipo: 'Todos'
  });

  // Queries
  const { data: banks = [] } = useOfflineQuery<BankAccount>(['bancos'], 'bancos');
  const { data: transactions = [] } = useOfflineQuery<Transacao>(['transacoes'], 'transacoes');
  
  // Set default bank
  useEffect(() => {
    if (banks.length > 0 && !selectedBankId) {
      setSelectedBankId(banks[0].id);
    }
  }, [banks, selectedBankId]);

  const erpItems = useMemo(() => {
    return transactions
      .filter(t => t.banco_id === selectedBankId || !t.banco_id) // Show unassigned or specific to bank
      .map(t => ({
        id: t.id,
        data: t.data,
        descricao: t.desc,
        valor: t.valor,
        tipo: t.tipo === 'in' ? 'ENTRADA' : 'SAIDA',
        status: (t.status === 'Pago' ? 'CONCILIADO' : 'PENDENTE') as any
      } as ReconciliationItem));
  }, [transactions, selectedBankId]);

  const conciliadosCount = useMemo(() => {
    return extrato.filter(e => e.status === 'CONCILIADO').length;
  }, [extrato]);

  const handleManualMatch = () => {
    if (selectedExtrato && selectedErp) {
      setExtrato(prev => prev.map(e => 
        e.id === selectedExtrato ? { ...e, status: 'CONCILIADO', matchId: selectedErp } : e
      ));
      setSelectedExtrato(null);
      setSelectedErp(null);
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
        setExtrato(parsed.map(p => ({ ...p, status: 'PENDENTE' } as ReconciliationItem)));
      }
      setIsImporting(false);
    };
    reader.readAsText(file);
  };

  const applyFilters = (list: ReconciliationItem[]) => {
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

      return matchesSearch && matchesColumnFilters;
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
            <div className="flex items-center gap-3">
              <h1>Conciliação Avançada</h1>
              <div className={`online-badge ${isOnline ? 'online' : 'offline'}`}>
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            <p className="description">Processamento inteligente de extratos bancários</p>
          </div>
        </div>

        <div className="bank-selector-pane">
           <div className="selector-label">
              <Building2 size={20} className="text-slate-400" />
              <span>Conta:</span>
           </div>
           <select 
             className="premium-select" 
             value={selectedBankId} 
             onChange={(e) => setSelectedBankId(e.target.value)}
           >
             {banks.map(bank => (
               <option key={bank.id} value={bank.id}>
                 {bank.banco} — CC: {bank.conta}
               </option>
             ))}
           </select>
        </div>

        <div className="action-buttons flex items-center gap-6">
          <div className="conciliacao-stats flex gap-8">
            <div className="stat flex flex-col items-end">
              <span className="label text-[10px] uppercase font-black tracking-widest text-slate-500">Pareados</span>
              <span className="value text-2xl font-black text-emerald-600">{conciliadosCount}</span>
            </div>
          </div>
          <button className="btn-premium-solid indigo">
            <ShieldCheck size={18} strokeWidth={3} />
            <span>Finalizar</span>
          </button>
        </div>
      </div>

      <div className="conciliacao-grid mt-8">
        <div className="reconciliation-panel">
          <div className="panel-header">
            <h3>Extrato Bancário</h3>
            <input type="file" id="ofx-upload" className="hidden-input" accept=".ofx" onChange={handleFileUpload} />
            <button className="btn-premium-outline btn-sm" onClick={() => document.getElementById('ofx-upload')?.click()}>
              <Upload size={14} /> Importar OFX
            </button>
          </div>
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
                  <span className="value font-black text-lg">R$ {item.valor.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="connection-center">
             <button className="manual-match-btn" onClick={handleManualMatch} disabled={!selectedExtrato || !selectedErp}>
                 <Link size={20} />
             </button>
        </div>

        <div className="reconciliation-panel">
          <div className="panel-header">
            <h3>Registros ERP</h3>
          </div>
          <div className="transaction-list">
            {applyFilters(erpItems).map(item => (
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
                  <span className="value font-black text-lg">R$ {item.valor.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
