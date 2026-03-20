import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  Edit, 
  Download, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Filter,
  Calculator,
  ArrowRight,
  Printer,
  ChevronRight,
  X,
  PlusCircle,
  Hash,
  Activity,
  Calendar,
  User,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ModernModal } from '../../../components/ModernModal';
import { DanfeModal } from './components/DanfeModal';
import { TablePagination } from '../../../components/TablePagination';
import { TableFilters } from '../../../components/TableFilters';
import { usePagination } from '../../../hooks/usePagination';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../services/db';
import { dataService } from '../../../services/dataService';
import { useCompany } from '../../../contexts/CompanyContext';
import { SalesInvoice, Cliente, Company } from '../../../types';
import { InvoiceHeader } from './components/InvoiceHeader';
import { InvoiceItems } from './components/InvoiceItems';
import { InvoiceFooter } from './components/InvoiceFooter';
import { nfeService } from '../../../services/nfeService';
import { SummaryCard } from '../../../components/SummaryCard';
import { StatusBadge } from '../../../components/StatusBadge';

export function NotasSaida() {
  const { activeCompanyId } = useCompany();
  const allNotas = useLiveQuery(() => db.pedidos_venda.toArray()) || [];
  const notas = allNotas.filter(n => activeCompanyId === 'Todas' || (n as any).empresaId === activeCompanyId);
  const clientes = useLiveQuery(() => db.clientes.toArray()) || [];
  const empresasList = useLiveQuery(() => db.empresas.toArray()) || [] as Company[];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNota, setSelectedNota] = useState<SalesInvoice | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDanfeOpen, setIsDanfeOpen] = useState(false);
  const [currentNotaForDanfe, setCurrentNotaForDanfe] = useState<SalesInvoice | null>(null);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmissionError, setTransmissionError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SalesInvoice>>({});

  const handleOpenModal = (nota: SalesInvoice | null = null, view = false) => {
    if (nota) {
      setSelectedNota(nota);
      setFormData(nota);
      setIsViewMode(view);
    } else {
      setSelectedNota(null);
      setFormData({
        numero: '',
        serie: '1',
        naturezaOperacao: 'Venda de Produção',
        dataEmissao: new Date().toISOString().split('T')[0],
        dataSaida: new Date().toISOString().split('T')[0],
        status: 'Pendente',
        itens: [],
        valorProdutos: 0,
        valorIcms: 0,
        valorIpi: 0,
        valorFrete: 0,
        valorSeguro: 0,
        valorDesconto: 0,
        valorOutrasDespesas: 0,
        valorTotal: 0,
        empresaId: activeCompanyId !== 'Todas' ? activeCompanyId : ''
      });
      setIsViewMode(false);
    }
    setTransmissionError(null);
    setIsModalOpen(true);
  };

  const filteredNotas = notas.filter(nota => {
    const searchLower = searchTerm.toLowerCase();
    const cliente = clientes.find(c => c.id === nota.cliente_id);
    const clienteNome = cliente?.nome || 'N/A';
    return (nota.numero || '').toLowerCase().includes(searchLower) || 
           clienteNome.toLowerCase().includes(searchLower);
  }).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedItems,
    itemsPerPage,
    goToPage,
    nextPage: handleNextPage,
    prevPage: handlePrevPage,
    setItemsPerPage,
    startIndex,
    endIndex,
    totalItems
  } = usePagination({ data: filteredNotas, initialItemsPerPage: 10 });

  const handleSave = async () => {
    if (!formData.numero || !formData.cliente_id) {
      alert('Por favor, preencha o número da nota e selecione um cliente.');
      return;
    }

    const isNew = !selectedNota?.id;
    const notaId = selectedNota?.id || Math.random().toString(36).substr(2, 9);

    const payload: SalesInvoice = {
      ...formData,
      id: notaId,
      status: formData.status || 'Pendente',
      empresaId: formData.empresaId || (activeCompanyId !== 'Todas' ? activeCompanyId : ''),
      tenant_id: 'default',
      created_at: selectedNota?.created_at || new Date().toISOString()
    } as SalesInvoice;

    try {
      await dataService.saveItem('pedidos_venda', payload);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      alert('Erro ao salvar a nota.');
    }
  };

  const handleTransmit = async () => {
    if (!formData.id) return;
    setIsTransmitting(true);
    setTransmissionError(null);

    try {
      const result = await nfeService.transmitInvoice(formData);
      if (result.success) {
        const updatedNota: SalesInvoice = {
          ...formData,
          status: 'Processada',
          chaveAcesso: result.chaveAcesso,
          nProt: result.nProt
        } as SalesInvoice;

        await dataService.saveItem('pedidos_venda', updatedNota);
        setFormData(updatedNota);
        alert('NF-e Autorizada com Sucesso!');
        setIsModalOpen(false);
      } else {
        setTransmissionError(`${result.cStat} - ${result.xMotivo}`);
      }
    } catch (err) {
      setTransmissionError('Erro crítico na comunicação com a SEFAZ.');
    }
  };
  return (
    <div className="p-10 max-w-[1600px] mx-auto animate-premium-fade-up">
      {/* Floating Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 sticky top-0 z-30 py-4 bg-slate-50/80 backdrop-blur-md -mx-10 px-10 border-b border-slate-200/50 shadow-sm">
        <div>
          <div className="flex items-center gap-4 mb-1">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
              <FileText size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notas de Saída</h1>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest text-shadow-sm">Gestão Fiscal & Faturamento</p>
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
            className="btn-premium-solid h-14 px-8 rounded-2xl indigo"
          >
            <PlusCircle size={22} strokeWidth={3} />
            <span className="text-base">Nova Nota</span>
          </button>
        </div>
      </div>

      {/* Modern Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <SummaryCard 
          label="Pendentes Transmissão"
          value={notas.filter(n => n.status === 'Pendente').length.toString().padStart(2, '0')}
          icon={Clock}
          color="amber"
          subtext="Aguardando SEFAZ"
        />
        <SummaryCard 
          label="Faturamento Mensal"
          value={`R$ ${(notas.reduce((acc, n) => acc + (n.valorTotal || 0), 0) / 1000000).toFixed(2)}M`}
          icon={TrendingUp}
          color="indigo"
          trend={{ value: '+24%', type: 'up', icon: TrendingUp }}
        />
        <SummaryCard 
          label="Notas Autorizadas"
          value={notas.filter(n => n.status === 'Processada').length.toString().padStart(2, '0')}
          icon={CheckCircle2}
          color="emerald"
          subtext="Protocolo Ativo"
        />
        <SummaryCard 
          label="ICMS Estimado"
          value={`R$ ${(notas.reduce((acc, n) => acc + (n.valorIcms || 0), 0) / 1000).toFixed(1)}k`}
          icon={Calculator}
          color="rose"
          subtext="Crédito Tributário"
        />
      </div>

      {/* Main List Section */}
      <div className="glass-premium rounded-[40px] overflow-hidden shadow-soft-xl border border-white/40">
        <div className="p-8 border-b border-slate-200/50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/50">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Buscar por número ou cliente..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-700 font-bold focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
             <TableFilters 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Documento / Série</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Cliente / Destinatário</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Emissão & Saída</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Valor Total</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/30 backdrop-blur-sm">
              {paginatedItems.length > 0 ? (paginatedItems as SalesInvoice[]).map((nota) => {
                const cliente = clientes.find(c => c.id === nota.cliente_id);
                return (
                  <tr key={nota.id} className="group hover:bg-slate-50/50 transition-all duration-300 transform hover:scale-[1.002]">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-base mb-1">NF {nota.numero}</span>
                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 w-fit px-2 py-0.5 rounded uppercase tracking-widest">Série {nota.serie || '1'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shadow-inner">
                          <User size={16} />
                        </div>
                        <span className="font-bold text-slate-700">{cliente?.nome || 'Cliente não identificado'}</span>
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
                          <span>Saída: {new Date(nota.dataSaida || '').toLocaleDateString()}</span>
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
                        <button 
                          onClick={() => {
                            setCurrentNotaForDanfe(nota);
                            setIsDanfeOpen(true);
                          }}
                          className="action-btn-global btn-edit" title="Imprimir DANFE"
                        >
                          <Printer size={18} strokeWidth={2.5} />
                        </button>
                        {nota.status === 'Pendente' && (
                          <>
                            <button 
                              onClick={() => handleOpenModal(nota)}
                              className="action-btn-global btn-edit" title="Editar"
                            >
                              <Edit size={18} strokeWidth={2.5} />
                            </button>
                            <button 
                              onClick={() => {
                                if(confirm('Deseja excluir permanentemente esta nota?')) {
                                  db.pedidos_venda.delete(nota.id);
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
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <FileText size={64} strokeWidth={1} />
                      <p className="text-lg font-bold text-slate-400">Nenhum documento encontrado</p>
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
        onClose={() => !isTransmitting && setIsModalOpen(false)}
        title={isViewMode ? 'Visualizar NF-e' : selectedNota ? 'Editar Nota Fiscal' : 'Emissão de Nota de Saída'}
        subtitle="Confira minuciosamente os dados fiscais e o destinatário para evitar rejeições SEFAZ."
        icon={FileText}
        footer={
          <div className="flex justify-between items-center w-full">
             <div className="hidden sm:flex items-center gap-4 px-6 py-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
                disabled={isTransmitting}
              >
                {isViewMode ? 'Fechar' : 'Cancelar'}
              </button>
              {!isViewMode && (
                <>
                  <button
                    type="button"
                    className="btn-premium-solid h-12 px-8 indigo shadow-lg shadow-indigo-100 min-w-[180px]"
                    onClick={handleTransmit}
                    disabled={isTransmitting}
                  >
                    {isTransmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Transmitindo...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                         <Activity size={18} />
                         <span>Transmitir SEFAZ</span>
                      </div>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn-premium-solid h-12 px-8 emerald shadow-lg shadow-emerald-100"
                    onClick={handleSave}
                    disabled={isTransmitting}
                  >
                    <CheckCircle2 size={18} />
                    <span>Salvar Nota</span>
                  </button>
                </>
              )}
            </div>
          </div>
        }
      >
        {transmissionError && (
          <div className="mx-8 mt-8 p-6 bg-rose-50 border border-rose-100 rounded-[32px] flex items-start gap-4 animate-premium-fade-up">
            <div className="p-3 bg-white rounded-2xl text-rose-600 shadow-sm border border-rose-100">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <p className="font-black text-rose-900 text-sm uppercase tracking-widest mb-1">Rejeição SEFAZ</p>
              <p className="text-rose-600 text-sm font-bold leading-relaxed">{transmissionError}</p>
            </div>
            <button onClick={() => setTransmissionError(null)} className="p-2 text-rose-300 hover:text-rose-600 transition-colors">
              <X size={20} />
            </button>
          </div>
        )}

        <div className="space-y-12">
          <InvoiceHeader 
            data={formData} 
            onChange={setFormData as any} 
            clientes={clientes as any} 
            empresas={empresasList as any}
            isViewMode={isViewMode}
          />
          
          <InvoiceItems 
            data={formData} 
            onChange={setFormData as any} 
            isViewMode={isViewMode}
          />
          
          <InvoiceFooter 
            data={formData} 
            onChange={setFormData as any} 
            isViewMode={isViewMode}
          />
        </div>
      </ModernModal>

      {/* DANFE Modal */}
      {isDanfeOpen && currentNotaForDanfe && (
        <DanfeModal 
          nota={currentNotaForDanfe}
          cliente={clientes.find(c => c.id === currentNotaForDanfe.cliente_id)}
          onClose={() => setIsDanfeOpen(false)}
        />
      )}
    </div>
  );
}
