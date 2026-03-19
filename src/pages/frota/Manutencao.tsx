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
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { supabase } from '../../services/supabase';
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

interface OrdemServico {
  id: string;
  idAtivo: string;
  nomeAtivo: string;
  tipo: 'Preventiva' | 'Corretiva';
  status: 'Aberta' | 'Execução' | 'Concluída' | 'Cancelada';
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  responsavel: string;
  dataAbertura: string;
  dataConclusao?: string;
  horimetroFinal?: number;
  descricao: string;
  itens: ItemAplicado[];
  maoDeObra: number;
  totalVl: number;
}

const mockAssets = [
  { id: '1', nome: 'Trator John Deere 6125J' },
  { id: '2', nome: 'Caminhão Scania R450' },
  { id: '3', nome: 'Utilitário Toyota Hilux' },
];

const mockInsumos = [
  { id: 'i1', nome: 'Óleo Lubrificante 15W40', unidade: 'Litro', preco: 45.0 },
  { id: 'i2', nome: 'Filtro de Óleo JD', unidade: 'Un', preco: 180.0 },
  { id: 'i3', nome: 'Filtro de Combustível', unidade: 'Un', preco: 150.0 },
  { id: 'i4', nome: 'Pneu Agrícola 18.4-34', unidade: 'Un', preco: 4200.0 },
  { id: 'i5', nome: 'Graxa de Chassi 1kg', unidade: 'Un', preco: 35.0 },
];

const initialOS: OrdemServico[] = [
  {
    id: 'OS-2024-001',
    idAtivo: '1',
    nomeAtivo: 'Trator John Deere 6125J',
    tipo: 'Preventiva',
    status: 'Execução',
    prioridade: 'Alta',
    responsavel: 'Marcos Silva',
    dataAbertura: '2024-03-10',
    descricao: 'Revisão periódica de 500 horas. Troca de óleo e filtros.',
    itens: [
      { id: 'i1', nome: 'Óleo Lubrificante 15W40', quantidade: 20, unidade: 'Litro', valorUnitario: 45, total: 900 },
      { id: 'i2', nome: 'Filtro de Óleo JD', quantidade: 1, unidade: 'Un', valorUnitario: 180, total: 180 },
    ],
    maoDeObra: 350,
    totalVl: 1430
  },
  {
    id: 'OS-2024-002',
    idAtivo: '2',
    nomeAtivo: 'Caminhão Scania R450',
    tipo: 'Corretiva',
    status: 'Aberta',
    prioridade: 'Crítica',
    responsavel: 'Ricardo Santos',
    dataAbertura: '2024-03-12',
    descricao: 'Vazamento de ar no sistema de freios traseiro.',
    itens: [],
    maoDeObra: 0,
    totalVl: 0
  }
];

