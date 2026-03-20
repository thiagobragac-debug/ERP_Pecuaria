import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Beef,
  Info
} from 'lucide-react';
import './Nutricao.css';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import { Dieta, Ingrediente, LogTrato, Animal } from '../../types';


import { useCompany } from '../../contexts/CompanyContext';
import { AnaliseCustoNutricao } from './AnaliseCustoNutricao';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';
import { financialService } from '../../services/financialService';

export const Nutricao = () => {
  const { activeCompanyId } = useCompany();
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

  // Live Queries
  const allDietas = useLiveQuery(() => db.dietas.toArray()) || [];
  const allAnimais = useLiveQuery(() => db.animais.toArray()) || [];

  const dietas = allDietas.filter(d => activeCompanyId === 'Todas' || d.empresaId === activeCompanyId);
  const animais = allAnimais.filter(a => activeCompanyId === 'Todas' || a.empresaId === activeCompanyId);

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
      <nav className="subpage-breadcrumb">
        <Link to="/pecuaria/rebanho">Pecuária</Link>
        <ChevronRight size={14} />
        <span>Nutrição</span>
      </nav>
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <Utensils size={32} />
          </div>
          <div>
            <h1>Inteligência Nutricional</h1>
            <p className="description">Planos de dieta, conversão alimentar e otimização de custos de cocho.</p>
          </div>
        </div>
        <div className="action-buttons flex items-center gap-6">
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
        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0s' }}>
          <div className="summary-info">
            <span className="summary-label">Animais em Dieta</span>
            <span className="summary-value">{totalAnimaisDieta} <small className="text-xl text-slate-400">cab.</small></span>
            <p className="mt-4 text-emerald-600 font-extrabold flex items-center gap-2">
              <CheckCircle2 size={18} strokeWidth={2.5} /> Nutrição ativa
            </p>
          </div>
          <div className="summary-icon emerald">
            <Beef size={24} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Custo Médio/Animal</span>
            <span className="summary-value">R$ {custoMedio}</span>
            <p className="mt-4 text-amber-600 font-extrabold flex items-center gap-2">
              <DollarSign size={18} strokeWidth={2.5} /> Base 30 dias
            </p>
          </div>
          <div className="summary-icon amber">
            <DollarSign size={24} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Consumo Matéria Seca</span>
            <span className="summary-value">2.4<small className="text-xl text-slate-400">% PV</small></span>
            <p className="mt-4 text-sky-600 font-extrabold flex items-center gap-2">
              <Zap size={18} strokeWidth={2.5} /> PV Otimizado
            </p>
          </div>
          <div className="summary-icon sky">
            <Zap size={24} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Eficiência Alimentar</span>
            <span className="summary-value">1.45 <small className="text-xl text-slate-400">GMD</small></span>
            <p className="mt-4 text-emerald-600 font-extrabold flex items-center gap-2">
              <Activity size={18} strokeWidth={2.5} /> Méd. Rebanho
            </p>
          </div>
          <div className="summary-icon emerald">
            <TrendingUp size={24} strokeWidth={3} />
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

      <ModernModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? 'Dossiê Nutricional' : (selectedDieta ? 'Editar Formulação' : 'Manejo Nutricional')}
        subtitle="Gestão estratégica de ingredientes e performance de ganho."
        icon={Apple}
        footer={
          <>
            <button type="button" className="btn-modern-secondary" onClick={handleCloseModal}>
              <X size={18} />
              <span>{isViewMode ? 'Fechar' : 'Cancelar'}</span>
            </button>
            {!isViewMode && (
              <button type="submit" form="nutricao-form" className="btn-modern-primary">
                <span>{selectedDieta ? 'Salvar Alterações' : 'Cadastrar Dieta'}</span>
                {selectedDieta ? <CheckCircle2 size={18} /> : <Plus size={18} />}
              </button>
            )}
          </>
        }
      >
        <div className="modal-tabs mb-6">
          <button className={`tab-btn ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>Geral</button>
          <button className={`tab-btn ${activeTab === 'composicao' ? 'active' : ''}`} onClick={() => setActiveTab('composicao')}>Composição</button>
          <button className={`tab-btn ${activeTab === 'eficiencia' ? 'active' : ''}`} onClick={() => setActiveTab('eficiencia')}>Eficiência</button>
          {selectedDieta?.loteId && (
            <button className={`tab-btn ${activeTab === 'detalhamento' ? 'active' : ''}`} onClick={() => setActiveTab('detalhamento')}>Detalhamento</button>
          )}
        </div>
            
        <div className="sidesheet-body-content">
            
        <form id="nutricao-form" className="modern-form-section" onSubmit={async (e) => { 
          e.preventDefault(); 
          const formData = new FormData(e.currentTarget);
          const updatedDieta: Dieta = {
            ...selectedDieta!,
            id: selectedDieta?.id || Math.random().toString(36).substr(2, 9),
            empresaId: selectedDieta?.empresaId || (activeCompanyId !== 'Todas' ? activeCompanyId : undefined),
            nome: formData.get('nome') as string,
            categoria: formData.get('categoria') as string,
            cmsProjetado: Number(formData.get('cmsProjetado')),
            status: formData.get('status') as any,
            loteId: formData.get('loteId') as string,
            ingredientes: selectedDieta?.ingredientes || [],
            historicoTrato: selectedDieta?.historicoTrato || [],
            custoPorCab: selectedDieta?.custoPorCab || 0,
            tenant_id: 'default'
          };
          await dataService.saveItem('dietas', updatedDieta);
          handleCloseModal(); 
        }}>
          {activeTab === 'geral' && (
            <div className="modern-form-section">
              <div className="modern-form-group full-width">
                <label>Título da Dieta / Identificação</label>
                <div className="modern-input-wrapper">
                  <input type="text" name="nome" className="modern-input text-lg font-bold" defaultValue={selectedDieta?.nome} disabled={isViewMode} required placeholder="Ex: Dieta Acabamento V2" />
                  <Activity size={18} className="modern-field-icon" />
                </div>
              </div>

              <div className="modern-form-row four-cols">
                <div className="modern-form-group col-span-2">
                  <label>Vincular a Lote (Opcional)</label>
                  <div className="modern-input-wrapper">
                    <select name="loteId" className="modern-input" defaultValue={selectedDieta?.loteId} disabled={isViewMode}>
                      <option value="">Nenhum Lote</option>
                      <option value="1">Lote 01 - Recria Nelore</option>
                      <option value="2">Lote 02 - Engorda Machos</option>
                      <option value="3">Lote 03 - Novilhas Reprod.</option>
                    </select>
                    <Layers size={18} className="modern-field-icon" />
                  </div>
                </div>
                <div className="modern-form-group col-span-2">
                  <label>Categoria Animal</label>
                  <div className="modern-input-wrapper">
                    <select name="categoria" className="modern-input" defaultValue={selectedDieta?.categoria} disabled={isViewMode}>
                      <option>Engorda Intensiva</option>
                      <option>Recria</option>
                      <option>Adaptação</option>
                      <option>Bezerros (Creep)</option>
                    </select>
                    <Beef size={18} className="modern-field-icon" />
                  </div>
                </div>
              </div>

              <div className="modern-form-row four-cols">
                <div className="modern-form-group col-span-2">
                  <label>CMS Projetado (kg/dia)</label>
                  <div className="modern-input-wrapper">
                    <input type="number" name="cmsProjetado" className="modern-input" step="0.1" defaultValue={selectedDieta?.cmsProjetado} disabled={isViewMode} required />
                    <Scale size={18} className="modern-field-icon" />
                  </div>
                </div>
                <div className="modern-form-group col-span-2">
                  <label>Status Operacional</label>
                  <div className="modern-input-wrapper">
                    <select name="status" className="modern-input" defaultValue={selectedDieta?.status} disabled={isViewMode}>
                      <option>Ativa</option>
                      <option>Ajuste Necessário</option>
                      <option>Programada</option>
                    </select>
                    <CheckCircle2 size={18} className="modern-field-icon" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'composicao' && (
            <div className="modern-form-section">
              <div className="modern-form-group-title flex items-center gap-2 mb-2">
                <FlaskConical size={18} className="text-indigo-500" />
                <span className="font-bold text-slate-700">Composição do Trato</span>
              </div>
              <div className="ingredient-list-modern">
                {selectedDieta?.ingredientes.map((ing, idx) => (
                  <div key={idx} className="modern-ingredient-card animate-slide-in">
                    <div className="ing-info">
                      <span className="ing-name-modern">{ing.nome}</span>
                      <span className="ing-sub">{ing.custoUnitario.toFixed(2)} / kg</span>
                    </div>
                    <div className="ing-perc-badge">{ing.proporcao}%</div>
                    {!isViewMode && <button type="button" className="ing-remove-btn"><X size={14} /></button>}
                  </div>
                ))}
                {!isViewMode && (
                  <button type="button" className="btn-modern-secondary w-full py-4 mt-2">
                    <Plus size={16} /> Vincular Item do Estoque
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'eficiencia' && (
            <div className="modern-form-section">
              <div className="modern-form-row">
                <div className="modern-form-group col-6">
                  <label>GMD Esperado (kg/dia)</label>
                  <div className="modern-input-wrapper">
                    <input type="number" className="modern-input" step="0.001" defaultValue={1.450} disabled={isViewMode} />
                    <TrendingUp size={18} className="modern-field-icon" />
                  </div>
                </div>
                <div className="modern-form-group col-6">
                  <label>Conversão Alimentar Meta</label>
                  <div className="modern-input-wrapper">
                    <input type="number" className="modern-input" step="0.1" defaultValue={6.5} disabled={isViewMode} />
                    <Activity size={18} className="modern-field-icon" />
                  </div>
                </div>
              </div>

              <div className="modern-info-tag emerald mb-6 full-width">
                 <Zap size={20} />
                 <div className="flex flex-col">
                   <span className="text-[10px] uppercase opacity-70">Custo Arroba Produzida (@)</span>
                   <span className="text-lg font-bold">R$ {((selectedDieta?.custoPorCab || 0) / (1.450 / 30) * 30).toFixed(2)}</span>
                 </div>
              </div>

              <div className="historico-trato-modern mt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Histórico de Cocho</span>
                  {!isViewMode && (
                    <button type="button" className="btn-modern-secondary btn-sm h-8 px-3 text-xs">
                      Nova Entrega
                    </button>
                  )}
                </div>
                <div className="trato-list-modern">
                  {selectedDieta?.historicoTrato.map(trato => (
                    <div key={trato.id} className="trato-row-modern">
                      <div className="trato-date">{new Date(trato.data).toLocaleDateString('pt-BR')}</div>
                      <div className="trato-qty font-bold">{trato.quantidadeEntregue} kg</div>
                      <div className={`status-dot ${trato.status.toLowerCase()}`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'detalhamento' && (
            <div className="modern-form-section">
              <div className="animal-cost-modern">
                 {(() => {
                    const matchingLoteId = selectedDieta?.loteId;
                    const lotAnimals = animais.filter(a => {
                      if (!matchingLoteId) return false;
                      const searchStr = `Lote ${matchingLoteId.padStart(2, '0')}`;
                      return a.lote.startsWith(searchStr);
                    });
                    
                    return lotAnimals.map(animal => (
                      <div key={animal.id} className="animal-cost-row-modern">
                        <div className="animal-brinco-tag">{animal.brinco}</div>
                        <div className="animal-weight">{animal.peso} kg</div>
                        <div className="animal-daily-cost">R$ {(selectedDieta?.custoPorCab || 0).toFixed(2)}</div>
                      </div>
                    ));
                 })()}
              </div>
            </div>
          )}
        </form>
        </div>
      </ModernModal>
    </div>
  );
};

