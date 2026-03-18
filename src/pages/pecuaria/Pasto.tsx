
import React, { useState } from 'react';
import { 
  Map as MapIcon, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Activity,
  Layers,
  Wind,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  Droplets,
  AlertTriangle,
  History,
  LayoutGrid
} from 'lucide-react';
import { StandardModal } from '../../components/StandardModal';
import { MapaPastagem } from './MapaPastagem';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import './Pasto.css';

interface Pasto {
  id: string;
  nome: string;
  area: number;
  forrageira: string;
  capacidade: number;
  lotacaoAtual: number;
  status: 'Ocupado' | 'Vazio' | 'Descanso' | 'Reforma';
  dataUltimaAdubacao: string;
}

const mockPastos: Pasto[] = [
  { id: '1', nome: 'Piquete 01 - Sede', area: 12.5, forrageira: 'Brachiaria Brizantha', capacidade: 35, lotacaoAtual: 2.8, status: 'Ocupado', dataUltimaAdubacao: '2023-10-15' },
  { id: '2', nome: 'Invernada Boa Vista', area: 45.0, forrageira: 'Panicum Maximum', capacidade: 120, lotacaoAtual: 0, status: 'Descanso', dataUltimaAdubacao: '2023-11-20' },
  { id: '3', nome: 'Pasto da Baixada', area: 22.0, forrageira: 'Cynodon (Tifton 85)', capacidade: 80, lotacaoAtual: 3.5, status: 'Ocupado', dataUltimaAdubacao: '2024-01-05' },
  { id: '4', nome: 'Reserva Legal', area: 15.8, forrageira: 'Nativa/Campo', capacidade: 15, lotacaoAtual: 0.5, status: 'Reforma', dataUltimaAdubacao: '2023-01-10' },
  { id: '5', nome: 'Piquete 02 - Norte', area: 18.2, forrageira: 'Brachiaria Humidicola', capacidade: 45, lotacaoAtual: 1.8, status: 'Ocupado', dataUltimaAdubacao: '2024-03-01' },
  { id: '6', nome: 'Invernada do Morro', area: 33.5, forrageira: 'Brachiaria Brizantha', capacidade: 90, lotacaoAtual: 0, status: 'Vazio', dataUltimaAdubacao: '2023-12-10' },
];

