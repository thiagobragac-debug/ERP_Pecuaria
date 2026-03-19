import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Download, 
  Calendar, 
  Hash, 
  Building2, 
  AlertCircle,
  FileCode,
  ArrowUpRight
} from 'lucide-react';
import './NotasEntrada.css';
import { InvoiceHeader } from './notas/components/InvoiceHeader';
import { InvoiceItems } from './notas/components/InvoiceItems';
import { InvoiceFooter } from './notas/components/InvoiceFooter';
import { INITIAL_COMPANIES } from '../../data/initialData';
import { StandardModal } from '../../components/StandardModal';
import { TablePagination } from '../../components/TablePagination';
import { TableFilters } from '../../components/TableFilters';
import { usePagination } from '../../hooks/usePagination';
import { ColumnFilters } from '../../components/ColumnFilters';
import { NotaEntrada as NotaType, ItemNota, Supplier, PurchaseOrder } from '../../types';
import { db } from '../../services/db';
import { dataService } from '../../services/dataService';
import { useLiveQuery } from 'dexie-react-hooks';
import { useCompany } from '../../contexts/CompanyContext';

export const NotasEntradaPage = () => {
  const { activeCompanyId } = useCompany();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedNota, setSelectedNota] = useState<NotaType | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [formData, setFormData] = useState<Partial<NotaType>>({});

  // Form State
  const [columnFilters, setColumnFilters] = useState({
    numero: '',
    fornecedorNome: '',
    dataEntrada: '',
    status: 'Todos',
    valorTotal: ''
  });

  // Database Queries
  const allNotas = useLiveQuery(() => db.notas_entrada.toArray()) || [];
  const allPedidos = useLiveQuery(() => db.pedidos_compra.filter(p => p.status === 'Confirmado').toArray()) || [];
  
  const notas = allNotas.filter(n => activeCompanyId === 'Todas' || (n as any).empresaId === activeCompanyId);
  const pedidos = allPedidos.filter(p => activeCompanyId === 'Todas' || p.empresaId === activeCompanyId);
  
  const empresas = useLiveQuery(() => db.empresas.toArray()) || [];
  const fornecedores = useLiveQuery(() => db.fornecedores.toArray()) || [];

  const filteredData = notas.filter(nota => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      nota.numero.toLowerCase().includes(searchLower) || 
      nota.fornecedorNome.toLowerCase().includes(searchLower) ||
      nota.chaveAcesso.includes(searchLower);
    
    const matchesColumnFilters = 
      (columnFilters.numero === '' || nota.numero.includes(columnFilters.numero)) &&
      (columnFilters.fornecedorNome === '' || nota.fornecedorNome.toLowerCase().includes(columnFilters.fornecedorNome.toLowerCase())) &&
      (columnFilters.dataEntrada === '' || nota.dataEntrada.includes(columnFilters.dataEntrada)) &&
      (columnFilters.status === 'Todos' || nota.status === columnFilters.status);

    return matchesSearch && matchesColumnFilters;
  });

  const {
    currentPage, totalPages, paginatedData, itemsPerPage, setItemsPerPage,
    startIndex, endIndex, totalItems, goToPage, nextPage, prevPage
  } = usePagination({ data: filteredData, initialItemsPerPage: 10 });

  useEscapeKey(() => {
    setIsModalOpen(false);
    setIsImportModalOpen(false);
  });

  const handleOpenModal = (nota: NotaType | null = null, viewOnly = false) => {
    if (nota) {
      setFormData(nota);
    } else {
      setFormData({
        id: Math.random().toString(36).substr(2, 9),
        serie: '1',
        dataEmissao: new Date().toISOString().split('T')[0],
        dataEntrada: new Date().toISOString().split('T')[0],
        empresaId: activeCompanyId !== 'Todas' ? activeCompanyId : (empresas[0]?.id || ''),
        itens: [],
        status: 'Pendente',
        naturezaOperacao: 'Compra para Industrialização',
        indPres: '1',
        modFrete: '9',
        valorFrete: 0,
        valorSeguro: 0,
        valorDesconto: 0,
        valorOutrasDespesas: 0,
        tenant_id: 'default'
      });
    }
    setIsViewMode(viewOnly);
    setIsModalOpen(true);
  };

  const handleSave = async (statusOverride?: 'Processada' | 'Pendente') => {
    if (!formData.numero || !formData.fornecedorId) {
      alert('Número e Fornecedor são obrigatórios');
      return;
    }

    const finalStatus = statusOverride || formData.status || 'Pendente';

    const notaToSave = {
      ...formData,
      status: finalStatus,
      updated_at: new Date().toISOString()
    } as NotaType;

    try {
      await dataService.saveItem('notas_entrada', notaToSave);

      // Se finalizada, atualiza estoque e cria financeiro
      if (notaToSave.status === 'Processada') {
        // Integração com estoque
        for (const item of notaToSave.itens) {
          await dataService.saveItem('movimentacoes_estoque', {
            id: `M-${Date.now()}-${item.id}`,
            insumo_id: item.insumoId,
            insumo_nome: item.insumoNome,
            tipo: 'Entrada',
            quantidade: item.quantidade,
            unidade: item.unidade,
            local_origem: 'Depósito Central',
            documento: notaToSave.numero,
            data: notaToSave.dataEntrada,
            status: 'Processado',
            responsavel: 'Sistema',
            motivo: `Entrada via NF ${notaToSave.numero}`,
            empresaId: notaToSave.empresaId,
            tenant_id: 'default'
          });
        }

        // Integração com financeiro (Contas a Pagar)
        await dataService.saveItem('transacoes', {
          id: `T-${Date.now()}`,
          desc: `Compra: NF ${notaToSave.numero} - ${notaToSave.fornecedorNome}`,
          valor: notaToSave.valorTotal,
          data: notaToSave.dataEntrada,
          vencimento: notaToSave.dataEntrada,
          tipo: 'out',
          status: 'Pendente',
          categoria: 'Insumos',
          empresaId: notaToSave.empresaId,
          tenant_id: 'default'
        });
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      alert('Erro ao salvar a nota. Verifique o console.');
    }
  };

  const handleImportXML = () => {
    // Simulação de importação de XML
    const mockXML = {
      chaveAcesso: '35240312345678000199550010000001231234567890',
      numero: '1234',
      serie: '1',
      dataEmissao: '2024-03-15',
      dataEntrada: '2024-03-16',
      fornecedorId: 'S1', // Fornecedor pré-existente no mock
      fornecedorNome: 'Agro Campo Fertilizantes',
      naturezaOperacao: 'Compra para Industrialização',
      indPres: '1' as any,
      valorProdutos: 15450.00,
      valorTotal: 15450.00,
      itens: [
        { 
          id: 'xml1', insumoId: '1', insumoNome: 'Adubo NPK 04-14-08', quantidade: 2000, unidade: 'KG', 
          precoUnitario: 5.50, subtotal: 11000, ncm: '3105.20.00', cfop: '1.102', 
          origem: '0' as any, cst_icms: '00', baseIcms: 11000, aliquotaIcms: 12, valorIcms: 1320 
        },
        { 
          id: 'xml2', insumoId: '2', insumoNome: 'Semente de Milho Híbrido', quantidade: 50, unidade: 'SC', 
          precoUnitario: 89.00, subtotal: 4450, ncm: '1209.91.00', cfop: '1.102', 
          origem: '0' as any, cst_icms: '00', baseIcms: 4450, aliquotaIcms: 12, valorIcms: 534 
        }
      ] as any
    };
    
    setFormData(prev => ({ ...prev, ...mockXML }));
    setIsModalOpen(true);
    alert('XML importado com sucesso (simulação)');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Excluir esta nota?')) {
      await dataService.deleteItem('notas_entrada', id);
    }
  };

  const importFromPedido = (pedido: PurchaseOrder) => {
    setFormData({
      ...formData,
      fornecedorId: pedido.fornecedor_id,
      fornecedorNome: pedido.fornecedorNome,
      empresaId: pedido.empresaId,
      naturezaOperacao: 'Compra para Industrialização',
      modFrete: '9',
      valorFrete: 0,
      valorSeguro: 0,
      valorDesconto: 0,
      valorOutrasDespesas: 0,
      itens: pedido.itens.map(it => ({
        id: Math.random().toString(36).substr(2, 9),
        insumoId: it.insumo_id,
        insumoNome: it.insumoNome,
        quantidade: it.quantidade,
        unidade: it.unidade,
        precoUnitario: it.valorUnitario,
        subtotal: it.subtotal,
        ncm: '0000.00.00',
        cfop: '1.102',
        origem: '0',
        cst_icms: '00',
        baseIcms: it.subtotal,
        valorIcms: it.subtotal * 0.12,
        aliquotaIcms: 12
      }))
    });
    setIsImportModalOpen(false);
    setIsModalOpen(true);
  };

  return (
    <div className="notas-wrapper fade-in">
      <div className="page-header-row">
        <div className="title-section">
          <div className="icon-badge primary">
            <Download size={32} />
          </div>
          <div>
            <h1>Notas de Entrada</h1>
            <p className="description">Recebimento de mercadorias e lançamentos fiscais.</p>
          </div>
        </div>
        <div className="header-actions">
           <button className="btn-premium-outline grey" onClick={handleImportXML}>
            <FileCode size={18} />
            <span>Importar XML</span>
          </button>
          <button className="btn-premium-solid indigo" onClick={() => setIsImportModalOpen(true)}>
            <Plus size={18} strokeWidth={3} />
            <span>Nova Nota</span>
          </button>
        </div>
      </div>

      <div className="data-section">
        <TableFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Buscar NF ou fornecedor..."
          onToggleAdvanced={() => setIsFiltersOpen(!isFiltersOpen)}
          isAdvancedOpen={isFiltersOpen}
        />

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>NF / Série</th>
                <th>Emissão</th>
                <th>Entrada</th>
                <th>Fornecedor</th>
                <th>Valor Total</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
              {isFiltersOpen && (
                <ColumnFilters
                  columns={[
                    { key: 'numero', type: 'text', placeholder: 'Filtrar NF...' },
                    { key: 'dataEntrada', type: 'text', placeholder: 'Data...' },
                    { key: 'fornecedorNome', type: 'text', placeholder: 'Fornecedor...' },
                    { key: 'status', type: 'select', options: ['Todos', 'Pendente', 'Processada', 'Cancelada'] }
                  ]}
                  values={columnFilters}
                  onChange={(key, value) => setColumnFilters(prev => ({ ...prev, [key]: value }))}
                />
              )}
            </thead>
            <tbody>
              {paginatedData.map((nota) => (
                <tr key={nota.id}>
                  <td className="font-bold">{nota.numero} <small className="text-slate-400">S:{nota.serie}</small></td>
                  <td>{nota.dataEmissao}</td>
                  <td>{nota.dataEntrada}</td>
                  <td>{nota.fornecedorNome}</td>
                  <td className="font-bold text-slate-800">R$ {nota.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>
                    <span className={`status-badge nota-${nota.status.toLowerCase()}`}>
                      {nota.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="actions-cell">
                      <button className="action-btn-global btn-view" title="Visualizar" onClick={() => handleOpenModal(nota, true)}>
                        <Eye size={18} strokeWidth={3} />
                      </button>
                      {nota.status === 'Pendente' && (
                        <>
                          <button className="action-btn-global btn-edit" title="Editar" onClick={() => handleOpenModal(nota)}>
                            <Edit size={18} strokeWidth={3} />
                          </button>
                          <button className="action-btn-global btn-delete" title="Excluir" onClick={() => handleDelete(nota.id)}>
                            <Trash2 size={18} strokeWidth={3} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TablePagination
          currentPage={currentPage} totalPages={totalPages} itemsPerPage={itemsPerPage}
          startIndex={startIndex} endIndex={endIndex} totalItems={totalItems}
          onPageChange={goToPage} onNextPage={nextPage} onPrevPage={prevPage}
          onItemsPerPageChange={setItemsPerPage} label="notas"
        />
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isViewMode ? 'Visualizar NF-e de Entrada' : (formData.id ? 'Editar Lançamento Fiscal' : 'Lançamento de Nota de Entrada')}
        subtitle="Confira minuciosamente os itens, impostos e valores para conciliação."
        icon={FileText}
        size="lg"
        footer={
          <div className="flex gap-3 w-full justify-between items-center">
            <div className="flex gap-2">
              <button className="btn-premium-outline hide-mobile" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              {!isViewMode && formData.status === 'Pendente' && (
                <button className="btn-premium-outline indigo" onClick={() => handleSave()}>
                  <Clock size={18} /> Salvar como Rascunho
                </button>
              )}
            </div>
            
            {!isViewMode && (
              <button className="btn-premium-solid emerald" onClick={() => handleSave('Processada')}>
                <CheckCircle2 size={18} /> Salvar e Processar Entrada
              </button>
            )}
          </div>
        }
      >
        <div className="modal-content-scrollable p-0">
          <div className="p-8">
            <InvoiceHeader 
              data={formData} 
              onChange={setFormData}
              isViewMode={isViewMode}
              empresas={empresas as any}
              fornecedores={fornecedores as any}
            />
            
            <InvoiceItems 
              data={formData}
              onChange={setFormData}
              isViewMode={isViewMode}
            />
            
            <InvoiceFooter 
              data={formData}
              onChange={setFormData}
              isViewMode={isViewMode}
            />
          </div>
        </div>
      </StandardModal>

      <StandardModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Novo Lançamento: Selecionar Pedido"
        subtitle="Importe dados de um pedido de compra confirmado para agilizar o lançamento."
        icon={Plus}
        size="md"
      >
        <div className="p-6">
          {pedidos.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">Nenhum pedido confirmado encontrado para importação.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pedidos.map(ped => (
                <button 
                  key={ped.id} 
                  className="flex items-center justify-between p-4 border rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left"
                  onClick={() => importFromPedido(ped)}
                >
                  <div>
                    <span className="block font-bold text-slate-800">{ped.numero}</span>
                    <span className="text-sm text-slate-500">{ped.fornecedorNome} — R$ {ped.valorTotal.toLocaleString()}</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
              ))}
              <div className="mt-4 pt-4 border-t text-center">
                <button className="text-indigo-600 font-bold hover:underline" onClick={() => handleOpenModal()}>
                  Lançar Nota Avulsa (Sem Pedido)
                </button>
              </div>
            </div>
          )}
        </div>
      </StandardModal>
    </div>
  );
};
