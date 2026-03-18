import React, { useState } from 'react';
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
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import './PlanoContas.css'; // Reusing general accounting styles

interface Lancamento {
  id: string;
  data: string;
  descricao: string;
  categoria: string;
  tipo: 'Entrada' | 'Saída';
  valor: number;
  conta: string;
}

const mockLancamentos: Lancamento[] = [
  { id: '1', data: '2024-03-15', descricao: 'Venda de Gado - Lote 12', categoria: 'Receita Operacional', tipo: 'Entrada', valor: 45200.00, conta: 'Banco do Brasil' },
  { id: '2', data: '2024-03-14', descricao: 'Compra de Insumos - Nutribase', categoria: 'Custo Produção', tipo: 'Saída', valor: 12500.00, conta: 'Itaú Rural' },
  { id: '3', data: '2024-03-12', descricao: 'Energia Elétrica - Sede', categoria: 'Despesa Indireta', tipo: 'Saída', valor: 850.40, conta: 'Banco do Brasil' },
  { id: '4', data: '2024-03-10', descricao: 'Adiantamento Frete', categoria: 'Logística', tipo: 'Saída', valor: 2200.00, conta: 'Dinheiro/Caixa' },
];

export const LivroCaixa = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [filterCategoria, setFilterCategoria] = useState('Todos');
  const [columnFilters, setColumnFilters] = useState({
    data: '',
    descricao: '',
    categoria: 'Todos',
    conta: '',
    valor: ''
  });

  const filteredLancamentos = mockLancamentos.filter(l => {
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
          <button className="btn-premium-solid indigo">
            <Plus size={18} strokeWidth={3} />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card glass animate-slide-up">
          <div className="summary-info">
            <span className="summary-label">Entradas (Mês)</span>
            <span className="summary-value text-emerald">R$ 158.4k</span>
            <span className="summary-trend up"><TrendingUp size={14} /> +8%</span>
          </div>
          <div className="summary-icon green">
            <ArrowUpRight size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Saídas (Mês)</span>
            <span className="summary-value text-red">R$ 92.1k</span>
            <span className="summary-trend down"><TrendingDown size={14} /> -3%</span>
          </div>
          <div className="summary-icon red">
            <ArrowDownLeft size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Saldo Acumulado</span>
            <span className="summary-value">R$ 66.3k</span>
            <span className="summary-subtext">Disponibilidade atual</span>
          </div>
          <div className="summary-icon blue">
            <DollarSign size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Lançamentos</span>
            <span className="summary-value">124</span>
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
    </div>
  );
};

