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
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import './Lote.css';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';

interface Lote {
  id: string;
  nome: string;
  categoria: string;
  pasto: string;
  qtdAnimais: number;
  pesoMedio: number;
  dataCriacao: string;
  status: 'Ativo' | 'Encerrado' | 'Vendido';
  cor: string;
}

const mockLotes: Lote[] = [
  { id: '1', nome: 'Lote 01 - Recria Nelore', categoria: 'Recria', pasto: 'Pasto das Flores', qtdAnimais: 120, pesoMedio: 285.5, dataCriacao: '2023-11-10', status: 'Ativo', cor: '#2E7D32' },
  { id: '2', nome: 'Lote 02 - Engorda Machos', categoria: 'Engorda', pasto: 'Confinamento A', qtdAnimais: 85, pesoMedio: 452.2, dataCriacao: '2023-12-05', status: 'Ativo', cor: '#1565C0' },
  { id: '3', nome: 'Lote 03 - Novilhas Reprod.', categoria: 'Reprodução', pasto: 'Pasto Velho', qtdAnimais: 42, pesoMedio: 380.0, dataCriacao: '2024-01-15', status: 'Ativo', cor: '#C62828' },
  { id: '4', nome: 'Lote Piloto Angus', categoria: 'Teste', pasto: 'Piquete 04', qtdAnimais: 12, pesoMedio: 310.4, dataCriacao: '2024-02-01', status: 'Ativo', cor: '#FF8F00' },
];