export const Pasto = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterForrageira, setFilterForrageira] = useState('Todos');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPasto, setSelectedPasto] = useState<Pasto | null>(null);
  const [columnFilters, setColumnFilters] = useState({
    nome: '',
    area: '',
    forrageira: 'Todos',
    capacidade: '',
    lotacao: '',
    status: 'Todos'
  });

  const handleOpenModal = (pasto: Pasto | null = null) => {
    setSelectedPasto(pasto);
    setIsModalOpen(true);
  };

  const totals = {
    areaTotal: mockPastos.reduce((acc, p) => acc + p.area, 0),
    uaTotal: mockPastos.reduce((acc, p) => acc + (p.lotacaoAtual * p.area), 0).toFixed(1),
    pastosAtivos: mockPastos.filter(p => p.status === 'Ocupado').length
  };

  const filteredData = mockPastos.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = p.nome.toLowerCase().includes(searchLower) || 
                         p.forrageira.toLowerCase().includes(searchLower) ||
                         p.status.toLowerCase().includes(searchLower) ||
                         p.area.toString().includes(searchLower) ||
                         p.capacidade.toString().includes(searchLower) ||
                         p.lotacaoAtual.toString().includes(searchLower);
    const matchesStatus = filterStatus === 'Todos' || p.status === filterStatus;
    const matchesForrageira = filterForrageira === 'Todos' || p.forrageira === filterForrageira;
    
    const matchesColumnFilters = 
      (columnFilters.nome === '' || p.nome.toLowerCase().includes(columnFilters.nome.toLowerCase())) &&
      (columnFilters.area === '' || p.area.toString().includes(columnFilters.area)) &&
      (columnFilters.forrageira === 'Todos' || p.forrageira === columnFilters.forrageira) &&
      (columnFilters.capacidade === '' || p.capacidade.toString().includes(columnFilters.capacidade)) &&
      (columnFilters.lotacao === '' || p.lotacaoAtual.toString().includes(columnFilters.lotacao)) &&
      (columnFilters.status === 'Todos' || p.status === columnFilters.status);

    return matchesSearch && matchesStatus && matchesForrageira && matchesColumnFilters;
  });

  const forrageiras = Array.from(new Set(mockPastos.map(p => p.forrageira)));

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

  if (view === 'map') {
    return <MapaPastagem onBack={() => setView('list')} />;
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge emerald">
            <MapIcon size={40} strokeWidth={3} />
          </div>
          <div>
            <h1>Gestão de Pastos</h1>
            <p className="description">Controle de lotação, rotação e produtividade das unidades de pastejo.</p>
          </div>
        </div>
          <button className="btn-premium-outline h-11 px-6 gap-2" onClick={() => setView('map')}>
            <LayoutGrid size={20} strokeWidth={3} />
            <span>Visão Geral Mapas</span>
          </button>
          <button className="btn-premium-solid indigo h-11 px-6 gap-2" onClick={() => handleOpenModal()}>
            <Plus size={20} strokeWidth={3} />
            <span>Novo Pasto</span>
          </button>
      </div>

      <div className="summary-grid">
        <div className="summary-card glass">
          <div className="summary-info">
            <span className="summary-label">Área Sob Manejo</span>
            <span className="summary-value">{totals.areaTotal} ha</span>
            <span className="summary-subtext desc">Total da propriedade</span>
          </div>
          <div className="summary-icon emerald">
            <Maximize2 size={28} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card glass">
          <div className="summary-info">
            <span className="summary-label">Lotação Total</span>
            <span className="summary-value">{totals.uaTotal} UA</span>
            <span className="summary-subtext desc">Unidade Animal</span>
          </div>
          <div className="summary-icon indigo">
            <TrendingUp size={28} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card glass">
          <div className="summary-info">
            <span className="summary-label">Taxa de Ocupação</span>
            <span className="summary-value">{totals.pastosAtivos} / {mockPastos.length}</span>
            <span className="summary-subtext desc">Pastos em uso</span>
          </div>
          <div className="summary-icon success">
            <Activity size={28} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card glass">
          <div className="summary-info">
            <span className="summary-label">Pluviometria Média</span>
            <span className="summary-value">12.5 mm</span>
            <span className="summary-subtext desc">Últimas 24h</span>
          </div>
          <div className="summary-icon info">
            <Droplets size={28} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por nome ou forrageira..."
          onToggleAdvanced={() => setIsFiltersOpen(!isFiltersOpen)}
          isAdvancedOpen={isFiltersOpen}
        />

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome do Pasto</th>
                <th>Área (ha)</th>
                <th>Forrageira</th>
                <th>Capacidade (UA)</th>
                <th>Lotação Atual</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'nome', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'area', type: 'text', placeholder: 'Área...' },
                    { key: 'forrageira', type: 'select', options: forrageiras },
                    { key: 'capacidade', type: 'text', placeholder: 'Capac...' },
                    { key: 'lotacao', type: 'text', placeholder: 'Lotac...' },
                    { key: 'status', type: 'select', options: ['Ocupado', 'Vazio', 'Descanso', 'Reforma'] }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((pasto) => (
                <tr key={pasto.id}>
                  <td>
                    <div className="pasto-cell flex items-center gap-2">
                      <strong className="text-slate-800 font-bold">{pasto.nome}</strong>
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">— {pasto.id}</span>
                    </div>
                  </td>
                  <td>{pasto.area}</td>
                  <td>
                    <div className="forrageira-badge">
                      <Layers size={14} />
                      {pasto.forrageira}
                    </div>
                  </td>
                  <td>{pasto.capacidade}</td>
                  <td>
                    <div className="usage-indicator">
                      <span className="usage-val">{pasto.lotacaoAtual} UA/ha</span>
                      <div className="usage-bar">
                        <div 
                          className={`usage-fill ${pasto.lotacaoAtual > 3 ? 'danger' : (pasto.lotacaoAtual > 1.5 ? 'warning' : 'success')}`}
                          style={{ width: `${Math.min((pasto.lotacaoAtual / 4) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${pasto.status.toLowerCase()}`}>
                      {pasto.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="actions-cell">
                      <button className="action-btn-global btn-view" title="Ver Mapa" onClick={() => setView('map')}>
                        <Maximize2 size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(pasto)}>
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
          label="pastos"
        />
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPasto ? 'Editar Unidade de Pastejo' : 'Nova Unidade de Pastejo'}
        icon={MapIcon}
        size="lg"
        footer={
          <div className="flex gap-3">
            <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button className="btn-premium-solid indigo">Salvar Pasto</button>
          </div>
        }
      >
        <div className="modal-body-content">
          <div className="form-grid">
            <div className="form-group col-12">
              <label>Nome do Pasto / Piquete</label>
              <input type="text" defaultValue={selectedPasto?.nome} placeholder="Ex: Piquete 08 - Sul" />
            </div>
            <div className="form-group col-6">
              <label>Área Total (Hectares)</label>
              <input type="number" defaultValue={selectedPasto?.area} placeholder="0.00" />
            </div>
            <div className="form-group col-6">
              <label>Espécie Forrageira</label>
              <select defaultValue={selectedPasto?.forrageira}>
                <option value="Brachiaria Brizantha">Brachiaria Brizantha</option>
                <option value="Panicum Maximum">Panicum Maximum</option>
                <option value="Cynodon (Tifton 85)">Cynodon (Tifton 85)</option>
                <option value="Nativa/Campo">Nativa/Campo</option>
              </select>
            </div>
            <div className="form-group col-6">
              <label>Capacidade de Suporte (UA)</label>
              <input type="number" defaultValue={selectedPasto?.capacidade} placeholder="Capacidade máxima" />
            </div>
            <div className="form-group col-6">
              <label>Data da Última Adubação</label>
              <input type="date" defaultValue={selectedPasto?.dataUltimaAdubacao} />
            </div>
          </div>

          <div className="info-box-generic info">
             <AlertTriangle size={20} />
             <div>
                <p><strong>Dica de Manejo:</strong> A lotação recomendada para esta espécie forrageira no período seco é de 1.2 UA/ha para evitar a degradação.</p>
             </div>
          </div>
        </div>
      </StandardModal>
    </div>
  );
};

