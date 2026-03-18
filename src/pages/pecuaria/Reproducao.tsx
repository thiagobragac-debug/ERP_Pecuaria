import React, { useState } from 'react';
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
  Hash
} from 'lucide-react';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import './Reproducao.css';

interface InsumoUsado {
  id: string;
  nome: string;
  quantidade: number;
}

interface ReproducaoSession {
  id: string;
  animal: string;
  protocolo: string;
  dataInicio: string;
  previsaoDiagnostico: string;
  status: 'Em Protocolo' | 'Prenhe' | 'Vazia' | 'Parto Previsto';
  insumos: InsumoUsado[];
}

const mockSessions: ReproducaoSession[] = [
  { 
    id: '1', 
    animal: 'VAC-8820', 
    protocolo: 'IATF 3 Manejos', 
    dataInicio: '2024-03-01', 
    previsaoDiagnostico: '2024-04-01', 
    status: 'Em Protocolo',
    insumos: [
      { id: '1', nome: 'D-Cloprostenol', quantidade: 2 },
      { id: '2', nome: 'Sêmen Angus Black', quantidade: 1 }
    ]
  },
  { 
    id: '2', 
    animal: 'VAC-4412', 
    protocolo: 'Monta Natural', 
    dataInicio: '2024-01-15', 
    previsaoDiagnostico: '2024-02-15', 
    status: 'Prenhe',
    insumos: []
  },
  { 
    id: '3', 
    animal: 'VAC-9905', 
    protocolo: 'IATF 3 Manejos', 
    dataInicio: '2023-12-10', 
    previsaoDiagnostico: '2024-01-10', 
    status: 'Vazia',
    insumos: [
      { id: '1', nome: 'D-Cloprostenol', quantidade: 2 },
      { id: '2', nome: 'Sêmen Nelore PO', quantidade: 1 }
    ]
  },
];

import { DiagnosticoReproducao } from './DiagnosticoReproducao';

