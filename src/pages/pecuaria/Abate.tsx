import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Beef, Plus, Search, Filter, ChevronLeft, ChevronRight, Eye, Edit, Trash2, Calendar, ClipboardList, CheckCircle2, TrendingUp, TrendingDown, Clock, X } from 'lucide-react';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';
import { Abate as AbateType, Lote } from '../../types';
import { useCompany } from '../../contexts/CompanyContext';
import { useAuth } from '../../contexts/AuthContext';
import { SummaryCard } from '../../components/SummaryCard';
import { SearchableSelect } from '../../components/SearchableSelect';
import { StatusBadge } from '../../components/StatusBadge';
import './Abate.css';

export const Abate = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [selectedAbate, setSelectedAbate] = useState<AbateType | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const { activeCompanyId } = useCompany();
  const { currentOrg } = useAuth();
  
  const [formData, setFormData] = useState<Partial<AbateType>>({
    status: 'Agendado',
    data: new Date().toISOString().substring(0, 10),
    rendimentoProjetado: 54
  });
  
  // Live Queries
  const allAbates = useLiveQuery(() => db.abates.toArray()) || [];
  const allLotes = useLiveQuery(() => db.lotes.toArray()) || [];

  const abates = allAbates.filter(a => activeCompanyId === 'Todas' || a.empresaId === activeCompanyId);
  const lotes = allLotes.filter(l => activeCompanyId === 'Todas' || l.empresaId === activeCompanyId);
  const [columnFilters, setColumnFilters] = useState({
    lote: '',
    data: '',
    frigorifico: '',
    status: 'Todos'
  });

  const handleOpenModal = (abate: AbateType | null = null, viewOnly = false) => {
    if (abate) {
      setSelectedAbate(abate);
      setFormData({ ...abate });
    } else {
      setSelectedAbate(null);
      setFormData({
        status: 'Agendado',
        data: new Date().toISOString().substring(0, 10),
        rendimentoProjetado: 54,
        empresaId: activeCompanyId !== 'Todas' ? activeCompanyId : undefined
      });
    }
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAbate(null);
    setIsViewMode(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lote_id || !formData.data || !formData.frigorifico) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const newAbate: AbateType = {
      ...selectedAbate!,
      id: selectedAbate?.id || Math.random().toString(36).substr(2, 9),
      lote_id: formData.lote_id,
      data: formData.data!,
      frigorifico: formData.frigorifico!,
      status: formData.status as any,
      rendimentoProjetado: formData.rendimentoProjetado || 54,
      empresaId: formData.empresaId || activeCompanyId,
      tenant_id: currentOrg?.id || 'default'
    };

    await dataService.saveItem('abates', newAbate);
    handleCloseModal();
  };

  const totals = {
    programados: abates.filter(a => a.status === 'Agendado').length,
    concluidos: abates.filter(a => a.status === 'Concluído').length,
    rendimentoMedio: abates.length > 0 ? (abates.reduce((acc, curr) => acc + (curr.rendimentoProjetado || 0), 0) / abates.length).toFixed(1) : '0'
  };

  const filteredData = abates.filter(a => {
    const searchLower = searchTerm.toLowerCase();
    const loteNome = lotes.find(l => l.id === a.lote_id)?.nome.toLowerCase() || '';
    
    const matchesSearch = loteNome.includes(searchLower) || 
      a.frigorifico.toLowerCase().includes(searchLower) ||
      a.status.toLowerCase().includes(searchLower) ||
      a.data.includes(searchLower);
    
    const matchesStatus = filterStatus === 'Todos' || a.status === filterStatus;

    const matchesColumnFilters = 
      (columnFilters.lote === '' || loteNome.includes(columnFilters.lote.toLowerCase())) &&
      (columnFilters.data === '' || a.data.includes(columnFilters.data)) &&
      (columnFilters.frigorifico === '' || a.frigorifico.toLowerCase().includes(columnFilters.frigorifico.toLowerCase())) &&
      (columnFilters.status === 'Todos' || a.status === columnFilters.status);

    return matchesSearch && matchesStatus && matchesColumnFilters;
  });

  const { 
    currentPage, 
    totalPages, 
    paginatedData, 
    itemsPerPage, 
    goToPage, 
    nextPage, 
    prevPage, 
    setItemsPerPage,
    startIndex, 
    endIndex, 
    totalItems 
  } = usePagination({ data: filteredData, initialItemsPerPage: 10 });

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/pecuaria/rebanho">Pecuária</Link>
        <ChevronRight size={14} />
        <span>Abate</span>
      </nav>
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge rose">
            <Beef size={32} />
          </div>
          <div>
            <h1>Programação de Abate</h1>
            <p className="description">Inteligência de embarque, controle de carência e projeção de carcaça.</p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-premium-solid rose" onClick={() => handleOpenModal()}>
            <Plus size={20} strokeWidth={3} />
            <span>Nova Programação</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryCard 
          label="Abates Programados"
          value={totals.programados.toString()}
          trend={{ value: 'Próximos 30 dias', type: 'neutral', icon: Calendar }}
          icon={Clock}
          color="rose"
          delay="0s"
        />
        <SummaryCard 
          label="Lotes Concluídos"
          value={totals.concluidos.toString()}
          trend={{ value: 'Safra atual', type: 'up', icon: TrendingUp }}
          icon={CheckCircle2}
          color="emerald"
          delay="0.1s"
        />
        <SummaryCard 
          label="Rendimento Médio"
          value={`${totals.rendimentoMedio}%`}
          trend={{ value: 'Projetado', type: 'up', icon: TrendingUp }}
          icon={TrendingUp}
          color="sky"
          delay="0.2s"
        />
        <SummaryCard 
          label="Receita Estimada"
          value="R$ 1.2M"
          trend={{ value: 'Contratos ativos', type: 'neutral', icon: TrendingUp }}
          icon={TrendingUp}
          color="amber"
          delay="0.3s"
        />
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por lote ou frigorífico..."
          onToggleAdvanced={() => setIsFiltersOpen(!isFiltersOpen)}
          isAdvancedOpen={isFiltersOpen}
        />

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lote</th>
                <th>Data Prevista</th>
                <th>Frigorífico</th>
                <th>Rend. Projetado</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'lote', type: 'text', placeholder: 'Filtrar Lote...' },
                    { key: 'data', type: 'text', placeholder: 'Data...' },
                    { key: 'frigorifico', type: 'text', placeholder: 'Filtrar Frig...' },
                    { key: 'status', type: 'select', options: ['Agendado', 'Em Trânsito', 'Concluído'] }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((item) => {
                const loteNome = lotes.find(l => l.id === item.lote_id)?.nome || '-';
                return (
                  <tr key={item.id}>
                    <td><strong className="text-slate-800">{loteNome}</strong></td>
                    <td><span className="font-bold text-slate-500">{new Date(item.data).toLocaleDateString('pt-BR')}</span></td>
                    <td><span className="font-extrabold text-slate-700">{item.frigorifico}</span></td>
                    <td>
                      <div className="flex items-center gap-1 text-emerald-600 font-black">
                        {item.rendimentoProjetado}%
                        <TrendingUp size={14} />
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="text-right">
                      <div className="actions-cell">
                        <button className="action-btn-global btn-view" title="Dossiê" onClick={() => handleOpenModal(item, true)}>
                          <Eye size={18} strokeWidth={3} />
                        </button>
                        <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(item)}>
                          <Edit size={18} strokeWidth={3} />
                        </button>
                        <button className="action-btn-global btn-delete" title="Excluir" onClick={() => dataService.deleteItem('abates', item.id)}>
                          <Trash2 size={18} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
          label="abates"
        />
      </div>

      <ModernModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? 'Dossiê do Abate' : (selectedAbate ? 'Editar Programação' : 'Programação de Abate')}
        subtitle="Inteligência de embarque e rendimento projetado."
        icon={Beef}
        footer={
          <>
            <button type="button" className="btn-premium-outline" onClick={handleCloseModal}>
              <X size={18} strokeWidth={3} />
              <span>{isViewMode ? 'Fechar' : 'Cancelar'}</span>
            </button>
            {!isViewMode && (
              <button type="submit" form="abate-form" className="btn-premium-solid rose">
                <span>{selectedAbate ? 'Salvar Alterações' : 'Confirmar Programaçao'}</span>
                <CheckCircle2 size={18} strokeWidth={3} />
              </button>
            )}
          </>
        }
      >
        <div className="sidesheet-body-content">
          <form id="abate-form" onSubmit={handleSave}>
            <div className="modern-form-section">
              <div className="modern-form-row four-cols">
                <div className="modern-form-group col-span-2">
                  <SearchableSelect
                    label="Lote de Origem"
                    options={lotes.map(l => ({ id: l.id, label: l.nome, sublabel: l.categoria }))}
                    value={formData.lote_id || ''}
                    onChange={(val) => setFormData({ ...formData, lote_id: val })}
                    disabled={isViewMode}
                    required
                  />
                </div>
                <div className="modern-form-group col-span-2">
                  <label>Data de Embarque</label>
                  <div className="modern-input-wrapper">
                    <input 
                      type="date" 
                      className="modern-input"
                      value={formData.data || ''} 
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })} 
                      disabled={isViewMode} 
                      required 
                    />
                    <Calendar size={18} className="modern-field-icon" />
                  </div>
                </div>
              </div>

              <div className="modern-form-row three-cols">
                <div className="modern-form-group">
                  <label>Frigorífico Destino</label>
                  <div className="modern-input-wrapper">
                    <input 
                      type="text" 
                      className="modern-input"
                      value={formData.frigorifico || ''} 
                      onChange={(e) => setFormData({ ...formData, frigorifico: e.target.value })} 
                      disabled={isViewMode} 
                      placeholder="Nome do frigorífico" 
                      required 
                    />
                    <MapPin size={18} className="modern-field-icon" />
                  </div>
                </div>
                <div className="modern-form-group">
                  <label>Rendimento (%)</label>
                  <div className="modern-input-wrapper">
                    <input 
                      type="number" 
                      className="modern-input"
                      value={formData.rendimentoProjetado || ''} 
                      onChange={(e) => setFormData({ ...formData, rendimentoProjetado: parseFloat(e.target.value) })} 
                      disabled={isViewMode} 
                      min="40" 
                      max="65" 
                      step="0.1" 
                    />
                    <TrendingUp size={18} className="modern-field-icon" />
                  </div>
                </div>
                <div className="modern-form-group">
                  <SearchableSelect
                    label="Status"
                    options={[
                      { id: 'Agendado', label: 'Agendado' },
                      { id: 'Em Trânsito', label: 'Em Trânsito' },
                      { id: 'Concluído', label: 'Concluído' }
                    ]}
                    value={formData.status || ''}
                    onChange={(val) => setFormData({ ...formData, status: val as any })}
                    disabled={isViewMode}
                    required
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </ModernModal>
    </div>
  );
};

const MapPin = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
