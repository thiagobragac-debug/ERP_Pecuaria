import React, { useState } from 'react';
import { 
  Apple, 
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
  DollarSign,
  Utensils,
  Scale,
  Zap,
  FlaskConical,
  PackageCheck,
  CheckCircle2,
  PieChart,
  ChevronLeft,
  ChevronRight,
  Users,
  Beef
} from 'lucide-react';
import './Nutricao.css';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import { Dieta, Ingrediente, LogTrato, Animal } from '../../types';


import { AnaliseCustoNutricao } from './AnaliseCustoNutricao';
import { useOfflineQuery, useOfflineMutation } from '../../hooks/useOfflineSync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { financialService } from '../../services/financialService';

export const Nutricao = () => {
  const [view, setView] = useState<'list' | 'analise'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterCategoria, setFilterCategoria] = useState('Todos');
  const [selectedDieta, setSelectedDieta] = useState<Dieta | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    nome: '',
    categoria: 'Todos',
    cms: '',
    custo: '',
    status: 'Todos'
  });
  const [activeTab, setActiveTab] = useState<'geral' | 'composicao' | 'eficiencia' | 'detalhamento'>('geral');
  const [costCalculationMode, setCostCalculationMode] = useState<'fixed' | 'proportional'>('proportional');
  const isOnline = useOnlineStatus();

  // Offline-first Queries
  const { data: dietas = [], isLoading: isLoadingDietas } = useOfflineQuery<Dieta>(['dietas'], 'dietas');
  const { data: animais = [] } = useOfflineQuery<Animal>(['animais'], 'animais');

  // Offline-first Mutation
  const saveDietaMutation = useOfflineMutation<Dieta>('dietas', [['dietas']]);

  const handleOpenModal = (dieta: Dieta | null = null, viewOnly = false) => {
    setSelectedDieta(dieta);
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
    setActiveTab('geral');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDieta(null);
    setIsViewMode(false);
  };

  const totalDietas = dietas.length;
  const totalAnimaisDieta = animais.filter(a => a.lote).length; // Using .lote as available in Rebanho.tsx
  const custoMedio = totalDietas > 0 
    ? (dietas.reduce((acc, d) => acc + d.custoPorCab, 0) / totalDietas).toFixed(2)
    : 0;
  const cmsMedio = totalDietas > 0
    ? (dietas.reduce((acc, d) => acc + d.cmsProjetado, 0) / totalDietas).toFixed(1)
    : 0;

  const filteredData = dietas.filter(d => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = d.nome.toLowerCase().includes(searchLower) || 
      d.categoria.toLowerCase().includes(searchLower) ||
      d.status.toLowerCase().includes(searchLower) ||
      d.cmsProjetado.toString().includes(searchLower) ||
      d.custoPorCab.toString().includes(searchLower) ||
      (d.loteId && d.loteId.toLowerCase().includes(searchLower));
    
    const matchesCategoria = filterCategoria === 'Todos' || d.categoria === filterCategoria;

    const matchesColumnFilters = 
      (columnFilters.nome === '' || d.nome.toLowerCase().includes(columnFilters.nome.toLowerCase())) &&
      (columnFilters.categoria === 'Todos' || d.categoria === columnFilters.categoria) &&
      (columnFilters.cms === '' || d.cmsProjetado.toString().includes(columnFilters.cms)) &&
      (columnFilters.custo === '' || d.custoPorCab.toString().includes(columnFilters.custo)) &&
      (columnFilters.status === 'Todos' || d.status === columnFilters.status);

    return matchesSearch && matchesCategoria && matchesColumnFilters;
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

  if (view === 'analise') {
    return <AnaliseCustoNutricao onBack={() => setView('list')} dietaNome={selectedDieta?.nome} />;
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge secondary">
            <Utensils size={32} />
          </div>
          <div>
            <h1>Inteligência Nutricional</h1>
            <p className="description">Planos de dieta, conversão alimentar e otimização de custos de cocho.</p>
          </div>
        </div>
        <div className="action-buttons flex items-center gap-6">
          <div className={`online-badge flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest ${isOnline ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}>
            <Activity size={18} strokeWidth={3} className={isOnline ? 'animate-pulse' : ''} />
            <span>{isOnline ? 'Cloud Sync' : 'Offline Mode'}</span>
          </div>
          <button className="btn-premium-outline h-11 px-6 gap-2" onClick={() => setView('analise')}>
            <TrendingUp size={20} strokeWidth={3} />
            <span>Análise de Custos</span>
          </button>
          <button className="btn-premium-solid indigo h-11 px-6 gap-2" onClick={() => handleOpenModal()}>
            <Plus size={20} strokeWidth={3} />
            <span>Nova Dieta</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card animate-slide-up" style={{ animationDelay: '0s' }}>
          <div className="summary-info">
            <span className="summary-label">Animais em Dieta</span>
            <span className="summary-value">{totalAnimaisDieta} <small className="text-xl text-slate-400">cab.</small></span>
            <p className="mt-4 text-emerald-600 font-extrabold flex items-center gap-2">
              <CheckCircle2 size={18} strokeWidth={2.5} /> Nutrição ativa
            </p>
          </div>
          <div className="summary-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <Beef size={36} strokeWidth={3} color="#10b981" />
          </div>
        </div>

        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Custo Médio/Animal</span>
            <span className="summary-value">R$ {custoMedio}</span>
            <p className="mt-4 text-amber-600 font-extrabold flex items-center gap-2">
              <DollarSign size={18} strokeWidth={2.5} /> Base 30 dias
            </p>
          </div>
          <div className="summary-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <DollarSign size={36} strokeWidth={3} color="#f59e0b" />
          </div>
        </div>

        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Consumo Matéria Seca</span>
            <span className="summary-value">2.4<small className="text-xl text-slate-400">% PV</small></span>
            <p className="mt-4 text-sky-600 font-extrabold flex items-center gap-2">
              <Zap size={18} strokeWidth={2.5} /> PV Otimizado
            </p>
          </div>
          <div className="summary-icon" style={{ background: 'rgba(14, 165, 233, 0.1)' }}>
            <Zap size={36} strokeWidth={3} color="#0ea5e9" />
          </div>
        </div>

        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Eficiência Alimentar</span>
            <span className="summary-value">1.45 <small className="text-xl text-slate-400">GMD</small></span>
            <p className="mt-4 text-emerald-600 font-extrabold flex items-center gap-2">
              <Activity size={18} strokeWidth={2.5} /> Méd. Rebanho
            </p>
          </div>
          <div className="summary-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <TrendingUp size={36} strokeWidth={3} color="#10b981" />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por nome da dieta or categoria..."
          onToggleAdvanced={() => setIsFiltersOpen(!isFiltersOpen)}
          isAdvancedOpen={isFiltersOpen}
        />


        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome da Dieta</th>
                <th>Categoria</th>
                <th>CMS (kg/dia)</th>
                <th>Custo/Cab/Dia</th>
                <th>Ingredientes</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'nome', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'categoria', type: 'select', options: Array.from(new Set(dietas.map(d => d.categoria))) },
                    { key: 'cms', type: 'text', placeholder: 'CMS...' },
                    { key: 'custo', type: 'text', placeholder: 'Custo...' },
                    { key: 'status', type: 'select', options: ['Ativa', 'Ajuste Necessário', 'Programada'] }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((reg) => (
                <tr key={reg.id}>
                  <td><span className="text-slate-800 font-black text-lg">{reg.nome}</span></td>
                  <td><span className="category-pill">{reg.loteId ? `Lote: ${reg.loteId}` : reg.categoria}</span></td>
                  <td><span className="font-bold text-slate-500">{reg.cmsProjetado} <small className="text-xs text-slate-500">kg</small></span></td>
                  <td><span className="font-black text-emerald-600 text-lg">R$ {reg.custoPorCab.toFixed(2)}</span></td>
                  <td>
                    <div className="ingredient-stack flex items-center gap-2">
                       <PackageCheck size={16} className="text-sky-600" />
                       <span className="font-bold text-slate-500">{reg.ingredientes.length} itens vinculados</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge diet-${reg.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {reg.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="actions-cell">
                      <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(reg, true)}>
                        <Eye size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(reg)}>
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
          label="dietas"
        />
      </div>
    
      <StandardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? 'Detalhes Nutricionais' : (selectedDieta ? 'Editar Dieta' : 'Nova Formulação Dietética')}
        subtitle="Gestão de ingredientes e integração direta com o estoque de grãos e núcleos."
        icon={Apple}
        size="lg"
        footer={
          <div className="flex gap-3">
            <button type="button" className="btn-premium-outline" onClick={handleCloseModal}>Fechar</button>
            {!isViewMode && <button type="submit" form="diet-form" className="btn-premium-solid indigo">Salvar e Atualizar Custo</button>}
          </div>
        }
      >
        <div className="modal-tabs">
          <button className={activeTab === 'geral' ? 'active' : ''} onClick={() => setActiveTab('geral')}>Geral</button>
          <button className={activeTab === 'composicao' ? 'active' : ''} onClick={() => setActiveTab('composicao')}>Composição</button>
          <button className={activeTab === 'eficiencia' ? 'active' : ''} onClick={() => setActiveTab('eficiencia')}>Eficiência</button>
          {selectedDieta?.loteId && (
            <button className={activeTab === 'detalhamento' ? 'active' : ''} onClick={() => setActiveTab('detalhamento')}>Detalhamento</button>
          )}
        </div>
            
              <form id="diet-form" onSubmit={(e) => { 
                e.preventDefault(); 
                const formData = new FormData(e.currentTarget);
                const updatedDieta: Dieta = {
                  ...selectedDieta!,
                  id: selectedDieta?.id || Math.random().toString(36).substr(2, 9),
                  nome: formData.get('nome') as string,
                  categoria: formData.get('categoria') as string,
                  cmsProjetado: Number(formData.get('cmsProjetado')),
                  status: formData.get('status') as any,
                  loteId: formData.get('loteId') as string,
                };
                saveDietaMutation.mutate(updatedDieta);
                handleCloseModal(); 
              }}>
                {activeTab === 'geral' && (
                  <div className="form-grid">
                    <div className="form-group col-12">
                      <label>Título da Dieta / Identificação</label>
                      <div className="input-with-icon">
                        <input type="text" name="nome" defaultValue={selectedDieta?.nome} disabled={isViewMode} required placeholder="Ex: Dieta Acabamento V2" />
                        <Activity size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Vincular a Lote (Opcional)</label>
                      <div className="input-with-icon">
                        <select name="loteId" defaultValue={selectedDieta?.loteId} disabled={isViewMode}>
                          <option value="">Nenhum Lote</option>
                          <option value="1">Lote 01 - Recria Nelore</option>
                          <option value="2">Lote 02 - Engorda Machos</option>
                          <option value="3">Lote 03 - Novilhas Reprod.</option>
                        </select>
                        <Layers size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Categoria Animal</label>
                      <div className="input-with-icon">
                        <select name="categoria" defaultValue={selectedDieta?.categoria} disabled={isViewMode}>
                          <option>Engorda Intensiva</option>
                          <option>Recria</option>
                          <option>Adaptação</option>
                          <option>Bezerros (Creep)</option>
                        </select>
                        <Beef size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>CMS Projetado (kg/dia)</label>
                      <div className="input-with-icon">
                        <input type="number" name="cmsProjetado" step="0.1" defaultValue={selectedDieta?.cmsProjetado} disabled={isViewMode} required />
                        <Scale size={18} className="field-icon" />
                      </div>
                    </div>
                    <div className="form-group col-6">
                      <label>Status Operacional</label>
                      <div className="input-with-icon">
                        <select name="status" defaultValue={selectedDieta?.status} disabled={isViewMode}>
                          <option>Ativa</option>
                          <option>Ajuste Necessário</option>
                          <option>Programada</option>
                        </select>
                        <CheckCircle2 size={18} className="field-icon" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'composicao' && (
                  <div className="inventory-integration">
                    <div className="integration-header">
                      <FlaskConical size={20} />
                      <h4>Ingredientes Selecionados do Estoque</h4>
                    </div>
                    
                    <div className="ingredient-list">
                      <div className="list-header">
                        <span>Ingrediente</span>
                        <span>Part. (%)</span>
                        <span>Custo/kg</span>
                      </div>
                      {selectedDieta?.ingredientes.map((ing, idx) => (
                        <div key={idx} className="ingredient-row">
                          <span className="ing-name">{ing.nome}</span>
                          <span className="ing-perc">{ing.proporcao}%</span>
                          <span className="ing-cost">R$ {ing.custoUnitario.toFixed(2)}</span>
                          {!isViewMode && <button type="button" className="remove-ing"><X size={14} /></button>}
                        </div>
                      ))}
                      {!isViewMode && (
                        <button type="button" className="btn-premium-outline w-full py-3">
                          <Plus size={16} strokeWidth={3} /> Vincular Item do Estoque
                        </button>
                      )}
                    </div>

                    {!isViewMode && (
                      <div className="info-box primary">
                        <p><strong>Integração Financeira:</strong> O custo total da dieta é recalculado automaticamente com base nos valores de entrada do Estoque.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'eficiencia' && (
                  <div className="efficiency-form">
                    <div className="form-grid">
                      <div className="form-group col-6">
                        <label>GMD Esperado (kg/dia)</label>
                        <div className="input-with-icon">
                          <input type="number" step="0.001" defaultValue={1.450} disabled={isViewMode} />
                          <TrendingUp size={18} className="field-icon" />
                        </div>
                      </div>
                      <div className="form-group col-6">
                        <label>Conversão Alimentar Meta</label>
                        <div className="input-with-icon">
                          <input type="number" step="0.1" defaultValue={6.5} disabled={isViewMode} />
                          <Activity size={18} className="field-icon" />
                        </div>
                      </div>
                      <div className="form-group full-width">
                         <div className="efficiency-indicator-box">
                            <Zap size={24} className="text-warning" />
                            <div>
                               <strong>Inteligência Estimada: Custo de Arroba Produzida</strong>
                               <p>Com base no CMS de {selectedDieta?.cmsProjetado || 0}kg e GMD de 1.450kg, o custo projetado por arroba produzida é de:</p>
                            </div>
                            <div className="arroba-badge">
                               R$ {((selectedDieta?.custoPorCab || 0) / (1.450 / 30) * 30).toFixed(2)}
                            </div>
                         </div>
                      </div>
                    </div>
                    
                    <div className="historico-trato-section">
                      <h4>Log de Trato Recente (Baixa de Estoque)</h4>
                      <div className="trato-list">
                        <div className="trato-header">
                          <span>Data</span>
                          <span>Quantidade</span>
                          <span>Status</span>
                        </div>
                        {selectedDieta?.historicoTrato.map(trato => (
                          <div key={trato.id} className="trato-row">
                            <span>{new Date(trato.data).toLocaleDateString('pt-BR')}</span>
                            <span className="font-bold">{trato.quantidadeEntregue} kg</span>
                            <span className={`status-tag ${trato.status.toLowerCase()}`}>{trato.status}</span>
                          </div>
                        ))}
                        {!isViewMode && (
                          <button type="button" className="btn-premium-outline w-full py-3 mt-4">
                            <Plus size={16} strokeWidth={3} /> Registrar Entrega de Trato
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'detalhamento' && (
                  <div className="animal-detail-pane fade-in">
                    <div className="detail-controls">
                       <div className="detail-header-info">
                          <Users size={18} />
                          <span>Animais vinculados ao <strong>Lote {selectedDieta?.loteId}</strong></span>
                       </div>
                       <div className="cost-mode-toggle">
                          <label className={costCalculationMode === 'fixed' ? 'active' : ''}>
                             <input 
                               type="radio" 
                               name="costMode" 
                               value="fixed" 
                               checked={costCalculationMode === 'fixed'} 
                               onChange={() => setCostCalculationMode('fixed')} 
                             />
                             Custo Fixo
                          </label>
                          <label className={costCalculationMode === 'proportional' ? 'active' : ''}>
                             <input 
                               type="radio" 
                               name="costMode" 
                               value="proportional" 
                               checked={costCalculationMode === 'proportional'} 
                               onChange={() => setCostCalculationMode('proportional')} 
                             />
                             Custo por Peso
                          </label>
                       </div>
                    </div>

                    <div className="animal-cost-table">
                       <div className="table-header">
                          <span>Brinco</span>
                          <span>Peso Est.</span>
                          <span>Custo/Dia</span>
                          <span>Custo Acumulado</span>
                       </div>
                       <div className="table-body">
                          {(() => {
                            const matchingLoteId = selectedDieta?.loteId;
                            // Match "Lote 01", "Lote 1", "Lote 01 - ..."
                            const lotAnimals = animais.filter(a => {
                               if (!matchingLoteId) return false;
                               const searchStr = `Lote ${matchingLoteId.padStart(2, '0')}`;
                               return a.lote.startsWith(searchStr);
                            });
                            const totalWeight = lotAnimals.reduce((acc, a) => acc + a.peso, 0);
                            
                            return lotAnimals.map(animal => {
                               const animalDailyCost = financialService.calculateNutritionCost(
                                 animal,
                                 selectedDieta ?? undefined,
                                 lotAnimals,
                                 1, // Daily cost
                                 costCalculationMode
                               );
                               
                               return (
                                 <div key={animal.id} className="animal-cost-row">
                                    <span>{animal.brinco}</span>
                                    <span>{animal.peso} kg {costCalculationMode === 'proportional' && <small>({(animal.peso / (totalWeight || 1) * 100).toFixed(1)}%)</small>}</span>
                                    <span className="text-primary font-bold">R$ {animalDailyCost.toFixed(2)}</span>
                                    <span className="muted">R$ {(animalDailyCost * 15).toFixed(2)} <small>(15 d)</small></span>
                                 </div>
                               );
                            });
                          })()}
                       </div>
                    </div>

                    <div className="detail-footer-box info">
                       <DollarSign size={16} />
                       <p>
                         {costCalculationMode === 'proportional' 
                           ? "O custo é atribuído proporcionalmente ao peso do animal em relação ao total do lote."
                           : "O custo é atribuído de forma igualitária (per capita) para todos os animais do lote."
                         }
                       </p>
                    </div>
                  </div>
                )}

              </form>
      </StandardModal>
    </div>
  );
};

