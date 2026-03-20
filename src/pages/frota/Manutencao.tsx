import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Settings, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Package,
  DollarSign,
  User,
  Calendar,
  X,
  PlusCircle,
  Trash2,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Edit2,
  History,
  ShieldAlert,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { SummaryCard } from '../../components/SummaryCard';
import { StatusBadge } from '../../components/StatusBadge';
import { SearchableSelect } from '../../components/SearchableSelect';
import { useOfflineQuery, useOfflineMutation } from '../../hooks/useOfflineSync';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { Asset, Insumo, Manutencao as ManutencaoType } from '../../types';
import './Manutencao.css';

interface ItemAplicado {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  total: number;
}



export const Manutencao: React.FC = () => {
  const { user: currentUser, currentOrg } = useAuth();
  const isOnline = useOnlineStatus();
  
  const { data: osList = [], isLoading: loadingOS } = useOfflineQuery<ManutencaoType>(['manutencoes'], 'manutencoes');
  const { data: assets = [], isLoading: loadingAssets } = useOfflineQuery<Asset>(['ativos'], 'ativos');
  const { data: insumos = [], isLoading: loadingInsumos } = useOfflineQuery<Insumo>(['insumos'], 'insumos');
  
  const saveOSMutation = useOfflineMutation<ManutencaoType>('manutencoes', [['manutencoes']]);
  const saveInsumoMutation = useOfflineMutation<Insumo>('insumos', [['insumos']]);
  const saveAssetMutation = useOfflineMutation<Asset>('ativos', [['ativos']]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    id: '',
    ativo_nome: '',
    tipo: 'Todos',
    status: 'Todos',
    prioridade: 'Todos',
    responsavel: ''
  });
  const [activeTab, setActiveTab] = useState<'geral' | 'itens' | 'servico'>('geral');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingOS, setEditingOS] = useState<ManutencaoType | null>(null);

  const [formData, setFormData] = useState<Partial<ManutencaoType>>({
    status: 'Pendente',
    tipo: 'Preventiva',
    valorTotal: 0,
    itens: []
  });

  const handleOpenModal = (os?: ManutencaoType) => {
    if (os) {
      setEditingOS(os);
      setFormData({ ...os });
    } else {
      setEditingOS(null);
      setFormData({
        status: 'Pendente',
        tipo: 'Preventiva',
        data: new Date().toISOString().split('T')[0],
        valorTotal: 0,
        descricao: ''
      });
    }
    setActiveTab('geral');
    setIsModalOpen(true);
  };

  const handleAddItem = (insumo: Insumo) => {
    const newItem: ItemAplicado = {
      id: insumo.id,
      nome: insumo.nome,
      quantidade: 1,
      unidade: insumo.unidade,
      valorUnitario: (insumo as any).preco || 0,
      total: (insumo as any).preco || 0
    };
    
    const updatedItens = [...(formData.itens || []), newItem];
    const newTotal = updatedItens.reduce((acc: number, curr: any) => acc + curr.total, 0) + (formData.maoDeObra || 0);
    
    setFormData({
      ...formData,
      itens: updatedItens,
      valorTotal: newTotal
    });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItens = (formData.itens || []).filter((_: any, i: number) => i !== index);
    const newTotal = updatedItens.reduce((acc: number, curr: any) => acc + curr.total, 0) + (formData.maoDeObra || 0);
    
    setFormData({
      ...formData,
      itens: updatedItens,
      valorTotal: newTotal
    });
  };

  const updateItemQty = (index: number, qty: number) => {
    const updatedItens = (formData.itens || []).map((item: any, i: number) => {
      if (i === index) {
        return { ...item, quantidade: qty, total: qty * item.valorUnitario };
      }
      return item;
    });
    const newTotal = updatedItens.reduce((acc: number, curr: any) => acc + curr.total, 0) + (formData.maoDeObra || 0);
    
    setFormData({
      ...formData,
      itens: updatedItens,
      valorTotal: newTotal
    });
  };

  const handleSave = async () => {
    if (!formData.ativo_id) {
      alert('Selecione um ativo para a OS!');
      return;
    }

    try {
      const asset = assets.find(a => a.id === formData.ativo_id);

      const finalOS: ManutencaoType = {
        ...formData,
        id: editingOS?.id || `OS-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        ativo_nome: asset?.nome || 'N/A',
        empresaId: asset?.empresaId || currentOrg?.id,
        tenant_id: currentOrg?.id || 'default'
      } as ManutencaoType;

      // CRITICAL: Stock Integrity & Asset Update
      if (finalOS.status === 'Concluída' && (!editingOS || editingOS.status !== 'Concluída')) {
        // 1. Deduct Items from Stock
        if (finalOS.itens && finalOS.itens.length > 0) {
          for (const item of finalOS.itens) {
            const insumoToUpdate = insumos.find(i => i.id === item.id || i.nome === item.nome);
            if (insumoToUpdate) {
              const updatedInsumo = {
                ...insumoToUpdate,
                estoqueAtual: (insumoToUpdate.estoqueAtual || 0) - (item.quantidade || 0),
                ultimaSaida: new Date().toISOString().split('T')[0]
              };
              await saveInsumoMutation.mutateAsync(updatedInsumo);
            }
          }
        }

        // 2. Update Asset usage if horimetroFinal is provided
        if (asset && finalOS.odometroHorimetro && finalOS.odometroHorimetro > (asset.usoAtual || 0)) {
          const updatedAsset = {
            ...asset,
            usoAtual: finalOS.odometroHorimetro,
            status: 'Operacional' as const
          };
          await saveAssetMutation.mutateAsync(updatedAsset);
        }
      }

      await saveOSMutation.mutateAsync(finalOS);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving maintenance:', error);
      alert('Erro ao salvar manutenção');
    }
  };

  const filteredOS = osList.filter(os => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = os.id.toLowerCase().includes(searchLower) || 
                          os.ativo_nome.toLowerCase().includes(searchLower) ||
                          os.tipo.toLowerCase().includes(searchLower) ||
                          os.status.toLowerCase().includes(searchLower) ||
                          (os.prioridade?.toLowerCase() || '').includes(searchLower) ||
                          (os.responsavel?.toLowerCase() || '').includes(searchLower) ||
                          os.data.toLowerCase().includes(searchLower) ||
                          os.valorTotal.toString().includes(searchLower);
    
    const matchesColumnFilters = 
      (columnFilters.id === '' || os.id.toLowerCase().includes(columnFilters.id.toLowerCase())) &&
      (columnFilters.ativo_nome === '' || os.ativo_nome.toLowerCase().includes(columnFilters.ativo_nome.toLowerCase())) &&
      (columnFilters.tipo === 'Todos' || os.tipo === columnFilters.tipo) &&
      (columnFilters.status === 'Todos' || os.status === columnFilters.status) &&
      (columnFilters.prioridade === 'Todos' || os.prioridade === columnFilters.prioridade) &&
      (columnFilters.responsavel === '' || (os.responsavel || '').toLowerCase().includes(columnFilters.responsavel.toLowerCase()));

    return matchesSearch && matchesColumnFilters;
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
  } = usePagination({ data: filteredOS, initialItemsPerPage: 10 });


  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/maquinas">Frota & Máquinas</Link>
        <ChevronRight size={14} />
        <span>Manutenção</span>
      </nav>

      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <Wrench size={32} strokeWidth={3} />
          </div>
          <div>
            <h1>Oficina & Manutenção</h1>
            <p className="description">Controle de ordens de serviço, preventivas e gestão de peças.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <span>Nova OS</span>
            <Plus size={18} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryCard 
          label="Ordens Abertas"
          value={osList.filter(os => os.status !== 'Concluída').length.toString().padStart(2, '0')}
          icon={Clock}
          color="amber"
          delay="0s"
          subtext="Pendentes ou em execução"
        />
        <SummaryCard 
          label="Investimento (Mês)"
          value={`R$ ${(osList.reduce((acc, os) => acc + (os.valorTotal || 0), 0) / 1000).toFixed(1)}k`}
          icon={TrendingUp}
          color="emerald"
          delay="0.1s"
          subtext="Peças + Mão de obra"
        />
        <SummaryCard 
          label="Alertas Críticos"
          value={osList.filter(os => os.prioridade === 'Crítica' && os.status !== 'Concluída').length.toString().padStart(2, '0')}
          icon={ShieldAlert}
          color="rose"
          delay="0.2s"
          subtext="Revisões vencidas"
        />
        <SummaryCard 
          label="Preventivas em Dia"
          value="92%"
          icon={CheckCircle2}
          color="indigo"
          delay="0.3s"
          subtext="Meta do período: 95%"
        />
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar OS, Máquina ou Veículo..."
          actionsLabel="Filtragem"
        >
          <button 
            className={`btn-premium-outline ${isFiltersOpen ? 'filter-active' : ''}`}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter size={18} strokeWidth={3} />
            <span>{isFiltersOpen ? 'Fechar Filtros' : 'Filtros Avançados'}</span>
          </button>
        </TableFilters>


        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ordem de Serviço</th>
                <th>Ativo / Equipamento</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th>Responsável / Valor</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                  <ColumnFilters
                    columns={[
                      { key: 'id', type: 'text', placeholder: 'ID OS...' },
                      { key: 'ativo_nome', type: 'text', placeholder: 'Ativo...' },
                      { key: 'tipo', type: 'select', options: ['Preventiva', 'Corretiva', 'Preditiva'] },
                      { key: 'status', type: 'select', options: ['Pendente', 'Em Andamento', 'Concluída'] },
                      { key: 'prioridade', type: 'select', options: ['Baixa', 'Média', 'Alta', 'Crítica'] },
                      { key: 'responsavel', type: 'text', placeholder: 'Responsável...' }
                    ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((os) => (
                <tr key={os.id}>
                  <td>
                    <div className="os-id-cell">
                      <div className="flex items-center gap-3">
                        <span className={`os-type-prefix ${os.tipo.toLowerCase()}`}>{os.tipo[0]}</span>
                        <div className="datetime-cell">
                          <strong className="text-slate-900">{os.id}</strong>
                          <span className="sub-info">{new Date(os.data).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="asset-info-mini">
                      <strong className="text-slate-700">{os.ativo_nome}</strong>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={os.status} />
                  </td>
                  <td>
                    <span className={`priority-indicator ${(os.prioridade || 'Baixa').toLowerCase().replace('é', 'e').replace('í', 'i')}`}>
                      {os.prioridade || 'Média'}
                    </span>
                  </td>
                  <td>
                    <div className="avatar-chip">
                      <div className="avatar-initials">{(os.responsavel || 'N A').split(' ').map(n => n[0]).join('')}</div>
                      <div className="chip-details">
                        <span className="font-bold text-slate-700">{os.responsavel || 'Não Atribuído'}</span>
                        <strong className="text-indigo-600 block mt-0.5">R$ {os.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </div>
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="table-actions">
                      <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(os)}>
                        <Edit2 size={18} strokeWidth={3} />
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
          label="ordens de serviço"
        />

      </div>

      <ModernModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOS ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
        subtitle={`${formData.id} • Controle Profissional`}
        icon={Wrench}
        footer={
          <>
            <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)}>
              <X size={18} strokeWidth={3} />
              <span>Cancelar</span>
            </button>
            <button className="btn-premium-solid indigo" onClick={handleSave}>
              <span>{editingOS ? 'Gravar Alterações' : 'Abrir Ordem de Serviço'}</span>
              <CheckCircle2 size={18} strokeWidth={3} />
            </button>
          </>
        }
      >
        <div className="modal-tabs mb-6">
          <button className={`tab-btn ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>Geral</button>
          <button className={`tab-btn ${activeTab === 'itens' ? 'active' : ''}`} onClick={() => setActiveTab('itens')}>Peças & Insumos</button>
          <button className={`tab-btn ${activeTab === 'servico' ? 'active' : ''}`} onClick={() => setActiveTab('servico')}>Serviços & Custos</button>
        </div>

        <div className="modal-content-scrollable">
          <div className="form-sections-grid">
          {activeTab === 'geral' && (
            <div className="form-section">
              <div className="form-section-title">
                <FileText size={16} />
                <span>Dados da Ordem de Serviço</span>
              </div>
              <div className="form-grid">
                <div className="form-group col-6">
                  <SearchableSelect
                    label="Selecione o Ativo"
                    options={assets.map(a => ({ id: a.id, label: a.nome, sublabel: a.placaOuSerie }))}
                    value={formData.ativo_id || ''}
                    onChange={(val) => setFormData({ ...formData, ativo_id: val })}
                    required
                  />
                </div>
                <div className="form-group col-6">
                  <SearchableSelect
                    label="Tipo de Manutenção"
                    options={[
                      { id: 'Preventiva', label: 'Preventiva (Revisão)' },
                      { id: 'Corretiva', label: 'Corretiva (Quebra)' },
                      { id: 'Preditiva', label: 'Preditiva' }
                    ]}
                    value={formData.tipo || ''}
                    onChange={(val) => setFormData({ ...formData, tipo: val as any })}
                  />
                </div>
                <div className="form-group col-6">
                  <SearchableSelect
                    label="Status da OS"
                    options={[
                      { id: 'Pendente', label: 'Aberta' },
                      { id: 'Em Andamento', label: 'Em Execução' },
                      { id: 'Concluída', label: 'Finalizada' },
                      { id: 'Cancelada', label: 'Cancelada' }
                    ]}
                    value={formData.status || ''}
                    onChange={(val) => setFormData({ ...formData, status: val as any })}
                  />
                </div>
                <div className="form-group col-6">
                  <SearchableSelect
                    label="Prioridade"
                    options={[
                      { id: 'Baixa', label: 'Baixa' },
                      { id: 'Média', label: 'Média' },
                      { id: 'Alta', label: 'Alta' },
                      { id: 'Crítica', label: 'Crítica (Veículo Parado)' }
                    ]}
                    value={formData.prioridade || ''}
                    onChange={(val) => setFormData({ ...formData, prioridade: val as any })}
                  />
                </div>
              </div>

              <div className="form-divider" />

              <div className="form-grid">
                <div className="form-group col-6">
                  <label>Responsável / Mecânico</label>
                  <input type="text" placeholder="Ex: Roberto Alves" value={formData.responsavel || ''} onChange={(e) => setFormData({...formData, responsavel: e.target.value})} />
                </div>
                <div className="form-group col-6">
                  <label>Data</label>
                  <input type="date" value={formData.data || ''} onChange={(e) => setFormData({...formData, data: e.target.value})} />
                </div>
                <div className="form-group col-12">
                  <label>Descrição detalhada do Problema / Serviço</label>
                  <textarea 
                    rows={3} 
                    placeholder="Descreva aqui o diagnóstico inicial ou serviços a serem prestados..." 
                    value={formData.descricao || ''} 
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'itens' && (
            <div className="form-section">
              <div className="form-section-title">
                <Package size={20} />
                <span>Peças e Peças Aplicadas na OS</span>
              </div>
              <div className="parts-section">
                <div className="parts-inventory">
                  <div className="form-group col-12">
                     <SearchableSelect
                        label="Adicionar Peça / Insumo do Estoque"
                        options={insumos.map(i => ({ id: i.id, label: i.nome, sublabel: `Estoque: ${i.estoqueAtual} ${i.unidade}` }))}
                        value=""
                        onChange={(val) => {
                          const insumo = insumos.find(i => i.id === val);
                          if (insumo) {
                            const newItem: ItemAplicado = {
                              id: insumo.id,
                              nome: insumo.nome,
                              quantidade: 1,
                              unidade: insumo.unidade,
                              valorUnitario: (insumo as any).preco || (insumo as any).valorCusto || 0,
                              total: (insumo as any).preco || (insumo as any).valorCusto || 0
                            };
                            const updatedItens = [...(formData.itens || []), newItem];
                            const newTotal = updatedItens.reduce((acc, curr) => acc + curr.total, 0) + (formData.maoDeObra || 0);
                            setFormData({ ...formData, itens: updatedItens, valorTotal: newTotal });
                          }
                        }}
                        placeholder="Pesquise peça por nome..."
                     />
                  </div>
                </div>

                <div className="applied-parts mt-6">
                  <label className="section-label">Peças e Peças Aplicadas na OS</label>
                  <table className="parts-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Quantidade</th>
                        <th>Valor Unit.</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.itens?.length === 0 ? (
                        <tr><td colSpan={5} className="empty-td">Nenhum item aplicado nesta OS.</td></tr>
                      ) : (
                        formData.itens?.map((item, index) => (
                          <tr key={index}>
                            <td>{item.nome}</td>
                            <td>
                              <div className="qty-input">
                                <input type="number" value={item.quantidade} onChange={(e) => updateItemQty(index, parseFloat(e.target.value) || 0)} />
                                <span>{item.unidade}</span>
                              </div>
                            </td>
                            <td>R$ {item.valorUnitario.toLocaleString()}</td>
                            <td>R$ {item.total.toLocaleString()}</td>
                            <td>
                              <button className="btn-icon-danger" onClick={() => handleRemoveItem(index)}><Trash2 size={16} /></button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'servico' && (
            <div className="form-section">
              <div className="costs-section">
                <div className="cost-summary-card">
                  <div className="cost-row">
                    <span>Total em Peças:</span>
                    <strong>R$ {(formData.valorTotal! - (formData.maoDeObra || 0)).toLocaleString()}</strong>
                  </div>
                  <div className="cost-row">
                    <span>Valor de Mão de Obra:</span>
                    <div className="input-with-icon inline">
                      <DollarSign size={16} />
                      <input type="number" value={formData.valorTotal} onChange={(e) => {
                        setFormData({...formData, valorTotal: parseFloat(e.target.value) || 0});
                      }} />
                    </div>
                  </div>
                  <div className="divider"></div>
                  <div className="cost-row total">
                    <span>Total Geral da OS:</span>
                    <strong>R$ {formData.valorTotal?.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="finalization-alerts mt-6">
                  <div className="alert-box info">
                    <AlertCircle size={20} />
                    <p>Ao finalizar a OS com status <strong>"Concluída"</strong>, o sistema realizará a baixa automática dos itens aplicados no estoque e atualizará o horímetro do ativo vinculado.</p>
                  </div>
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

