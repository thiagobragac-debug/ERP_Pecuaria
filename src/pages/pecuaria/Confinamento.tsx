import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  TrendingUp,
  Calendar,
  Layers,
  MoreHorizontal,
  X,
  Activity,
  ArrowUpRight,
  TrendingDown,
  Utensils,
  Clock,
  ThermometerSun,
  MonitorCheck,
  ChevronLeft,
  ChevronRight,
  Hash,
  Beef
} from 'lucide-react';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';
import { SearchableSelect } from '../../components/SearchableSelect';
import { Confinamento as ConfinamentoType, Lote, Dieta } from '../../types';
import { useCompany } from '../../contexts/CompanyContext';
import './Confinamento.css';

// Removed mockConfinamento

import { MonitorCocho } from './MonitorCocho';

export const Confinamento = () => {
  const [view, setView] = useState<'dashboard' | 'monitor'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterCurral, setFilterCurral] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ConfinamentoType | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const { activeCompanyId } = useCompany();
  
  // Live Queries
  const allConfinamentos = useLiveQuery(() => db.confinamento.toArray()) || [];
  const allLotes = useLiveQuery(() => db.lotes.toArray()) || [];
  const allDietas = useLiveQuery(() => db.dietas.toArray()) || [];

  const confinamentos = allConfinamentos.filter(c => activeCompanyId === 'Todas' || c.empresaId === activeCompanyId);
  const lotes = allLotes.filter(l => activeCompanyId === 'Todas' || l.empresaId === activeCompanyId);
  const dietas = allDietas.filter(d => activeCompanyId === 'Todas' || d.empresaId === activeCompanyId);

  const [columnFilters, setColumnFilters] = useState({
    curral: 'Todos',
    lote: '',
    animais: '',
    entrada: '',
    saida: '',
    dias: '',
    status: 'Todos'
  });
  const [activeTab, setActiveTab] = useState('geral');
  const [formData, setFormData] = useState<Partial<ConfinamentoType>>({
    status: 'Em Engorda',
    dataEntrada: new Date().toISOString().split('T')[0],
    qtdAnimais: 0,
    imgAnterior: 0,
    curral: '',
    dieta: ''
  });

  const handleOpenModal = (entry: ConfinamentoType | null = null, viewOnly = false) => {
    if (entry) {
      setFormData({ ...entry });
    } else {
      setFormData({
        status: 'Em Engorda',
        dataEntrada: new Date().toISOString().split('T')[0],
        qtdAnimais: 0,
        imgAnterior: 0,
        curral: '',
        dieta: ''
      });
    }
    setSelectedEntry(entry);
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
    setActiveTab('geral');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lote_id) return alert('Selecione um lote!');

    // Calculate days in feedlot
    const start = new Date(formData.dataEntrada!);
    const end = new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const finalConfinamento: ConfinamentoType = {
      ...formData,
      id: selectedEntry?.id || Math.random().toString(36).substr(2, 9),
      diasNoCochos: diffDays,
      empresaId: activeCompanyId !== 'Todas' ? activeCompanyId : (selectedEntry?.empresaId || undefined),
      tenant_id: 'default'
    } as ConfinamentoType;

    await dataService.saveItem('confinamento', finalConfinamento);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
    setIsViewMode(false);
  };

  const ocupacaoTotal = confinamentos.reduce((acc, e) => acc + e.qtdAnimais, 0);
  const imsMedia = confinamentos.length > 0
    ? (confinamentos.reduce((acc, e) => acc + e.imgAnterior, 0) / confinamentos.length).toFixed(1)
    : 0;

  const filteredData = confinamentos.filter(entry => {
    const searchLower = searchTerm.toLowerCase();
    const loteNome = lotes.find(l => l.id === entry.lote_id)?.nome.toLowerCase() || '';
    
    const matchesSearch = loteNome.includes(searchLower) || 
                          entry.curral.toLowerCase().includes(searchLower) || 
                          entry.dieta.toLowerCase().includes(searchLower) ||
                          entry.status.toLowerCase().includes(searchLower) ||
                          entry.qtdAnimais.toString().includes(searchLower) ||
                          entry.dataEntrada.toLowerCase().includes(searchLower) ||
                          entry.previsaoSaida.toLowerCase().includes(searchLower) ||
                          entry.diasNoCochos.toString().includes(searchLower);
    
    const matchesStatus = filterStatus === 'Todos' || entry.status === filterStatus;
    const matchesCurral = filterCurral === 'Todos' || entry.curral === filterCurral;

    const matchesColumnFilters = 
      (columnFilters.curral === 'Todos' || entry.curral === columnFilters.curral) &&
      (columnFilters.lote === '' || loteNome.includes(columnFilters.lote.toLowerCase())) &&
      (columnFilters.animais === '' || entry.qtdAnimais.toString().includes(columnFilters.animais)) &&
      (columnFilters.entrada === '' || entry.dataEntrada.includes(columnFilters.entrada)) &&
      (columnFilters.saida === '' || entry.previsaoSaida.includes(columnFilters.saida)) &&
      (columnFilters.dias === '' || entry.diasNoCochos.toString().includes(columnFilters.dias)) &&
      (columnFilters.status === 'Todos' || entry.status === columnFilters.status);

    return matchesSearch && matchesStatus && matchesCurral && matchesColumnFilters;
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

  if (view === 'monitor') {
    return <MonitorCocho onBack={() => setView('dashboard')} />;
  }

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/pecuaria/rebanho">Pecuária</Link>
        <ChevronRight size={14} />
        <span>Confinamento</span>
      </nav>
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <Home size={40} strokeWidth={3} />
          </div>
          <div>
            <h1>Gestão de Confinamento</h1>
            <p className="description">Monitoramento de engorda intensiva, currais e dietas.</p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-premium-outline" onClick={() => setView('monitor')}>
            <MonitorCheck size={20} strokeWidth={3} />
            <span>Monitorar Cocho</span>
          </button>
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={20} strokeWidth={3} />
            <span>Novo Lote no Cocho</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0s' }}>
          <div className="summary-info">
            <span className="summary-label">Ocupação Total</span>
            <span className="summary-value">{ocupacaoTotal} <small>cab.</small></span>
            <span className="summary-subtext">85% da capacidade total</span>
          </div>
          <div className="summary-icon indigo">
            <Layers size={36} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Consumo Médio (IMS)</span>
            <span className="summary-value">{imsMedia} <small>kg/cab</small></span>
            <span className="summary-trend up">
              <ArrowUpRight size={14} /> +0.4 vs meta
            </span>
          </div>
          <div className="summary-icon warning">
            <Utensils size={36} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">GMD Projetado</span>
            <span className="summary-value">1.650 <small>kg/dia</small></span>
            <span className="summary-subtext">Eficiência elevada</span>
          </div>
          <div className="summary-icon primary">
            <TrendingUp size={36} strokeWidth={3} />
          </div>
        </div>
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Status Sanitário</span>
            <span className="summary-value">Normal</span>
            <span className="summary-subtext">Check-up diário concluído</span>
          </div>
          <div className="summary-icon success">
            <ThermometerSun size={36} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por curral ou lote..."
          onToggleAdvanced={() => setIsFiltersOpen(!isFiltersOpen)}
          isAdvancedOpen={isFiltersOpen}
        />


        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Curral</th>
                <th>Lote</th>
                <th>Animais</th>
                <th>Entrada</th>
                <th>Previsão Saída</th>
                <th>Dias de Cocho</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'curral', type: 'select', options: ['C-01', 'C-02', 'C-04'] },
                    { key: 'lote', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'animais', type: 'text', placeholder: 'Qtd...' },
                    { key: 'entrada', type: 'text', placeholder: 'Data...' },
                    { key: 'saida', type: 'text', placeholder: 'Data...' },
                    { key: 'dias', type: 'text', placeholder: 'Dias...' },
                    { key: 'status', type: 'select', options: ['Em Engorda', 'Finalizando', 'Saída Programada'] }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((entry) => {
                const loteNome = lotes.find(l => l.id === entry.lote_id)?.nome || '-';
                return (
                  <tr key={entry.id}>
                    <td><span className="curral-badge">{entry.curral}</span></td>
                    <td className="font-bold">{loteNome}</td>
                    <td>{entry.qtdAnimais} cab.</td>
                    <td>{new Date(entry.dataEntrada).toLocaleDateString('pt-BR')}</td>
                    <td>{new Date(entry.previsaoSaida).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <div className="days-progress">
                        <Clock size={14} /> {entry.diasNoCochos} dias
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${entry.status === 'Saída Programada' ? 'warning' : 'active'}`}>
                        {entry.status}
                      </span>
                    </td>
                  <td className="text-right">
                    <div className="actions-cell">
                      <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(entry, true)}>
                        <Eye size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(entry)}>
                        <Edit size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-delete" title="Excluir" onClick={() => dataService.deleteItem('confinamento', entry.id)}>
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
          label="registros"
        />
      </div>

      <ModernModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? 'Detalhes do Confinamento' : (selectedEntry ? 'Editar Lote no Cocho' : 'Nova Entrada de Confinamento')}
        subtitle="Gestão técnica de engorda intensiva e nutrição."
        icon={Home}
        footer={
          <>
            <button type="button" className="btn-premium-outline" onClick={handleCloseModal}>
              <X size={18} strokeWidth={3} />
              <span>Cancelar</span>
            </button>
            {!isViewMode && (
              <button type="submit" form="confinamento-form" className="btn-premium-solid indigo">
                <span>{selectedEntry ? 'Gravar Alterações' : 'Confirmar Entrada'}</span>
                <MonitorCheck size={18} strokeWidth={3} />
              </button>
            )}
          </>
        }
      >
        <div className="modal-tabs mb-6">
          <button className={`tab-btn ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>Geral</button>
          <button className={`tab-btn ${activeTab === 'nutricao' ? 'active' : ''}`} onClick={() => setActiveTab('nutricao')}>Nutrição & Metas</button>
        </div>
        
        <div className="modal-content-scrollable">
          <form id="confinamento-form" onSubmit={handleSave}>
            <div className="form-sections-grid">
              {activeTab === 'geral' && (
                <div className="form-section">
                  <div className="form-section-title">
                    <Beef size={20} />
                    <span>Alocação e Identificação</span>
                  </div>
                  <div className="form-grid">
                    <div className="form-group col-12">
                      <SearchableSelect
                        label="Lote"
                        options={lotes.map(l => ({ id: l.id, label: l.nome, sublabel: `${l.qtdAnimais} animais` }))}
                        value={formData.lote_id || ''}
                        onChange={(val) => setFormData({ ...formData, lote_id: val })}
                        disabled={isViewMode}
                        required
                      />
                    </div>
                    <div className="form-group col-6">
                      <label>Curral/Unidade</label>
                      <div className="input-with-icon">
                        <input 
                          type="text" 
                          value={formData.curral || ''} 
                          onChange={(e) => setFormData({ ...formData, curral: e.target.value })}
                          disabled={isViewMode} 
                          required 
                          placeholder="Ex: C-01" 
                        />
                        <Home size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Quantidade de Animais</label>
                      <div className="input-with-icon">
                        <input 
                          type="number" 
                          value={formData.qtdAnimais || 0} 
                          onChange={(e) => setFormData({ ...formData, qtdAnimais: parseInt(e.target.value) || 0 })}
                          disabled={isViewMode} 
                          required 
                        />
                        <Hash size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Data de Entrada</label>
                      <div className="input-with-icon">
                        <input 
                          type="date" 
                          value={formData.dataEntrada || ''} 
                          onChange={(e) => setFormData({ ...formData, dataEntrada: e.target.value })}
                          disabled={isViewMode} 
                          required 
                        />
                        <Calendar size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Previsão de Saída (Abate)</label>
                      <div className="input-with-icon">
                        <input 
                          type="date" 
                          value={formData.previsaoSaida || ''} 
                          onChange={(e) => setFormData({ ...formData, previsaoSaida: e.target.value })}
                          disabled={isViewMode} 
                          required 
                        />
                        <Calendar size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-12">
                      <SearchableSelect
                        label="Status do Lote no Cocho"
                        options={[
                          { id: 'Em Engorda', label: 'Em Engorda' },
                          { id: 'Finalizando', label: 'Finalizando' },
                          { id: 'Saída Programada', label: 'Saída Programada' }
                        ]}
                        value={formData.status || ''}
                        onChange={(val) => setFormData({ ...formData, status: val as any })}
                        disabled={isViewMode}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'nutricao' && (
                <div className="form-section">
                  <div className="form-section-title">
                    <Activity size={20} />
                    <span>Nutrição e Performance</span>
                  </div>
                  <div className="form-grid">
                    <div className="form-group col-12">
                      <SearchableSelect
                        label="Dieta Atual"
                        options={dietas.length > 0 ? dietas.map(d => ({ id: d.nome, label: d.nome, sublabel: d.categoria })) : [
                          { id: 'Adaptação Fase 1', label: 'Adaptação Fase 1' },
                          { id: 'Engorda Rápida V4', label: 'Engorda Rápida V4' },
                          { id: 'Transição Elevada', label: 'Transição Elevada' },
                          { id: 'Acabamento Top', label: 'Acabamento Top' }
                        ]}
                        value={formData.dieta || ''}
                        onChange={(val) => setFormData({ ...formData, dieta: val })}
                        disabled={isViewMode}
                        required
                      />
                    </div>
                    <div className="form-group col-6">
                      <label>IMS Planejada (kg/cab/dia)</label>
                      <div className="input-with-icon">
                        <input 
                          type="number" 
                          step="0.1" 
                          value={formData.imgAnterior || 0} 
                          onChange={(e) => setFormData({ ...formData, imgAnterior: parseFloat(e.target.value) || 0 })}
                          disabled={isViewMode} 
                        />
                        <Activity size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>GMD Projetado (kg/dia)</label>
                      <div className="input-with-icon">
                        <input type="number" step="0.001" value={1.650} readOnly disabled />
                        <TrendingUp size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-12">
                      <div className="info-box info-indigo">
                        <Activity size={18} />
                        <p><strong>Meta de Abate:</strong> O sistema projetará o peso final com base no GMD e nos dias de cocho restantes.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </ModernModal>
    </div>
  );
};

