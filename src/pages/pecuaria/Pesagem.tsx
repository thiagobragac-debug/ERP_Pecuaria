import React, { useState } from 'react';
import { 
  Scale, 
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
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  X,
  History,
  Activity,
  ArrowUpRight,
  TrendingDown,
  User,
  Zap,
  Hash,
  AlertCircle
} from 'lucide-react';
import './Pesagem.css';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';

interface Pesagem {
  id: string;
  brinco: string;
  data: string;
  pesoAtual: number;
  pesoAnterior: number;
  gmd: number; // Ganho Médio Diário em kg
  lote: string;
  manejo: string;
}

const mockPesagens: Pesagem[] = [
  { id: '1', brinco: '8922', data: '2024-03-10', pesoAtual: 345.5, pesoAnterior: 310.0, gmd: 1.18, lote: 'Lote 01 - Recria', manejo: 'Pesagem Rotina' },
  { id: '2', brinco: '4451', data: '2024-03-10', pesoAtual: 412.0, pesoAnterior: 385.2, gmd: 0.89, lote: 'Lote 01 - Recria', manejo: 'Pesagem Rotina' },
  { id: '3', brinco: '2210', data: '2024-03-11', pesoAtual: 450.8, pesoAnterior: 415.5, gmd: 1.25, lote: 'Lote 02 - Engorda', manejo: 'Saída Pasto' },
  { id: '4', brinco: '5567', data: '2024-03-11', pesoAtual: 388.2, pesoAnterior: 395.0, gmd: -0.22, lote: 'Lote 02 - Engorda', manejo: 'Check-up' },
];

import { HistoricoPesagem } from './HistoricoPesagem';

