import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft,
  ChevronRight,
  Eye, 
  Edit, 
  Trash2, 
  TrendingUp,
  X, 
  Package, 
  Truck, 
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calculator,
  ArrowRight,
  Download,
  Building2,
  CreditCard,
  FileSearch,
  Check
} from 'lucide-react';
import './NotasEntrada.css';
import { INITIAL_COMPANIES, INITIAL_UNIDADES } from '../../data/initialData';
import { MOCK_SUPPLIERS } from '../../data/supplierData';
import { MOCK_INSUMOS } from '../../data/inventoryData';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';

interface ItemNota {
  id: string;
  insumoId: string;
  insumoNome: string;
  quantidade: number;
  unidade: string;
  precoUnitario: number;
  subtotal: number;
  baseIcms: number;
  valorIcms: number;
  aliquotaIcms: number;
}

interface NotaEntrada {
  id: string;
  chaveAcesso: string;
  numero: string;
  serie: string;
  dataEmissao: string;
  dataEntrada: string;
  fornecedorId: string;
  fornecedorNome: string;
  valorTotal: number;
  valorIcmsTotal: number;
  status: 'Processada' | 'Pendente' | 'Cancelada';
  empresaId: string;
  itens: ItemNota[];
}

const mockNotas: NotaEntrada[] = [
  {
    id: '1',
    chaveAcesso: '35240312345678000190550010000012341234567890',
    numero: '1234',
    serie: '1',
    dataEmissao: '2024-03-10',
    dataEntrada: '2024-03-12',
    fornecedorId: 'F1',
    fornecedorNome: 'AgroQuímica Brasil S.A.',
    valorTotal: 5500.00,
    valorIcmsTotal: 990.00,
    status: 'Processada',
    empresaId: 'M1',
    itens: []
  },
  {
    id: '2',
    chaveAcesso: '35240311222333000144550010000056785678123456',
    numero: '5678',
    serie: '1',
    dataEmissao: '2024-03-14',
    dataEntrada: '2024-03-15',
    fornecedorId: 'F2',
    fornecedorNome: 'Nutri Pantanal',
    valorTotal: 12450.00,
    valorIcmsTotal: 2241.00,
    status: 'Pendente',
    empresaId: 'F1',
    itens: []
  }
];

