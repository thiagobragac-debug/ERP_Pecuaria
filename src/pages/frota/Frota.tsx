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
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { ColumnFilters } from '../../components/ColumnFilters';
import { usePagination } from '../../hooks/usePagination';
import { INITIAL_COMPANIES } from '../../data/initialData';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { supabase } from '../../services/supabase';
import { useCompany } from '../../contexts/CompanyContext';
import './Frota.css';

import { 
  mockAssets, 
  mockCompanies, 
  Asset, 
  AssetFinancial 
} from '../../data/fleetData';

export const Frota: React.FC = () => {
  const { activeCompanyId } = useCompany();
  const allAssets = useLiveQuery(() => db.ativos.toArray()) || [];
  
  // Filter by active company
  const assets = allAssets.filter(a => activeCompanyId === 'Todas' || a.empresaId === activeCompanyId);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterCategoria, setFilterCategoria] = useState('Todos');
  const [filterEmpresa, setFilterEmpresa] = useState('Todas');
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
      vidaUtilAnos: 0,
      depreciacaoAnual: 0
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
      const { data: { user } } = await supabase.auth.getUser();
      const tenant_id = user?.user_metadata?.tenant_id || 'default';

      const finalAsset: Asset = {
        ...(editingAsset || {}),
        ...formData,
        id: editingAsset?.id || Math.random().toString(36).substr(2, 9),
        tenant_id,
        empresaId: formData.empresaId || (activeCompanyId === 'Todas' ? undefined : activeCompanyId),
        proximaRevisao: formData.proximaRevisao || 'A definir'
      } as Asset;

      await dataService.saveItem('ativos', finalAsset);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving asset:', error);
      alert('Erro ao salvar ativo');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Deseja realmente excluir este ativo?')) {
      await dataService.deleteItem('ativos', id);
    }
  };

  const filteredAssets = assets.filter(a => {
    const company = INITIAL_COMPANIES.find(c => c.id === a.empresaId);
    if (company && company.status === 'Inativa') return false;
    
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
    
    const matchesStatus = filterStatus === 'Todos' || a.status === filterStatus;
    const matchesCategoria = filterCategoria === 'Todos' || a.categoria === filterCategoria;
    const matchesEmpresa = filterEmpresa === 'Todas' || a.empresaId === filterEmpresa;

    const currentEmpresa = mockCompanies.find(c => c.id === a.empresaId)?.nome || 'N/A';
    const matchesColumnFilters = 
      (columnFilters.ativo === '' || a.nome.toLowerCase().includes(columnFilters.ativo.toLowerCase()) || a.placaOuSerie.toLowerCase().includes(columnFilters.ativo.toLowerCase())) &&
      (columnFilters.status === 'Todos' || a.status === columnFilters.status) &&
      (columnFilters.operacional === '' || a.usoAtual.toString().includes(columnFilters.operacional)) &&
      (columnFilters.empresa === 'Todas' || currentEmpresa.includes(columnFilters.empresa)) &&
      (columnFilters.revisao === '' || a.proximaRevisao.toLowerCase().includes(columnFilters.revisao.toLowerCase()));

    return matchesSearch && matchesStatus && matchesCategoria && matchesEmpresa && matchesColumnFilters;
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
        <div className="header-left">
          <h1>Máquina & Frota</h1>
          <p>Gestão de ativos imobilizados, manutenção e controle operacional</p>
        </div>
        <div className="header-actions">
          <button className="btn-premium-solid indigo h-11 px-6 gap-2" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Novo Ativo</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <StatCard icon={Truck} label="Total Ativos" value={assets.length} color="indigo" delay="0s" subtext="Frota registrada" />
        <StatCard icon={CheckCircle2} label="Disponíveis" value={assets.filter(a => a.status === 'Operacional').length} color="indigo" delay="0.1s" subtext="Prontos para uso" />
        <StatCard icon={Wrench} label="Em Manutenção" value={assets.filter(a => a.status === 'Manutenção').length} color="orange" delay="0.2s" subtext="Parada técnica" />
        <StatCard icon={AlertTriangle} label="Críticos" value={assets.filter(a => (a.proximaRevisao || '').toLowerCase().includes('atrasad')).length} color="red" delay="0.3s" subtext="Revisão atrasada" />
        <StatCard icon={DollarSign} label="Vlr. Imobilizado" value={`R$ ${(assets.reduce((acc, current) => acc + (current.financeiro?.valorCompra || 0), 0) / 1000000).toFixed(1)}M`} color="green" delay="0.4s" subtext="Capital em Ativos" />
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
                    { key: 'empresa', type: 'select', options: ['Todas', ...mockCompanies.map(c => c.nome.split(' (')[0])] },
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
                    <span className={`status-badge ${asset.status.toLowerCase().replace('ç', 'c')} font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-wider`}>
                      {asset.status}
                    </span>
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
                      <span className="text-sm font-bold text-slate-600">{mockCompanies.find(c => c.id === asset.empresaId)?.nome.split(' (')[0] || 'N/A'}</span>
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

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAsset ? 'Editar Ativo' : 'Novo Ativo Profissional'}
        subtitle="Gestão completa de máquinas e veículos"
        icon={Truck}
        size="lg"
        footer={
          <div className="flex gap-3 w-full justify-end">
            <button className="btn-premium-outline px-8" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button className="btn-premium-solid indigo px-8" onClick={handleSave}>Finalizar Cadastro</button>
          </div>
        }
      >
        <div className="modal-tabs mb-6">
          <button className={`tab-btn ${activeTab === 'identificacao' ? 'active' : ''}`} onClick={() => setActiveTab('identificacao')}>Identificação</button>
          <button className={`tab-btn ${activeTab === 'operacional' ? 'active' : ''}`} onClick={() => setActiveTab('operacional')}>Operacional</button>
          <button className={`tab-btn ${activeTab === 'financeiro' ? 'active' : ''}`} onClick={() => setActiveTab('financeiro')}>Financeiro</button>
          <button className={`tab-btn ${activeTab === 'manutencao' ? 'active' : ''}`} onClick={() => setActiveTab('manutencao')}>Manutenção</button>
        </div>

        <div className="form-sections-grid">
          {activeTab === 'identificacao' && (
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group col-12">
                  <label>Nome do Ativo / Equipamento</label>
                  <input type="text" placeholder="Ex: Trator Massey Ferguson 4707" value={formData.nome || ''} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
                </div>
                <div className="form-group col-6">
                  <label>Categoria</label>
                  <select value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})}>
                    <option value="Trator">Trator</option>
                    <option value="Caminhão">Caminhão</option>
                    <option value="Utilitário">Utilitário (Picape/Carro)</option>
                    <option value="Colheitadeira">Colheitadeira</option>
                    <option value="Implemento">Implemento Agrícola</option>
                  </select>
                </div>
                <div className="form-group col-6">
                  <label>Empresa Responsável</label>
                  <select value={formData.empresaId} onChange={(e) => setFormData({...formData, empresaId: e.target.value})}>
                    <option value="">Selecione...</option>
                    {INITIAL_COMPANIES.filter(c => c.status === 'Ativa').map(c => (
                      <option key={c.id} value={c.id}>{c.nomeFantasia}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group col-4">
                  <label>Marca</label>
                  <input type="text" placeholder="Ex: John Deere" value={formData.marca || ''} onChange={(e) => setFormData({...formData, marca: e.target.value})} />
                </div>
                <div className="form-group col-4">
                  <label>Modelo</label>
                  <input type="text" placeholder="Ex: 6125J" value={formData.modelo || ''} onChange={(e) => setFormData({...formData, modelo: e.target.value})} />
                </div>
                <div className="form-group col-4">
                  <label>Ano</label>
                  <input type="number" placeholder="2024" value={formData.ano || ''} onChange={(e) => setFormData({...formData, ano: parseInt(e.target.value) || 0})} />
                </div>
                <div className="form-group col-12">
                  <label>Placa ou Nº de Série</label>
                  <input type="text" placeholder="ABC-1234 ou 000.000" value={formData.placaOuSerie || ''} onChange={(e) => setFormData({...formData, placaOuSerie: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'operacional' && (
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group col-6">
                  <label>Status Operacional</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})}>
                    <option value="Operacional">Operacional</option>
                    <option value="Manutenção">Em Manutenção</option>
                    <option value="Inativo">Inativo / Desativado</option>
                  </select>
                </div>
                <div className="form-group col-6">
                  <label>Tipo de Controle de Uso</label>
                  <div className="radio-group" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="radio" checked={formData.tipoUso === 'Horas'} onChange={() => setFormData({...formData, tipoUso: 'Horas'})} /> Horas
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="radio" checked={formData.tipoUso === 'KM'} onChange={() => setFormData({...formData, tipoUso: 'KM'})} /> KM
                    </label>
                  </div>
                </div>
                <div className="form-group col-6">
                  <label>Uso Atual ({formData.tipoUso})</label>
                  <div className="input-with-icon" style={{ position: 'relative' }}>
                    <Gauge size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="number" style={{ paddingLeft: '2.5rem' }} value={formData.usoAtual || 0} onChange={(e) => setFormData({...formData, usoAtual: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="form-group col-6">
                  <label>Próxima Revisão em ({formData.tipoUso})</label>
                  <input type="number" placeholder="Ex: 1500" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group col-6">
                  <label>Valor de Aquisição</label>
                  <div className="input-with-icon" style={{ position: 'relative' }}>
                    <DollarSign size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="number" style={{ paddingLeft: '2.5rem' }} value={formData.financeiro?.valorCompra || 0} onChange={(e) => setFormData({...formData, financeiro: {...formData.financeiro!, valorCompra: parseFloat(e.target.value) || 0}})} />
                  </div>
                </div>
                <div className="form-group col-6">
                  <label>Data da Compra</label>
                  <input type="date" value={formData.financeiro?.dataCompra || ''} onChange={(e) => setFormData({...formData, financeiro: {...formData.financeiro!, dataCompra: e.target.value}})} />
                </div>
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
          )}

          {activeTab === 'manutencao' && (
            <div className="form-section">
              <div className="maintenance-tab">
                <div className="info-alert mb-6" style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: 'var(--info)' }}>
                  <Info size={18} />
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>Agende e monitore as manutenções preventivas e corretivas.</p>
                </div>
                
                <div className="history-list">
                  <label className="section-label" style={{ display: 'block', marginBottom: '1rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Últimas Intervenções</label>
                  <div className="maintenance-empty" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <Wrench size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p style={{ marginBottom: '1.5rem' }}>Nenhum registro de manutenção para este ativo.</p>
                    <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Adicionar Ordem de Serviço</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </StandardModal>
    </div>
  );
};

