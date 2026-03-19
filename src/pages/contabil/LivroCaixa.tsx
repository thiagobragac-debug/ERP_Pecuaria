import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  BookOpen,
  ArrowUpRight,
  ArrowDownLeft,
  Plus
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { AccountingEntry } from '../../types';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import { dataService } from '../../services/dataService';
import { useCompany } from '../../contexts/CompanyContext';
import './PlanoContas.css';
 // Reusing general accounting styles

export const LivroCaixa = () => {
  const { activeCompanyId } = useCompany();
  const allLancamentos = useLiveQuery(() => db.lancamentos_contabeis.toArray()) || [];
  
  // Filter by active company
  const lancamentos = allLancamentos.filter(l => activeCompanyId === 'Todas' || l.empresaId === activeCompanyId);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [filterCategoria, setFilterCategoria] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<AccountingEntry>>({
    data: new Date().toISOString().split('T')[0],
    descricao: '',
    categoria: 'Receita Operacional',
    tipo: 'Entrada',
    valor: 0,
    conta: ''
  });
  const [columnFilters, setColumnFilters] = useState({
    data: '',
    descricao: '',
    categoria: 'Todos',
    conta: '',
    valor: ''
  });

  const filteredLancamentos = useMemo(() => {
    return (lancamentos || []).filter((l: AccountingEntry) => {
    const matchesSearch = 
      l.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.conta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.valor.toString().includes(searchTerm) ||
      l.data.includes(searchTerm);
    
    const matchesTipo = filterTipo === 'Todos' || l.tipo === filterTipo;
    const matchesCategoria = filterCategoria === 'Todos' || l.categoria === filterCategoria;

    const matchesColumnFilters = 
      (columnFilters.data === '' || l.data.includes(columnFilters.data)) &&
      (columnFilters.descricao === '' || l.descricao.toLowerCase().includes(columnFilters.descricao.toLowerCase())) &&
      (columnFilters.categoria === 'Todos' || l.categoria === columnFilters.categoria) &&
      (columnFilters.conta === '' || l.conta.toLowerCase().includes(columnFilters.conta.toLowerCase())) &&
      (columnFilters.valor === '' || l.valor.toString().includes(columnFilters.valor));

      return matchesSearch && matchesTipo && matchesCategoria && matchesColumnFilters;
    });
  }, [lancamentos, searchTerm, filterTipo, filterCategoria, columnFilters]);

  const summary = useMemo(() => {
    const entradas = filteredLancamentos.filter((l: AccountingEntry) => l.tipo === 'Entrada').reduce((acc: number, current: AccountingEntry) => acc + current.valor, 0);
    const saidas = filteredLancamentos.filter((l: AccountingEntry) => l.tipo === 'Saída').reduce((acc: number, current: AccountingEntry) => acc + current.valor, 0);
    return { entradas, saidas, saldo: entradas - saidas, totalCount: filteredLancamentos.length };
  }, [filteredLancamentos]);

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
  } = usePagination({ data: filteredLancamentos, initialItemsPerPage: 10 });
  
  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <BookOpen size={32} />
          </div>
          <div>
            <h1>Livro Caixa Digital</h1>
            <p className="description">Escrituração detalhada de entradas e saídas para fins fiscais e gerenciais.</p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-premium-outline">
            <Download size={18} strokeWidth={3} />
            <span>Exportar LCDPR</span>
          </button>
          <button className="btn-premium-solid indigo" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} strokeWidth={3} />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card glass animate-slide-up">
          <div className="summary-info">
            <span className="summary-label">Entradas (Mês)</span>
            <span className="summary-value text-emerald">R$ {(summary.entradas / 1000).toFixed(1)}k</span>
            <span className="summary-trend up"><TrendingUp size={14} /> +0%</span>
          </div>
          <div className="summary-icon green">
            <ArrowUpRight size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Saídas (Mês)</span>
            <span className="summary-value text-red">R$ {(summary.saidas / 1000).toFixed(1)}k</span>
            <span className="summary-trend down"><TrendingDown size={14} /> -0%</span>
          </div>
          <div className="summary-icon red">
            <ArrowDownLeft size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Saldo Acumulado</span>
            <span className="summary-value">R$ {(summary.saldo / 1000).toFixed(1)}k</span>
            <span className="summary-subtext">Disponibilidade atual</span>
          </div>
          <div className="summary-icon blue">
            <DollarSign size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Lançamentos</span>
            <span className="summary-value">{summary.totalCount}</span>
            <span className="summary-subtext">No período selecionado</span>
          </div>
          <div className="summary-icon indigo">
            <FileText size={28} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar descrição, categoria ou conta..."
          actionsLabel="Filtragem"
        >
          <button 
            className={`btn-premium-outline h-11 px-6 ${isFiltersOpen ? 'filter-active' : ''}`}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter size={18} strokeWidth={3} />
            <span>{isFiltersOpen ? 'Fechar Filtros' : 'Filtros Avançados'}</span>
          </button>
        </TableFilters>


        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Conta/Caixa</th>
              <th className="text-right">Valor</th>
              <th className="text-right">Ações</th>
            </tr>
            {isFiltersOpen && (
              <ColumnFilters
                columns={[
                  { key: 'data', type: 'text', placeholder: 'Data...' },
                  { key: 'descricao', type: 'text', placeholder: 'Filtrar...' },
                  { key: 'categoria', type: 'select', options: ['Receita Operacional', 'Custo Produção', 'Despesa Indireta', 'Logística'] },
                  { key: 'conta', type: 'text', placeholder: 'Conta...' },
                  { key: 'valor', type: 'text', placeholder: 'Valor...' }
                ]}
                values={columnFilters}
                onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                showActionsPadding={true}
              />
            )}
          </thead>
          <tbody>
            {paginatedData.map(l => (
              <tr key={l.id}>
                <td>{new Date(l.data).toLocaleDateString('pt-BR')}</td>
                <td className="font-bold">{l.descricao}</td>
                <td><span className="category-badge">{l.categoria}</span></td>
                <td>{l.conta}</td>
                <td className={`text-right font-bold ${l.tipo === 'Entrada' ? 'text-emerald' : 'text-red'}`}>
                  {l.tipo === 'Entrada' ? '+' : '-'} R$ {l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="text-right">
                  <button className="action-btn-global"><FileText size={16} strokeWidth={3} /></button>
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
      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Lançamento Contábil"
        subtitle="Escrituração manual para o Livro Caixa Digital"
        icon={BookOpen}
        size="md"
        footer={
          <div className="flex gap-3">
            <button className="btn-premium-outline px-8" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button 
              className="btn-premium-solid indigo px-8" 
              onClick={() => {
                dataService.saveItem('lancamentos_contabeis', { 
                  ...formData, 
                  id: Math.random().toString(36).substr(2, 9),
                  empresaId: activeCompanyId === 'Todas' ? undefined : activeCompanyId,
                  tenant_id: 'default' 
                });
                setIsModalOpen(false);
              }}
            >
              Confirmar Lançamento
            </button>
          </div>
        }
      >
        <div className="form-grid">
          <div className="form-group col-6">
            <label>Data</label>
            <input 
              type="date" 
              value={formData.data}
              onChange={(e) => setFormData({...formData, data: e.target.value})}
            />
          </div>
          <div className="form-group col-6">
            <label>Tipo</label>
            <select 
              value={formData.tipo}
              onChange={(e) => setFormData({...formData, tipo: e.target.value as 'Entrada' | 'Saída'})}
            >
              <option value="Entrada">Entrada (Receita)</option>
              <option value="Saída">Saída (Despesa)</option>
            </select>
          </div>
          <div className="form-group col-12">
            <label>Descrição</label>
            <input 
              type="text" 
              placeholder="Ex: Venda de gado conforme NF..." 
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
            />
          </div>
          <div className="form-group col-12">
            <label>Categoria</label>
            <select 
              value={formData.categoria}
              onChange={(e) => setFormData({...formData, categoria: e.target.value})}
            >
              <option value="Receita Operacional">Receita Operacional</option>
              <option value="Custo Produção">Custo Produção</option>
              <option value="Despesa Indireta">Despesa Indireta</option>
              <option value="Logística">Logística</option>
              <option value="Investimento">Investimento</option>
            </select>
          </div>
          <div className="form-group col-6">
            <label>Conta / Banco</label>
            <input 
              type="text" 
              placeholder="Ex: Banco do Brasil" 
              value={formData.conta}
              onChange={(e) => setFormData({...formData, conta: e.target.value})}
            />
          </div>
          <div className="form-group col-6">
            <label>Valor (R$)</label>
            <input 
              type="number" 
              value={formData.valor}
              onChange={(e) => setFormData({...formData, valor: Number(e.target.value)})}
            />
          </div>
        </div>
      </StandardModal>
    </div>
  );
};