export const Lote = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const [activeTab, setActiveTab] = useState<'geral' | 'sanidade' | 'nutricao'>('geral');
  const [isViewMode, setIsViewMode] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
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

  const handleOpenModal = (lote: Lote | null = null, viewOnly = false) => {
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

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este lote? A remoção do lote pode afetar o vínculo dos animais.')) {
      alert(`Lote ${id} removido (Simulação)`);
    }
  };

  const totalLotes = mockLotes.length;
  const lotesAtivos = mockLotes.filter(l => l.status === 'Ativo').length;
  const totalAnimais = mockLotes.reduce((acc, l) => acc + l.qtdAnimais, 0);
  const pesoMedioGlobal = totalAnimais > 0 
    ? (mockLotes.reduce((acc, l) => acc + (l.pesoMedio * l.qtdAnimais), 0) / totalAnimais).toFixed(1) 
    : 0;

  const filteredData = mockLotes.filter(l => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = l.nome.toLowerCase().includes(searchLower) || 
                          l.pasto.toLowerCase().includes(searchLower) || 
                          l.categoria.toLowerCase().includes(searchLower) ||
                          l.status.toLowerCase().includes(searchLower) ||
                          l.qtdAnimais.toString().includes(searchLower) ||
                          l.pesoMedio.toString().includes(searchLower) ||
                          l.dataCriacao.toLowerCase().includes(searchLower);
    
    const matchesStatus = filterStatus === 'Todos' || l.status === filterStatus;
    const matchesCategoria = filterCategoria === 'Todas' || l.categoria === filterCategoria;

    const matchesColumnFilters = 
      (columnFilters.nome === '' || l.nome.toLowerCase().includes(columnFilters.nome.toLowerCase())) &&
      (columnFilters.categoria === 'Todas' || l.categoria === columnFilters.categoria) &&
      (columnFilters.pasto === '' || l.pasto.toLowerCase().includes(columnFilters.pasto.toLowerCase())) &&
      (columnFilters.qtd === '' || l.qtdAnimais.toString().includes(columnFilters.qtd)) &&
      (columnFilters.peso === '' || l.pesoMedio.toString().includes(columnFilters.peso)) &&
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
            <Layers size={24} />
          </div>
          <div>
            <h1>Gestão de Lotes</h1>
            <p className="description">Agrupamento e manejo coletivo de animais.</p>
          </div>
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
            <span className="summary-value">82<small className="text-xl text-slate-400">%</small></span>
            <p className="mt-4 text-amber-600 font-extrabold flex items-center gap-2">
              <MapPin size={18} strokeWidth={2.5} /> Lotação ideal
            </p>
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
                      <MapPin size={16} className="text-emerald-600" /> <span className="font-bold text-slate-500">{lote.pasto}</span>
                    </div>
                  </td>
                  <td><span className="font-black text-slate-800 text-lg">{lote.qtdAnimais} <small className="text-xs text-slate-500">cab.</small></span></td>
                  <td><span className="font-black text-emerald-600 text-lg">{lote.pesoMedio} <small className="text-xs text-slate-500">kg</small></span></td>
                  <td>
                    <div className="icon-text text-slate-500 font-bold">
                      {new Date(lote.dataCriacao).toLocaleDateString('pt-BR')}
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
              <form id="lote-form" onSubmit={(e) => { e.preventDefault(); alert('Lote salvo! (Simulação)'); handleCloseModal(); }}>
                <div className="form-sections-grid">
                  {activeTab === 'geral' && (
                    <div className="form-section">
                      <div className="form-grid">
                        <div className="form-group col-12">
                          <label>Nome do Lote</label>
                          <div className="input-with-icon">
                            <input type="text" defaultValue={selectedLote?.nome} placeholder="Ex: Lote 05 - Engorda" required disabled={isViewMode} />
                            <Layers size={18} className="field-icon" />
                          </div>
                        </div>
                        <div className="form-group col-6">
                          <label>Categoria</label>
                          <div className="input-with-icon">
                            <select defaultValue={selectedLote?.categoria || 'Recria'} required disabled={isViewMode}>
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
                            <input type="text" defaultValue={selectedLote?.pasto} placeholder="Ex: Pasto das Flores" required disabled={isViewMode} />
                            <MapPin size={18} className="field-icon" />
                          </div>
                        </div>
                        <div className="form-group col-4">
                          <label>Data Início</label>
                          <div className="input-with-icon">
                            <input type="date" defaultValue={selectedLote?.dataCriacao} required disabled={isViewMode} />
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
                            <input type="color" defaultValue={selectedLote?.cor || '#2E7D32'} required disabled={isViewMode} style={{ paddingLeft: '3rem', height: '45px' }} />
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
                      <div className="lot-section-dashboard mb-24">
                        <div className="dash-card">
                          <span className="label">Ocorrências Ativas</span>
                          <span className="value">01</span>
                        </div>
                        <div className="dash-card warning">
                          <span className="label">Em Carência</span>
                          <span className="value">12 dias</span>
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
                            <tr>
                              <td>10/03/2024</td>
                              <td><span className="pill-small">Vacinação</span></td>
                              <td>Brucelose</td>
                              <td><span className="status-dot green"></span> Concluído</td>
                            </tr>
                            <tr>
                              <td>01/02/2024</td>
                              <td><span className="pill-small">Prevenção</span></td>
                              <td>Vermifugação</td>
                              <td><span className="status-dot green"></span> Concluído</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'nutricao' && (
                    <div className="form-section">
                      <h4>Estratégia Nutricional</h4>
                      <div className="lot-section-dashboard mb-24">
                        <div className="dash-card indigo">
                          <span className="label">Dieta Atual</span>
                          <span className="value">Acabamento V2</span>
                        </div>
                        <div className="dash-card">
                          <span className="label">Custo/Cab/Dia</span>
                          <span className="value">R$ 12,80</span>
                        </div>
                      </div>
                      
                      <div className="embedded-history">
                        <h4>Logs de Trato (Últimos 7 dias)</h4>
                        <div className="feeding-mini-chart">
                          <div className="bar" style={{ height: '80%' }}><span>10</span></div>
                          <div className="bar" style={{ height: '85%' }}><span>11</span></div>
                          <div className="bar" style={{ height: '100%' }}><span>12</span></div>
                          <div className="bar" style={{ height: '90%' }}><span>13</span></div>
                          <div className="bar" style={{ height: '95%' }}><span>14</span></div>
                          <div className="bar current" style={{ height: '10%' }}><span>15</span></div>
                        </div>
                        <p className="chart-caption">Consumo em kg/cab vs Meta (CMS)</p>
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

