import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { Beef, Plus, Search, Filter, Download, ChevronLeft, ChevronRight, Eye, Edit, Trash2, Calendar, Tag, Weight, MapPin, Activity, History, Info, BarChart3, ArrowUpRight, ArrowDownRight, DollarSign, CheckCircle2, Hash, X, ShieldCheck } from 'lucide-react';
import './Rebanho.css';
import { RelatoriosRebanho } from './RelatoriosRebanho';
import { ModernModal } from '../../components/ModernModal';
import { Animal, CustoLancamento, RegistroSanitario, Dieta } from '../../types';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';
import { financialService } from '../../services/financialService';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters, ColumnFilterConfig } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import { useCompany } from '../../contexts/CompanyContext';

const calculateCategory = (dataNasc: string, sexo: 'M' | 'F'): string => {
  const birthDate = new Date(dataNasc);
  const now = new Date();
  const diffInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());

  if (sexo === 'M') {
    if (diffInMonths < 12) return 'Bezerro';
    if (diffInMonths < 24) return 'Garrote';
    return 'Touro/Boi Erado';
  } else {
    if (diffInMonths < 12) return 'Bezerra';
    if (diffInMonths < 24) return 'Novilha';
    return 'Vaca';
  }
};

export const Rebanho = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [activeTab, setActiveTab] = useState<'geral' | 'genealogia' | 'manejo' | 'financeiro'>('geral');
  const [isViewMode, setIsViewMode] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterSexo, setFilterSexo] = useState('Todos');
  const [filterLote, setFilterLote] = useState('Todos os Lotes');
  const [filterPasto, setFilterPasto] = useState('Todos os Pastos');
  const [columnFilters, setColumnFilters] = useState({
    brinco: '',
    sexo: 'Todos',
    categoria: 'Todos',
    raca: 'Todos',
    lote: 'Todos',
    pasto: 'Todos',
    peso: '',
    status: 'Todos'
  });
  const [costCalculationMode, setCostCalculationMode] = useState<'fixed' | 'proportional'>('proportional');
  const [showReports, setShowReports] = useState(false);
  const { activeCompanyId } = useCompany();

  const allAnimais = useLiveQuery(() => db.animais.toArray()) || [];
  const dietas = useLiveQuery(() => db.dietas.toArray()) || [];
  const registrosSanitarios = useLiveQuery(() => db.registrosSanitarios.toArray()) || [];

  const animais = allAnimais.filter(a => activeCompanyId === 'Todas' || a.empresaId === activeCompanyId);

  useEscapeKey(() => {
    if (isModalOpen) handleCloseModal();
  });

  const handleOpenModal = (animal: Animal | null = null, viewOnly = false) => {
    setSelectedAnimal(animal);
    setIsViewMode(viewOnly);
    setActiveTab('geral');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAnimal(null);
    setIsViewMode(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este animal?')) {
       await dataService.deleteItem('animais', id);
    }
  };

  const totalCabecas = animais.length;
  const totalMachos = animais.filter(a => a.sexo === 'M').length;
  const totalFemeas = animais.filter(a => a.sexo === 'F').length;
  const pesoMedio = totalCabecas > 0 ? (animais.reduce((acc, a) => acc + a.peso, 0) / totalCabecas).toFixed(1) : 0;
  const percMachos = totalCabecas > 0 ? Math.round((totalMachos / totalCabecas) * 100) : 0;
  const percFemeas = totalCabecas > 0 ? Math.round((totalFemeas / totalCabecas) * 100) : 0;

  const filteredData = animais.filter(a => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = a.brinco.toLowerCase().includes(searchLower) ||
      a.raca.toLowerCase().includes(searchLower) ||
      a.lote.toLowerCase().includes(searchLower) ||
      a.pasto.toLowerCase().includes(searchLower) ||
      a.sexo.toLowerCase().includes(searchLower) ||
      a.categoria.toLowerCase().includes(searchLower) ||
      a.status.toLowerCase().includes(searchLower) ||
      a.peso.toString().includes(searchLower);
    
    const matchesStatus = filterStatus === 'Todos' || a.status === filterStatus;
    const matchesSexo = filterSexo === 'Todos' || a.sexo === (filterSexo === 'Macho' ? 'M' : 'F');
    const matchesLote = filterLote === 'Todos os Lotes' || a.lote === filterLote;
    const matchesPasto = filterPasto === 'Todos os Pastos' || a.pasto === filterPasto;

    const matchesColumnFilters = 
      (columnFilters.brinco === '' || a.brinco.toLowerCase().includes(columnFilters.brinco.toLowerCase())) &&
      (columnFilters.sexo === 'Todos' || a.sexo === (columnFilters.sexo === 'Macho' ? 'M' : 'F')) &&
      (columnFilters.categoria === 'Todos' || a.categoria === columnFilters.categoria) &&
      (columnFilters.raca === 'Todos' || a.raca === columnFilters.raca) &&
      (columnFilters.lote === 'Todos' || a.lote === columnFilters.lote) &&
      (columnFilters.pasto === 'Todos' || a.pasto === columnFilters.pasto) &&
      (columnFilters.peso === '' || a.peso.toString().includes(columnFilters.peso)) &&
      (columnFilters.status === 'Todos' || a.status === columnFilters.status);

    return matchesSearch && matchesStatus && matchesSexo && matchesLote && matchesPasto && matchesColumnFilters;
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
        <span>Pecuária</span>
        <ChevronRight size={14} />
        <span>Rebanho</span>
      </nav>

      {!showReports && (
        <div className="page-header-row">
          <div className="title-section">
            <div className="icon-badge indigo">
            <Beef size={32} />
          </div>
            <div>
              <h1>Gestão de Rebanho</h1>
              <p className="description">Potencialize a pecuária com dados precisos de cada animal.</p>
            </div>
          </div>
          <div className="action-buttons">
            <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
              <Plus size={20} strokeWidth={3} />
              <span>Novo Animal</span>
            </button>
          </div>
        </div>
      )}

      {showReports ? (
        <RelatoriosRebanho onBack={() => setShowReports(false)} />
      ) : (
        <>
          <div className="summary-grid">
            <div className="summary-card card glass">
              <div className="summary-info">
                <span className="summary-label">Total de Cabeças</span>
                <span className="summary-value">{totalCabecas.toLocaleString()}</span>
              </div>
              <div className="summary-icon indigo">
                <Beef size={24} strokeWidth={3} />
              </div>
            </div>
            <div className="summary-card card glass">
              <div className="summary-info">
                <span className="summary-label">Machos</span>
                <span className="summary-value">{totalMachos}</span>
                <span className="summary-subtext">{percMachos}% do rebanho</span>
              </div>
              <div className="summary-icon warning">
                <div className="gender-icon">M</div>
              </div>
            </div>
            <div className="summary-card card glass">
              <div className="summary-info">
                <span className="summary-label">Fêmeas</span>
                <span className="summary-value">{totalFemeas}</span>
                <span className="summary-subtext">{percFemeas}% do rebanho</span>
              </div>
              <div className="summary-icon secondary">
                <div className="gender-icon">F</div>
              </div>
            </div>
            <div className="summary-card card glass">
              <div className="summary-info">
                <span className="summary-label">Peso Médio</span>
                <span className="summary-value">{pesoMedio} kg</span>
              </div>
              <div className="summary-icon primary">
                <BarChart3 size={24} strokeWidth={3} />
              </div>
            </div>
          </div>

          <div className="data-section">
            <TableFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar por brinco, raça ou lote..."
              onToggleAdvanced={() => setIsFiltersOpen(!isFiltersOpen)}
              isAdvancedOpen={isFiltersOpen}
            />

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Brinco</th>
                    <th>Sexo</th>
                    <th>Categoria</th>
                    <th>Raça</th>
                    <th>Lote</th>
                    <th>Pasto</th>
                    <th>Peso (kg)</th>
                    <th>Status</th>
                    <th className="text-right">Ações</th>
                  </tr>
                  {isFiltersOpen && (
                    <ColumnFilters
                      columns={[
                        { key: 'brinco', type: 'text', placeholder: 'Filtrar...' },
                        { key: 'sexo', type: 'select', options: ['Macho', 'Fêmea'] },
                        { key: 'categoria', type: 'select', options: [...new Set(animais.map(a => a.categoria))] },
                        { key: 'raca', type: 'select', options: [...new Set(animais.map(a => a.raca))] },
                        { key: 'lote', type: 'select', options: [...new Set(animais.map(a => a.lote))] },
                        { key: 'pasto', type: 'select', options: [...new Set(animais.map(a => a.pasto))] },
                        { key: 'peso', type: 'text', placeholder: 'Peso...' },
                        { key: 'status', type: 'select', options: ['Ativo', 'Vendido', 'Baixa'] },
                      ]}
                      values={columnFilters}
                      onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                    />
                  )}
                </thead>
                <tbody>
                  {paginatedData.map((animal) => (
                    <tr key={animal.id}>
                      <td><span className="brinco-tag">{animal.brinco}</span></td>
                      <td>
                        <span className={`gender-badge ${animal.sexo}`}>
                          {animal.sexo === 'M' ? 'Macho' : 'Fêmea'}
                        </span>
                      </td>
                      <td>{animal.categoria}</td>
                      <td>{animal.raca}</td>
                      <td>{animal.lote}</td>
                      <td>{animal.pasto}</td>
                      <td className="font-bold">{animal.peso} kg</td>
                      <td>
                        <span className={`status-badge ${animal.status.toLowerCase() === 'ativo' ? 'active' : (animal.status.toLowerCase() === 'vendido' ? 'sold' : 'lost')}`}>
                          {animal.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="actions-cell">
                          <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(animal, true)}>
                            <Eye size={18} strokeWidth={3} />
                          </button>
                          <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(animal)}>
                            <Edit size={18} strokeWidth={3} />
                          </button>
                          <button className="action-btn-global btn-delete" title="Excluir" onClick={() => handleDelete(animal.id)}>
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
              label="animais"
            />
          </div>
        </>
      )}

      <ModernModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? 'Dossiê do Animal' : (selectedAnimal ? 'Editar Animal' : 'Novo Registro de Animal')}
        subtitle="Gestão completa de dados zootécnicos e financeiros."
        icon={Beef}
        footer={
          <>
            <button type="button" className="btn-premium-outline" onClick={handleCloseModal}>
              <X size={18} strokeWidth={3} />
              <span>{isViewMode ? 'Fechar' : 'Cancelar'}</span>
            </button>
            {!isViewMode && (
              <button type="submit" form="rebanho-form" className="btn-premium-solid indigo">
                <span>{selectedAnimal ? 'Salvar Alterações' : 'Cadastrar Animal'}</span>
                {selectedAnimal ? <CheckCircle2 size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
              </button>
            )}
          </>
        }
      >
        <div className="modal-tabs mb-6">
          <button className={`tab-btn ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>Geral</button>
          <button className={`tab-btn ${activeTab === 'genealogia' ? 'active' : ''}`} onClick={() => setActiveTab('genealogia')}>Genealogia</button>
          <button className={`tab-btn ${activeTab === 'manejo' ? 'active' : ''}`} onClick={() => setActiveTab('manejo')}>Manejo</button>
          <button className={`tab-btn ${activeTab === 'financeiro' ? 'active' : ''}`} onClick={() => setActiveTab('financeiro')}>Financeiro</button>
        </div>
        
        <div className="sidesheet-body-content">
          <form 
            id="rebanho-form"
            onSubmit={async (e) => { 
              e.preventDefault(); 
              const formData = new FormData(e.currentTarget);
              const updatedAnimal: Animal = {
                ...selectedAnimal!,
                id: selectedAnimal?.id || Math.random().toString(36).substr(2, 9),
                brinco: formData.get('brinco') as string,
                sexo: formData.get('sexo') as any,
                raca: formData.get('raca') as string,
                dataNasc: formData.get('dataNasc') as string,
                lote: formData.get('lote') as string,
                pasto: formData.get('pasto') as string,
                peso: Number(formData.get('peso')),
                status: formData.get('status') as any,
                categoria: calculateCategory(formData.get('dataNasc') as string, formData.get('sexo') as any),
                custoAquisicao: selectedAnimal?.custoAquisicao || 0,
                custoNutricao: selectedAnimal?.custoNutricao || 0,
                custoSanidade: selectedAnimal?.custoSanidade || 0,
                custoReproducao: selectedAnimal?.custoReproducao || 0,
                custoConfinamento: selectedAnimal?.custoConfinamento || 0,
                custoOperacional: selectedAnimal?.custoOperacional || 0,
                statusEmAbate: selectedAnimal?.statusEmAbate || false,
                historicoCustos: selectedAnimal?.historicoCustos || [],
                empresaId: selectedAnimal?.empresaId,
                tenant_id: 'default'
              };
              await dataService.saveItem('animais', updatedAnimal);
              handleCloseModal(); 
            }}
          >
            {activeTab === 'geral' && (
              <div className="modern-form-section">
                <div className="modern-form-row four-cols">
                  <div className="modern-form-group col-span-2">
                    <label>Identificação / Brinco</label>
                    <div className="modern-input-wrapper">
                      <input type="text" name="brinco" className="modern-input text-lg font-bold" defaultValue={selectedAnimal?.brinco} placeholder="Ex: 8922" required disabled={isViewMode} />
                      <Hash size={20} className="modern-field-icon" />
                    </div>
                  </div>
                  <div className="modern-form-group">
                    <label>Sexo</label>
                    <div className="modern-input-wrapper">
                      <select name="sexo" className="modern-input" defaultValue={selectedAnimal?.sexo || 'M'} required disabled={isViewMode}>
                        <option value="M">Macho</option>
                        <option value="F">Fêmea</option>
                      </select>
                      <Activity size={18} className="modern-field-icon" />
                    </div>
                  </div>
                  <div className="modern-form-group">
                    <label>Nascimento</label>
                    <div className="modern-input-wrapper">
                      <input type="date" name="dataNasc" className="modern-input" defaultValue={selectedAnimal?.dataNasc} required disabled={isViewMode} />
                      <Calendar size={18} className="modern-field-icon" />
                    </div>
                  </div>
                </div>

                <div className="modern-form-row">
                  <div className="modern-form-group">
                    <label>Raça Dominante</label>
                    <div className="modern-input-wrapper">
                      <input type="text" name="raca" className="modern-input" defaultValue={selectedAnimal?.raca} placeholder="Ex: Nelore" required disabled={isViewMode} />
                      <Beef size={18} className="modern-field-icon" />
                    </div>
                  </div>
                  <div className="modern-form-group">
                    <label>Status Animal</label>
                    <div className="modern-input-wrapper">
                      <select name="status" className="modern-input" defaultValue={selectedAnimal?.status || 'Ativo'} required disabled={isViewMode}>
                        <option value="Ativo">🟢 Ativo no Plantel</option>
                        <option value="Vendido">💰 Vendido / Saída</option>
                        <option value="Baixa">❌ Baixa / Óbito</option>
                      </select>
                      <ShieldCheck size={18} className="modern-field-icon" />
                    </div>
                  </div>
                </div>

                <div className="modern-info-tag indigo full-width">
                  <Info size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">A categoria é calculada automaticamente baseada na idade e sexo.</span>
                </div>
              </div>
            )}

            {activeTab === 'genealogia' && (
              <div className="modern-form-section">
                <div className="modern-form-row">
                  <div className="modern-form-group">
                    <label>Número SISBOV</label>
                    <div className="modern-input-wrapper">
                      <input type="text" className="modern-input" defaultValue={selectedAnimal?.sisbov} placeholder="Ex: 076.1234.9" disabled={isViewMode} />
                      <Info size={18} className="modern-field-icon" />
                    </div>
                  </div>
                  <div className="modern-form-group">
                    <label>ID Eletrônico (RFID)</label>
                    <div className="modern-input-wrapper">
                      <input type="text" className="modern-input" defaultValue={selectedAnimal?.idEletronico} placeholder="Ex: A123B456" disabled={isViewMode} />
                      <Activity size={18} className="modern-field-icon" />
                    </div>
                  </div>
                </div>
                <div className="modern-form-row">
                  <div className="modern-form-group">
                    <label>Identificação do Pai</label>
                    <div className="modern-input-wrapper">
                      <input type="text" className="modern-input" defaultValue={selectedAnimal?.pai} placeholder="Ex: Nelore PO 55" disabled={isViewMode} />
                      <Beef size={18} className="modern-field-icon" />
                    </div>
                  </div>
                  <div className="modern-form-group">
                    <label>Identificação da Mãe</label>
                    <div className="modern-input-wrapper">
                      <input type="text" className="modern-input" defaultValue={selectedAnimal?.mae} placeholder="Ex: Matriz 204" disabled={isViewMode} />
                      <Beef size={18} className="modern-field-icon" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'manejo' && (
              <div className="modern-form-section">
                <div className="modern-form-row four-cols">
                  <div className="modern-form-group col-span-2">
                    <label>Lote Atual</label>
                    <div className="modern-input-wrapper">
                      <input type="text" name="lote" className="modern-input" defaultValue={selectedAnimal?.lote} placeholder="Ex: Lote 01" required disabled={isViewMode} />
                      <Tag size={18} className="modern-field-icon" />
                    </div>
                  </div>
                  <div className="modern-form-group col-span-2">
                    <label>Pasto / Piquete</label>
                    <div className="modern-input-wrapper">
                      <input type="text" name="pasto" className="modern-input" defaultValue={selectedAnimal?.pasto} placeholder="Ex: Pasto das Flores" required disabled={isViewMode} />
                      <MapPin size={18} className="modern-field-icon" />
                    </div>
                  </div>
                </div>
                <div className="modern-form-row">
                  <div className="modern-form-group full-width">
                    <label>Peso Entrada (kg)</label>
                    <div className="modern-input-wrapper">
                      <input type="number" name="peso" className="modern-input text-lg font-bold" defaultValue={selectedAnimal?.peso} placeholder="Ex: 450" required disabled={isViewMode} />
                      <Weight size={18} className="modern-field-icon" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'financeiro' && selectedAnimal && (
              <div className="modern-form-section">
                {(() => {
                  const lotAnimals = animais.filter(a => a.lote === selectedAnimal.lote);
                  const matchingLoteId = selectedAnimal.lote?.includes('Lote 01') ? '1' : selectedAnimal.lote?.includes('Lote 02') ? '2' : '';
                  const diet = dietas.find(d => d.loteId === matchingLoteId);
                  const lotSanitationCost = financialService.calculateSanitationCost(selectedAnimal, registrosSanitarios, lotAnimals.length);
                  const lotNutritionCost = financialService.calculateNutritionCost(selectedAnimal, diet, lotAnimals, 30, costCalculationMode);
                  const totalInvestido = financialService.calculateTotalAnimalInvestment(selectedAnimal, lotSanitationCost, lotNutritionCost);
                  const roi = Math.round(((selectedAnimal.peso / 30 * 280) / (totalInvestido || 1) - 1) * 100);

                  return (
                    <div className="modern-financial-pane">
                      <div className="modern-form-row mb-6">
                        <div className="modern-info-tag indigo flex-1">
                          <DollarSign size={20} />
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase opacity-70">Total Investido</span>
                            <span className="text-lg font-bold">R$ {totalInvestido.toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                        <div className={`modern-info-tag ${roi >= 0 ? 'emerald' : 'amber'} flex-1`}>
                          <BarChart3 size={20} />
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase opacity-70">ROI Estimado</span>
                            <span className="text-lg font-bold">{roi > 0 ? '+' : ''}{roi}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="modern-cost-list bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-100">
                         <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 block">Detalhamento de Custos</span>
                         {[
                           { label: 'Aquisição', val: selectedAnimal.custoAquisicao, color: '#6366f1', icon: <Plus size={14} /> },
                           { label: 'Nutrição', val: lotNutritionCost, color: '#10b981', icon: <Activity size={14} /> },
                           { label: 'Sanidade', val: lotSanitationCost, color: '#ef4444', icon: <Activity size={14} /> },
                           { label: 'Operacional', val: selectedAnimal.custoOperacional + selectedAnimal.custoReproducao, color: '#f59e0b', icon: <BarChart3 size={14} /> }
                         ].map(item => (
                           <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors rounded-lg px-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                                  {item.icon}
                                </div>
                                <span className="font-semibold text-slate-700">{item.label}</span>
                              </div>
                              <span className="font-bold text-slate-900">R$ {item.val.toLocaleString('pt-BR')}</span>
                           </div>
                         ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </form>
        </div>
      </ModernModal>
    </div>
  );
};
