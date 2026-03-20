import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import './Pesagem.css';
import { ModernModal } from '../../components/ModernModal'; 
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';
import { Pesagem as PesagemType, Animal, Lote } from '../../types';
import { useCompany } from '../../contexts/CompanyContext';
import { useAuth } from '../../contexts/AuthContext';
import { SummaryCard } from '../../components/SummaryCard';
import { SearchableSelect } from '../../components/SearchableSelect';
import { StatusBadge } from '../../components/StatusBadge';

import { HistoricoPesagem } from './HistoricoPesagem';

export const Pesagem = () => {
  const [view, setView] = useState<'current' | 'history'>('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterLote, setFilterLote] = useState('Todos');
  const [filterManejo, setFilterManejo] = useState('Todos');
  const { activeCompanyId } = useCompany();
  const { currentOrg } = useAuth();
  const [selectedPesagem, setSelectedPesagem] = useState<PesagemType | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  
  const [formData, setFormData] = useState<Partial<PesagemType>>({
    data: new Date().toISOString().substring(0, 10),
    manejo: 'Pesagem Rotina'
  });
  
  // Live Queries
  const allPesagens = useLiveQuery(() => db.pesagens.toArray()) || [];
  const allAnimais = useLiveQuery(() => db.animais.toArray()) || [];
  const allLotes = useLiveQuery(() => db.lotes.toArray()) || [];

  const pesagens = allPesagens.filter(p => activeCompanyId === 'Todas' || p.empresaId === activeCompanyId);
  const animais = allAnimais.filter(a => activeCompanyId === 'Todas' || a.empresaId === activeCompanyId);
  const lotes = allLotes.filter(l => activeCompanyId === 'Todas' || l.empresaId === activeCompanyId);
  const [columnFilters, setColumnFilters] = useState({
    brinco: '',
    data: '',
    peso: '',
    evolucao: '',
    gmd: '',
    lote: 'Todos',
    manejo: 'Todos'
  });

  const handleOpenModal = (pesagem: PesagemType | null = null, viewOnly = false) => {
    if (pesagem) {
      setSelectedPesagem(pesagem);
      setFormData({ ...pesagem });
    } else {
      setSelectedPesagem(null);
      setFormData({
        data: new Date().toISOString().substring(0, 10),
        manejo: 'Pesagem Rotina',
        empresaId: activeCompanyId !== 'Todas' ? activeCompanyId : undefined
      });
    }
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPesagem(null);
    setIsViewMode(false);
    setFormData({
        data: new Date().toISOString().substring(0, 10),
        manejo: 'Pesagem Rotina'
    });
  };

  const gmdMedio = pesagens.length > 0
    ? (pesagens.reduce((acc, p) => acc + (p.gmd || 0), 0) / pesagens.length).toFixed(2)
    : 0;
  const totalPesado = pesagens.length;
  const melhorGMD = pesagens.length > 0 ? Math.max(...pesagens.map(p => p.gmd || 0)).toFixed(3) : '0.000';
  const perdaPeso = pesagens.filter(p => (p.gmd || 0) < 0).length;

  const filteredData = pesagens.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const animalBrinco = p.brinco?.toLowerCase() || '';
    const loteNome = lotes.find(l => l.id === p.lote_id)?.nome.toLowerCase() || '';
    
    const matchesSearch = animalBrinco.includes(searchLower) || 
      loteNome.includes(searchLower) ||
      p.manejo.toLowerCase().includes(searchLower) ||
      p.data.toLowerCase().includes(searchLower);
    
    const matchesLote = filterLote === 'Todos' || p.lote_id === filterLote;
    const matchesManejo = filterManejo === 'Todos' || p.manejo === filterManejo;

    const matchesColumnFilters = 
      (columnFilters.brinco === '' || animalBrinco.includes(columnFilters.brinco.toLowerCase())) &&
      (columnFilters.data === '' || p.data.includes(columnFilters.data)) &&
      (columnFilters.peso === '' || p.pesoAtual.toString().includes(columnFilters.peso)) &&
      (columnFilters.gmd === '' || (p.gmd || 0).toString().includes(columnFilters.gmd)) &&
      (columnFilters.lote === 'Todos' || p.lote_id === columnFilters.lote) &&
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
      <nav className="subpage-breadcrumb">
        <Link to="/pecuaria/rebanho">Pecuária</Link>
        <ChevronRight size={14} />
        <span>Pesagem</span>
      </nav>
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <Scale size={32} strokeWidth={3} />
          </div>
          <div>
            <h1>Desempenho & Pesagens</h1>
            <p className="description">Monitoramento analítico de GMD e evolução ponderal do rebanho.</p>
          </div>
        </div>
        <div className="action-buttons">
          <button className="btn-premium-outline" onClick={() => setView('history')}>
            <History size={20} strokeWidth={3} />
            <span>Histórico Analítico</span>
          </button>
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={20} strokeWidth={3} />
            <span>Nova Pesagem</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryCard 
          label="GMD Médio (Rebanho)"
          value={`${gmdMedio} kg/dia`}
          trend={{ value: '+0.05 vs ideal', type: 'up', icon: ArrowUpRight }}
          icon={TrendingUp}
          color="emerald"
          delay="0s"
        />
        <SummaryCard 
          label="Eficiência de Ganho"
          value="1.42 @/mês"
          subtext="Meta de engorda atingida"
          icon={Activity}
          color="sky"
          delay="0.1s"
        />
        <SummaryCard 
          label="Animais Estagnados"
          value={`${perdaPeso} cab.`}
          trend={{ value: 'Alerta de manejo', type: 'down', icon: AlertCircle }}
          icon={AlertCircle}
          color="rose"
          delay="0.2s"
        />
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
                    { key: 'lote', type: 'select', options: lotes.map(l => ({ value: l.id, label: l.nome })) as any },
                    { key: 'manejo', type: 'select', options: Array.from(new Set(pesagens.map(p => p.manejo))) }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((pesagem) => {
                const diff = (pesagem.pesoAtual - (pesagem.pesoAnterior || 0)).toFixed(1);
                const loteNome = lotes.find(l => l.id === pesagem.lote_id)?.nome || '-';
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
                        <span className="text-slate-900 font-bold text-lg">{(pesagem.gmd || 0).toFixed(3)}</span>
                        <div className={`h-2.5 w-2.5 rounded-full ${(pesagem.gmd || 0) > 1 ? 'bg-emerald-500' : (pesagem.gmd || 0) > 0.5 ? 'bg-sky-500' : 'bg-rose-500'}`} 
                             style={{ boxShadow: `0 0 10px ${(pesagem.gmd || 0) > 1 ? 'rgba(16, 185, 129, 0.4)' : (pesagem.gmd || 0) > 0.5 ? 'rgba(14, 165, 233, 0.4)' : 'rgba(244, 63, 94, 0.4)'}` }}></div>
                      </div>
                    </td>
                    <td><span className="font-bold text-slate-600">{loteNome}</span></td>
                    <td><span className="text-emerald-700 font-extrabold uppercase text-xs tracking-wider">{pesagem.manejo}</span></td>
                    <td className="text-right">
                      <div className="actions-cell">
                        <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(pesagem, true)}>
                          <Eye size={18} strokeWidth={3} />
                        </button>
                        <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(pesagem)}>
                          <Edit size={18} strokeWidth={3} />
                        </button>
                        <button className="action-btn-global btn-delete" title="Excluir" onClick={() => dataService.deleteItem('pesagens', pesagem.id)}>
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

      <ModernModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isViewMode ? 'Dossiê da Pesagem' : (selectedPesagem ? 'Editar Pesagem' : 'Nova Pesagem')}
        subtitle="Registro analítico de performance e ganho de peso."
        icon={Scale}
        footer={
          <>
            <button type="button" className="btn-premium-outline" onClick={handleCloseModal}>
              <X size={18} strokeWidth={3} />
              <span>{isViewMode ? 'Fechar' : 'Cancelar'}</span>
            </button>
            {!isViewMode && (
              <button 
                type="button" 
                className="btn-premium-solid emerald" 
                onClick={async () => {
                  if (!formData.animal_id || !formData.pesoAtual || !formData.data) {
                    alert('Por favor, preencha os campos obrigatórios.');
                    return;
                  }

                  const animalId = formData.animal_id;
                  const animal = animais.find(a => a.id === animalId);
                  const pesoAtual = parseFloat(formData.pesoAtual.toString());
                  const pesoAnterior = animal?.peso || 0;
                  const data = formData.data;
                  
                  // GMD calculation
                  let gmd = 0;
                  if (animal?.dataNasc) {
                    const dataAnterior = animal.created_at ? new Date(animal.created_at) : new Date(animal.dataNasc);
                    const days = Math.max(1, Math.ceil((new Date(data).getTime() - dataAnterior.getTime()) / (1000 * 60 * 60 * 24)));
                    gmd = (pesoAtual - pesoAnterior) / days;
                  }

                  const newPesagem: any = {
                    ...selectedPesagem!,
                    id: selectedPesagem?.id || Math.random().toString(36).substr(2, 9),
                    animal_id: animalId,
                    brinco: animal?.brinco || '',
                    data: data,
                    pesoAtual: pesoAtual,
                    pesoAnterior: pesoAnterior,
                    gmd: gmd,
                    lote_id: animal?.lote_id || '',
                    manejo: formData.manejo || 'Pesagem Rotina',
                    empresaId: formData.empresaId || activeCompanyId,
                    tenant_id: currentOrg?.id || 'default'
                  };

                  await dataService.saveItem('pesagens', newPesagem);
                  if (animal) {
                    await dataService.saveItem('animais', { ...animal, peso: pesoAtual });
                  }
                  
                  handleCloseModal();
                }}
              >
                <span>{selectedPesagem ? 'Salvar Alterações' : 'Salvar Registro'}</span>
                {selectedPesagem ? <CheckCircle2 size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
              </button>
            )}
          </>
        }
      >
        <div className="modern-form-section">
          <div className="modern-form-row four-cols">
            <div className="modern-form-group col-span-2">
              <SearchableSelect
                label="Animal (Brinco)"
                options={animais.map(a => ({ id: a.id, label: a.brinco, sublabel: `${a.raca} - ${a.peso}kg` }))}
                value={formData.animal_id || ''}
                onChange={(val) => setFormData({ ...formData, animal_id: val })}
                disabled={isViewMode}
                required
              />
            </div>
            <div className="modern-form-group col-span-2">
              <label>Data da Pesagem</label>
              <div className="modern-input-wrapper">
                <input 
                  type="date" 
                  className="modern-input"
                  value={formData.data || ''} 
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  disabled={isViewMode} 
                  required 
                />
                <Calendar size={18} className="modern-field-icon" />
              </div>
            </div>
          </div>

          <div className="modern-form-row four-cols">
            <div className="modern-form-group col-span-2">
              <label>Peso Atual (kg)</label>
              <div className="modern-input-wrapper">
                <input 
                  type="number" 
                  className="modern-input text-lg font-bold"
                  step="0.1" 
                  value={formData.pesoAtual || ''} 
                  onChange={(e) => setFormData({ ...formData, pesoAtual: parseFloat(e.target.value) || 0 })}
                  disabled={isViewMode} 
                  required 
                  placeholder="0.0" 
                />
                <Scale size={18} className="modern-field-icon" />
              </div>
            </div>
            <div className="modern-form-group col-span-2">
              <SearchableSelect
                label="Tipo de Manejo"
                options={[
                  { id: 'Pesagem Rotina', label: 'Pesagem Rotina' },
                  { id: 'Entrada Pasto', label: 'Entrada Pasto' },
                  { id: 'Saída Pasto', label: 'Saída Pasto' },
                  { id: 'Vacinação', label: 'Vacinação' }
                ]}
                value={formData.manejo || ''}
                onChange={(val) => setFormData({ ...formData, manejo: val })}
                disabled={isViewMode}
                required
              />
            </div>
          </div>

          {!isViewMode && (
            <div className="modern-info-tag indigo mt-4 full-width">
              <Activity size={18} />
              <p className="text-sm font-semibold">
                <strong>Cálculo Automático:</strong> O GMD será calculado automaticamente com base no peso anterior.
              </p>
            </div>
          )}
        </div>
      </ModernModal>
    </div>
  );
};

