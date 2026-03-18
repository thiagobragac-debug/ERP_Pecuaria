import React, { useState, useEffect } from 'react';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { Beef, Plus, Search, Filter, Download, ChevronLeft, ChevronRight, Eye, Edit, Trash2, Calendar, Tag, Weight, MapPin, Activity, History, Info, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './Rebanho.css';
import { RelatoriosRebanho } from './RelatoriosRebanho';
import { StandardModal } from '../../components/StandardModal';
import { Animal, CustoLancamento, RegistroSanitario, Dieta } from '../../types';
import { useOfflineQuery, useOfflineMutation } from '../../hooks/useOfflineSync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { financialService } from '../../services/financialService';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters, ColumnFilterConfig } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';


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
  const isOnline = useOnlineStatus();

  // Offline-first Queries
  const { data: animais = [], isLoading: isLoadingAnimais } = useOfflineQuery<Animal>(['animais'], 'animais');
  const { data: dietas = [] } = useOfflineQuery<Dieta>(['dietas'], 'dietas');
  const { data: registrosSanitarios = [] } = useOfflineQuery<RegistroSanitario>(['registrosSanitarios'], 'registrosSanitarios');

  // Offline-first Mutation
  const saveAnimalMutation = useOfflineMutation<Animal>('animais', [['animais']]);
  const deleteAnimalMutation = useOfflineMutation<Animal>('animais', [['animais']], 'delete');

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

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este animal?')) {
       deleteAnimalMutation.mutate({ id } as Animal);
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
      a.peso.toString().includes(searchLower) ||
      (a.sisbov && a.sisbov.toLowerCase().includes(searchLower)) ||
      (a.idEletronico && a.idEletronico.toLowerCase().includes(searchLower)) ||
      (a.pai && a.pai.toLowerCase().includes(searchLower)) ||
      (a.mae && a.mae.toLowerCase().includes(searchLower));
    
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
      <div className="subpage-breadcrumb" style={{ paddingBottom: 0, marginBottom: '-1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
          <span>Pecuária</span>
          <ChevronRight size={14} />
          <span style={{ color: 'var(--primary-indigo)', fontWeight: 700 }}>Rebanho</span>
        </div>
      </div>

      {!showReports && (
        <div className="page-header-row">
          <div className="title-section">
            <div className="icon-badge indigo">
            <Beef size={24} />
          </div>
            <div>
              <h1>Gestão de Rebanho</h1>
              <p className="description">Potencialize a pecuária com dados precisos de cada animal.</p>
            </div>
          </div>
          <div className="connectivity-section">
            <div className={`online-badge ${isOnline ? 'online' : 'offline'}`}>
              <Activity size={12} />
              <span>{isOnline ? 'Online' : 'Trabalhando Offline'}</span>
            </div>
          </div>
          <div className="action-buttons">
            <button className="btn-premium-solid indigo h-11 px-6 gap-2" onClick={() => handleOpenModal()}>
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
            <div className="summary-card card glass animate-slide-up">
              <div className="summary-info">
                <span className="summary-label">Total de Cabeças</span>
                <span className="summary-value">{totalCabecas.toLocaleString()}</span>
                <span className="summary-trend up">
                  <ArrowUpRight size={14} /> +{totalCabecas} este mês
                </span>
              </div>
              <div className="summary-icon indigo">
                <Beef size={24} strokeWidth={3} />
              </div>
            </div>
            <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="summary-info">
                <span className="summary-label">Machos</span>
                <span className="summary-value">{totalMachos}</span>
                <span className="summary-subtext">{percMachos}% do rebanho</span>
              </div>
              <div className="summary-icon warning">
                <div className="gender-icon">M</div>
              </div>
            </div>
            <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="summary-info">
                <span className="summary-label">Fêmeas</span>
                <span className="summary-value">{totalFemeas}</span>
                <span className="summary-subtext">{percFemeas}% do rebanho</span>
              </div>
              <div className="summary-icon secondary">
                <div className="gender-icon">F</div>
              </div>
            </div>
            <div className="summary-card card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="summary-info">
                <span className="summary-label">Peso Médio</span>
                <span className="summary-value">{pesoMedio} kg</span>
                <span className="summary-trend down">
                  <ArrowDownRight size={14} /> -2.4% vs anterior
                </span>
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
                  <tbody className="divide-y">
                    {paginatedData.map((animal) => (
                    <tr key={animal.id}>
                      <td>
                        <span className="brinco-tag">{animal.brinco}</span>
                      </td>
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

      <StandardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? `Detalhes: ${selectedAnimal?.brinco}` : (selectedAnimal ? `Editar Animal: ${selectedAnimal.brinco}` : 'Novo Animal')}
        subtitle={isViewMode ? 'Visualizando informações técnicas registradas.' : 'Preencha as informações técnicas seguindo as regras de manejo.'}
        icon={Beef}
        size="lg"
        footer={
          <div className="flex gap-3">
            <button type="button" className="btn-premium-outline" onClick={handleCloseModal}>Cancelar</button>
            {!isViewMode && <button type="submit" form="animal-form" className="btn-premium-solid indigo">Finalizar Cadastro</button>}
          </div>
        }
      >
        <div className="modal-tabs">
          <button className={activeTab === 'geral' ? 'active' : ''} onClick={() => setActiveTab('geral')}>Geral</button>
          <button className={activeTab === 'genealogia' ? 'active' : ''} onClick={() => setActiveTab('genealogia')}>Genealogia</button>
          <button className={activeTab === 'manejo' ? 'active' : ''} onClick={() => setActiveTab('manejo')}>Manejo</button>
          <button className={activeTab === 'financeiro' ? 'active' : ''} onClick={() => setActiveTab('financeiro')}>Financeiro</button>
        </div>

        <form 
          id="animal-form"
          onSubmit={(e) => { 
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
              historicoCustos: selectedAnimal?.historicoCustos || []
            };
            saveAnimalMutation.mutate(updatedAnimal);
            handleCloseModal(); 
          }}
        >
          <div className="form-sections-grid">
            {activeTab === 'geral' && (
              <div className="form-section">
                <div className="form-grid">
                  <div className="form-group col-4">
                    <label>Brinco ID</label>
                    <div className="input-with-icon">
                      <input type="text" name="brinco" defaultValue={selectedAnimal?.brinco} placeholder="Ex: 8922" required disabled={isViewMode} />
                      <BarChart3 size={18} className="field-icon" />
                    </div>
                  </div>
                  <div className="form-group col-4">
                    <label>Sexo</label>
                    <div className="input-with-icon">
                      <select name="sexo" defaultValue={selectedAnimal?.sexo || 'M'} required disabled={isViewMode}>
                        <option value="M">Macho</option>
                        <option value="F">Fêmea</option>
                      </select>
                      <Activity size={18} className="field-icon" />
                    </div>
                  </div>
                  <div className="form-group col-4">
                    <label>Raça Dominante</label>
                    <div className="input-with-icon">
                      <input type="text" name="raca" defaultValue={selectedAnimal?.raca} placeholder="Ex: Nelore" required disabled={isViewMode} />
                      <Beef size={18} className="field-icon" />
                    </div>
                  </div>
                  <div className="form-group col-4">
                    <label>Data de Nascimento</label>
                    <div className="input-with-icon">
                      <input type="date" name="dataNasc" defaultValue={selectedAnimal?.dataNasc} required disabled={isViewMode} />
                      <Calendar size={18} className="field-icon" />
                    </div>
                  </div>
                  <div className="form-group col-8">
                    <div className="info-box info-indigo h-full flex items-center" style={{ margin: '0' }}>
                      <Info size={18} />
                      <p>A categoria é calculada automaticamente conforme idade e sexo.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

                  {activeTab === 'genealogia' && (
                    <div className="form-section">
                      <h4>Rastreabilidade e Origem</h4>
                      <div className="form-grid">
                        <div className="form-group col-6">
                          <label>Número SISBOV</label>
                          <div className="input-with-icon">
                            <input type="text" defaultValue={selectedAnimal?.sisbov} placeholder="Ex: 076.1234567.9" disabled={isViewMode} />
                            <Info size={18} className="field-icon" />
                          </div>
                        </div>
                        <div className="form-group col-6">
                          <label>ID Eletrônico (RFID)</label>
                          <div className="input-with-icon">
                            <input type="text" defaultValue={selectedAnimal?.idEletronico} placeholder="Ex: A123B456" disabled={isViewMode} />
                            <Activity size={18} className="field-icon" />
                          </div>
                        </div>
                        <div className="form-group col-6">
                          <label>Identificação do Pai (Brinco/Nome)</label>
                          <div className="input-with-icon">
                            <input type="text" defaultValue={selectedAnimal?.pai} placeholder="Ex: Nelore PO 55" disabled={isViewMode} />
                            <Beef size={18} className="field-icon" />
                          </div>
                        </div>
                        <div className="form-group col-6">
                          <label>Identificação da Mãe (Brinco/Nome)</label>
                          <div className="input-with-icon">
                            <input type="text" defaultValue={selectedAnimal?.mae} placeholder="Ex: Matriz 204" disabled={isViewMode} />
                            <Beef size={18} className="field-icon" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'manejo' && (
                    <div className="form-section">
                      <div className="form-grid">
                        <div className="form-group col-6">
                          <label>Lote Atual</label>
                          <div className="input-with-icon">
                            <input type="text" name="lote" defaultValue={selectedAnimal?.lote} placeholder="Ex: Lote 01" required disabled={isViewMode} />
                            <Plus size={18} className="field-icon" />
                          </div>
                        </div>
                        <div className="form-group col-6">
                          <label>Pasto/Piquete</label>
                          <div className="input-with-icon">
                            <input type="text" name="pasto" defaultValue={selectedAnimal?.pasto} placeholder="Ex: Pasto das Flores" required disabled={isViewMode} />
                            <Search size={18} className="field-icon" />
                          </div>
                        </div>
                        <div className="form-group col-4">
                          <label>Peso Entrada (kg)</label>
                          <div className="input-with-icon">
                            <input type="number" name="peso" defaultValue={selectedAnimal?.peso} placeholder="Ex: 450" required disabled={isViewMode} />
                            <BarChart3 size={18} className="field-icon" />
                          </div>
                        </div>
                        <div className="form-group col-8">
                          <label>Status Operacional</label>
                          <div className="input-with-icon">
                            <select name="status" defaultValue={selectedAnimal?.status || 'Ativo'} disabled={isViewMode}>
                              <option value="Ativo">Ativo no Rebanho</option>
                              <option value="Vendido">Vendido / Descarte</option>
                              <option value="Baixa">Baixa (Óbito/Perda)</option>
                            </select>
                            <Activity size={18} className="field-icon" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'financeiro' && selectedAnimal && (
                    <div className="form-section">
                      {(() => {
                        const lotAnimals = animais.filter(a => a.lote === selectedAnimal.lote);
                        const matchingLoteId = selectedAnimal.lote.includes('Lote 01') ? '1' : selectedAnimal.lote.includes('Lote 02') ? '2' : '';
                        const diet = dietas.find(d => d.loteId === matchingLoteId);
                        const lotSanitationCost = financialService.calculateSanitationCost(selectedAnimal, registrosSanitarios, lotAnimals.length);
                        const lotNutritionCost = financialService.calculateNutritionCost(selectedAnimal, diet, lotAnimals, 30, costCalculationMode);
                        const totalInvestido = financialService.calculateTotalAnimalInvestment(selectedAnimal, lotSanitationCost, lotNutritionCost);

                        return (
                          <>
                            <div className="financial-header-controls mb-16">
                              <h4>Resumo de Investimento</h4>
                              <div className="cost-mode-toggle mini">
                                <label className={costCalculationMode === 'fixed' ? 'active' : ''}>
                                  <input type="radio" value="fixed" checked={costCalculationMode === 'fixed'} onChange={() => setCostCalculationMode('fixed')} />
                                  Fixo
                                </label>
                                <label className={costCalculationMode === 'proportional' ? 'active' : ''}>
                                  <input type="radio" value="proportional" checked={costCalculationMode === 'proportional'} onChange={() => setCostCalculationMode('proportional')} />
                                  Peso
                                </label>
                              </div>
                            </div>

                            <div className="financial-dashboard mb-24">
                              <div className="financial-card">
                                <span className="card-label">Total Investido</span>
                                <span className="card-value">R$ {totalInvestido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                <div className="badge primary">Acumulado</div>
                              </div>
                              <div className="financial-card">
                                <span className="card-label">Custo por Arroba</span>
                                <span className="card-value">R$ {(totalInvestido / ((selectedAnimal.peso || 1) / 30)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                <div className="badge warning">Base @ 30kg</div>
                              </div>
                              <div className="financial-card indigo">
                                <span className="card-label">Valor de Mercado (Est.)</span>
                                <span className="card-value">R$ {(selectedAnimal.peso / 30 * 280).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                <div className="badge success">ROI: +{Math.round(((selectedAnimal.peso / 30 * 280) / (totalInvestido || 1) - 1) * 100)}%</div>
                              </div>
                            </div>

                            <div className="cost-breakdown-section mb-24">
                              <h4>Detalhamento de Custos</h4>
                              <table className="cost-table">
                                <thead>
                                  <tr>
                                    <th>Categoria</th>
                                    <th>Valor Registrado</th>
                                    <th>% do Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {[
                                    { label: 'Aquisição', value: selectedAnimal.custoAquisicao },
                                    { label: 'Nutrição (Individual)', value: selectedAnimal.custoNutricao },
                                    {
                                      label: `Nutrição (${costCalculationMode === 'proportional' ? 'Prorate p/ Peso' : 'Lote Fixo'})`, 
                                      value: financialService.calculateNutritionCost(selectedAnimal, diet, lotAnimals, 30, costCalculationMode)
                                    },
                                    { label: 'Sanidade (Individual)', value: selectedAnimal.custoSanidade },
                                    {
                                      label: 'Sanidade (Por Lote)', 
                                      value: lotSanitationCost - selectedAnimal.custoSanidade
                                    },
                                    { label: 'Reprodução', value: selectedAnimal.custoReproducao },
                                    { label: 'Confinamento', value: selectedAnimal.custoConfinamento },
                                    { label: 'Operacional', value: selectedAnimal.custoOperacional }
                                  ].map((cost) => {
                                    const total = totalInvestido || 1;
                                    return (
                                      <tr key={cost.label}>
                                        <td>{cost.label}</td>
                                        <td className="font-bold">R$ {cost.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        <td>
                                          <div className="percentage-bar-wrapper">
                                            <div className="percentage-bar" style={{ width: `${(cost.value / total * 100)}%`, backgroundColor: 'var(--primary-indigo)' }}></div>
                                            <span className="percentage-text">{Math.round(cost.value / total * 100)}%</span>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            <div className="cost-history-section">
                              <h4>Histórico de Lançamentos</h4>
                              <div className="history-table-wrapper">
                                <table className="history-table">
                                  <thead>
                                    <tr>
                                      <th>Data</th>
                                      <th>Categoria</th>
                                      <th>Descrição</th>
                                      <th className="text-right">Valor</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {selectedAnimal.historicoCustos.map((lancamento) => (
                                      <tr key={lancamento.id}>
                                        <td className="date-cell">{new Date(lancamento.data).toLocaleDateString('pt-BR')}</td>
                                        <td>
                                          <span className={`badge ${lancamento.categoria.toLowerCase() === 'sanidade' ? 'danger' : 'primary'}`}>
                                            {lancamento.categoria}
                                          </span>
                                        </td>
                                        <td className="desc-cell">{lancamento.descricao}</td>
                                        <td className="text-right font-bold">
                                          R$ {lancamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                </div>
              )}
            </div>
          </form>
        </StandardModal>
    </div>
  );
};

