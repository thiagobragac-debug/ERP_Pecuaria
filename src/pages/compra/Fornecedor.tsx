import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, 
  Plus, 
  Search, 
  X, 
  Edit, 
  Trash2, 
  ChevronRight,
  Info,
  MapPin,
  Phone,
  Mail,
  Building2,
  Globe,
  Tag,
  Activity,
  User,
  CheckCircle2,
  CreditCard,
  Briefcase,
  FileText,
  Users,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
  Filter,
  Download,
  Eye,
  DollarSign,
  Scale,
  Navigation,
  MessageSquare,
  Building,
  Loader2,
  SearchCode,
  PlusCircle,
  Clock
} from 'lucide-react';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import { SummaryCard } from '../../components/SummaryCard';
import { StatusBadge } from '../../components/StatusBadge';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';

import { Supplier } from '../../types';

export const Fornecedor: React.FC = () => {
  const suppliers = useLiveQuery(() => db.fornecedores.toArray()) || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'fiscal' | 'endereco' | 'contato' | 'comercial'>('geral');
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

  // Filters state
  const [columnFilters, setColumnFilters] = useState({
    nome: '',
    documento: '',
    localizacao: '',
    prazoEntregaMedio: '',
    status: 'Todos'
  });

  const [formData, setFormData] = useState<Partial<Supplier>>({});

  const handleOpenModal = (supplier?: Supplier, viewOnly = false) => {
    setIsViewMode(viewOnly);
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({ ...supplier });
    } else {
      setEditingSupplier(null);
      setFormData({
        nome: '',
        nomeFantasia: '',
        documento: '',
        tipo: 'Jurídica',
        status: 'Ativo',
        condicaoPagamentoPadrao: '30 dias',
        prazoEntregaMedio: '7 dias'
      });
    }
    setActiveTab('geral');
    setIsModalOpen(true);
  };

  const handleInputChange = (field: keyof Supplier, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCnpjLookup = async () => {
    if (!formData.documento) return;
    
    const cleanDoc = formData.documento.replace(/\D/g, '');
    if (cleanDoc.length !== 14) return;

    setIsLoadingCnpj(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanDoc}`);
      if (!response.ok) throw new Error('Não foi possível encontrar este CNPJ.');
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        nome: data.razao_social || prev.nome,
        nomeFantasia: data.nome_fantasia || prev.nomeFantasia || data.razao_social,
        cep: data.cep || prev.cep,
        logradouro: data.logradouro || prev.logradouro,
        numero: data.numero || prev.numero,
        complemento: data.complemento || prev.complemento,
        bairro: data.bairro || prev.bairro,
        cidade: data.municipio || prev.cidade,
        estado: data.uf || prev.estado,
        email: data.email || data.e_mail || prev.email,
        telefone: data.ddd_telefone_1 ? `(${data.ddd_telefone_1.substring(0,2)}) ${data.ddd_telefone_1.substring(2)}` : prev.telefone,
        cnae: data.cnae_fiscal ? `${String(data.cnae_fiscal).replace(/(\d{4})(\d{1})(\d{2})/, '$1-$2/$3')} - ${data.cnae_fiscal_descricao}` : prev.cnae
      }));
    } catch (error: any) {
      alert(error.message || 'Erro ao consultar CNPJ.');
    } finally {
      setIsLoadingCnpj(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.documento) {
      alert('Nome/Razão Social e CPF/CNPJ são obrigatórios');
      return;
    }

    const updatedSupplier: Supplier = {
      ...(editingSupplier || {}),
      ...formData,
      id: editingSupplier?.id || Math.random().toString(36).substr(2, 9),
      tenant_id: 'default'
    } as Supplier;

    await dataService.saveItem('fornecedores', updatedSupplier);
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Deseja realmente excluir o fornecedor "${name}"?`)) {
      await dataService.deleteItem('fornecedores', id);
    }
  };

  const filteredSuppliers = suppliers.filter(s => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      s.nome.toLowerCase().includes(searchLower) || 
      s.nomeFantasia.toLowerCase().includes(searchLower) ||
      (s.documento || '').includes(searchTerm) ||
      (s.cidade?.toLowerCase() || '').includes(searchLower) ||
      (s.estado?.toLowerCase() || '').includes(searchLower);
    
    const matchesColumnFilters =
      (columnFilters.nome === '' || s.nome.toLowerCase().includes(columnFilters.nome.toLowerCase())) &&
      (columnFilters.documento === '' || (s.documento || '').includes(columnFilters.documento)) &&
      (columnFilters.localizacao === '' || `${s.cidade}/${s.estado}`.toLowerCase().includes(columnFilters.localizacao.toLowerCase())) &&
      (columnFilters.status === 'Todos' || s.status === columnFilters.status);

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
  } = usePagination({ data: filteredSuppliers, initialItemsPerPage: 10 });

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'Ativo').length;

  return (
    <div className="p-10 max-w-[1600px] mx-auto animate-premium-fade-up">
      {/* Floating Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 sticky top-0 z-30 py-4 bg-slate-50/80 backdrop-blur-md -mx-10 px-10 border-b border-slate-200/50 shadow-sm">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
              <Truck size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fornecedores</h1>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest text-shadow-sm">Gestão de Parceiros & Suprimentos</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="action-btn-global h-12 px-6 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
            <Download size={20} strokeWidth={2.5} />
            <span className="font-bold">Relatórios</span>
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="btn-premium-solid h-14 px-8 rounded-2xl indigo"
          >
            <PlusCircle size={22} strokeWidth={3} />
            <span className="text-base text-white">Novo Fornecedor</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <SummaryCard 
          label="Total de Parceiros"
          value={totalSuppliers.toString().padStart(2, '0')}
          subtext="Base homologada"
          icon={Users}
          color="indigo"
          delay="0s"
        />
        <SummaryCard 
          label="Parceiros Ativos"
          value={activeSuppliers.toString().padStart(2, '0')}
          subtext="Em conformidade"
          icon={ShieldCheck}
          color="emerald"
          delay="0.1s"
        />
        <SummaryCard 
          label="Volume (30d)"
          value="R$ 88k"
          subtext="Total negociado"
          icon={CreditCard}
          color="amber"
          delay="0.2s"
        />
        <SummaryCard 
          label="Lead Time Médio"
          value="7.2d"
          subtext="Eficiência logística"
          icon={Clock}
          color="sky"
          delay="0.3s"
        />
      </div>

      {/* Main Data Section */}
      <div className="glass-premium rounded-[32px] border border-white/40 shadow-soft-xl overflow-hidden">
        <div className="p-8 border-b border-slate-200/50 bg-white/30">
          <TableFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Buscar por nome, documento ou localização..."
            onToggleAdvanced={() => setIsFiltersOpen(!isFiltersOpen)}
            isAdvancedOpen={isFiltersOpen}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-200/50">Fornecedor / Razão Social</th>
                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-200/50 text-center">CPF / CNPJ</th>
                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-200/50">Localização</th>
                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-200/50 text-center">Prazo Médio</th>
                <th className="px-8 py-5 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-200/50">Status</th>
                <th className="px-8 py-5 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-200/50">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'nome', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'documento', type: 'text', placeholder: 'Filtrar...' },
                    { key: 'localizacao', type: 'text', placeholder: 'Cidade/UF...' },
                    { key: 'prazoEntregaMedio', type: 'empty' },
                    { key: 'status', type: 'select', options: ['Ativo', 'Inativo', 'Suspenso'] }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                  showActionsPadding={true}
                />
              )}
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {paginatedData.map((s, idx) => (
                <tr 
                  key={s.id} 
                  className="group hover:bg-indigo-50/30 transition-all duration-300"
                  style={{ animation: `premium-fade-up 0.5s ease-out forwards ${idx * 0.05}s` }}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm ring-4 ring-white transition-transform group-hover:scale-110 duration-300 ${
                        s.status === 'Ativo' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {s.nome.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{s.nome}</div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{s.nomeFantasia}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100/50 px-3 py-1.5 rounded-lg border border-slate-200/30">{s.documento}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="text-sm font-black text-slate-600">{s.cidade} / {s.estado}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-sm font-black text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">{s.prazoEntregaMedio}</span>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleOpenModal(s, true)}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-lg transition-all flex items-center justify-center"
                        title="Visualizar"
                      >
                        <Eye size={18} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(s)}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:shadow-lg transition-all flex items-center justify-center"
                        title="Editar"
                      >
                        <Edit size={18} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => handleDelete(s.id, s.nome)}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:shadow-lg transition-all flex items-center justify-center"
                        title="Excluir"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-200/50 bg-slate-50/30">
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
            label="fornecedores"
          />
        </div>
      </div>

      <ModernModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isViewMode ? 'Visualizar Fornecedor' : (editingSupplier ? 'Editar Cadastro' : 'Novo Fornecedor')}
        subtitle="Gerencie as informações detalhadas e o histórico comercial do seu parceiro."
        icon={Users}
        footer={
          <div className="flex justify-between items-center w-full px-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {isViewMode ? 'Modo de Visualização' : (editingSupplier ? 'Editando Registro' : 'Novo registro')}
            </div>
            <div className="flex gap-4">
              <button className="btn-premium-outline h-12 px-6 rounded-xl" onClick={() => setIsModalOpen(false)}>
                <X size={18} strokeWidth={3} />
                <span>{isViewMode ? 'Fechar' : 'Cancelar'}</span>
              </button>
              {!isViewMode && (
                <button className="btn-premium-solid h-12 px-8 rounded-xl indigo shadow-indigo-100" onClick={handleSave}>
                  <CheckCircle2 size={18} strokeWidth={3} />
                  <span>{editingSupplier ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}</span>
                </button>
              )}
            </div>
          </div>
        }
      >
        <div className="modal-sidebar-layout">
          {/* Vertical Sidebar Navigation */}
          <aside className="modal-sidebar-nav">
            {[
              { id: 'geral', label: 'Geral', icon: Activity },
              { id: 'fiscal', label: 'Fiscal', icon: Scale },
              { id: 'endereco', label: 'Endereço', icon: MapPin },
              { id: 'contato', label: 'Contato', icon: MessageSquare },
              { id: 'comercial', label: 'Comercial', icon: CreditCard },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              >
                <tab.icon size={18} strokeWidth={2.5} />
                <span>{tab.label}</span>
              </button>
            ))}
          </aside>

          {/* Form Area */}
          <main className="modal-main-content">
            <div className="modern-form-section">
              {activeTab === 'geral' && (
                <div className="form-content-active">
                  {/* Card Section: Identificação */}
                  <div className="glass-premium p-8 rounded-3xl border border-white/60 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 rounded-full" />
                    <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      Identificação Básica
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="modern-form-group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tipo de Pessoa</label>
                        <div className="flex gap-2">
                          {['Jurídica', 'Física'].map(t => (
                            <button 
                              key={t}
                              type="button"
                              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black tracking-widest border transition-all ${
                                formData.tipo === t 
                                  ? 'bg-white border-indigo-500 text-indigo-600 shadow-md shadow-indigo-50' 
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                              }`}
                              onClick={() => !isViewMode && handleInputChange('tipo', t)}
                            >
                              <div className={`w-2 h-2 rounded-full ${formData.tipo === t ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="modern-form-group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                          {formData.tipo === 'Jurídica' ? 'CNPJ' : 'CPF'}
                        </label>
                        <div className="relative group">
                          <input 
                            type="text" 
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 pl-10 text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all group-hover:border-slate-300"
                            value={formData.documento || ''} 
                            onChange={(e) => handleInputChange('documento', e.target.value)}
                            disabled={isViewMode} 
                            required 
                            placeholder={formData.tipo === 'Jurídica' ? '00.000.000/0000-00' : '000.000.000-00'}
                          />
                          <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                          {formData.tipo === 'Jurídica' && !isViewMode && (
                            <button 
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center"
                              onClick={handleCnpjLookup}
                              disabled={isLoadingCnpj}
                            >
                              {isLoadingCnpj ? <Loader2 size={14} className="animate-spin" /> : <SearchCode size={14} strokeWidth={2.5} />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="modern-form-group full-width">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Razão Social / Nome Completo</label>
                        <div className="relative group">
                          <input 
                            type="text" 
                            className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 pl-12 text-base font-black text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all group-hover:border-slate-300"
                            value={formData.nome || ''} 
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                            disabled={isViewMode} 
                            required 
                          />
                          <Building2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-premium p-6 rounded-3xl border border-white/60 shadow-sm relative overflow-hidden group">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Comercial</h3>
                      <div className="modern-form-group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nome Fantasia / Apelido</label>
                        <input 
                          type="text" 
                          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                          value={formData.nomeFantasia || ''} 
                          onChange={(e) => handleInputChange('nomeFantasia', e.target.value)}
                          disabled={isViewMode} 
                          required 
                        />
                      </div>
                    </div>

                    <div className="glass-premium p-6 rounded-3xl border border-white/60 shadow-sm relative overflow-hidden group">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Operacional</h3>
                      <div className="modern-form-group text-white">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status do Parceiro</label>
                        <select 
                          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-black text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                          value={formData.status || 'Ativo'} 
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          disabled={isViewMode}
                        >
                          <option value="Ativo" className="text-emerald-600">✓ Ativo</option>
                          <option value="Inativo" className="text-slate-400">× Inativo</option>
                          <option value="Suspenso" className="text-rose-500">! Suspenso</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'fiscal' && (
                <div className="form-content-active">
                  <div className="glass-premium p-8 rounded-3xl border border-white/60 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-400 rounded-full" />
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2 font-black">
                      Regulares Fiscais
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="modern-form-group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Inscrição Estadual</label>
                        <input 
                          type="text" 
                          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all font-mono"
                          value={formData.inscricaoEstadual || ''} 
                          onChange={(e) => handleInputChange('inscricaoEstadual', e.target.value)}
                          disabled={isViewMode} 
                        />
                      </div>
                      <div className="modern-form-group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Inscrição Municipal</label>
                        <input 
                          type="text" 
                          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all font-mono"
                          value={formData.inscricaoMunicipal || ''} 
                          onChange={(e) => handleInputChange('inscricaoMunicipal', e.target.value)}
                          disabled={isViewMode} 
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-white">Regime Tributário</label>
                      <div className="flex gap-2">
                        {['Simples Nacional', 'Lucro Presumido', 'Lucro Real'].map(r => (
                          <button 
                            key={r}
                            type="button"
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                              formData.regimeTributario === r 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600' 
                                : 'bg-white border-slate-100 text-slate-400'
                            }`}
                            onClick={() => !isViewMode && handleInputChange('regimeTributario', r)}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="glass-premium p-6 rounded-3xl border border-white/60 shadow-sm">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Atividade Econômica</h3>
                    <div className="modern-form-group">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">CNAE Principal</label>
                      <input 
                        type="text" 
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                        value={formData.cnae || ''} 
                        onChange={(e) => handleInputChange('cnae', e.target.value)}
                        disabled={isViewMode} 
                        placeholder="Ex: 01.11-3-02"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'endereco' && (
                <div className="form-content-active">
                  <div className="glass-premium p-8 rounded-3xl border border-white/60 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="modern-form-group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">CEP</label>
                        <input 
                          type="text" 
                          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                          value={formData.cep || ''} 
                          onChange={(e) => handleInputChange('cep', e.target.value)}
                          disabled={isViewMode} 
                        />
                      </div>
                      <div className="modern-form-group col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Cidade</label>
                        <input 
                          type="text" 
                          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all uppercase"
                          value={formData.cidade || ''} 
                          onChange={(e) => handleInputChange('cidade', e.target.value)}
                          disabled={isViewMode} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-6 mt-6">
                      <div className="modern-form-group col-span-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Logradouro</label>
                        <input 
                          type="text" 
                          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                          value={formData.logradouro || ''} 
                          onChange={(e) => handleInputChange('logradouro', e.target.value)}
                          disabled={isViewMode} 
                        />
                      </div>
                      <div className="modern-form-group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Número</label>
                        <input 
                          type="text" 
                          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                          value={formData.numero || ''} 
                          onChange={(e) => handleInputChange('numero', e.target.value)}
                          disabled={isViewMode} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-6">
                      <div className="modern-form-group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Bairro</label>
                        <input 
                          type="text" 
                          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                          value={formData.bairro || ''} 
                          onChange={(e) => handleInputChange('bairro', e.target.value)}
                          disabled={isViewMode} 
                        />
                      </div>
                      <div className="modern-form-group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Estado (UF)</label>
                        <input 
                          type="text" 
                          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all uppercase"
                          value={formData.estado || ''} 
                          onChange={(e) => handleInputChange('estado', e.target.value)}
                          disabled={isViewMode} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contato' && (
                <div className="form-content-active">
                  <div className="glass-premium p-8 rounded-3xl border border-white/60 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
                    <div className="modern-form-group full-width mb-8">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Responsável Direto</label>
                      <div className="relative group">
                        <input 
                          type="text" 
                          className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl px-4 pl-12 text-base font-black text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                          value={formData.responsavel || ''} 
                          onChange={(e) => handleInputChange('responsavel', e.target.value)}
                          disabled={isViewMode} 
                        />
                        <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="modern-form-group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Telefone / WhatsApp</label>
                        <div className="relative group">
                          <input 
                            type="text" 
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 pl-10 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                            value={formData.telefone || ''} 
                            onChange={(e) => handleInputChange('telefone', e.target.value)}
                            disabled={isViewMode} 
                          />
                          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                      </div>
                      <div className="modern-form-group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">E-mail Comercial</label>
                        <div className="relative group">
                          <input 
                            type="email" 
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 pl-10 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                            value={formData.email || ''} 
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            disabled={isViewMode} 
                          />
                          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'comercial' && (
                <div className="form-content-active">
                  <div className="glass-premium p-8 rounded-3xl border border-white/60 shadow-sm">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="modern-form-group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block text-white">Condição de Pagamento</label>
                        <select 
                          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-black text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                          value={formData.condicaoPagamentoPadrao || ''} 
                          onChange={(e) => handleInputChange('condicaoPagamentoPadrao', e.target.value)}
                          disabled={isViewMode}
                        >
                          <option value="À Vista">À Vista</option>
                          <option value="7 dias">7 dias</option>
                          <option value="15 dias">15 dias</option>
                          <option value="30 dias">30 dias</option>
                          <option value="30/60 dias">30/60 dias</option>
                        </select>
                      </div>
                      <div className="modern-form-group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Prazos de Entrega</label>
                        <input 
                          type="text" 
                          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                          value={formData.prazoEntregaMedio || ''} 
                          onChange={(e) => handleInputChange('prazoEntregaMedio', e.target.value)}
                          disabled={isViewMode} 
                          placeholder="Ex: 5 dias"
                        />
                      </div>
                    </div>

                    <div className="mt-8">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Observações Comerciais</label>
                      <div className="relative group">
                        <textarea 
                          className="w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-2xl p-4 pl-12 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all resize-none"
                          value={formData.observacoes || ''} 
                          onChange={(e) => handleInputChange('observacoes', e.target.value)}
                          disabled={isViewMode} 
                          placeholder="Histórico, limites de crédito, acordos especiais..."
                        />
                        <Info size={18} className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </ModernModal>
    </div>
  );
};
