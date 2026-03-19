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
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StandardModal } from '../../../components/StandardModal';
import { DanfeModal } from './components/DanfeModal';
import { TablePagination } from '../../../components/TablePagination';
import { TableFilters } from '../../../components/TableFilters';
import { usePagination } from '../../../hooks/usePagination';
import { ColumnFilters } from '../../../components/ColumnFilters';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../services/db';
import { dataService } from '../../../services/dataService';
import { useCompany } from '../../../contexts/CompanyContext';
import { SalesInvoice, Cliente, Company } from '../../../types';
import { InvoiceHeader } from './components/InvoiceHeader';
import { InvoiceItems } from './components/InvoiceItems';
import { InvoiceFooter } from './components/InvoiceFooter';
import { nfeService } from '../../../services/nfeService';
import './NotasSaida.css';

export const NotasSaida = () => {
  const { activeCompanyId } = useCompany();
  const allNotas = useLiveQuery(() => db.pedidos_venda.toArray()) || [];
  const notas = allNotas.filter(n => activeCompanyId === 'Todas' || (n as any).empresaId === activeCompanyId);
  const clientes = useLiveQuery(() => db.clientes.toArray()) || [];
  const empresasList = useLiveQuery(() => db.empresas.toArray()) || [] as Company[];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNota, setSelectedNota] = useState<SalesInvoice | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isDanfeOpen, setIsDanfeOpen] = useState(false);
  const [currentNotaForDanfe, setCurrentNotaForDanfe] = useState<SalesInvoice | null>(null);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmissionError, setTransmissionError] = useState<string | null>(null);
  
  const [columnFilters, setColumnFilters] = useState({
    numero: '',
    dataEmissao: '',
    cliente: '',
    valorTotal: '',
    status: 'Todos'
  });

  const [formData, setFormData] = useState<Partial<SalesInvoice>>({
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
    valorTotal: 0
  });

  const handleOpenModal = (nota: any | null = null, view = false) => {
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
    setIsModalOpen(true);
  };

  const filteredData = notas.filter(nota => {
    const searchLower = searchTerm.toLowerCase();
    const cliente = clientes.find(c => c.id === nota.cliente_id);
    const clienteNome = cliente?.nome || 'N/A';
    const numeroStr = nota.numero || '';
    const statusStr = nota.status || '';

    const matchesSearch = numeroStr.toLowerCase().includes(searchLower) || 
                         clienteNome.toLowerCase().includes(searchLower) ||
                         statusStr.toLowerCase().includes(searchLower);
                         
    const matchesColumnFilters = 
      (columnFilters.numero === '' || numeroStr.toLowerCase().includes(columnFilters.numero.toLowerCase())) &&
      (columnFilters.cliente === '' || clienteNome.toLowerCase().includes(columnFilters.cliente.toLowerCase())) &&
      (columnFilters.status === 'Todos' || statusStr === columnFilters.status);

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
  } = usePagination({ data: filteredData, initialItemsPerPage: 10 });

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

    // Se estiver emitindo (mudando de Pendente para Processada)
    if (payload.status === 'Processada' && selectedNota?.status !== 'Processada') {
      // 1. Integração Financeira (Conta a Receber)
      await dataService.saveItem('transacoes', {
        id: crypto.randomUUID(),
        desc: `NF-e ${payload.numero} - ${clientes.find(c => c.id === payload.cliente_id)?.nome}`,
        cliente_id: payload.cliente_id,
        valor: payload.valorTotal,
        data: new Date().toISOString().split('T')[0],
        vencimento: payload.dataSaida,
        status: 'Pendente',
        tipo: 'in',
        categoria: 'Venda Gado',
        empresaId: payload.empresaId,
        tenant_id: 'default'
      });

      // 2. Integração de Estoque (Baixa)
      for (const item of (payload.itens as any[])) {
        await dataService.saveItem('movimentacoes_estoque', {
          id: crypto.randomUUID(),
          insumo_id: item.id || 'NF-ITEM',
          insumo_nome: item.produto || 'Item de NF',
          local_origem: 'Estoque Central',
          tipo: 'Saída',
          quantidade: item.quantidade,
          unidade: item.unidade || 'un',
          motivo: `NF-e ${payload.numero}`,
          data: new Date().toISOString().split('T')[0],
          responsavel: 'Sistema',
          status: 'Processado',
          empresaId: payload.empresaId,
          tenant_id: 'default'
        });
      }
    }

    await dataService.saveItem('pedidos_venda', payload);
    setIsModalOpen(false);
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

        // Save the authorized invoice
        await dataService.saveItem('pedidos_venda', updatedNota);
        setFormData(updatedNota);
        
        // Trigger financial/stock integration if not done
        if (selectedNota?.status !== 'Processada') {
             // 1. Integração Financeira (Conta a Receber)
            await dataService.saveItem('transacoes', {
              id: crypto.randomUUID(),
              desc: `NF-e ${updatedNota.numero} - ${clientes.find(c => c.id === updatedNota.cliente_id)?.nome}`,
              cliente_id: updatedNota.cliente_id,
              valor: updatedNota.valorTotal,
              data: new Date().toISOString().split('T')[0],
              vencimento: updatedNota.dataSaida,
              status: 'Pendente',
              tipo: 'in',
              categoria: 'Venda Gado',
              empresaId: updatedNota.empresaId,
              tenant_id: 'default'
            });

            // 2. Integração de Estoque (Baixa)
            for (const item of (updatedNota.itens as any[])) {
              await dataService.saveItem('movimentacoes_estoque', {
                id: crypto.randomUUID(),
                insumo_id: item.id || 'NF-ITEM',
                insumo_nome: item.produto || 'Item de NF',
                local_origem: 'Estoque Central',
                tipo: 'Saída',
                quantidade: item.quantidade,
                unidade: item.unidade || 'un',
                motivo: `NF-e ${updatedNota.numero}`,
                data: new Date().toISOString().split('T')[0],
                responsavel: 'Sistema',
                status: 'Processado',
                empresaId: updatedNota.empresaId,
                tenant_id: 'default'
              });
            }
        }

        alert('NF-e Autorizada com Sucesso!');
        setIsModalOpen(false);
      } else {
        setTransmissionError(`${result.cStat} - ${result.xMotivo}`);
      }
    } catch (err) {
      setTransmissionError('Erro crítico na comunicação com a SEFAZ.');
    } finally {
      setIsTransmitting(false);
    }
  };

  const handleOpenDanfe = (nota: SalesInvoice) => {
    setCurrentNotaForDanfe(nota);
    setIsDanfeOpen(true);
  };

  return (
    <div className="page-container fade-in">
      <nav className="subpage-breadcrumb">
        <Link to="/vendas">Vendas & Comercial</Link>
        <ChevronRight size={14} />
        <span>Notas de Saída</span>
      </nav>

      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge indigo">
            <FileText size={32} />
          </div>
          <div>
            <h1>Inteligência Fiscal</h1>
            <p className="description">Emissão e controle avançado de notas de saída (NF-e).</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-premium-outline">
            <Download size={18} strokeWidth={3} />
            <span>Exportar XML/PDF</span>
          </button>
          <button className="btn-premium-solid indigo" onClick={() => handleOpenModal()}>
            <Plus size={18} strokeWidth={3} />
            <span>Nova Nota de Saída</span>
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card glass animate-slide-up">
          <div className="summary-info">
            <span className="summary-label">Faturamento Mensal</span>
            <span className="summary-value">R$ 1.25M</span>
            <span className="summary-subtext desc">Meta atingida: 82%</span>
          </div>
          <div className="summary-icon indigo">
            <TrendingUp size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="summary-info">
            <span className="summary-label">Notas Pendentes</span>
            <span className="summary-value">03</span>
            <span className="summary-subtext desc">Aguardando SEFAZ</span>
          </div>
          <div className="summary-icon orange">
            <Clock size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="summary-info">
            <span className="summary-label">Carga Tributária</span>
            <span className="summary-value">R$ 45.2k</span>
            <span className="summary-subtext desc">ICMS / Funrural</span>
          </div>
          <div className="summary-icon emerald">
            <Calculator size={28} />
          </div>
        </div>
        <div className="summary-card glass animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="summary-info">
            <span className="summary-label">Volume de Saídas</span>
            <span className="summary-value">12</span>
            <span className="summary-subtext desc">Notas neste mês</span>
          </div>
          <div className="summary-icon blue">
            <ArrowRight size={28} />
          </div>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar por número ou cliente..."
        >
          <button 
            className={`btn-premium-outline h-11 px-6 ${isFiltersOpen ? 'filter-active' : ''}`}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter size={18} strokeWidth={3} />
            <span>{isFiltersOpen ? 'Fechar Filtros' : 'Filtros Colunares'}</span>
          </button>
        </TableFilters>

        <table className="data-table">
          <thead>
            <tr>
              <th>Número / Série</th>
              <th>Emissão</th>
              <th>Cliente</th>
              <th>Valor Total</th>
              <th>Status</th>
              <th className="text-right">Ações</th>
            </tr>
            {isFiltersOpen && (
              <ColumnFilters
                columns={[
                  { key: 'numero', type: 'text', placeholder: 'NF...' },
                  { key: 'dataEmissao', type: 'text', placeholder: 'Data...' },
                  { key: 'cliente', type: 'text', placeholder: 'Filtrar...' },
                  { key: 'valorTotal', type: 'text', placeholder: 'Valor...' },
                  { key: 'status', type: 'select', options: ['Pendente', 'Processada', 'Cancelada'] }
                ]}
                values={columnFilters}
                onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                showActionsPadding={true}
              />
            )}
          </thead>
          <tbody>
            {paginatedData.map(nota => {
              const cliente = clientes.find(c => c.id === nota.cliente_id);
              return (
                <tr key={nota.id}>
                  <td className="font-bold">NF {nota.numero}-{nota.serie}</td>
                  <td>{new Date(nota.dataEmissao || (nota as any).data).toLocaleDateString()}</td>
                  <td>{cliente?.nome || 'N/A'}</td>
                  <td className="font-bold">R$ {nota.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>
                    <span className={`status-badge ${(nota.status || '').toLowerCase()}`}>
                      {nota.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="actions-cell">
                      <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(nota, true)}>
                        <Eye size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-view" title="Imprimir DANFE" onClick={() => handleOpenDanfe(nota)}>
                        <Printer size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(nota)}>
                        <Edit size={18} strokeWidth={3} />
                      </button>
                      <button className="action-btn-global btn-delete" title="Excluir">
                        <Trash2 size={18} strokeWidth={3} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
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
          label="notas"
        />
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isViewMode ? 'Visualizar NF-e' : (selectedNota ? 'Editar NF-e' : 'Emissão de Nota de Saída')}
        subtitle="Preencha os dados fiscais conforme a legislação vigente."
        icon={FileText}
        footer={
          <div className="footer-actions flex justify-between w-full">
            <div className="flex gap-2">
              {transmissionError && (
                <div className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-100 flex items-center gap-2">
                  <span>{transmissionError}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button className="btn-premium-outline" onClick={() => setIsModalOpen(false)} disabled={isTransmitting}>Cancelar</button>
              
              {!isViewMode && (
                <>
                  {(formData.status === 'Pendente' || formData.status === 'Rejeitada') && formData.id && (
                    <button 
                      className="btn-premium-solid emerald" 
                      onClick={handleTransmit}
                      disabled={isTransmitting}
                    >
                      {isTransmitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                      ) : (
                        <TrendingUp size={18} strokeWidth={3} />
                      )}
                      <span>{isTransmitting ? 'Transmitindo...' : 'Transmitir NF-e'}</span>
                    </button>
                  )}
                  
                  <button className="btn-premium-solid indigo" onClick={handleSave} disabled={isTransmitting}>
                    <CheckCircle2 size={18} strokeWidth={3} />
                    <span>{selectedNota ? 'Salvar Alterações' : 'Salvar como Pendente'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        }
        size="xl"
      >
        <div className="invoice-container">
          <InvoiceHeader 
            data={formData} 
            onChange={(newData) => setFormData(newData)} 
            clientes={clientes} 
            empresas={empresasList as Company[]}
            isViewMode={isViewMode}
          />
          
          <InvoiceItems 
            data={formData} 
            onChange={(newData) => setFormData(newData)} 
            isViewMode={isViewMode}
          />
          
          <InvoiceFooter 
            data={formData} 
            onChange={(newData) => setFormData(newData)} 
            isViewMode={isViewMode}
          />
        </div>
      </StandardModal>

      {isDanfeOpen && currentNotaForDanfe && (
        <DanfeModal 
          nota={currentNotaForDanfe}
          cliente={clientes.find(c => c.id === currentNotaForDanfe.cliente_id)}
          onClose={() => setIsDanfeOpen(false)}
        />
      )}
    </div>
  );
};
