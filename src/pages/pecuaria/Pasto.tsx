
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Map as MapIcon, 
  Plus, 
  Activity, 
  Layers, 
  Maximize2, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Droplets, 
  AlertTriangle,
  LayoutGrid,
  ChevronRight
} from 'lucide-react';
import { StandardModal } from '../../components/StandardModal';
import { MapaPastagem } from './MapaPastagem';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';
import { Pasto as PastoType } from '../../types';
import { useCompany } from '../../contexts/CompanyContext';
import './Pasto.css';

export const Pasto = () => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { activeCompanyId } = useCompany();
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterForrageira, setFilterForrageira] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPasto, setSelectedPasto] = useState<PastoType | null>(null);

  // Live Queries
  const allPastos = useLiveQuery(() => db.pastos.toArray()) || [];
  const allAnimais = useLiveQuery(() => db.animais.toArray()) || [];

  // Filter by active company
  const pastos = allPastos.filter(p => activeCompanyId === 'Todas' || p.empresaId === activeCompanyId);
  const animais = allAnimais.filter(a => activeCompanyId === 'Todas' || a.empresaId === activeCompanyId);

  const [columnFilters, setColumnFilters] = useState({
    nome: '',
    area: '',
    forrageira: 'Todos',
    capacidade: '',
    lotacao: '',
    status: 'Todos'
  });

  const handleOpenModal = (pasto: PastoType | null = null) => {
    setSelectedPasto(pasto);
    setIsModalOpen(true);
  };

  const totals = {
    areaTotal: pastos.reduce((acc, p) => acc + (p.area_ha || 0), 0),
    uaTotal: pastos.reduce((acc, p) => {
      const animCount = animais.filter(a => a.pasto_id === p.id || a.pasto === p.nome).length;
      return acc + (animCount * 0.8); // Simple UA calculation for demo
    }, 0).toFixed(1),
    pastosAtivos: pastos.filter(p => p.status === 'Ocupado').length
  };

  const filteredData = pastos.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = p.nome.toLowerCase().includes(searchLower) || 
                         (p.pasto_tipo?.toLowerCase().includes(searchLower) || false) ||
                         (p.status?.toLowerCase().includes(searchLower) || false);
    const matchesStatus = filterStatus === 'Todos' || p.status === filterStatus;
    const matchesForrageira = filterForrageira === 'Todos' || p.pasto_tipo === filterForrageira;
    
    const lotacao = p.area_ha > 0 ? (animais.filter(a => a.pasto_id === p.id).length / p.area_ha) : 0;

    const matchesColumnFilters = 
      (columnFilters.nome === '' || p.nome.toLowerCase().includes(columnFilters.nome.toLowerCase())) &&
      (columnFilters.area === '' || p.area_ha.toString().includes(columnFilters.area)) &&
      (columnFilters.forrageira === 'Todos' || p.pasto_tipo === columnFilters.forrageira) &&
      (columnFilters.capacidade === '' || p.capacidade_ua?.toString().includes(columnFilters.capacidade)) &&
      (columnFilters.lotacao === '' || lotacao.toFixed(2).includes(columnFilters.lotacao)) &&
      (columnFilters.status === 'Todos' || p.status === columnFilters.status);

    return matchesSearch && matchesStatus && matchesForrageira && matchesColumnFilters;
  });

  const forrageiras = Array.from(new Set(pastos.map(p => p.pasto_tipo || 'Não especificada')));

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
      <nav className="subpage-breadcrumb">
        <Link to="/pecuaria/rebanho">Pecuária</Link>
        <ChevronRight size={14} />
        <span>Pastos</span>
      </nav>
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
        <div className="flex gap-3">
          <button className="btn-premium-outline h-11 px-6 gap-2" onClick={() => setView('map')}>
            <LayoutGrid size={20} strokeWidth={3} />
            <span>Visão Geral Mapas</span>
          </button>
          <button className="btn-premium-solid indigo h-11 px-6 gap-2" onClick={() => handleOpenModal()}>
            <Plus size={20} strokeWidth={3} />
            <span>Novo Pasto</span>
          </button>
        </div>
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
            <span className="summary-value">{totals.pastosAtivos} / {pastos.length}</span>
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
                  <td>{pasto.area_ha}</td>
                  <td>
                    <div className="forrageira-badge">
                      <Layers size={14} />
                      {pasto.pasto_tipo}
                    </div>
                  </td>
                  <td>{pasto.capacidade_ua}</td>
                  <td>
                    {(() => {
                      const animCount = animais.filter(a => a.pasto_id === pasto.id || a.pasto === pasto.nome).length;
                      const lotacao = pasto.area_ha > 0 ? (animCount / pasto.area_ha).toFixed(2) : 0;
                      return (
                        <div className="usage-indicator">
                          <span className="usage-val">{lotacao} UA/ha</span>
                          <div className="usage-bar">
                            <div 
                              className={`usage-fill ${Number(lotacao) > 3 ? 'danger' : (Number(lotacao) > 1.5 ? 'warning' : 'success')}`}
                              style={{ width: `${Math.min((Number(lotacao) / 4) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td>
                    <span className={`status-pill ${pasto.status?.toLowerCase()}`}>
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
                      <button className="action-btn-global btn-delete" title="Excluir" onClick={async () => {
                        if (window.confirm('Excluir pasto?')) {
                          await dataService.deleteItem('pastos', pasto.id);
                        }
                      }}>
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
            <button type="button" className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" form="pasto-form" className="btn-premium-solid indigo">Salvar Pasto</button>
          </div>
        }
      >
        <div className="modal-body-content">
          <form id="pasto-form" onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const updatedPasto: PastoType = {
              ...selectedPasto!,
              id: selectedPasto?.id || Math.random().toString(36).substr(2, 9),
              nome: formData.get('nome') as string,
              area_ha: Number(formData.get('area')),
              pasto_tipo: formData.get('forrageira') as string,
              capacidade_ua: Number(formData.get('capacidade')),
              status: selectedPasto?.status || 'Vazio',
              data_ultima_adubacao: formData.get('dataUltimaAdubacao') as string,
              empresaId: selectedPasto?.empresaId || (activeCompanyId === 'Todas' ? undefined : activeCompanyId),
              tenant_id: 'default'
            };
            await dataService.saveItem('pastos', updatedPasto);
            setIsModalOpen(false);
          }}>
            <div className="form-grid">
              <div className="form-group col-12">
                <label>Nome do Pasto / Piquete</label>
                <input type="text" name="nome" defaultValue={selectedPasto?.nome} placeholder="Ex: Piquete 08 - Sul" required />
              </div>
              <div className="form-group col-6">
                <label>Área Total (Hectares)</label>
                <input type="number" name="area" step="0.01" defaultValue={selectedPasto?.area_ha} placeholder="0.00" required />
              </div>
              <div className="form-group col-6">
                <label>Espécie Forrageira</label>
                <select name="forrageira" defaultValue={selectedPasto?.pasto_tipo}>
                  <option value="Brachiaria Brizantha">Brachiaria Brizantha</option>
                  <option value="Panicum Maximum">Panicum Maximum</option>
                  <option value="Cynodon (Tifton 85)">Cynodon (Tifton 85)</option>
                  <option value="Nativa/Campo">Nativa/Campo</option>
                </select>
              </div>
              <div className="form-group col-6">
                <label>Capacidade de Suporte (UA)</label>
                <input type="number" name="capacidade" defaultValue={selectedPasto?.capacidade_ua} placeholder="Capacidade máxima" required />
              </div>
              <div className="form-group col-6">
                <label>Data da Última Adubação</label>
                <input type="date" name="dataUltimaAdubacao" defaultValue={selectedPasto?.data_ultima_adubacao} />
              </div>
            </div>
          </form>

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