export const Pesagem = () => {
  const [view, setView] = useState<'current' | 'history'>('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterLote, setFilterLote] = useState('Todos');
  const [filterManejo, setFilterManejo] = useState('Todos');
  const [selectedPesagem, setSelectedPesagem] = useState<Pesagem | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    brinco: '',
    data: '',
    peso: '',
    evolucao: '',
    gmd: '',
    lote: 'Todos',
    manejo: 'Todos'
  });

  const handleOpenModal = (pesagem: Pesagem | null = null, viewOnly = false) => {
    setSelectedPesagem(pesagem);
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPesagem(null);
    setIsViewMode(false);
  };

  const gmdMedio = mockPesagens.length > 0
    ? (mockPesagens.reduce((acc, p) => acc + p.gmd, 0) / mockPesagens.length).toFixed(2)
    : 0;
  const totalPesado = mockPesagens.length;
  const melhorGMD = Math.max(...mockPesagens.map(p => p.gmd)).toFixed(3);
  const melhorLote = mockPesagens.find(p => p.gmd === parseFloat(melhorGMD))?.lote || '-';
  const perdaPeso = mockPesagens.filter(p => p.gmd < 0).length;

  const filteredData = mockPesagens.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = p.brinco.toLowerCase().includes(searchLower) || 
      p.lote.toLowerCase().includes(searchLower) ||
      p.manejo.toLowerCase().includes(searchLower) ||
      p.data.toLowerCase().includes(searchLower) ||
      p.pesoAtual.toString().includes(searchLower) ||
      p.gmd.toString().includes(searchLower);
    
    const matchesLote = filterLote === 'Todos' || p.lote === filterLote;
    const matchesManejo = filterManejo === 'Todos' || p.manejo === filterManejo;

    const matchesColumnFilters = 
      (columnFilters.brinco === '' || p.brinco.toLowerCase().includes(columnFilters.brinco.toLowerCase())) &&
      (columnFilters.data === '' || p.data.includes(columnFilters.data)) &&
      (columnFilters.peso === '' || p.pesoAtual.toString().includes(columnFilters.peso)) &&
      (columnFilters.gmd === '' || p.gmd.toString().includes(columnFilters.gmd)) &&
      (columnFilters.lote === 'Todos' || p.lote === columnFilters.lote) &&
      (columnFilters.manejo === 'Todos' || p.manejo === columnFilters.manejo);

    return matchesSearch && matchesLote && matchesManejo && matchesColumnFilters;
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

  if (view === 'history') {
    return <HistoricoPesagem onBack={() => setView('current')} />;
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge secondary">
            <Scale size={32} strokeWidth={3} />
          </div>
          <div>
            <h1>Desempenho & Pesagens</h1>
            <p className="description">Monitoramento analítico de GMD e evolução ponderal do rebanho.</p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-premium-outline h-11 px-6 gap-2" onClick={() => setView('history')}>
            <History size={20} strokeWidth={3} />
            <span>Histórico Analítico</span>
          </button>
          <button className="btn-premium-solid indigo h-11 px-6 gap-2" onClick={() => handleOpenModal()}>
            <Plus size={20} strokeWidth={3} />
            <span>Nova Pesagem</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card animate-slide-up" style={{ '--summary-accent': '#10b981' } as any}>
          <div className="summary-info">
            <span className="summary-label">GMD Médio (Rebanho)</span>
            <span className="summary-value">{gmdMedio} <small className="text-xl text-slate-400">kg/dia</small></span>
            <p className="mt-4 text-emerald-600 font-extrabold flex items-center gap-2">
              <ArrowUpRight size={18} strokeWidth={3} /> +0.05 vs ideal
            </p>
          </div>
          <div className="summary-icon" style={{ '--accent-rgb': '16, 185, 129' } as any}>
            <TrendingUp size={36} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.1s', '--summary-accent': '#0ea5e9' } as any}>
          <div className="summary-info">
            <span className="summary-label">Eficiência de Ganho</span>
            <span className="summary-value">1.42 <small className="text-xl text-slate-400">@/mês</small></span>
            <p className="mt-4 text-sky-600 font-extrabold flex items-center gap-2">
              <Zap size={18} strokeWidth={2.5} /> Meta de engorda atingida
            </p>
          </div>
          <div className="summary-icon" style={{ '--accent-rgb': '14, 165, 233' } as any}>
            <Activity size={36} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card animate-slide-up" style={{ animationDelay: '0.2s', '--summary-accent': '#f43f5e' } as any}>
          <div className="summary-info">
            <span className="summary-label">Animais Estagnados</span>
            <span className="summary-value">{perdaPeso} <small className="text-xl text-slate-400">cab.</small></span>
            <p className="mt-4 text-rose-500 font-black flex items-center gap-2">
              <TrendingDown size={18} strokeWidth={3} /> Alerta crítico de manejo
            </p>
          </div>
          <div className="summary-icon" style={{ '--accent-rgb': '244, 63, 94' } as any}>
            <AlertCircle size={36} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por brinco, lote ou manejo realizado..."
          onToggleAdvanced={() => setIsFiltersOpen(!isFiltersOpen)}
          isAdvancedOpen={isFiltersOpen}
        />

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Brinco</th>
                <th>Data</th>
                <th>Peso Atual</th>
                <th>Evolução (kg)</th>
                <th>GMD (kg/dia)</th>
                <th>Lote Atual</th>
                <th>Manejo Realizado</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'brinco', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'data', type: 'text', placeholder: 'Data...' },
                    { key: 'peso', type: 'text', placeholder: 'Peso...' },
                    { key: 'evolucao', type: 'text', placeholder: 'Evol...' },
                    { key: 'gmd', type: 'text', placeholder: 'GMD...' },
                    { key: 'lote', type: 'select', options: Array.from(new Set(mockPesagens.map(p => p.lote))) },
                    { key: 'manejo', type: 'select', options: Array.from(new Set(mockPesagens.map(p => p.manejo))) }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((pesagem) => {
                const diff = (pesagem.pesoAtual - pesagem.pesoAnterior).toFixed(1);
                return (
                  <tr key={pesagem.id}>
                    <td><span className="brinco-tag">{pesagem.brinco}</span></td>
                    <td><span className="font-bold text-slate-500">{new Date(pesagem.data).toLocaleDateString('pt-BR')}</span></td>
                    <td><span className="font-black text-slate-900 text-xl">{pesagem.pesoAtual} <small className="text-xs text-slate-500">kg</small></span></td>
                    <td>
                      <span className={`diff-badge ${parseFloat(diff) >= 0 ? 'positive' : 'negative'}`}>
                        {parseFloat(diff) >= 0 ? <ArrowUpRight size={14} className="inline mr-1" /> : <TrendingDown size={14} className="inline mr-1" />}
                        {parseFloat(diff) >= 0 ? '+' : ''}{diff} kg
                      </span>
                    </td>
                    <td>
                      <div className="gmd-cell flex items-center justify-center gap-2">
                        <span className="text-slate-900 font-bold text-lg">{pesagem.gmd.toFixed(3)}</span>
                        <div className={`h-2.5 w-2.5 rounded-full ${pesagem.gmd > 1 ? 'bg-emerald-500' : pesagem.gmd > 0.5 ? 'bg-sky-500' : 'bg-rose-500'}`} 
                             style={{ boxShadow: `0 0 10px ${pesagem.gmd > 1 ? 'rgba(16, 185, 129, 0.4)' : pesagem.gmd > 0.5 ? 'rgba(14, 165, 233, 0.4)' : 'rgba(244, 63, 94, 0.4)'}` }}></div>
                      </div>
                    </td>
                    <td><span className="font-bold text-slate-600">{pesagem.lote}</span></td>
                    <td><span className="text-emerald-700 font-extrabold uppercase text-xs tracking-wider">{pesagem.manejo}</span></td>
                    <td className="text-right">
                      <div className="actions-cell">
                        <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(pesagem, true)}>
                          <Eye size={18} strokeWidth={3} />
                        </button>
                        <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(pesagem)}>
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
          label="pesagens"
        />

        <div className="abate-prediction-box">
          <div className="icon-badge emerald">
            <Activity size={36} strokeWidth={3} />
          </div>
          <div className="prediction-info">
            <h4>Inteligência Preditiva: Abate Estimado</h4>
            <p className="text-slate-600 font-medium">Com base no GMD médio de <span className="text-emerald-600 font-bold">{gmdMedio}kg</span>, a previsão de atingir 18@ para o Lote 02 é de <span className="text-slate-900 font-black">42 dias</span>.</p>
          </div>
          <div className="prediction-stat ml-auto text-right">
            <span className="label text-xs uppercase font-black text-slate-500 tracking-widest block mb-1">Data Estimada</span>
            <strong>24/04/2026</strong>
          </div>
        </div>
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? 'Detalhes da Pesagem' : (selectedPesagem ? 'Editar Pesagem' : 'Nova Pesagem')}
        subtitle="Registro individual de performance e ganho de peso."
        icon={Scale}
        size="md"
        footer={
          <div className="flex gap-3">
            <button type="button" className="btn-premium-outline" onClick={handleCloseModal}>Cancelar</button>
            {!isViewMode && <button type="submit" form="pesagem-form" className="btn-premium-solid indigo">Salvar Registro</button>}
          </div>
        }
      >
            
            <div className="modal-body scrollable">
              <form id="pesagem-form" onSubmit={(e) => { e.preventDefault(); handleCloseModal(); }}>
                <div className="form-sections-grid">
                  <div className="form-section">
                    <h4>Informações da Pesagem</h4>
                    <div className="form-grid">
                      <div className="form-group col-6">
                        <label>Brinco do Animal</label>
                        <div className="input-with-icon">
                          <input type="text" defaultValue={selectedPesagem?.brinco} disabled={isViewMode} required placeholder="Ex: 8922" />
                          <Hash size={18} className="field-icon" />
                        </div>
                      </div>
                      <div className="form-group col-6">
                        <label>Data da Pesagem</label>
                        <div className="input-with-icon">
                          <input type="date" defaultValue={selectedPesagem?.data || new Date().toISOString().split('T')[0]} disabled={isViewMode} required />
                          <Calendar size={18} className="field-icon" />
                        </div>
                      </div>
                      <div className="form-group col-6">
                        <label>Peso Atual (kg)</label>
                        <div className="input-with-icon">
                          <input type="number" step="0.1" defaultValue={selectedPesagem?.pesoAtual} disabled={isViewMode} required placeholder="0.0" />
                          <Scale size={18} className="field-icon" />
                        </div>
                      </div>
                      <div className="form-group col-6">
                        <label>Tipo de Manejo</label>
                        <div className="input-with-icon">
                          <select defaultValue={selectedPesagem?.manejo} disabled={isViewMode}>
                            <option>Pesagem Rotina</option>
                            <option>Entrada Pasto</option>
                            <option>Saída Pasto</option>
                            <option>Vacinação</option>
                          </select>
                          <Layers size={18} className="field-icon" />
                        </div>
                      </div>
                      {!isViewMode && (
                        <div className="form-group col-12">
                          <div className="info-box indigo">
                            <Activity size={18} />
                            <p><strong>Cálculo Automático:</strong> O GMD será calculado automaticamente com base no peso anterior registrado no sistema.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

      </StandardModal>
    </div>
  );
};

