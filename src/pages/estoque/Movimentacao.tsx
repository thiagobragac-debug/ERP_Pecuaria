import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  MoreHorizontal,
  X,
  Package,
  User,
  Info,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Warehouse,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import './Movimentacao.css';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';

interface Movimentacao {
  id: string;
  insumo: string;
  localEstoque: string;
  localDestino?: string;
  tipo: 'Entrada' | 'Saída' | 'Transferência';
  quantidade: number;
  unidade: string;
  motivo: string;
  data: string;
  responsavel: string;
  status: 'Processado' | 'Pendente' | 'Cancelado';
}

const mockMovimentacoes: Movimentacao[] = [
  { 
    id: '1', 
    insumo: 'Milho Grão', 
    localEstoque: 'Depósito Central',
    tipo: 'Entrada', 
    quantidade: 5000, 
    unidade: 'kg', 
    motivo: 'Compra Manual (Produtor Local)', 
    data: '2024-03-12T10:30:00', 
    responsavel: 'João Silva',
    status: 'Processado'
  },
  { 
    id: '2', 
    insumo: 'Ivermectina 1%', 
    localEstoque: 'Farmácia Veterinária',
    tipo: 'Saída', 
    quantidade: 5, 
    unidade: 'un', 
    motivo: 'Ajuste de Inventário (Quebra)', 
    data: '2024-03-11T15:45:00', 
    responsavel: 'Dr. Ricardo',
    status: 'Processado'
  },
  { 
    id: '3', 
    insumo: 'Sal Mineral 80', 
    localEstoque: 'Depósito Central',
    tipo: 'Entrada', 
    quantidade: 20, 
    unidade: 'sc (30kg)', 
    motivo: 'Devolução de Lote', 
    data: '2024-03-13T08:15:00', 
    responsavel: 'Maria Oliveira',
    status: 'Pendente'
  },
  { 
    id: '4', 
    insumo: 'Sal Mineral 80', 
    localEstoque: 'Depósito Central',
    localDestino: 'Galpão de Nutrição',
    tipo: 'Transferência', 
    quantidade: 200, 
    unidade: 'kg', 
    motivo: 'Transferência de saldo para uso imediato', 
    data: '2024-03-14T09:00:00', 
    responsavel: 'João Silva',
    status: 'Processado'
  },
];

