import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Baby, 
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
  Heart,
  Zap,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  FlaskConical,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  Hash,
  Beef,
  Package
} from 'lucide-react';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';
import { Reproducao as ReproducaoType, Animal } from '../../types';
import { useCompany } from '../../contexts/CompanyContext';
import './Reproducao.css';

// Removed mockSessions

import { DiagnosticoReproducao } from './DiagnosticoReproducao';
import { SearchableSelect } from '../../components/SearchableSelect';

export const Reproducao = () => {
  const [view, setView] = useState<'list' | 'diagnostico'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedSession, setSelectedSession] = useState<ReproducaoType | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');
  const [formData, setFormData] = useState<Partial<ReproducaoType>>({});

  const { activeCompanyId } = useCompany();
  
  // Live Queries
  const allReproducoes = useLiveQuery(() => db.reproducao.toArray()) || [];
  const allAnimais = useLiveQuery(() => db.animais.toArray()) || [];

  const reproducoes = allReproducoes.filter(r => activeCompanyId === 'Todas' || r.empresaId === activeCompanyId);
  const animais = allAnimais.filter(a => activeCompanyId === 'Todas' || a.empresaId === activeCompanyId);

  const [columnFilters, setColumnFilters] = useState({
    animal: '',
    protocolo: 'Todos',
    inicio: '',
    dgPrevisto: '',
    status: 'Todos',
    consumo: ''
  });

  const handleOpenModal = (session: ReproducaoType | null = null, viewOnly = false) => {
    if (session) {
      setSelectedSession(session);
      setFormData({ ...session });
    } else {
      setSelectedSession(null);
      setFormData({
        dataInicio: new Date().toISOString().split('T')[0],
        status: 'Em Protocolo',
        protocolo: 'IATF 3 Manejos',
        insumos: [],
      });
    }
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
    setActiveTab('geral');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
    setFormData({});
    setIsViewMode(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.animal_id || !formData.protocolo) return;

    const newReproducao: ReproducaoType = {
      ...formData,
      id: formData.id || Math.random().toString(36).substr(2, 9),
      empresaId: activeCompanyId !== 'Todas' ? activeCompanyId : (formData.empresaId || undefined),
      tenant_id: 'default',
      insumos: formData.insumos || []
    } as ReproducaoType;

    await dataService.saveItem('reproducao', newReproducao);
    handleCloseModal();
  };

  const totalSessions = reproducoes.length;
  const prenhes = reproducoes.filter(s => s.status === 'Prenhe').length;
  const taxaPrenhez = totalSessions > 0 ? ((prenhes / totalSessions) * 100).toFixed(0) : 0;
  
  const iatfSessions = reproducoes.filter(s => s.protocolo.includes('IATF'));
  const iatfPrenhes = iatfSessions.filter(s => s.status === 'Prenhe').length;
  const eficaciaIATF = iatfSessions.length > 0 ? ((iatfPrenhes / iatfSessions.length) * 100).toFixed(0) : 0;
  
  const partosPrevistos = reproducoes.filter(s => s.status === 'Parto Previsto').length;

  const filteredData = reproducoes.filter(s => {
    const searchLower = searchTerm.toLowerCase();
    const animalBrinco = animais.find(a => a.id === s.animal_id)?.brinco.toLowerCase() || '';
    
    const matchesSearch = animalBrinco.includes(searchLower) || 
                         s.protocolo.toLowerCase().includes(searchLower) ||
                         s.status.toLowerCase().includes(searchLower) ||
                         s.dataInicio.toLowerCase().includes(searchLower) ||
                         s.previsaoDiagnostico.toLowerCase().includes(searchLower);
    const matchesColumnFilters = 
      (columnFilters.animal === '' || animalBrinco.includes(columnFilters.animal.toLowerCase())) &&
      (columnFilters.protocolo === 'Todos' || s.protocolo === columnFilters.protocolo) &&
      (columnFilters.inicio === '' || s.dataInicio.includes(columnFilters.inicio)) &&
      (columnFilters.dgPrevisto === '' || s.previsaoDiagnostico.includes(columnFilters.dgPrevisto)) &&
      (columnFilters.status === 'Todos' || s.status === columnFilters.status) &&
      (columnFilters.consumo === '' || s.insumos.some(ins => ins.nome.toLowerCase().includes(columnFilters.consumo.toLowerCase())));

    return matchesSearch && matchesColumnFilters;
  });

  const protocolos = Array.from(new Set(reproducoes.map(s => s.protocolo)));

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

  if (view === 'diagnostico') {
    return <DiagnosticoReproducao onBack={() => setView('list')} />;
  }

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/pecuaria/rebanho">Pecuária</Link>
        <ChevronRight size={14} />
        <span>Reprodução</span>
      </nav>
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <Baby size={32} />
          </div>
          <div>
            <h1>Inteligência Reprodutiva</h1>
            <p className="description">Gargalos reprodutivos, IATF e monitoramento de taxa de prenhez.</p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-premium-outline" onClick={() => setView('diagnostico')}>
            <Stethoscope size={20} strokeWidth={3} />
            Central de Diagnósticos
          </button>
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={20} strokeWidth={3} />
            <span>Novo Protocolo</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0s' }}>
          <div className="summary-info">
            <span className="summary-label">Taxa de Prenhez</span>
            <span className="summary-value">{taxaPrenhez}%</span>
            <p className="mt-4 text-emerald-600 font-extrabold flex items-center gap-2">
              <TrendingUp size={18} strokeWidth={2.5} /> +5% vs meta
            </p>
          </div>
          <div className="summary-icon emerald">
            <Heart size={24} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">IEP Médio</span>
            <span className="summary-value">13.5 <small className="text-xl text-slate-400">meses</small></span>
            <p className="mt-4 text-amber-600 font-extrabold flex items-center gap-2">
              <Calendar size={18} strokeWidth={2.5} /> Ciclo Reprodutivo
            </p>
          </div>
          <div className="summary-icon amber">
            <Calendar size={24} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Eficácia IATF</span>
            <span className="summary-value">{eficaciaIATF}%</span>
            <p className="mt-4 text-sky-600 font-extrabold flex items-center gap-2">
              <Zap size={18} strokeWidth={2.5} /> Base: {iatfSessions.length} prot.
            </p>
          </div>
          <div className="summary-icon sky">
            <Zap size={24} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Partos Previstos</span>
            <span className="summary-value">{partosPrevistos} <small className="text-xl text-slate-400">cab.</small></span>
            <p className="mt-4 text-emerald-600 font-extrabold flex items-center gap-2">
              <Baby size={18} strokeWidth={2.5} /> Próximos 60 dias
            </p>
          </div>
          <div className="summary-icon rose">
            <Baby size={24} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por animal ou protocolo..."
          actionsLabel="Filtragem"
        >
          <button 
            className={`btn-premium-outline ${isFiltersOpen ? 'filter-active' : ''}`}
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
                <th>Fêmea (Brinco)</th>
                <th>Protocolo</th>
                <th>Início</th>
                <th>DG Previsto</th>
                <th>Status</th>
                <th>Consumo Estoque</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'animal', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'protocolo', type: 'select', options: protocolos },
                    { key: 'inicio', type: 'text', placeholder: 'Data...' },
                    { key: 'dgPrevisto', type: 'text', placeholder: 'Data...' },
                    { key: 'status', type: 'select', options: ['Em Protocolo', 'Prenhe', 'Vazia', 'Parto Previsto'] },
                    { key: 'consumo', type: 'text' }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                  showActionsPadding={true}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((session) => {
                const animalBrinco = animais.find(a => a.id === session.animal_id)?.brinco || '-';
                return (
                  <tr key={session.id}>
                    <td><span className="text-slate-800 font-black text-lg">{animalBrinco}</span></td>
                    <td><span className="font-bold text-slate-600">{session.protocolo}</span></td>
                    <td><span className="font-bold text-slate-500">{new Date(session.dataInicio).toLocaleDateString('pt-BR')}</span></td>
                    <td><span className="font-black text-sky-600">{new Date(session.previsaoDiagnostico).toLocaleDateString('pt-BR')}</span></td>
                    <td>
                      <span className={`status-badge rep-${session.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {session.status}
                      </span>
                    </td>
                  <td>
                    {session.insumos.length > 0 ? (
                      <div className="stock-link flex items-center gap-2">
                        <PackageCheck size={18} className="text-emerald-600" /> 
                        <span className="font-bold text-slate-500">{session.insumos.length} itens baixados</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 font-bold">Nenhum</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="actions-cell">
                      <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(session, true)}>
                        <Eye size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(session)}>
                        <Edit size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-delete" title="Excluir" onClick={() => dataService.deleteItem('reproducao', session.id)}>
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
          label="matrizes em protocolo"
        />
      </div>

      <div className="efficiency-gauge-box animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="gauge-container">
          <svg className="gauge-svg" viewBox="0 0 100 100">
             <circle className="gauge-bg" cx="50" cy="50" r="45"></circle>
             <circle 
               className="gauge-fill" 
               cx="50" cy="50" r="45" 
               style={{ strokeDasharray: `${(parseFloat(taxaPrenhez.toString()) / 100) * 283}, 283` }}
             ></circle>
          </svg>
          <div className="gauge-text">{taxaPrenhez}%</div>
        </div>
        <div className="gauge-info">
          <h4>Eficiência da Estação de Monta</h4>
          <p>Sua taxa de prenhez atual de {taxaPrenhez}% está <strong>8% acima</strong> da média regional.</p>
          <div className="flex gap-8">
             <span className="pill green">Status: Crítico Positivo</span>
             <span className="pill blue">Projeção: 85% Conclusão</span>
          </div>
        </div>
      </div>


      <ModernModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? 'Detalhes Reprodutivos' : (selectedSession ? 'Editar Protocolo' : 'Novo Protocolo / Estação')}
        subtitle="Acompanhamento técnico e gestão de estoque de sêmen e hormônios."
        icon={Baby}
        footer={
          <>
            <button type="button" className="btn-premium-outline" onClick={handleCloseModal}>
              <X size={18} strokeWidth={3} />
              <span>Cancelar</span>
            </button>
            {!isViewMode && (
              <button type="submit" form="reproducao-form" className="btn-premium-solid indigo">
                <span>Salvar e Atualizar Estoque</span>
                <CheckCircle2 size={18} strokeWidth={3} />
              </button>
            )}
          </>
        }
      >
        <div className="modal-tabs mb-6">
          <button className={`tab-btn ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>Geral</button>
          <button className={`tab-btn ${activeTab === 'estoque' ? 'active' : ''}`} onClick={() => setActiveTab('estoque')}>Consumo de Insumos</button>
          <button className={`tab-btn ${activeTab === 'evolucao' ? 'active' : ''}`} onClick={() => setActiveTab('evolucao')}>Evolução Ciclo</button>
        </div>
        
        <div className="modal-content-scrollable">
          <form id="reproducao-form" onSubmit={handleSave}>
            {activeTab === 'geral' && (
              <div className="form-sections-grid">
                <div className="form-section">
                  <div className="form-section-title">
                    <Beef size={20} />
                    <span>Informações Básicas</span>
                  </div>
                  <div className="form-grid">
                    <div className="form-group col-12">
                      <SearchableSelect
                        label="Animal (Matriz)"
                        options={animais.map(a => ({ id: a.id, label: a.brinco, sublabel: `Lote: ${a.lote}` }))}
                        value={formData.animal_id || ''}
                        onChange={(val) => setFormData({ ...formData, animal_id: val })}
                        disabled={isViewMode}
                        required
                      />
                    </div>
                    <div className="form-group col-6">
                      <label>Tipo de Protocolo</label>
                      <div className="input-with-icon">
                        <select 
                          value={formData.protocolo || 'IATF 3 Manejos'} 
                          onChange={(e) => setFormData({ ...formData, protocolo: e.target.value })} 
                          disabled={isViewMode}
                        >
                          <option>IATF 3 Manejos</option>
                          <option>Monta Natural</option>
                          <option>Transferência de Embrião (TE)</option>
                          <option>Inseminação Artificial (IA)</option>
                        </select>
                        <Layers size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Data de Início</label>
                      <div className="input-with-icon">
                        <input 
                          type="date" 
                          value={formData.dataInicio || ''} 
                          onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })} 
                          disabled={isViewMode} 
                          required 
                        />
                        <Calendar size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Previsão Diagnóstico (DG)</label>
                      <div className="input-with-icon">
                        <input 
                          type="date" 
                          value={formData.previsaoDiagnostico || ''} 
                          onChange={(e) => setFormData({ ...formData, previsaoDiagnostico: e.target.value })} 
                          disabled={isViewMode} 
                        />
                        <Calendar size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Status Atual</label>
                      <div className="input-with-icon">
                        <select 
                          value={formData.status || 'Em Protocolo'} 
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} 
                          disabled={isViewMode}
                        >
                          <option>Em Protocolo</option>
                          <option>Prenhe</option>
                          <option>Vazia</option>
                          <option>Parto Previsto</option>
                        </select>
                        <Activity size={18} className="field-icon" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'estoque' && (
              <div className="inventory-integration">
                <div className="integration-header">
                  <FlaskConical size={20} />
                <div className="form-section-title">
                  <Package size={20} />
                  <span>Insumos Vinculados (Baixa Automática)</span>
                </div>
                </div>
                
                <div className="selected-inputs">
                  {selectedSession?.insumos.map((insumo, idx) => (
                    <div key={idx} className="input-item-row">
                      <span className="input-name">{insumo.nome}</span>
                      <span className="input-qty">{insumo.quantidade} un.</span>
                      {!isViewMode && <button type="button" className="remove-input"><X size={14} /></button>}
                    </div>
                  ))}
                  {!isViewMode && (
                    <button type="button" className="btn-premium-outline w-full">
                      <Plus size={16} strokeWidth={3} /> Adicionar Item do Estoque
                    </button>
                  )}
                </div>

                {!isViewMode && (
                  <div className="info-box indigo mt-16">
                    <Activity size={18} />
                    <p><strong>Integração Ativa:</strong> Ao salvar, o sistema atualizará automaticamente o saldo dos itens selecionados no módulo de Estoque.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'evolucao' && (
              <div className="cycle-evolution">
                <div className="timeline">
                  <div className="timeline-item active">
                    <div className="timeline-dot completed"><CheckCircle2 size={16} /></div>
                    <div className="timeline-content">
                      <span className="time-date">01/03/2024</span>
                      <span className="time-title">Início do Protocolo (D0)</span>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot"><AlertCircle size={16} /></div>
                    <div className="timeline-content">
                      <span className="time-date">08/03/2024</span>
                      <span className="time-title">Inseminação (D8)</span>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot"><Calendar size={16} /></div>
                    <div className="timeline-content">
                      <span className="time-date">01/04/2024</span>
                      <span className="time-title">Diagnóstico de Gestação (DG)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </ModernModal>
    </div>
  );
};

