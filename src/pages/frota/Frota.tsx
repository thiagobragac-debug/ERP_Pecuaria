import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Settings, 
  Wrench, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  FileText, 
  X, 
  Edit2, 
  Trash2,
  ChevronRight,
  ChevronLeft,
  Clock,
  Gauge,
  Building2,
  Info,
  CheckCircle2,
  Filter,
  Activity,
  TrendingDown,
  Hash
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import { INITIAL_COMPANIES } from '../../data/initialData';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';
import { SummaryCard } from '../../components/SummaryCard';
import { StatusBadge } from '../../components/StatusBadge';
import { SearchableSelect } from '../../components/SearchableSelect';
import { useOfflineQuery, useOfflineMutation } from '../../hooks/useOfflineSync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import './Frota.css';

import { 
  mockAssets, 
  mockCompanies, 
  Asset, 
  AssetFinancial 
} from '../../data/fleetData';

export const Frota: React.FC = () => {
  const { user: currentUser, currentOrg } = useAuth();
  const isOnline = useOnlineStatus();
  
  const { data: assets = [], isLoading: loadingAssets } = useOfflineQuery<Asset>(['ativos'], 'ativos');
  const { data: companies = [], isLoading: loadingCompanies } = useOfflineQuery<any>(['empresas'], 'empresas');
  
  const saveAssetMutation = useOfflineMutation<Asset>('ativos', [['ativos']]);
  const deleteAssetMutation = useOfflineMutation<{ id: string }>('ativos', [['ativos']], 'delete');

  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    ativo: '',
    status: 'Todos',
    operacional: '',
    empresa: 'Todas',
    revisao: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'identificacao' | 'operacional' | 'financeiro' | 'manutencao'>('identificacao');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const [formData, setFormData] = useState<Partial<Asset>>({
    status: 'Operacional',
    tipoUso: 'Horas',
    financeiro: {
      valorCompra: 0,
      dataCompra: '',
      vidaUtilAnos: 10,
      depreciacaoAnual: 10
    }
  });

  const handleOpenModal = (asset?: Asset) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({ ...asset });
    } else {
      setEditingAsset(null);
      setFormData({
        nome: '',
        categoria: 'Trator',
        status: 'Operacional',
        tipoUso: 'Horas',
        usoAtual: 0,
        financeiro: {
          valorCompra: 0,
          dataCompra: '',
          vidaUtilAnos: 10,
          depreciacaoAnual: 10
        }
      });
    }
    setActiveTab('identificacao');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.categoria) {
      alert('Nome e Categoria são obrigatórios!');
      return;
    }

    try {
      const finalAsset: Asset = {
        ...(editingAsset || {}),
        ...formData,
        id: editingAsset?.id || Math.random().toString(36).substr(2, 9),
        tenant_id: currentOrg?.id || 'default',
        empresaId: formData.empresaId,
        proximaRevisao: formData.proximaRevisao || 'A definir'
      } as Asset;

      await saveAssetMutation.mutateAsync(finalAsset);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving asset:', error);
      alert('Erro ao salvar ativo');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este ativo?')) {
      await deleteAssetMutation.mutateAsync({ id });
    }
  };

  const filteredAssets = assets.filter(a => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = a.nome.toLowerCase().includes(searchLower) ||
                          a.placaOuSerie.toLowerCase().includes(searchLower) ||
                          a.marca.toLowerCase().includes(searchLower) ||
                          a.modelo.toLowerCase().includes(searchLower) ||
                          a.ano.toString().includes(searchLower) ||
                          a.categoria.toLowerCase().includes(searchLower) ||
                          a.status.toLowerCase().includes(searchLower) ||
                          a.usoAtual.toString().includes(searchLower) ||
                          a.tipoUso.toLowerCase().includes(searchLower) ||
                          a.proximaRevisao.toLowerCase().includes(searchLower);
    
    // Using simple filters instead of complex INITIAL_COMPANIES/mockCompanies logic for now
    const currentEmpresa = companies.find((c: any) => c.id === a.empresaId)?.nomeFantasia || 'N/A';
    
    const matchesColumnFilters = 
      (columnFilters.ativo === '' || a.nome.toLowerCase().includes(columnFilters.ativo.toLowerCase()) || a.placaOuSerie.toLowerCase().includes(columnFilters.ativo.toLowerCase())) &&
      (columnFilters.status === 'Todos' || a.status === columnFilters.status) &&
      (columnFilters.operacional === '' || a.usoAtual.toString().includes(columnFilters.operacional)) &&
      (columnFilters.empresa === 'Todas' || currentEmpresa.includes(columnFilters.empresa)) &&
      (columnFilters.revisao === '' || a.proximaRevisao.toLowerCase().includes(columnFilters.revisao.toLowerCase()));

    return matchesSearch && matchesColumnFilters;
  });

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedAssets,
    itemsPerPage,
    setItemsPerPage,
    startIndex,
    endIndex,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
  } = usePagination({ data: filteredAssets, initialItemsPerPage: 10 });

  const StatCard = ({ icon: Icon, label, value, color, delay, subtext }: any) => (
    <div className="summary-card card glass animate-slide-up" style={{ animationDelay: delay }}>
      <div className="summary-info">
        <span className="summary-label">{label}</span>
        <span className="summary-value">{value}</span>
        <span className="summary-subtext">{subtext}</span>
      </div>
      <div className={`summary-icon ${color}`}>
        <Icon size={24} strokeWidth={3} />
      </div>
    </div>
  );

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/maquinas">Frota & Máquinas</Link>
        <ChevronRight size={14} />
        <span>Frota</span>
      </nav>

      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <Truck size={32} />
          </div>
          <div>
            <h1>Máquina & Frota</h1>
            <p className="description">Gestão de ativos imobilizados, manutenção e controle operacional</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Novo Ativo</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryCard 
          label="Total Ativos"
          value={assets.length.toString()}
          icon={Truck}
          color="indigo"
          delay="0s"
          subtext="Frota registrada"
        />
        <SummaryCard 
          label="Disponíveis"
          value={assets.filter(a => a.status === 'Operacional').length.toString()}
          icon={CheckCircle2}
          color="indigo"
          delay="0.1s"
          subtext="Prontos para uso"
        />
        <SummaryCard 
          label="Em Manutenção"
          value={assets.filter(a => a.status === 'Manutenção').length.toString()}
          icon={Wrench}
          color="amber"
          delay="0.2s"
          subtext="Parada técnica"
        />
        <SummaryCard 
          label="Críticos"
          value={assets.filter(a => (a.proximaRevisao || '').toLowerCase().includes('atrasad')).length.toString()}
          icon={AlertTriangle}
          color="rose"
          delay="0.3s"
          subtext="Revisão atrasada"
        />
        <SummaryCard 
          label="Vlr. Imobilizado"
          value={`R$ ${(assets.reduce((acc, current) => acc + (current.financeiro?.valorCompra || 0), 0) / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          color="emerald"
          delay="0.4s"
          subtext="Capital em Ativos"
        />
      </div>

      <div className="assets-container card glass">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por nome, placa ou série..."
          isAdvancedOpen={isFiltersOpen}
        />

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ativo / Equipamento</th>
                <th>Status</th>
                <th>Operacional</th>
                <th>Empresa</th>
                <th>Próx. Revisão</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'ativo', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'status', type: 'select', options: ['Operacional', 'Manutenção', 'Inativo'] },
                    { key: 'operacional', type: 'text', placeholder: 'Uso...' },
                    { key: 'empresa', type: 'select', options: ['Todas', ...companies.map((c: any) => c.nomeFantasia)] },
                    { key: 'revisao', type: 'text', placeholder: 'Data...' }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
            </thead>
            <tbody>
              {paginatedAssets.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <div className="asset-main-cell flex items-center gap-3">
                      <div className={`asset-category-badge ${asset.categoria.toLowerCase()} h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600`}>
                        <Truck size={20} strokeWidth={3} />
                      </div>
                      <div className="asset-details flex flex-col">
                        <div className="asset-header-line flex items-center gap-2">
                          <strong className="text-slate-800 font-bold">{asset.nome}</strong>
                          <span className="asset-year text-[10px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">{asset.ano}</span>
                        </div>
                        <span className="sub-info text-xs font-bold text-slate-400">{asset.marca} {asset.modelo} • {asset.placaOuSerie}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <StatusBadge status={asset.status} />
                  </td>

                  <td>
                    <div className="operational-cell flex items-center gap-2">
                      <Gauge size={16} strokeWidth={3} className="text-slate-400" />
                      <div className="usage-info flex items-center gap-1.5">
                        <strong className="text-slate-700 font-bold">{asset.usoAtual.toLocaleString()}</strong>
                        <span className="text-[10px] font-black text-slate-400 uppercase">{asset.tipoUso}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="company-cell flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <Building2 size={14} strokeWidth={3} />
                      </div>
                      <span className="text-sm font-bold text-slate-600">{companies.find((c: any) => c.id === asset.empresaId)?.nomeFantasia || 'N/A'}</span>
                    </div>
                  </td>

                  <td>
                    <div className="revision-tag flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 w-fit">
                      <Calendar size={14} strokeWidth={3} className="text-amber-500" />
                      <span className="text-xs font-black text-slate-600 uppercase italic">{asset.proximaRevisao}</span>
                    </div>
                  </td>

                  <td className="text-right">
                    <div className="actions-cell flex justify-end gap-2">
                      <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(asset)}>
                        <Edit2 size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-delete" title="Excluir" onClick={() => handleDelete(asset.id)}>
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
          label="registros"
        />

      </div>

      <ModernModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAsset ? 'Editar Ativo' : 'Novo Ativo Profissional'}
        subtitle="Gestão completa de máquinas e veículos"
        icon={Truck}
        footer={
          <>
            <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>
              <X size={18} strokeWidth={3} />
              <span>Cancelar</span>
            </button>
            <button className="btn-premium-solid indigo" onClick={handleSave}>
              <span>{editingAsset ? 'Salvar Alterações' : 'Cadastrar Ativo'}</span>
              {editingAsset ? <CheckCircle2 size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
            </button>
          </>
        }
      >
        <div className="modal-tabs mb-6">
          <button className={`tab-btn ${activeTab === 'identificacao' ? 'active' : ''}`} onClick={() => setActiveTab('identificacao')}>Identificação</button>
          <button className={`tab-btn ${activeTab === 'operacional' ? 'active' : ''}`} onClick={() => setActiveTab('operacional')}>Operacional</button>
          <button className={`tab-btn ${activeTab === 'financeiro' ? 'active' : ''}`} onClick={() => setActiveTab('financeiro')}>Financeiro</button>
          <button className={`tab-btn ${activeTab === 'manutencao' ? 'active' : ''}`} onClick={() => setActiveTab('manutencao')}>Manutenção</button>
        </div>

        <div className="modal-content-scrollable">
          <div className="form-sections-grid">
          {activeTab === 'identificacao' && (
            <div className="modal-form-body">
              <div className="form-section">
                <div className="form-section-title">
                  <Truck size={20} />
                  <span>Identificação do Ativo</span>
                </div>
                <div className="form-grid">
                  <div className="form-group col-12">
                    <label>Nome do Ativo / Equipamento</label>
                    <input type="text" placeholder="Ex: Trator Massey Ferguson 4707" value={formData.nome || ''} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
                  </div>
                  <div className="form-group col-6">
                    <SearchableSelect
                      label="Categoria"
                      options={[
                        { id: 'Trator', label: 'Trator' },
                        { id: 'Caminhão', label: 'Caminhão' },
                        { id: 'Utilitário', label: 'Utilitário (Picape/Carro)' },
                        { id: 'Colheitadeira', label: 'Colheitadeira' },
                        { id: 'Implemento', label: 'Implemento Agrícola' }
                      ]}
                      value={formData.categoria || ''}
                      onChange={(val) => setFormData({ ...formData, categoria: val })}
                      required
                    />
                  </div>
                  <div className="form-group col-6">
                    <SearchableSelect
                      label="Empresa Responsável"
                      options={companies.map((c: any) => ({ id: c.id, label: c.nomeFantasia }))}
                      value={formData.empresaId || ''}
                      onChange={(val) => setFormData({ ...formData, empresaId: val })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="form-divider" />
              <div className="form-section">
                <div className="form-section-title">Dados Técnicos</div>
                <div className="form-grid">
                  <div className="form-group col-4">
                    <label>Marca</label>
                    <div className="input-with-icon">
                      <Building2 size={16} className="field-icon" />
                      <input type="text" placeholder="Ex: John Deere" value={formData.marca || ''} onChange={(e) => setFormData({...formData, marca: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group col-4">
                    <label>Modelo</label>
                    <div className="input-with-icon">
                      <Settings size={16} className="field-icon" />
                      <input type="text" placeholder="Ex: 6125J" value={formData.modelo || ''} onChange={(e) => setFormData({...formData, modelo: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group col-4">
                    <label>Ano</label>
                    <div className="input-with-icon">
                      <Calendar size={16} className="field-icon" />
                      <input type="number" placeholder="2024" value={formData.ano || ''} onChange={(e) => setFormData({...formData, ano: parseInt(e.target.value) || 0})} />
                    </div>
                  </div>
                  <div className="form-group col-6">
                    <label>Placa ou Nº de Série</label>
                    <div className="input-with-icon">
                      <Hash size={16} className="field-icon" />
                      <input type="text" placeholder="ABC-1234" value={formData.placaOuSerie || ''} onChange={(e) => setFormData({...formData, placaOuSerie: e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'operacional' && (
            <div className="modal-form-body">
              <div className="form-section">
                <div className="form-section-title">
                  <Activity size={20} />
                  <span>Condição Atual</span>
                </div>
                <div className="form-grid">
                  <div className="form-group col-12">
                    <SearchableSelect
                      label="Status Operacional"
                      options={[
                        { id: 'Operacional', label: 'Operacional' },
                        { id: 'Manutenção', label: 'Em Manutenção' },
                        { id: 'Inativo', label: 'Inativo / Desativado' }
                      ]}
                      value={formData.status || ''}
                      onChange={(val) => setFormData({ ...formData, status: val as any })}
                      required
                    />
                  </div>
                  <div className="form-group col-6">
                    <label>Tipo de Controle de Uso</label>
                    <div className="radio-group">
                      <label className="radio-option">
                        <input type="radio" checked={formData.tipoUso === 'Horas'} onChange={() => setFormData({...formData, tipoUso: 'Horas'})} /> Horas
                      </label>
                      <label className="radio-option">
                        <input type="radio" checked={formData.tipoUso === 'KM'} onChange={() => setFormData({...formData, tipoUso: 'KM'})} /> Quilometragem (KM)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-divider" />
              <div className="form-section">
                <div className="form-section-title">
                  <Gauge size={20} />
                  <span>Medidores</span>
                </div>
                <div className="form-grid">
                  <div className="form-group col-6">
                    <label>Uso Atual ({formData.tipoUso})</label>
                    <div className="input-with-icon">
                      <span className="field-icon"><Gauge size={16} /></span>
                      <input type="number" value={formData.usoAtual || 0} onChange={(e) => setFormData({...formData, usoAtual: parseInt(e.target.value) || 0})} />
                    </div>
                  </div>
                  <div className="form-group col-6">
                    <label>Próxima Revisão em ({formData.tipoUso})</label>
                    <input type="number" placeholder="Ex: 1500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div className="modal-form-body">
              <div className="form-section">
                <div className="form-section-title">
                  <DollarSign size={20} />
                  <span>Dados de Aquisição</span>
                </div>
                <div className="form-grid">
                  <div className="form-group col-6">
                    <label>Valor de Aquisição</label>
                    <div className="input-with-icon">
                      <span className="field-icon"><DollarSign size={16} /></span>
                      <input type="number" value={formData.financeiro?.valorCompra || 0} onChange={(e) => setFormData({...formData, financeiro: {...formData.financeiro!, valorCompra: parseFloat(e.target.value) || 0}})} />
                    </div>
                  </div>
                  <div className="form-group col-6">
                    <label>Data da Compra</label>
                    <input type="date" value={formData.financeiro?.dataCompra || ''} onChange={(e) => setFormData({...formData, financeiro: {...formData.financeiro!, dataCompra: e.target.value}})} />
                  </div>
                </div>
              </div>
              <div className="form-section">
                <div className="form-section-title">
                  <TrendingDown size={20} />
                  <span>Depreciação</span>
                </div>
                <div className="form-grid">
                  <div className="form-group col-6">
                    <label>Vida Útil Estimada (Anos)</label>
                    <input type="number" value={formData.financeiro?.vidaUtilAnos || 10} onChange={(e) => setFormData({...formData, financeiro: {...formData.financeiro!, vidaUtilAnos: parseInt(e.target.value) || 0}})} />
                  </div>
                  <div className="form-group col-6">
                    <label>Depreciação Anual (%)</label>
                    <input type="number" value={formData.financeiro?.depreciacaoAnual || 10} onChange={(e) => setFormData({...formData, financeiro: {...formData.financeiro!, depreciacaoAnual: parseFloat(e.target.value) || 0}})} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manutencao' && (
            <div className="modal-form-body">
              <div className="form-section">
                <div className="form-section-title">Histórico de Manutenção</div>
                <div className="info-alert">
                  <Info size={18} />
                  <p>Agende e monitore as manutenções preventivas e corretivas aqui.</p>
                </div>
                <div className="maintenance-empty">
                  <Wrench size={40} style={{ opacity: 0.4 }} />
                  <p>Nenhum registro de manutenção para este ativo.</p>
                  <button className="btn-premium-outline btn-sm">
                    <Plus size={16} strokeWidth={3} />
                    <span>Adicionar Ordem de Serviço</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </ModernModal>
    </div>
  );
};