export const Movimentacao = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    insumo: '',
    localEstoque: 'Todos os Locais',
    tipo: 'Todos',
    status: 'Todos',
    responsavel: ''
  });
  const [selectedMov, setSelectedMov] = useState<Movimentacao | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [movType, setMovType] = useState<'Entrada' | 'Saída' | 'Transferência'>('Entrada');

  const handleOpenModal = (mov: Movimentacao | null = null, viewOnly = false) => {
    setSelectedMov(mov);
    setIsViewMode(viewOnly);
    setMovType(mov?.tipo || 'Entrada');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMov(null);
    setIsViewMode(false);
  };

  const totalEntradas = mockMovimentacoes
    .filter(m => m.tipo === 'Entrada')
    .reduce((acc, m) => acc + m.quantidade, 0);
  
  const totalSaidas = mockMovimentacoes
    .filter(m => m.tipo === 'Saída')
    .reduce((acc, m) => acc + m.quantidade, 0);

  const filteredData = mockMovimentacoes.filter(m => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = m.insumo.toLowerCase().includes(searchLower) || 
                         m.motivo.toLowerCase().includes(searchLower) ||
                         m.responsavel.toLowerCase().includes(searchLower) ||
                         m.localEstoque.toLowerCase().includes(searchLower) ||
                         (m.localDestino && m.localDestino.toLowerCase().includes(searchLower)) ||
                         m.tipo.toLowerCase().includes(searchLower) ||
                         m.status.toLowerCase().includes(searchLower) ||
                         m.quantidade.toString().includes(searchLower) ||
                         m.unidade.toLowerCase().includes(searchLower);
    
    const matchesColumnFilters = 
      (columnFilters.insumo === '' || m.insumo.toLowerCase().includes(columnFilters.insumo.toLowerCase())) &&
      (columnFilters.localEstoque === 'Todos os Locais' || m.localEstoque === columnFilters.localEstoque) &&
      (columnFilters.tipo === 'Todos' || m.tipo === columnFilters.tipo) &&
      (columnFilters.status === 'Todos' || m.status === columnFilters.status) &&
      (columnFilters.responsavel === '' || m.responsavel.toLowerCase().includes(columnFilters.responsavel.toLowerCase()));

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
  } = usePagination({ data: filteredData, initialItemsPerPage: 10 });

  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge secondary">
            <ArrowLeftRight size={24} strokeWidth={3} />
          </div>
          <div>
            <h1>Movimentação de Estoque</h1>
            <p className="description">Registro manual de entradas, saídas e ajustes de inventário.</p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-premium-outline h-11 px-6 gap-2">
            <Download size={18} strokeWidth={3} />
            <span>Relatório de Movimento</span>
          </button>
          <button className="btn-premium-solid indigo h-11 px-6 gap-2" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Nova Movimentação</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card card glass animate-slide-up">
          <div className="summary-info">
            <span className="summary-label">Entradas (30 dias)</span>
            <span className="summary-value">{totalEntradas.toLocaleString('pt-BR')} <small>kg/un</small></span>
            <span className="summary-trend up">
              <TrendingUp size={14} /> +12% vs mês ant.
            </span>
          </div>
          <div className="summary-icon green">
            <ArrowUpRight size={24} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Saídas (30 dias)</span>
            <span className="summary-value">{totalSaidas.toLocaleString('pt-BR')} <small>kg/un</small></span>
            <span className="summary-trend down">
              <TrendingDown size={14} /> -5% vs mês ant.
            </span>
          </div>
          <div className="summary-icon red">
            <ArrowDownLeft size={24} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Ajustes / Perdas</span>
            <span className="summary-value">R$ 1.240,00</span>
            <span className="summary-subtext">Valor acumulado</span>
          </div>
          <div className="summary-icon orange">
            <AlertTriangle size={24} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Giro de Estoque</span>
            <span className="summary-value">1.4x</span>
            <span className="summary-subtext">Média mensal</span>
          </div>
          <div className="summary-icon blue">
            <TrendingUp size={24} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por insumo, motivo ou responsável..."
          actionsLabel="Filtragem"
        >
          <button 
            className={`btn-premium-outline h-11 px-6 gap-2 ${isFiltersOpen ? 'filter-active' : ''}`}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter size={18} strokeWidth={3} />
            <span>{isFiltersOpen ? 'Fechar Filtros' : 'Filtros Avançados'}</span>
          </button>
        </TableFilters>


        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Insumo</th>
                <th>Local</th>
                <th>Quantidade</th>
                <th>Data / Hora</th>
                <th>Responsável</th>
                <th>Motivo</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'tipo', type: 'select', options: ['Entrada', 'Saída', 'Transferência'] },
                    { key: 'insumo', type: 'text', placeholder: 'Insumo...' },
                    { key: 'localEstoque', type: 'select', options: ['Depósito Central', 'Farmácia Veterinária', 'Galpão de Nutrição'] },
                    { key: 'quantidade', type: 'empty' },
                    { key: 'data', type: 'empty' },
                    { key: 'responsavel', type: 'text', placeholder: 'Responsável...' },
                    { key: 'motivo', type: 'text', placeholder: 'Motivo...' },
                    { key: 'status', type: 'select', options: ['Processado', 'Pendente', 'Cancelado'] }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((mov) => (
                <tr key={mov.id}>
                  <td>
                    <span className={`movement-type ${mov.tipo.toLowerCase()}`}>
                        {mov.tipo === 'Entrada' ? <ArrowUpRight size={14} /> : 
                         mov.tipo === 'Saída' ? <ArrowDownLeft size={14} /> : 
                         <ArrowLeftRight size={14} />}
                        {mov.tipo}
                    </span>
                  </td>
                  <td className="font-bold">{mov.insumo}</td>
                  <td>
                    <div className="location-cell">
                      <Warehouse size={14} />
                      {mov.tipo === 'Transferência' ? (
                        <span className="transfer-path">
                          {mov.localEstoque} <ChevronRight size={12} /> {mov.localDestino}
                        </span>
                      ) : mov.localEstoque}
                    </div>
                  </td>
                  <td className="font-semibold text-primary">{mov.quantidade} {mov.unidade}</td>
                  <td>
                    <div className="datetime-cell">
                        <span className="date">{new Date(mov.data).toLocaleDateString('pt-BR')}</span>
                        <span className="time">{new Date(mov.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </td>
                  <td>
                    <div className="user-info-cell">
                        <User size={14} />
                        {mov.responsavel}
                    </div>
                  </td>
                  <td title={mov.motivo} className="truncate-cell">{mov.motivo}</td>
                  <td>
                    <span className={`status-badge mov-${mov.status.toLowerCase()}`}>
                      {mov.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="table-actions">
                      <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(mov, true)}>
                        <Eye size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(mov)}>
                        <Edit size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-delete" title="Excluir" onClick={() => {}}>
                        <Trash2 size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
          label="movimentações"
        />
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? 'Detalhes da Movimentação' : (selectedMov ? 'Editar Movimentação' : 'Nova Movimentação de Estoque')}
        subtitle="O ajuste manual de estoque impacta diretamente o saldo físico e financeiro do almoxarifado."
        icon={ArrowLeftRight}
        size="lg"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button type="button" className="btn-premium-outline px-8" onClick={handleCloseModal}>Cancelar</button>
            {!isViewMode && <button type="button" className="btn-premium-solid indigo px-8" onClick={handleCloseModal}>Confirmar Movimentação</button>}
          </div>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCloseModal(); }}>
          <div className="form-grid">
            <div className="form-group col-12">
              <label>Tipo de Movimento</label>
              <div className={`radio-group flex gap-3 ${isViewMode ? 'disabled opacity-60' : ''}`} style={{ background: 'var(--bg-light)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label className={`radio-label cursor-pointer p-2 rounded transition-all flex-1 text-center ${movType === 'Entrada' ? 'bg-emerald-50 text-emerald-600 font-bold' : ''}`}>
                      <input 
                        type="radio" 
                        name="tipo" 
                        value="Entrada" 
                        className="hidden"
                        checked={movType === 'Entrada'} 
                        onChange={() => !isViewMode && setMovType('Entrada')}
                        disabled={isViewMode} 
                      />
                      Entrada
                  </label>
                  <label className={`radio-label cursor-pointer p-2 rounded transition-all flex-1 text-center ${movType === 'Saída' ? 'bg-rose-50 text-rose-600 font-bold' : ''}`}>
                      <input 
                        type="radio" 
                        name="tipo" 
                        value="Saída" 
                        className="hidden"
                        checked={movType === 'Saída'} 
                        onChange={() => !isViewMode && setMovType('Saída')}
                        disabled={isViewMode} 
                      />
                      Saída
                  </label>
                  <label className={`radio-label cursor-pointer p-2 rounded transition-all flex-1 text-center ${movType === 'Transferência' ? 'bg-indigo-50 text-indigo-600 font-bold' : ''}`}>
                      <input 
                        type="radio" 
                        name="tipo" 
                        value="Transferência" 
                        className="hidden"
                        checked={movType === 'Transferência'} 
                        onChange={() => !isViewMode && setMovType('Transferência')}
                        disabled={isViewMode} 
                      />
                      Transferência
                  </label>
              </div>
            </div>
            <div className="form-group col-8">
              <label>Insumo / Produto</label>
              <div className="input-with-icon">
                  <input type="text" defaultValue={selectedMov?.insumo} disabled={isViewMode} required placeholder="Buscar produto no estoque..." className="w-full" />
                  <Package size={18} className="field-icon" />
              </div>
            </div>
            <div className="form-group col-4">
              <label>Quantidade</label>
              <div className="input-with-unit flex">
                  <input type="number" step="0.01" defaultValue={selectedMov?.quantidade} disabled={isViewMode} required className="flex-1 rounded-r-none" />
                  <span className="unit-label p-2 bg-slate-100 border border-l-0 rounded-r text-xs flex items-center">{selectedMov?.unidade || 'un'}</span>
              </div>
            </div>
            <div className="form-group col-6">
              <label>Data da Movimentação</label>
              <div className="input-with-icon">
                <input type="datetime-local" defaultValue={selectedMov?.data.substring(0, 16)} disabled={isViewMode} required className="w-full" />
                <Calendar size={18} className="field-icon" />
              </div>
            </div>
            <div className="form-group col-6">
              <label>Responsável</label>
              <div className="input-with-icon">
                <input type="text" defaultValue={selectedMov?.responsavel} disabled={isViewMode} required className="w-full" />
                <User size={18} className="field-icon" />
              </div>
            </div>
            <div className="form-group col-12">
              <label>Motivo / Justificativa</label>
              <div className="input-with-icon">
                <textarea rows={2} defaultValue={selectedMov?.motivo} disabled={isViewMode} required placeholder="Ex: Quebra de frasco, ajuste de inventário cíclico, devolução..." className="w-full" />
                <Info size={18} className="field-icon" />
              </div>
            </div>
            
            <div className="form-group col-6">
              <label>{movType === 'Transferência' ? 'Local de Origem' : 'Almoxarifado / Local'}</label>
              <div className="input-with-icon">
                <select disabled={isViewMode} defaultValue={selectedMov?.localEstoque} className="w-full">
                    <option>Depósito Central</option>
                    <option>Farmácia Veterinária</option>
                    <option>Galpão de Nutrição</option>
                </select>
                <Warehouse size={18} className="field-icon" />
              </div>
            </div>
            {movType === 'Transferência' ? (
              <div className="form-group col-6">
                <label>Local de Destino</label>
                <div className="input-with-icon">
                  <select disabled={isViewMode} defaultValue={selectedMov?.localDestino} className="w-full">
                      <option value="">Selecione o destino...</option>
                      <option>Depósito Central</option>
                      <option>Farmácia Veterinária</option>
                      <option>Galpão de Nutrição</option>
                  </select>
                  <Warehouse size={18} className="field-icon" />
                </div>
              </div>
            ) : (
                <div className="form-group col-6"></div>
            )}
          </div>

          {!isViewMode && (
              <div className={`info-box mt-6 p-4 rounded-lg flex gap-3 ${movType === 'Transferência' ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-800'}`}>
                  {movType === 'Transferência' ? <Info size={18} /> : <AlertTriangle size={18} />}
                  <p className="text-sm">
                    {movType === 'Transferência' 
                      ? <strong>Custo Médio:</strong> 
                      : <strong>Atenção:</strong>}
                    {movType === 'Transferência'
                      ? ' A saída do local de origem será feita pelo custo médio atual. O local de destino recalculará seu custo médio com base neste valor.'
                      : ' Movimentações manuais não possuem rastreabilidade automática via outros módulos. Use com cautela.'}
                  </p>
              </div>
          )}
        </form>
      </StandardModal>
    </div>
  );
};

