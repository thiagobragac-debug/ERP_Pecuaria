import React, { useState } from 'react';
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
  Hash
} from 'lucide-react';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';
import { Confinamento as ConfinamentoType, Lote, Dieta } from '../../types';
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

  // Live Queries
  const confinamentos = useLiveQuery(() => db.confinamento.toArray()) || [];
  const lotes = useLiveQuery(() => db.lotes.toArray()) || [];
  const dietas = useLiveQuery(() => db.dietas.toArray()) || [];

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

  const handleOpenModal = (entry: ConfinamentoType | null = null, viewOnly = false) => {
    setSelectedEntry(entry);
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
    setActiveTab('geral');
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
          <button className="btn-premium-outline h-11 px-6 gap-2" onClick={() => setView('monitor')}>
            <MonitorCheck size={20} strokeWidth={3} />
            <span>Monitorar Cocho</span>
          </button>
          <button className="btn-premium-solid indigo h-11 px-6 gap-2" onClick={() => handleOpenModal()}>
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
                      <button className="action-btn-global btn-delete" title="Excluir" onClick={() => {}}>
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

      <StandardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? 'Detalhes do Confinamento' : (selectedEntry ? 'Editar Lote no Cocho' : 'Nova Entrada de Confinamento')}
        subtitle="Gestão técnica de engorda intensiva e nutrição."
        icon={Home}
        size="lg"
        footer={
          <div className="flex gap-3">
            <button type="button" className="btn-premium-outline" onClick={handleCloseModal}>Cancelar</button>
            {!isViewMode && <button type="submit" form="confinamento-form" className="btn-premium-solid indigo">Salvar Alterações</button>}
          </div>
        }
      >
        <div className="modal-tabs">
          <button className={activeTab === 'geral' ? 'active' : ''} onClick={() => setActiveTab('geral')}>Geral</button>
          <button className={activeTab === 'nutricao' ? 'active' : ''} onClick={() => setActiveTab('nutricao')}>Nutrição & Metas</button>
        </div>
        
        <div className="modal-body scrollable">
          <form id="confinamento-form" onSubmit={async (e) => { 
            e.preventDefault(); 
            const formData = new FormData(e.currentTarget);
            
            const dataEntrada = formData.get('dataEntrada') as string;
            const previsaoSaida = formData.get('previsaoSaida') as string;
            
            // Calculate days in feedlot
            const start = new Date(dataEntrada);
            const end = new Date();
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const newConfinamento: ConfinamentoType = {
              ...selectedEntry!,
              id: selectedEntry?.id || Math.random().toString(36).substr(2, 9),
              lote_id: formData.get('lote_id') as string,
              curral: formData.get('curral') as string,
              qtdAnimais: parseInt(formData.get('qtdAnimais') as string),
              dataEntrada: dataEntrada,
              previsaoSaida: previsaoSaida,
              diasNoCochos: diffDays,
              dieta: formData.get('dieta') as string,
              imgAnterior: parseFloat(formData.get('imgAnterior') as string),
              status: formData.get('status') as any || 'Em Engorda',
              tenant_id: 'default'
            };

            await dataService.saveItem('confinamento', newConfinamento);
            handleCloseModal(); 
          }}>
            <div className="form-sections-grid">
              {activeTab === 'geral' && (
                <div className="form-section">
                  <h4>Alocação e Identificação</h4>
                  <div className="form-grid">
                    <div className="form-group col-12">
                      <label>Lote</label>
                      <div className="input-with-icon">
                        <select name="lote_id" defaultValue={selectedEntry?.lote_id} disabled={isViewMode} required>
                          <option value="">Selecione o lote...</option>
                          {lotes.map(l => (
                            <option key={l.id} value={l.id}>{l.nome}</option>
                          ))}
                        </select>
                        <Layers size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Curral/Unidade</label>
                      <div className="input-with-icon">
                        <input type="text" name="curral" defaultValue={selectedEntry?.curral} disabled={isViewMode} required placeholder="Ex: C-01" />
                        <Home size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Quantidade de Animais</label>
                      <div className="input-with-icon">
                        <input type="number" name="qtdAnimais" defaultValue={selectedEntry?.qtdAnimais} disabled={isViewMode} required />
                        <Hash size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Data de Entrada</label>
                      <div className="input-with-icon">
                        <input type="date" name="dataEntrada" defaultValue={selectedEntry?.dataEntrada || new Date().toLocaleDateString('en-CA')} disabled={isViewMode} required />
                        <Calendar size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Previsão de Saída (Abate)</label>
                      <div className="input-with-icon">
                        <input type="date" name="previsaoSaida" defaultValue={selectedEntry?.previsaoSaida} disabled={isViewMode} required />
                        <Calendar size={18} className="field-icon" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'nutricao' && (
                <div className="form-section">
                  <h4>Nutrição e Performance</h4>
                  <div className="form-grid">
                    <div className="form-group col-12">
                      <label>Dieta Atual</label>
                      <div className="input-with-icon">
                        <select name="dieta" defaultValue={selectedEntry?.dieta} disabled={isViewMode}>
                          <option value="">Selecione a dieta...</option>
                          {dietas.map(d => (
                            <option key={d.id} value={d.nome}>{d.nome}</option>
                          ))}
                          {!dietas.length && (
                            <>
                              <option>Adaptação Fase 1</option>
                              <option>Engorda Rápida V4</option>
                              <option>Transição Elevada</option>
                              <option>Acabamento Top</option>
                            </>
                          )}
                        </select>
                        <Utensils size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>IMS Planejada (kg/cab/dia)</label>
                      <div className="input-with-icon">
                        <input type="number" name="imgAnterior" step="0.1" defaultValue={selectedEntry?.imgAnterior} disabled={isViewMode} />
                        <Activity size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>GMD Projetado (kg/dia)</label>
                      <div className="input-with-icon">
                        <input type="number" step="0.001" defaultValue={1.650} disabled={isViewMode} />
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
      </StandardModal>
    </div>
  );
};