export const Reproducao = () => {
  const [view, setView] = useState<'list' | 'diagnostico'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedSession, setSelectedSession] = useState<ReproducaoSession | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');
  const [columnFilters, setColumnFilters] = useState({
    animal: '',
    protocolo: 'Todos',
    inicio: '',
    dgPrevisto: '',
    status: 'Todos',
    consumo: ''
  });

  const handleOpenModal = (session: ReproducaoSession | null = null, viewOnly = false) => {
    setSelectedSession(session);
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
    setActiveTab('geral');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
    setIsViewMode(false);
  };

  const totalSessions = mockSessions.length;
  const prenhes = mockSessions.filter(s => s.status === 'Prenhe').length;
  const taxaPrenhez = totalSessions > 0 ? ((prenhes / totalSessions) * 100).toFixed(0) : 0;
  
  const iatfSessions = mockSessions.filter(s => s.protocolo.includes('IATF'));
  const iatfPrenhes = iatfSessions.filter(s => s.status === 'Prenhe').length;
  const eficaciaIATF = iatfSessions.length > 0 ? ((iatfPrenhes / iatfSessions.length) * 100).toFixed(0) : 0;
  
  const partosPrevistos = mockSessions.filter(s => s.status === 'Parto Previsto').length;

  const filteredData = mockSessions.filter(s => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = s.animal.toLowerCase().includes(searchLower) || 
                         s.protocolo.toLowerCase().includes(searchLower) ||
                         s.status.toLowerCase().includes(searchLower) ||
                         s.dataInicio.toLowerCase().includes(searchLower) ||
                         s.previsaoDiagnostico.toLowerCase().includes(searchLower);
    const matchesColumnFilters = 
      (columnFilters.animal === '' || s.animal.toLowerCase().includes(columnFilters.animal.toLowerCase())) &&
      (columnFilters.protocolo === 'Todos' || s.protocolo === columnFilters.protocolo) &&
      (columnFilters.inicio === '' || new Date(s.dataInicio).toLocaleDateString('pt-BR').includes(columnFilters.inicio)) &&
      (columnFilters.dgPrevisto === '' || new Date(s.previsaoDiagnostico).toLocaleDateString('pt-BR').includes(columnFilters.dgPrevisto)) &&
      (columnFilters.status === 'Todos' || s.status === columnFilters.status) &&
      (columnFilters.consumo === '' || s.insumos.some(ins => ins.nome.toLowerCase().includes(columnFilters.consumo.toLowerCase())));

    return matchesSearch && matchesColumnFilters;
  });

  const protocolos = Array.from(new Set(mockSessions.map(s => s.protocolo)));

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
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <Baby size={24} />
          </div>
          <div>
            <h1>Inteligência Reprodutiva</h1>
            <p className="description">Gargalos reprodutivos, IATF e monitoramento de taxa de prenhez.</p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-premium-outline h-11 px-6 gap-2" onClick={() => setView('diagnostico')}>
            <Stethoscope size={20} strokeWidth={3} />
            Central de Diagnósticos
          </button>
          <button className="btn-premium-solid indigo h-11 px-6 gap-2" onClick={() => handleOpenModal()}>
            <Plus size={20} strokeWidth={3} />
            Novo Protocolo
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card animate-slide-up" style={{ animationDelay: '0s' }}>
          <div className="summary-info">
            <span className="summary-label">Taxa de Prenhez</span>
            <span className="summary-value">{taxaPrenhez}%</span>
            <p className="mt-4 text-emerald-600 font-extrabold flex items-center gap-2">
              <TrendingUp size={18} strokeWidth={2.5} /> +5% vs meta
            </p>
          </div>
          <div className="summary-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <Heart size={36} strokeWidth={3} color="#10b981" />
          </div>
        </div>

        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">IEP Médio</span>
            <span className="summary-value">13.5 <small className="text-xl text-slate-400">meses</small></span>
            <p className="mt-4 text-amber-600 font-extrabold flex items-center gap-2">
              <Calendar size={18} strokeWidth={2.5} /> Ciclo Reprodutivo
            </p>
          </div>
          <div className="summary-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <Calendar size={36} strokeWidth={3} color="#f59e0b" />
          </div>
        </div>

        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Eficácia IATF</span>
            <span className="summary-value">{eficaciaIATF}%</span>
            <p className="mt-4 text-sky-600 font-extrabold flex items-center gap-2">
              <Zap size={18} strokeWidth={2.5} /> Base: {iatfSessions.length} prot.
            </p>
          </div>
          <div className="summary-icon" style={{ background: 'rgba(14, 165, 233, 0.1)' }}>
            <Zap size={36} strokeWidth={3} color="#0ea5e9" />
          </div>
        </div>

        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Partos Previstos</span>
            <span className="summary-value">{partosPrevistos} <small className="text-xl text-slate-400">cab.</small></span>
            <p className="mt-4 text-emerald-600 font-extrabold flex items-center gap-2">
              <Baby size={18} strokeWidth={2.5} /> Próximos 60 dias
            </p>
          </div>
          <div className="summary-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <Baby size={36} strokeWidth={3} color="#10b981" />
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
              {paginatedData.map((session) => (
                <tr key={session.id}>
                  <td><span className="text-slate-800 font-black text-lg">{session.animal}</span></td>
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


      <StandardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? 'Detalhes Reprodutivos' : (selectedSession ? 'Editar Protocolo' : 'Novo Protocolo / Estação')}
        subtitle="Acompanhamento técnico e gestão de estoque de sêmen e hormônios."
        icon={Baby}
        size="lg"
        footer={
          <div className="flex gap-3">
            <button type="button" className="btn-premium-outline" onClick={handleCloseModal}>Cancelar</button>
            {!isViewMode && <button type="submit" form="reproducao-form" className="btn-premium-solid indigo">Salvar e Atualizar Estoque</button>}
          </div>
        }
      >
        <div className="modal-tabs">
          <button className={activeTab === 'geral' ? 'active' : ''} onClick={() => setActiveTab('geral')}>Geral</button>
          <button className={activeTab === 'estoque' ? 'active' : ''} onClick={() => setActiveTab('estoque')}>Consumo de Insumos</button>
          <button className={activeTab === 'evolucao' ? 'active' : ''} onClick={() => setActiveTab('evolucao')}>Evolução Ciclo</button>
        </div>
        
        <div className="modal-body scrollable">
          <form id="reproducao-form" onSubmit={(e) => { e.preventDefault(); handleCloseModal(); }}>
            {activeTab === 'geral' && (
              <div className="form-sections-grid">
                <div className="form-section">
                  <h4>Informações Básicas</h4>
                  <div className="form-grid">
                    <div className="form-group col-12">
                      <label>Animal (Matriz)</label>
                      <div className="input-with-icon">
                        <input type="text" defaultValue={selectedSession?.animal} disabled={isViewMode} required placeholder="Ex: VAC-8820" />
                        <Hash size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Tipo de Protocolo</label>
                      <div className="input-with-icon">
                        <select defaultValue={selectedSession?.protocolo} disabled={isViewMode}>
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
                        <input type="date" defaultValue={selectedSession?.dataInicio} disabled={isViewMode} required />
                        <Calendar size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Previsão Diagnóstico (DG)</label>
                      <div className="input-with-icon">
                        <input type="date" defaultValue={selectedSession?.previsaoDiagnostico} disabled={isViewMode} />
                        <Calendar size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Status Atual</label>
                      <div className="input-with-icon">
                        <select defaultValue={selectedSession?.status} disabled={isViewMode}>
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
                  <h4>Insumos Vinculados (Baixa Automática)</h4>
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
                    <button type="button" className="btn-premium-outline w-full py-3">
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
      </StandardModal>
    </div>
  );
};