export const NotasEntrada = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterFornecedor, setFilterFornecedor] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedNota, setSelectedNota] = useState<NotaEntrada | null>(null);
  
  // Selection/Import State
  const [isImporting, setIsImporting] = useState(false);

  // Form State
  const [chaveAcesso, setChaveAcesso] = useState('');
  const [numero, setNumero] = useState('');
  const [serie, setSerie] = useState('1');
  const [dataEmissao, setDataEmissao] = useState('');
  const [dataEntrada, setDataEntrada] = useState(new Date().toISOString().split('T')[0]);
  const [fornecedorId, setFornecedorId] = useState('');
  const [empresaId, setEmpresaId] = useState('M1');
  const [items, setItems] = useState<ItemNota[]>([]);
  const [columnFilters, setColumnFilters] = useState({
    numero: '',
    dataEmissao: '',
    dataEntrada: '',
    fornecedorNome: '',
    valorTotal: '',
    status: 'Todos'
  });

  const filteredData = mockNotas.filter(nota => {
    const matchesSearch = 
      nota.numero.toLowerCase().includes(searchTerm.toLowerCase()) || 
      nota.fornecedorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.chaveAcesso.includes(searchTerm) ||
      nota.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.itens.some(it => it.insumoNome.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'Todos' || nota.status === filterStatus;
    const matchesFornecedor = filterFornecedor === 'Todos' || nota.fornecedorId === filterFornecedor;
    
    const matchesColumnFilters = 
      (columnFilters.numero === '' || nota.numero.includes(columnFilters.numero)) &&
      (columnFilters.dataEmissao === '' || nota.dataEmissao.includes(columnFilters.dataEmissao)) &&
      (columnFilters.dataEntrada === '' || nota.dataEntrada.includes(columnFilters.dataEntrada)) &&
      (columnFilters.fornecedorNome === '' || nota.fornecedorNome.toLowerCase().includes(columnFilters.fornecedorNome.toLowerCase())) &&
      (columnFilters.valorTotal === '' || nota.valorTotal.toString().includes(columnFilters.valorTotal)) &&
      (columnFilters.status === 'Todos' || nota.status === columnFilters.status);

    return matchesSearch && matchesStatus && matchesFornecedor && matchesColumnFilters;
  });

  const uniqueSuppliers = Array.from(new Set(mockNotas.map(n => ({ id: n.fornecedorId, nome: n.fornecedorNome }))));

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

  useEscapeKey(() => setIsModalOpen(false));

  const handleOpenModal = (nota: NotaEntrada | null = null, view = false) => {
    if (nota) {
      setSelectedNota(nota);
      setChaveAcesso(nota.chaveAcesso);
      setNumero(nota.numero);
      setSerie(nota.serie);
      setDataEmissao(nota.dataEmissao);
      setDataEntrada(nota.dataEntrada);
      setFornecedorId(nota.fornecedorId);
      setEmpresaId(nota.empresaId);
      setItems(nota.itens);
      setIsViewMode(view);
    } else {
      setSelectedNota(null);
      setChaveAcesso('');
      setNumero('');
      setSerie('1');
      setDataEmissao(new Date().toISOString().split('T')[0]);
      setDataEntrada(new Date().toISOString().split('T')[0]);
      setFornecedorId('');
      setEmpresaId('M1');
      setItems([]);
      setIsViewMode(false);
    }
    setIsModalOpen(true);
  };

  const addItemRow = () => {
    const newItem: ItemNota = {
      id: Math.random().toString(36).substr(2, 9),
      insumoId: '',
      insumoNome: '',
      quantidade: 0,
      unidade: '-',
      precoUnitario: 0,
      subtotal: 0,
      baseIcms: 0,
      valorIcms: 0,
      aliquotaIcms: 18
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof ItemNota, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        if (field === 'insumoId') {
          const insumo = MOCK_INSUMOS.find(i => i.id === value);
          if (insumo) {
            updatedItem.insumoNome = insumo.nome;
            updatedItem.unidade = insumo.unidade;
          }
        }

        const qty = field === 'quantidade' ? value : updatedItem.quantidade;
        const price = field === 'precoUnitario' ? value : updatedItem.precoUnitario;
        updatedItem.subtotal = qty * price;
        updatedItem.baseIcms = updatedItem.subtotal;
        updatedItem.valorIcms = (updatedItem.baseIcms * updatedItem.aliquotaIcms) / 100;

        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotal = () => items.reduce((acc, item) => acc + item.subtotal, 0);
  const calculateTotalIcms = () => items.reduce((acc, item) => acc + item.valorIcms, 0);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleImportOrder = (pedido: any) => {
    setFornecedorId(pedido.fornecedorId);
    setItems(pedido.itens.map((item: any) => ({
      ...item,
      id: `imported-${item.id}`,
      precoUnitario: item.preco,
      baseIcms: item.subtotal,
      valorIcms: (item.subtotal * 18) / 100, // Default 18%
      aliquotaIcms: 18
    })));
    setIsImportModalOpen(false);
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge secondary">
            <FileText size={24} />
          </div>
          <div>
            <h1>Notas de Entrada</h1>
            <p className="description">Gestão e registro fiscal de entradas de mercadorias e insumos.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-outline">
            <Download size={18} strokeWidth={3} />
            <span>XML / Importar</span>
          </button>
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Adicionar Nota</span>
          </button>
        </div>
      </div>

      <div className="invoice-summary-grid">
        <div className="summary-card glass animate-slide-up fiscal">
          <div className="summary-info">
            <span className="summary-label">Volume do Mês</span>
            <span className="summary-value">R$ 145.800</span>
            <span className="summary-subtext">24 notas registradas</span>
          </div>
          <div className="summary-icon primary">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up tax" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">ICMS Recuperável</span>
            <span className="summary-value">R$ 26.244</span>
            <span className="summary-trend up">+12% vs mês ant.</span>
          </div>
          <div className="summary-icon green">
            <Calculator size={24} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up pending" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Aguardando Entrada</span>
            <span className="summary-value">05</span>
            <span className="summary-subtext" style={{ color: 'var(--warning)', fontWeight: 700 }}>Mercadoria em trânsito</span>
          </div>
          <div className="summary-icon orange">
            <Truck size={24} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por número, fornecedor ou chave..."
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
              <th>Número / Série</th>
              <th>Emissão</th>
              <th>Entrada</th>
              <th>Fornecedor</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th className="text-center">Ações</th>
            </tr>
            {isFiltersOpen && (
              <ColumnFilters
                columns={[
                  { key: 'numero', type: 'text', placeholder: 'Filtrar...' },
                  { key: 'dataEmissao', type: 'text', placeholder: 'Data...' },
                  { key: 'dataEntrada', type: 'text', placeholder: 'Data...' },
                  { key: 'fornecedorNome', type: 'text', placeholder: 'Fornecedor...' },
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
                <td>
                  <div className="flex flex-col">
                    <span className="font-bold" style={{ color: 'var(--text-main)' }}>{nota.numero}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Série {nota.serie}</span>
                  </div>
                </td>
                <td>{new Date(nota.dataEmissao).toLocaleDateString()}</td>
                <td>{new Date(nota.dataEntrada).toLocaleDateString()}</td>
                <td>
                  <div className="solicitante-cell">
                    <div className="avatar-circle primary">
                      {nota.fornecedorNome.charAt(0)}
                    </div>
                    <span className="font-medium" style={{ color: 'var(--text-main)' }}>{nota.fornecedorNome}</span>
                  </div>
                </td>
                <td className="font-bold">R$ {nota.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>
                  <span className={`status-indicator ${nota.status === 'Processada' ? 'status-aprovado' : 'status-pendente'}`}>
                    {nota.status === 'Processada' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    {nota.status}
                  </span>
                </td>
                <td className="text-center">
                  <div className="actions-cell flex-center">
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

      {isModalOpen && (
      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isViewMode ? 'Visualizar Nota' : (selectedNota ? 'Editar Nota' : 'Adicionar Nota de Entrada')}
        subtitle="Registro fiscal e estoque de entrada de mercadorias."
        icon={FileText}
        size="xl"
        footer={
          <>
            <div className="invoice-footer-totals">
              <div className="total-item">
                <span className="label">Total Base ICMS</span>
                <span className="value">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="total-item">
                <span className="label">Total ICMS</span>
                <span className="value">R$ {calculateTotalIcms().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="total-item highlight">
                <span className="label">Valor Total da Nota</span>
                <span className="value">R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="footer-actions ml-auto flex gap-3">
              <button type="button" className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              {!isViewMode && (
                <button type="button" className="btn-premium-solid indigo" onClick={() => setIsModalOpen(false)}>
                  <Check size={18} strokeWidth={3} />
                  <span>{selectedNota ? 'Salvar Alterações' : 'Adicionar Nota'}</span>
                </button>
              )}
            </div>
          </>
        }
      >
        <div className="form-sections-grid">
          {!selectedNota && !isViewMode && (
            <div className="form-section full-width mb-0">
              <div className="import-section-trigger animate-slide-in" onClick={() => setIsImportModalOpen(true)}>
                <div className="import-info">
                  <div className="import-icon">
                    <Download size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold" style={{ color: 'var(--primary-indigo)' }}>Importar de Pedido de Compra</h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Agilize o lançamento puxando dados de um pedido já aprovado.</p>
                  </div>
                </div>
                <button type="button" className="btn-premium-solid btn-sm">
                  <ArrowRight size={16} strokeWidth={3} />
                  <span>Selecionar Pedido</span>
                </button>
              </div>

              {isImportModalOpen && (
                <div className="order-picker-overlay card glass animate-scale">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold">Selecione o Pedido</h4>
                    <button onClick={(e) => { e.stopPropagation(); setIsImportModalOpen(false); }} className="close-btn"><X size={18} /></button>
                  </div>
                  <div className="picker-list">
                    {[
                      { id: '1', numero: 'PC-2024-001', fornecedorNome: 'AgroQuímica S.A.', fornecedorId: 'f1', valorTotal: 680, itens: [{ id: 'i1', insumoId: 's7', insumoNome: 'Sal Mineral', quantidade: 200, unidade: 'kg', preco: 3.40, subtotal: 680 }] },
                      { id: '2', numero: 'PC-2024-002', fornecedorNome: 'Nutri Pantanal', fornecedorId: 'f2', valorTotal: 4660, itens: [{ id: 'i2', insumoId: 's8', insumoNome: 'Ração', quantidade: 2, unidade: 'ton', preco: 2380, subtotal: 4660 }] }
                    ].map(p => (
                      <div key={p.id} className="picker-item" onClick={(e) => { e.stopPropagation(); handleImportOrder(p); }}>
                        <div className="picker-item-info">
                          <strong>{p.numero}</strong>
                          <span>{p.fornecedorNome}</span>
                        </div>
                        <div className="picker-item-value">R$ {p.valorTotal.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="form-section">
            <div className="section-title">
              <FileSearch size={16} />
              Dados do Documento Fiscal
            </div>
            
            <div className="form-grid mt-4">
              <div className="form-group col-12">
                <label>Chave de Acesso (44 dígitos)</label>
                <input 
                  type="text" 
                  value={chaveAcesso} 
                  onChange={(e) => setChaveAcesso(e.target.value)}
                  placeholder="0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000"
                  disabled={isViewMode}
                />
              </div>
              <div className="form-group col-3">
                <label>Número NF</label>
                <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} disabled={isViewMode} />
              </div>
              <div className="form-group col-2">
                <label>Série</label>
                <input type="text" value={serie} onChange={(e) => setSerie(e.target.value)} disabled={isViewMode} />
              </div>
              <div className="form-group col-3">
                <label>Emissão</label>
                <input type="date" value={dataEmissao} onChange={(e) => setDataEmissao(e.target.value)} disabled={isViewMode} />
              </div>
              <div className="form-group col-4">
                <label>Entrada / Receb.</label>
                <input type="date" value={dataEntrada} onChange={(e) => setDataEntrada(e.target.value)} disabled={isViewMode} />
              </div>

              <div className="form-group col-7">
                <label>Fornecedor</label>
                <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)} disabled={isViewMode}>
                  <option value="">Selecione o fornecedor...</option>
                  {MOCK_SUPPLIERS.map(s => (
                    <option key={s.id} value={s.id}>{s.nomeFantasia}</option>
                  ))}
                </select>
              </div>
              <div className="form-group col-5">
                <label>Empresa Destinatária</label>
                <select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)} disabled={isViewMode}>
                  {INITIAL_COMPANIES.filter(c => c.status === 'Ativa').map(c => (
                    <option key={c.id} value={c.id}>{c.nomeFantasia}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="flex justify-between items-center mb-4">
              <h3 className="section-title">
                <Package size={18} />
                Itens e Impostos
              </h3>
              {!isViewMode && (
                <button type="button" className="btn-premium-solid btn-sm" onClick={addItemRow}>
                  <Plus size={16} strokeWidth={3} />
                  <span>Adicionar Item</span>
                </button>
              )}
            </div>

            <div className="items-table-container">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Produto / Insumo</th>
                    <th>Qtd / Un</th>
                    <th>Unitário</th>
                    <th>Subtotal</th>
                    <th>BC ICMS</th>
                    <th>Alíq %</th>
                    <th>Vlr ICMS</th>
                    {!isViewMode && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="animate-slide-in">
                      <td className="item-input-cell">
                        <select 
                          value={item.insumoId} 
                          onChange={(e) => updateItem(item.id, 'insumoId', e.target.value)}
                          disabled={isViewMode}
                        >
                          <option value="">Buscar insumo...</option>
                          {MOCK_INSUMOS.map(i => (
                            <option key={i.id} value={i.id}>{i.nome}</option>
                          ))}
                        </select>
                      </td>
                      <td className="item-input-cell" style={{ width: '100px' }}>
                        <div className="flex items-center gap-1">
                          <input type="number" value={item.quantidade} onChange={(e) => updateItem(item.id, 'quantidade', parseFloat(e.target.value))} disabled={isViewMode} />
                          <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>{item.unidade}</span>
                        </div>
                      </td>
                      <td className="item-input-cell">
                        <input type="number" value={item.precoUnitario} onChange={(e) => updateItem(item.id, 'precoUnitario', parseFloat(e.target.value))} disabled={isViewMode} />
                      </td>
                      <td className="font-medium" style={{ color: 'var(--text-main)' }}>R$ {item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="item-input-cell">
                        <input type="number" value={item.baseIcms} onChange={(e) => updateItem(item.id, 'baseIcms', parseFloat(e.target.value))} disabled={isViewMode} />
                      </td>
                      <td className="item-input-cell" style={{ width: '70px' }}>
                        <input type="number" value={item.aliquotaIcms} onChange={(e) => updateItem(item.id, 'aliquotaIcms', parseFloat(e.target.value))} disabled={isViewMode} />
                      </td>
                      <td className="font-medium" style={{ color: 'var(--text-main)' }}>R$ {item.valorIcms.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      {!isViewMode && (
                        <td>
                          <button className="text-red-500 hover:text-red-700" onClick={() => setItems(items.filter(i => i.id !== item.id))}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </StandardModal>
      )}
    </div>
  );
};