export const Manutencao: React.FC = () => {
  const osList = useLiveQuery(() => db.manutencoes.toArray()) || [];
  const assets = useLiveQuery(() => db.ativos.toArray()) || [];
  const insumos = useLiveQuery(() => db.insumos.toArray()) || [];
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
    valorTotal: 0
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

  const handleAddItem = (insumo: typeof mockInsumos[0]) => {
    const newItem: ItemAplicado = {
      id: insumo.id,
      nome: insumo.nome,
      quantidade: 1,
      unidade: insumo.unidade,
      valorUnitario: insumo.preco,
      total: insumo.preco
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
      const { data: { user } } = await supabase.auth.getUser();
      const tenant_id = user?.user_metadata?.tenant_id || 'default';
      const asset = assets.find(a => a.id === formData.ativo_id);

      const finalOS: ManutencaoType = {
        ...formData,
        id: editingOS?.id || Math.random().toString(36).substr(2, 9),
        ativo_nome: asset?.nome || 'N/A',
        tenant_id
      } as ManutencaoType;

      await dataService.saveItem('manutencoes', finalOS);
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

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'Pendente': return 'Aberta';
      case 'Em Andamento': return 'Execução';
      case 'Concluída': return 'Concluída';
      default: return status;
    }
  };

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

  const StatCard = ({ icon: Icon, label, value, color, delay, subtext }: any) => (
    <div className="summary-card card glass animate-slide-up" style={{ animationDelay: delay }}>
      <div className="summary-info">
        <span className="summary-label">{label}</span>
        <span className="summary-value">{value}</span>
        <span className="summary-subtext">{subtext}</span>
      </div>
      <div className={`summary-icon ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="page-container fade-in">
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
          <button className="btn-premium-solid indigo h-11 px-6 flex items-center gap-2" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} /> Nova Ordem de Serviço
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card glass animate-slide-up">
          <div className="summary-info">
            <span className="summary-label">Ordens Abertas</span>
            <span className="summary-value">04</span>
            <span className="summary-subtext desc">Equipe em campo: 02</span>
          </div>
          <div className="summary-icon orange">
            <Clock size={28} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Investimento (Mês)</span>
            <span className="summary-value">R$ 12.4k</span>
            <span className="summary-subtext desc">Peças + Mão de obra</span>
          </div>
          <div className="summary-icon emerald">
            <TrendingUp size={28} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Alertas Críticos</span>
            <span className="summary-value">02</span>
            <span className="summary-subtext desc">Revisões vencidas</span>
          </div>
          <div className="summary-icon red">
            <ShieldAlert size={28} strokeWidth={3} />
          </div>
        </div>

        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Preventivas em Dia</span>
            <span className="summary-value">92%</span>
            <span className="summary-subtext desc">Meta do período: 95%</span>
          </div>
          <div className="summary-icon indigo">
            <CheckCircle2 size={28} strokeWidth={3} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar OS, Máquina ou Veículo..."
          actionsLabel="Filtragem"
        >
          <button 
            className={`btn-premium-outline h-11 px-6 flex items-center gap-2 ${isFiltersOpen ? 'filter-active' : ''}`}
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
                    <span className={`status-badge ${os.status.toLowerCase().replace(' ', '-')}`}>
                      {os.status === 'Em Andamento' ? <Clock size={12} className="spinning-slow" /> : null}
                      {getStatusLabel(os.status)}
                    </span>
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

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOS ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
        subtitle={`${formData.id} • Controle Profissional`}
        icon={Wrench}
        size="lg"
        footer={
          <div className="flex gap-3 w-full justify-end">
            <button className="btn-premium-outline px-6" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button className="btn-premium-solid indigo px-6" onClick={handleSave}>Gravar OS</button>
          </div>
        }
      >
        <div className="modal-tabs mb-6">
          <button className={`tab-btn ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>Geral</button>
          <button className={`tab-btn ${activeTab === 'itens' ? 'active' : ''}`} onClick={() => setActiveTab('itens')}>Peças & Insumos</button>
          <button className={`tab-btn ${activeTab === 'servico' ? 'active' : ''}`} onClick={() => setActiveTab('servico')}>Serviços & Custos</button>
        </div>

        <div className="form-sections-grid">
          {activeTab === 'geral' && (
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group col-6">
                  <label>Selecione o Ativo</label>
                  <select value={formData.ativo_id} onChange={(e) => setFormData({...formData, ativo_id: e.target.value})}>
                    <option value="">Selecione...</option>
                    {assets.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  </select>
                </div>
                <div className="form-group col-6">
                  <label>Tipo de Manutenção</label>
                  <select value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value as any})}>
                    <option value="Preventiva">Preventiva (Revisão)</option>
                    <option value="Corretiva">Corretiva (Quebra)</option>
                  </select>
                </div>
                <div className="form-group col-6">
                  <label>Status da OS</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})}>
                    <option value="Pendente">Aberta</option>
                    <option value="Em Andamento">Em Execução</option>
                    <option value="Concluída">Finalizada</option>
                  </select>
                </div>
                <div className="form-group col-6">
                  <label>Prioridade</label>
                  <select value={formData.prioridade} onChange={(e) => setFormData({...formData, prioridade: e.target.value as any})}>
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica (Veículo Parado)</option>
                  </select>
                </div>
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
              <div className="parts-section">
                <div className="parts-inventory">
                  <label className="section-label">Estoque de Insumos (Integração)</label>
                  <div className="inventory-chips">
                    {insumos.slice(0, 10).map(insumo => (
                      <button key={insumo.id} className="chip" onClick={() => {
                        const baseVl = formData.valorTotal || 0;
                        setFormData({...formData, valorTotal: baseVl + (insumo.valorUnitario || 0)});
                      }}>
                        <PlusCircle size={14} />
                        {insumo.nome}
                      </button>
                    ))}
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
      </StandardModal>
    </div>
  );
};

