import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Eye, 
  Trash2, 
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Printer,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  Lock,
  Unlock,
  ShieldCheck,
  Building,
  Check,
  User,
  Info
} from 'lucide-react';
import { db } from '../../services/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { NotaEntrada as NotaType, Supplier } from '../../types';
import { useCompany } from '../../contexts/CompanyContext';
import { StatusBadge } from '../../components/StatusBadge';
import { InvoiceHeader } from './notas/components/InvoiceHeader';
import { InvoiceItems } from './notas/components/InvoiceItems';
import { InvoiceFooter } from './notas/components/InvoiceFooter';
import { INITIAL_COMPANIES } from '../../data/initialData';
import { ModernModal } from '../../components/ModernModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';

import { SummaryCard } from '../../components/SummaryCard';

export function NotasEntrada() {
  const { activeCompanyId } = useCompany();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNota, setSelectedNota] = useState<NotaType | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [formData, setFormData] = useState<Partial<NotaType>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [columnFilters, setColumnFilters] = useState({
    numero: '',
    fornecedor: '',
    status: ''
  });

  // Queries
  const notas = useLiveQuery(
    () => db.notas_entrada.where('tenant_id').equals(activeCompanyId || 'default').toArray(),
    [activeCompanyId]
  ) || [];

  const fornecedores = useLiveQuery(() => db.fornecedores.toArray()) || [];
  const insumos = useLiveQuery(() => db.insumos.toArray()) || [];
  const empresasList = useLiveQuery(() => db.empresas.toArray()) || [];

  // Filter logic aligned with PedidoCompra
  const filteredNotasByCompany = notas.filter(n => activeCompanyId === 'Todas' || n.empresaId === activeCompanyId);

  // Pagination
  const {
    currentPage,
    totalPages,
    paginatedData: filteredNotas,
    itemsPerPage,
    goToPage,
    nextPage: handleNextPage,
    prevPage: handlePrevPage,
    setItemsPerPage,
    startIndex,
    endIndex,
    totalItems
  } = usePagination({
    data: filteredNotasByCompany.filter((n: NotaType) => 
      (n.numero || '').toLowerCase().includes(columnFilters.numero.toLowerCase()) &&
      (n.fornecedorNome || '').toLowerCase().includes(columnFilters.fornecedor.toLowerCase())
    ).sort((a: NotaType, b: NotaType) => (b.dataEmissao || '').localeCompare(a.dataEmissao || '')),
    initialItemsPerPage: 10
  });

  const handleOpenModal = (nota: NotaType | null = null, viewOnly = false) => {
    if (nota) {
      setFormData(nota);
      setSelectedNota(nota);
    } else {
      setFormData({
        id: Math.random().toString(36).substr(2, 9),
        dataEntrada: new Date().toISOString().split('T')[0],
        status: 'Pendente',
        itens: [],
        valorProdutos: 0,
        valorTotal: 0,
        valorIcmsTotal: 0,
        valorFrete: 0,
        valorSeguro: 0,
        valorOutrasDespesas: 0,
        tenant_id: activeCompanyId || 'default'
      });
      setSelectedNota(null);
    }
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
  };

  const handleSave = async (statusOverride?: NotaType['status']) => {
    if (!formData.numero || !formData.fornecedorId) {
      alert('Por favor, preencha o número da nota e o fornecedor.');
      return;
    }

    setIsSaving(true);
    const finalStatus = statusOverride || formData.status || 'Pendente';

    const notaToSave = {
      ...formData,
      status: finalStatus,
      updatedAt: new Date().toISOString()
    } as NotaType;

    try {
      if (selectedNota) {
        await db.notas_entrada.update(selectedNota.id, notaToSave as any);
      } else {
        await db.notas_entrada.add(notaToSave);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      alert('Erro ao salvar a nota. Verifique o console.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-10 max-w-[1600px] mx-auto animate-premium-fade-up">
      {/* Floating Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 sticky top-0 z-30 py-4 bg-slate-50/80 backdrop-blur-md -mx-10 px-10 border-b border-slate-200/50 shadow-sm">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 ring-4 ring-emerald-50">
              <FileText size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notas de Entrada</h1>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest text-shadow-sm">Recebimento & Lançamento de Insumos</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Empresa:</span>
            <span className="text-xs font-black text-slate-700">{activeCompanyId === 'Todas' ? 'Visão Consolidada' : empresasList.find(e => e.id === activeCompanyId)?.razaoSocial || 'Unidade'}</span>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="btn-premium-solid h-14 px-8 rounded-2xl emerald shadow-xl shadow-emerald-100/50"
          >
            <Plus size={22} strokeWidth={3} />
            <span className="text-base">Lançar Nota</span>
          </button>
        </div>
      </div>

      {/* Modern Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <SummaryCard 
          label="Lançamentos Pendentes"
          value={notas.filter(n => n.status === 'Pendente').length.toString().padStart(2, '0')}
          icon={Clock}
          color="amber"
          subtext="Aguardando Conferência"
        />
        <SummaryCard 
          label="Volume de Compras"
          value={`R$ ${(notas.reduce((acc, n) => acc + (n.valorTotal || 0), 0) / 1000).toFixed(1)}k`}
          icon={FileText}
          color="indigo"
          subtext="Acumulado do Mês"
        />
        <SummaryCard 
          label="Notas Processadas"
          value={notas.filter(n => n.status === 'Processada').length.toString().padStart(2, '0')}
          icon={ShieldCheck}
          color="emerald"
          subtext="Estoque Atualizado"
        />
        <SummaryCard 
          label="Alertas Fiscais"
          value={notas.filter(n => (n.valorIcmsTotal || 0) === 0 && (n.valorTotal || 0) > 0).length.toString().padStart(2, '0')}
          icon={AlertCircle}
          color="rose"
          subtext="Sem Crédito ICMS"
        />
      </div>

      {/* Main List Section */}
      <div className="glass-premium rounded-[40px] overflow-hidden shadow-soft-xl border border-white/40">
        <div className="p-8 border-b border-slate-200/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/50">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Buscar por número ou fornecedor..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-bold focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
              value={columnFilters.numero}
              onChange={(e) => setColumnFilters({...columnFilters, numero: e.target.value})}
            />
          </div>

          <div className="flex items-center gap-3">
             <TableFilters 
              searchTerm={columnFilters.numero}
              onSearchChange={(val) => setColumnFilters({...columnFilters, numero: val})}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Número / Série</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Fornecedor</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Emissão / Entrada</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Valor Total</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/30 backdrop-blur-sm">
              {filteredNotas.length > 0 ? (filteredNotas as NotaType[]).map((nota) => (
                <tr key={nota.id} className="group hover:bg-slate-50/50 transition-all duration-300 transform hover:scale-[1.002]">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-base mb-1">NF {nota.numero}</span>
                      <span className="text-[10px] font-black text-slate-400 bg-slate-100 w-fit px-2 py-0.5 rounded uppercase tracking-widest">Série {nota.serie || '001'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-emerald-600 shadow-inner">
                        <Building size={16} />
                      </div>
                      <span className="font-bold text-slate-700">{nota.fornecedorNome}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                        <Calendar size={12} className="text-indigo-400" />
                        <span>Emissão: {new Date(nota.dataEmissao || '').toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black mt-1.5 uppercase tracking-tighter">
                        <ArrowRight size={10} className="text-emerald-400" />
                        <span>Entrada: {new Date(nota.dataEntrada || '').toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="font-black text-slate-700 text-lg tabular-nums tracking-tighter">
                      R$ {nota.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <StatusBadge status={nota.status || 'Pendente'} />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-4">
                      <button 
                        onClick={() => handleOpenModal(nota, true)}
                        className="action-btn-global btn-view" title="Visualizar"
                      >
                        <Eye size={18} strokeWidth={2.5} />
                      </button>
                      
                      {nota.status === 'Pendente' && (
                        <>
                          <button 
                            onClick={() => handleOpenModal(nota)}
                            className="action-btn-global btn-edit" title="Editar"
                          >
                            <Edit2 size={18} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={() => {
                              if(confirm('Deseja excluir permanentemente este lançamento?')) {
                                db.notas_entrada.delete(nota.id);
                              }
                            }}
                            className="action-btn-global btn-delete" title="Excluir"
                          >
                            <Trash2 size={18} strokeWidth={2.5} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <FileText size={64} strokeWidth={1} />
                      <p className="text-lg font-bold text-slate-400">Nenhum lançamento encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50">
          <TablePagination 
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
            onPageChange={goToPage}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>

      <ModernModal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        title={isViewMode ? 'Visualizar Nota Fiscal' : selectedNota ? 'Editar Nota Fiscal' : 'Lançamento de Nota de Entrada'}
        subtitle="Confira minuciosamente os itens, impostos e valores para conciliação fiscal."
        icon={FileText}
        footer={
          <div className="flex justify-between items-center w-full">
            <div className="hidden sm:flex items-center gap-4 px-6 py-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-emerald-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">Valor da Nota:</span>
              <span className="text-2xl font-black text-white tracking-tighter relative z-10 tabular-nums">
                R$ {formData.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="flex gap-4">
              <button
                type="button"
                className="btn-premium-outline h-12 px-8"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
              >
                {isViewMode ? 'Fechar' : 'Cancelar'}
              </button>
              {!isViewMode && (
                <button
                  type="button"
                  className="btn-premium-solid h-12 px-8 emerald shadow-lg shadow-emerald-100 min-w-[200px]"
                  onClick={() => handleSave('Processada')}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={18} />
                       <span>Confirmar Entrada</span>
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-12">
          <InvoiceHeader 
            data={formData} 
            onChange={setFormData as any} 
            isViewMode={isViewMode} 
            fornecedores={fornecedores as any} 
            empresas={empresasList as any}
          />
          
          <InvoiceItems 
            data={formData} 
            onChange={setFormData as any} 
            isViewMode={isViewMode} 
            insumos={insumos as any}
          />
          
          <InvoiceFooter 
            data={formData} 
            onChange={setFormData as any} 
            isViewMode={isViewMode}
          />
        </div>
      </ModernModal>
    </div>
  );
}

