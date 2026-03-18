
import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  Edit, 
  Download, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Filter, 
  Package, 
  User, 
  Calculator,
  ArrowRight,
  TrendingDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import './NotasSaida.css';
import { INITIAL_COMPANIES } from '../../data/initialData';
import { mockClients } from './Cliente';

interface Client {
  id: string;
  nome: string;
}

interface ItemNotaSaida {
  id: string;
  produtoNome: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
  subtotal: number;
}

interface NotaSaida {
  id: string;
  numero: string;
  serie: string;
  dataEmissao: string;
  clienteId: string;
  clienteNome: string;
  valorTotal: number;
  status: 'Processada' | 'Pendente' | 'Cancelada';
  itens: ItemNotaSaida[];
}

const mockNotasSaida: NotaSaida[] = [
  {
    id: '1',
    numero: '1001',
    serie: '1',
    dataEmissao: '2024-03-12',
    clienteId: 'C1',
    clienteNome: 'Frigorífico Boi Gordo',
    valorTotal: 450000.00,
    status: 'Processada',
    itens: [
      { id: 'i1', produtoNome: 'Boi Gordo - Lote 04', quantidade: 50, unidade: 'cab', precoUnitario: 9000, subtotal: 450000 }
    ]
  }
];

export const NotasSaida = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterCliente, setFilterCliente] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNota, setSelectedNota] = useState<NotaSaida | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    numero: '',
    emissao: '',
    cliente: '',
    valorTotal: '',
    status: 'Todos'
  });

  // Form State
  const [numero, setNumero] = useState('');
  const [serie, setSerie] = useState('1');
  const [dataEmissao, setDataEmissao] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [items, setItems] = useState<ItemNotaSaida[]>([]);
  const [gerarFinanceiro, setGerarFinanceiro] = useState(true);
  const [dataVencimento, setDataVencimentoFinanceiro] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Boleto');

  const handleOpenModal = (nota: NotaSaida | null = null, view = false) => {
    if (nota) {
      setSelectedNota(nota);
      setNumero(nota.numero);
      setSerie(nota.serie);
      setDataEmissao(nota.dataEmissao);
      setClienteId(nota.clienteId);
      setItems(nota.itens);
      setIsViewMode(view);
    } else {
      setSelectedNota(null);
      setNumero('');
      setSerie('1');
      setDataEmissao(new Date().toISOString().split('T')[0]);
      setClienteId('');
      setItems([]);
      setGerarFinanceiro(true);
      setDataVencimentoFinanceiro(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setFormaPagamento('Boleto');
      setIsViewMode(false);
    }
    setIsModalOpen(true);
  };

  const filteredData = mockNotasSaida.filter(nota => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = nota.numero.toLowerCase().includes(searchLower) || 
                         nota.clienteNome.toLowerCase().includes(searchLower) ||
                         nota.dataEmissao.toLowerCase().includes(searchLower) ||
                         nota.status.toLowerCase().includes(searchLower) ||
                         nota.valorTotal.toString().includes(searchLower) ||
                         nota.serie.toLowerCase().includes(searchLower);
    const matchesStatus = filterStatus === 'Todos' || nota.status === filterStatus;
    const matchesCliente = filterCliente === 'Todos' || nota.clienteId === filterCliente;
    
    const matchesColumnFilters = 
      (columnFilters.numero === '' || nota.numero.toLowerCase().includes(columnFilters.numero.toLowerCase())) &&
      (columnFilters.emissao === '' || new Date(nota.dataEmissao).toLocaleDateString().includes(columnFilters.emissao)) &&
      (columnFilters.cliente === '' || nota.clienteNome.toLowerCase().includes(columnFilters.cliente.toLowerCase())) &&
      (columnFilters.valorTotal === '' || nota.valorTotal.toString().includes(columnFilters.valorTotal)) &&
      (columnFilters.status === 'Todos' || nota.status === columnFilters.status);

    return matchesSearch && matchesStatus && matchesCliente && matchesColumnFilters;
  });

  const uniqueClients = Array.from(new Set(mockNotasSaida.map(n => ({ id: n.clienteId, nome: n.clienteNome }))));

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
  } = usePagination({ data: filteredData, initialItemsPerPage: 10 });

  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <FileText size={32} />
          </div>
          <div>
            <h1>Inteligência Fiscal</h1>
            <p className="description">Emissão, controle de notas de saída e integração financeira estratégica.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-outline">
            <Download size={18} strokeWidth={3} />
            <span>Exportar Arquivos</span>
          </button>
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Nova Nota de Saída</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card glass animate-slide-up">
          <div className="summary-info">
            <span className="summary-label">Faturamento Mensal</span>
            <span className="summary-value">R$ 1.25M</span>
            <span className="summary-subtext desc">Meta atingida: 82%</span>
          </div>
          <div className="summary-icon indigo">
            <TrendingUp size={28} />
          </div>
        </div>

        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Notas Pendentes</span>
            <span className="summary-value">03</span>
            <span className="summary-subtext desc">Aguardando SEFAZ</span>
          </div>
          <div className="summary-icon orange">
            <Clock size={28} />
          </div>
        </div>

        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Carga Tributária</span>
            <span className="summary-value">R$ 45.2k</span>
            <span className="summary-subtext desc">Funrural / ICMS</span>
          </div>
          <div className="summary-icon emerald">
            <Calculator size={28} />
          </div>
        </div>

        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Saídas de Gado</span>
            <span className="summary-value">120 <small>cab</small></span>
            <span className="summary-subtext desc">No período atual</span>
          </div>
          <div className="summary-icon blue">
            <ArrowRight size={28} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por número, cliente ou chave..."
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
              <th>Número</th>
              <th>Emissão</th>
              <th>Cliente</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
            {isFiltersOpen && (
              <ColumnFilters
                columns={[
                  { key: 'numero', type: 'text', placeholder: 'Filtrar...' },
                  { key: 'emissao', type: 'text', placeholder: 'Data...' },
                  { key: 'cliente', type: 'text', placeholder: 'Filtrar...' },
                  { key: 'valorTotal', type: 'text', placeholder: 'Valor...' },
                  { key: 'status', type: 'select', options: ['Processada', 'Pendente', 'Cancelada'] }
                ]}
                values={columnFilters}
                onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                showActionsPadding={true}
              />
            )}
          </thead>
          <tbody>
            {paginatedData.map(nota => (
              <tr key={nota.id}>
                <td className="font-bold">NF {nota.numero}</td>
                <td>{new Date(nota.dataEmissao).toLocaleDateString()}</td>
                <td>{nota.clienteNome}</td>
                <td className="font-bold">R$ {nota.valorTotal.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${nota.status.toLowerCase()}`}>
                    {nota.status}
                  </span>
                </td>
                <td className="text-right">
                  <div className="actions-cell">
                    <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(nota, true)}>
                      <Eye size={18} strokeWidth={3} />
                    </button>
                    <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(nota)}>
                      <Edit size={18} strokeWidth={3} />
                    </button>
                    <button className="action-btn-global btn-delete" title="Excluir">
                      <Trash2 size={18} strokeWidth={3} />
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
          label="notas"
        />
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isViewMode ? 'Visualizar Nota' : (selectedNota ? 'Editar Nota' : 'Nova Nota de Saída')}
        subtitle="Emissão de documento fiscal de venda."
        icon={FileText}
        footer={
          <div className="footer-actions flex gap-3">
            <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            {!isViewMode && (
              <button className="btn-premium-solid indigo" onClick={() => setIsModalOpen(false)}>
                <CheckCircle2 size={18} strokeWidth={3} />
                <span>{selectedNota ? 'Salvar Alterações' : 'Emitir Nota & Integrar'}</span>
              </button>
            )}
          </div>
        }
        size="lg"
      >
        <div className="form-sections-grid">
           <div className="form-section">
             <div className="form-grid">
               <div className="form-group col-3">
                  <label>Número NF</label>
                  <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} disabled={isViewMode} />
               </div>
               <div className="form-group col-2">
                  <label>Série</label>
                  <input type="text" value={serie} onChange={(e) => setSerie(e.target.value)} disabled={isViewMode} />
               </div>
               <div className="form-group col-7">
                  <label>Data de Emissão</label>
                  <input type="date" value={dataEmissao} onChange={(e) => setDataEmissao(e.target.value)} disabled={isViewMode} />
               </div>
               <div className="form-group col-12">
                  <label>Cliente</label>
                  <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} disabled={isViewMode}>
                    <option value="">Selecione o cliente...</option>
                    {mockClients.map((c: Client) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
               </div>
             </div>
           </div>

           <div className="form-section">
              <div className="integration-box animate-fade-in" style={{ background: 'rgba(79, 70, 229, 0.05)', padding: '20px', borderRadius: '16px', border: '1px border var(--primary-light)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <h4 style={{ margin: 0, color: 'var(--primary-indigo)', fontWeight: 700 }}>Integração Financeira</h4>
                     <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gerar automaticamente lançamento no Contas a Receber</p>
                   </div>
                   <div className="custom-switch">
                     <input 
                       type="checkbox" 
                       id="gerarFinanceiro" 
                       checked={gerarFinanceiro} 
                       onChange={(e) => setGerarFinanceiro(e.target.checked)}
                       disabled={isViewMode}
                     />
                     <label htmlFor="gerarFinanceiro"></label>
                   </div>
                 </div>

                 {gerarFinanceiro && (
                   <div className="form-grid mt-6 animate-slide-up">
                     <div className="form-group col-6">
                       <label>Data de Vencimento</label>
                       <input 
                         type="date" 
                         value={dataVencimento} 
                         onChange={(e) => setDataVencimentoFinanceiro(e.target.value)}
                         disabled={isViewMode}
                       />
                     </div>
                     <div className="form-group col-6">
                       <label>Forma de Pagamento</label>
                       <select 
                         value={formaPagamento} 
                         onChange={(e) => setFormaPagamento(e.target.value)}
                         disabled={isViewMode}
                       >
                         <option value="Boleto">Boleto Bancário</option>
                         <option value="Pix">Pix / Transferência</option>
                         <option value="Cartao">Cartão de Crédito</option>
                         <option value="Dinheiro">Dinheiro</option>
                       </select>
                     </div>
                   </div>
                 )}
               </div>
            </div>
        </div>
      </StandardModal>
    </div>
  );
};

