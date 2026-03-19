import { 
  Layers, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Tag,
  Calendar,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  X,
  Users,
  Activity, 
  Info
} from 'lucide-react';
import React, { useState } from 'react';
import './Lote.css';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import { Lote as LoteType } from '../../types';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCompany } from '../../contexts/CompanyContext';

export const LotePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLote, setSelectedLote] = useState<LoteType | null>(null);
  const [activeTab, setActiveTab] = useState<'geral' | 'sanidade' | 'nutricao'>('geral');
  const [isViewMode, setIsViewMode] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { activeCompanyId } = useCompany();

  // Live Queries
  const allLotes = useLiveQuery(() => db.lotes.toArray()) || [];
  
  // Filter lotes by active company
  const lotes = allLotes.filter(l => activeCompanyId === 'Todas' || l.empresaId === activeCompanyId);
  const animais = useLiveQuery(() => db.animais.toArray()) || [];
  const pastos = useLiveQuery(() => db.pastos.toArray()) || [];
  const registros = useLiveQuery(() => db.registrosSanitarios.toArray()) || [];
  const dietas = useLiveQuery(() => db.dietas.toArray()) || [];

  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterCategoria, setFilterCategoria] = useState('Todas');
  const [columnFilters, setColumnFilters] = useState({
    nome: '',
    categoria: 'Todas',
    pasto: '',
    qtd: '',
    peso: '',
    data: '',
    status: 'Todos'
  });

  const handleOpenModal = (lote: LoteType | null = null, viewOnly = false) => {
    setSelectedLote(lote);
    setIsViewMode(viewOnly);
    setActiveTab('geral');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLote(null);
    setIsViewMode(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este lote?')) {
       await dataService.deleteItem('lotes', id);
    }
  };

  const totalLotes = lotes.length;
  const lotesAtivos = lotes.filter(l => l.status === 'Ativo').length;
  const totalAnimais = lotes.reduce((acc, l) => acc + (l.qtdAnimais || 0), 0);
  const pesoMedioGlobal = totalAnimais > 0 
    ? (lotes.reduce((acc, l) => acc + ((l.pesoMedio || 0) * (l.qtdAnimais || 0)), 0) / totalAnimais).toFixed(1) 
    : 0;

  const filteredData = lotes.filter(l => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = l.nome.toLowerCase().includes(searchLower) || 
                          (l.pasto?.toLowerCase().includes(searchLower) || false) || 
                          (l.categoria?.toLowerCase().includes(searchLower) || false) ||
                          l.status.toLowerCase().includes(searchLower);
    
    const matchesStatus = filterStatus === 'Todos' || l.status === filterStatus;
    const matchesCategoria = filterCategoria === 'Todas' || l.categoria === filterCategoria;

    const matchesColumnFilters = 
      (columnFilters.nome === '' || l.nome.toLowerCase().includes(columnFilters.nome.toLowerCase())) &&
      (columnFilters.categoria === 'Todas' || l.categoria === columnFilters.categoria) &&
      (columnFilters.pasto === '' || (l.pasto?.toLowerCase().includes(columnFilters.pasto.toLowerCase()) || false)) &&
      (columnFilters.status === 'Todos' || l.status === columnFilters.status);

    return matchesSearch && matchesStatus && matchesCategoria && matchesColumnFilters;
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
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <Layers size={32} />
          </div>
          <div>
            <h1>Gestão de Lotes</h1>
            <p className="description">Agrupamento e manejo coletivo de animais.</p>
          </div>
        </div>
        <div className="connectivity-section mr-4">
        </div>
        <div className="action-buttons">
          <button className="btn-premium-outline h-11 px-6 gap-2">
            <Download size={20} strokeWidth={3} />
            <span>Exportar</span>
          </button>
          <button className="btn-premium-solid indigo h-11 px-6 gap-2" onClick={() => handleOpenModal()}>
            <Plus size={20} strokeWidth={3} />
            <span>Novo Lote</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card animate-slide-up" style={{ animationDelay: '0s' }}>
          <div className="summary-info">
            <span className="summary-label">Lotes Ativos</span>
            <span className="summary-value">{lotesAtivos}</span>
            <p className="mt-4 text-emerald-600 font-extrabold flex items-center gap-2">
              <ArrowUpRight size={18} strokeWidth={2.5} /> +{lotesAtivos} este mês
            </p>
          </div>
          <div className="summary-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <Layers size={36} strokeWidth={3} color="#10b981" />
          </div>
        </div>

        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Animais em Lote</span>
            <span className="summary-value">{totalAnimais.toLocaleString()}</span>
            <p className="mt-4 text-sky-600 font-extrabold flex items-center gap-2">
              <Users size={18} strokeWidth={2.5} /> 95% do rebanho
            </p>
          </div>
          <div className="summary-icon" style={{ background: 'rgba(14, 165, 233, 0.1)' }}>
            <Users size={36} strokeWidth={3} color="#0ea5e9" />
          </div>
        </div>

        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Peso Médio Global</span>
            <span className="summary-value">{pesoMedioGlobal} <small className="text-xl text-slate-400">kg</small></span>
            <p className="mt-4 text-emerald-600 font-extrabold flex items-center gap-2">
              <TrendingUp size={18} strokeWidth={2.5} /> +1.2 kg GMD
            </p>
          </div>
          <div className="summary-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <TrendingUp size={36} strokeWidth={3} color="#10b981" />
          </div>
        </div>

        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Eficiência Pasto</span>
            {(() => {
                const totalCapacidade = pastos.reduce((acc: number, p: any) => acc + (p.capacidade_ua || 0), 0);
                const animNoPasto = animais.filter((a: any) => a.pasto_id && a.status === 'Ativo').length;
                const eficiencia = totalCapacidade > 0 ? Math.round((animNoPasto / totalCapacidade) * 100) : 0;
                return (
                  <>
                    <span className="summary-value">{eficiencia}<small className="text-xl text-slate-400">%</small></span>
                    <p className="mt-4 text-amber-600 font-extrabold flex items-center gap-2">
                        <MapPin size={18} strokeWidth={2.5} /> {eficiencia > 100 ? 'Superlotação' : 'Lotação ideal'}
                    </p>
                  </>
                );
            })()}
          </div>
          <div className="summary-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <ArrowUpRight size={36} strokeWidth={3} color="#f59e0b" />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por lote, pasto ou categoria..."
          onToggleAdvanced={() => setIsFiltersOpen(!isFiltersOpen)}
          isAdvancedOpen={isFiltersOpen}
        />


        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Identificação</th>
                <th>Categoria</th>
                <th>Pasto/Local</th>
                <th>Qtd. Animais</th>
                <th>Peso Médio</th>
                <th>Data Início</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'nome', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'categoria', type: 'select', options: ['Recria', 'Engorda', 'Reprodução', 'Teste'] },
                    { key: 'pasto', type: 'text', placeholder: 'Pasto...' },
                    { key: 'qtd', type: 'text', placeholder: 'Qtd...' },
                    { key: 'peso', type: 'text', placeholder: 'Peso...' },
                    { key: 'data', type: 'text', placeholder: 'Data...' },
                    { key: 'status', type: 'select', options: ['Ativo', 'Encerrado', 'Vendido'] }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((lote) => (
                <tr key={lote.id}>
                  <td>
                    <div className="lote-name-cell">
                      <div className="color-dot" style={{ backgroundColor: lote.cor, color: lote.cor }}></div>
                      <span className="text-slate-800 font-black text-lg">{lote.nome}</span>
                    </div>
                  </td>
                  <td>
                    <span className="tag-badge">
                      <Tag size={16} className="text-sky-600" /> <span className="text-slate-600 font-extrabold">{lote.categoria}</span>
                    </span>
                  </td>
                  <td>
                    <div className="icon-text flex items-center gap-2">
                      <MapPin size={16} className="text-emerald-600" /> <span className="font-bold text-slate-500">{lote.pasto || '-'}</span>
                    </div>
                  </td>
                  <td><span className="font-black text-slate-800 text-lg">{lote.qtdAnimais || 0} <small className="text-xs text-slate-500">cab.</small></span></td>
                  <td><span className="font-black text-emerald-600 text-lg">{lote.pesoMedio || 0} <small className="text-xs text-slate-500">kg</small></span></td>
                  <td>
                    <div className="icon-text text-slate-500 font-bold">
                      {lote.dataCriacao ? new Date(lote.dataCriacao).toLocaleDateString('pt-BR') : '-'}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge active`}>{lote.status}</span>
                  </td>
                  <td className="text-right">
                    <div className="actions-cell">
                      <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(lote, true)}>
                        <Eye size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(lote)}>
                        <Edit size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-delete" title="Excluir" onClick={() => handleDelete(lote.id)}>
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
          label="lotes filtrados"
        />
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? `Detalhes do Lote: ${selectedLote?.nome}` : (selectedLote ? 'Editar Lote' : 'Novo Lote')}
        subtitle={isViewMode ? 'Informações técnicas do lote e histórico.' : 'Gerencie as propriedades do lote e sua localização.'}
        icon={Layers}
        size="lg"
        footer={
          <div className="flex gap-3">
            <button type="button" className="btn-premium-outline" onClick={handleCloseModal}>Cancelar</button>
            {!isViewMode && <button type="submit" form="lote-form" className="btn-premium-solid indigo">Salvar Alterações</button>}
          </div>
        }
      >
        <div className="modal-tabs">
          <button className={activeTab === 'geral' ? 'active' : ''} onClick={() => setActiveTab('geral')}>Propriedades</button>
          <button className={activeTab === 'sanidade' ? 'active' : ''} onClick={() => setActiveTab('sanidade')}>Sanidade</button>
          <button className={activeTab === 'nutricao' ? 'active' : ''} onClick={() => setActiveTab('nutricao')}>Nutrição</button>
        </div>
            
            <div className="modal-body scrollable">
              <form id="lote-form" onSubmit={async (e) => { 
                e.preventDefault(); 
                const formData = new FormData(e.currentTarget);
                const updatedLote: LoteType = {
                  ...selectedLote!,
                  id: selectedLote?.id || Math.random().toString(36).substr(2, 9),
                  nome: formData.get('nome') as string,
                  categoria: formData.get('categoria') as string,
                  pasto: formData.get('pasto') as string,
                  dataCriacao: formData.get('dataCriacao') as string,
                  cor: formData.get('cor') as string,
                  status: formData.get('status') as any || 'Ativo',
                  empresaId: selectedLote?.empresaId || (activeCompanyId === 'Todas' ? undefined : activeCompanyId),
                  tenant_id: 'default',
                  qtdAnimais: selectedLote?.qtdAnimais || 0,
                  pesoMedio: selectedLote?.pesoMedio || 0
                };
                await dataService.saveItem('lotes', updatedLote);
                handleCloseModal(); 
              }}>
                <div className="form-sections-grid">
                  {activeTab === 'geral' && (
                    <div className="form-section">
                      <div className="form-grid">
                        <div className="form-group col-12">
                          <label>Nome do Lote</label>
                          <div className="input-with-icon">
                            <input type="text" name="nome" defaultValue={selectedLote?.nome} placeholder="Ex: Lote 05 - Engorda" required disabled={isViewMode} />
                            <Layers size={18} className="field-icon" />
                          </div>
                        </div>
                        <div className="form-group col-6">
                          <label>Categoria</label>
                          <div className="input-with-icon">
                            <select name="categoria" defaultValue={selectedLote?.categoria || 'Recria'} required disabled={isViewMode}>
                              <option value="Recria">Recria</option>
                              <option value="Engorda">Engorda</option>
                              <option value="Reprodução">Reprodução</option>
                            </select>
                            <Tag size={18} className="field-icon" />
                          </div>
                        </div>
                        <div className="form-group col-6">
                          <label>Pasto/Piquete</label>
                          <div className="input-with-icon">
                            <input type="text" name="pasto" defaultValue={selectedLote?.pasto} placeholder="Ex: Pasto das Flores" required disabled={isViewMode} />
                            <MapPin size={18} className="field-icon" />
                          </div>
                        </div>
                        <div className="form-group col-4">
                          <label>Data Início</label>
                          <div className="input-with-icon">
                            <input type="date" name="dataCriacao" defaultValue={selectedLote?.dataCriacao || new Date().toLocaleDateString('en-CA')} required disabled={isViewMode} />
                            <Calendar size={18} className="field-icon" />
                          </div>
                        </div>
                        <div className="form-group col-4">
                          <label>Objetivo</label>
                          <div className="input-with-icon">
                            <select defaultValue="Terminação" disabled={isViewMode}>
                              <option>Cria / Desmama</option>
                              <option>Recria</option>
                              <option>Terminação / Engorda</option>
                              <option>Iatf / Reprodução</option>
                            </select>
                            <TrendingUp size={18} className="field-icon" />
                          </div>
                        </div>
                        <div className="form-group col-4">
                          <label>Cor Identificadora</label>
                          <div className="input-with-icon">
                            <input type="color" name="cor" defaultValue={selectedLote?.cor || '#2E7D32'} required disabled={isViewMode} style={{ paddingLeft: '3rem', height: '45px' }} />
                            <div className="field-icon" style={{ left: '1rem' }}><div style={{ width: '18px', height: '18px', borderRadius: '4px', backgroundColor: selectedLote?.cor || '#2E7D32', border: '1px solid rgba(0,0,0,0.1)' }}></div></div>
                          </div>
                        </div>
                      </div>

                      <h4 className="mt-24">Metas e Planejamento</h4>
                      <div className="form-grid">
                        <div className="form-group col-4">
                          <label>Meta GMD (kg/dia)</label>
                          <input type="number" step="0.001" defaultValue="1.200" disabled={isViewMode} placeholder="0.000" />
                        </div>
                        <div className="form-group col-4">
                          <label>Peso Alvo (kg)</label>
                          <input type="number" defaultValue="550" disabled={isViewMode} placeholder="0" />
                        </div>
                        <div className="form-group col-4">
                          <label>Previsão Saída</label>
                          <input type="date" disabled={isViewMode} />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'sanidade' && (
                    <div className="form-section">
                      <h4>Monitoramento Sanitário</h4>
                      {(() => {
                        const lotRegistros = registros.filter((r: any) => r.lote_id === selectedLote?.id || r.loteId === selectedLote?.id);
                        const activeOccurrences = lotRegistros.filter((r: any) => r.status !== 'Concluído').length;
                        
                        const now = new Date();
                        const carenciaRecords = lotRegistros.filter((r: any) => r.careencia_fim && new Date(r.careencia_fim) > now);
                        const maxCarenciaDate = carenciaRecords.length > 0 
                          ? new Date(Math.max(...carenciaRecords.map((r: any) => new Date(r.careencia_fim).getTime())))
                          : null;
                        
                        const daysRemaining = maxCarenciaDate 
                          ? Math.ceil((maxCarenciaDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                          : 0;

                        return (
                          <>
                            <div className="lot-section-dashboard mb-24">
                              <div className="dash-card">
                                <span className="label">Ocorrências Ativas</span>
                                <span className="value">{activeOccurrences.toString().padStart(2, '0')}</span>
                              </div>
                              <div className={`dash-card ${daysRemaining > 0 ? 'warning' : ''}`}>
                                <span className="label">Em Carência</span>
                                <span className="value">{daysRemaining > 0 ? `${daysRemaining} dias` : 'Nenhuma'}</span>
                              </div>
                            </div>
                            
                            <div className="embedded-history">
                              <h4>Histórico Sanitário do Lote</h4>
                              <table className="mini-table">
                                <thead>
                                  <tr>
                                    <th>Data</th>
                                    <th>Tipo</th>
                                    <th>Motivo</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {lotRegistros.length > 0 ? lotRegistros.slice(0, 5).map((reg: any) => (
                                    <tr key={reg.id}>
                                      <td>{new Date(reg.data).toLocaleDateString('pt-BR')}</td>
                                      <td><span className="pill-small">{reg.tipo}</span></td>
                                      <td>{reg.doenca_motivo}</td>
                                      <td>
                                        <span className={`status-dot ${reg.status === 'Concluído' ? 'green' : 'yellow'}`}></span> 
                                        {reg.status}
                                      </td>
                                    </tr>
                                  )) : (
                                    <tr>
                                      <td colSpan={4} className="text-center py-4 text-slate-400">Nenhum registro encontrado</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {activeTab === 'nutricao' && (
                    <div className="form-section">
                      <h4>Estratégia Nutricional</h4>
                      {(() => {
                        const lotDieta = dietas.find((d: any) => d.loteId === selectedLote?.id || d.lote_id === selectedLote?.id);
                        const historico = lotDieta?.historicoTrato || [];
                        const last7Days = historico.slice(-7);

                        return (
                          <>
                            <div className="lot-section-dashboard mb-24">
                              <div className="dash-card indigo">
                                <span className="label">Dieta Atual</span>
                                <span className="value">{lotDieta?.nome || 'Não definida'}</span>
                              </div>
                              <div className="dash-card">
                                <span className="label">Custo/Cab/Dia</span>
                                <span className="value">R$ {(lotDieta?.custoPorCab || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                            
                            <div className="embedded-history">
                              <h4>Logs de Trato (Últimos registros)</h4>
                              <div className="feeding-mini-chart">
                                {last7Days.length > 0 ? last7Days.map((trato: any, idx: number) => {
                                    const percentage = Math.min(100, (trato.quantidadeEntregue / (lotDieta?.cmsProjetado || 1)) * 100);
                                    return (
                                        <div key={trato.id} className={`bar ${idx === last7Days.length - 1 ? 'current' : ''}`} style={{ height: `${percentage}%` }}>
                                            <span>{new Date(trato.data).getDate()}</span>
                                        </div>
                                    );
                                }) : (
                                    <div className="flex items-center justify-center w-full h-full text-slate-400">
                                        Sem histórico de trato
                                    </div>
                                )}
                              </div>
                              <p className="chart-caption">Consumo em kg/cab vs Meta (CMS)</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </form>
            </div>
      </StandardModal>
    </div>
  );
};

export const Lote = LotePage;

