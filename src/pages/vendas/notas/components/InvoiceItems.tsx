import React from 'react';
import { Package, Trash2, Plus, Calculator } from 'lucide-react';
import { SalesInvoice, InvoiceItem } from '../../../../types';

interface Props {
  data: Partial<SalesInvoice>;
  onChange: (data: Partial<SalesInvoice>) => void;
  isViewMode?: boolean;
}

export const InvoiceItems: React.FC<Props> = ({ data, onChange, isViewMode }) => {
  const items = data.itens || [];

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      produto_id: '',
      descricao: '',
      ncm: '',
      cest: '',
      cfop: '',
      origem: '0',
      unidade: 'UN',
      quantidade: 0,
      valorUnitario: 0,
      valorTotal: 0,
      cst_icms: '00',
      baseIcms: 0,
      aliquotaIcms: 0,
      valorIcms: 0,
      cst_pis: '01',
      cst_cofins: '01',
      cst_ipi: '99'
    };
    onChange({ ...data, itens: [...items, newItem] });
  };

  const handleRemoveItem = (id: string) => {
    onChange({ ...data, itens: items.filter((item: InvoiceItem) => item.id !== id) });
  };

  const handleUpdateItem = (id: string, updates: Partial<InvoiceItem>) => {
    const newItems = items.map((item: InvoiceItem) => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates };
        // Recalculate totals for this row
        const qty = updatedItem.quantidade || 0;
        const price = updatedItem.valorUnitario || 0;
        updatedItem.valorTotal = qty * price;
        updatedItem.baseIcms = updatedItem.valorTotal; // By default full base
        updatedItem.valorIcms = (updatedItem.baseIcms * (updatedItem.aliquotaIcms || 0)) / 100;
        return updatedItem;
      }
      return item;
    });
    onChange({ ...data, itens: newItems });
  };

  return (
    <div className="invoice-section">
      <div className="section-title">
        <Package size={18} />
        <span>Produtos & Serviços</span>
      </div>

      <div className="items-table-container">
        <table className="items-table">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>Descrição / Produto</th>
              <th style={{ width: '10%' }}>NCM</th>
              <th style={{ width: '6%' }}>CFOP</th>
              <th style={{ width: '5%' }}>Unid</th>
              <th style={{ width: '7%' }}>Qtd</th>
              <th style={{ width: '10%' }}>Vl. Unit</th>
              <th style={{ width: '11%' }}>Vl. Total</th>
              <th style={{ width: '5%' }}>% ICMS</th>
              <th style={{ width: '11%' }}>Vl. ICMS</th>
              {!isViewMode && <th style={{ width: '4%' }}></th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <React.Fragment key={item.id}>
                <tr>
                <td>
                  <input 
                    type="text" 
                    value={item.descricao} 
                    onChange={(e) => handleUpdateItem(item.id, { descricao: e.target.value })}
                    disabled={isViewMode}
                    placeholder="Nome do produto..."
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={item.ncm} 
                    onChange={(e) => handleUpdateItem(item.id, { ncm: e.target.value })}
                    disabled={isViewMode}
                    placeholder="0000.00.00"
                  />
                </td>
                <td>
                   <input 
                    type="text" 
                    value={item.cfop} 
                    onChange={(e) => handleUpdateItem(item.id, { cfop: e.target.value })}
                    disabled={isViewMode}
                    placeholder="5.101"
                  />
                </td>
                <td>
                  <input 
                    type="text" 
                    value={item.unidade} 
                    onChange={(e) => handleUpdateItem(item.id, { unidade: e.target.value })}
                    disabled={isViewMode}
                    className="text-center"
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    value={item.quantidade} 
                    onChange={(e) => handleUpdateItem(item.id, { quantidade: Number(e.target.value) })}
                    disabled={isViewMode}
                    className="text-right"
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    value={item.valorUnitario} 
                    onChange={(e) => handleUpdateItem(item.id, { valorUnitario: Number(e.target.value) })}
                    disabled={isViewMode}
                    className="text-right"
                  />
                </td>
                <td className="font-bold text-right">
                  {(item.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td>
                  <input 
                    type="number" 
                    value={item.aliquotaIcms} 
                    onChange={(e) => handleUpdateItem(item.id, { aliquotaIcms: Number(e.target.value) })}
                    disabled={isViewMode}
                    className="text-center"
                  />
                </td>
                <td className="text-right">
                   {(item.valorIcms || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                {!isViewMode && (
                  <td className="text-center">
                    <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
              {/* Fiscal Details Row */}
              <tr>
                <td colSpan={isViewMode ? 9 : 10} className="fiscal-details-cell">
                  <div className="fiscal-grid p-3 bg-slate-50/50 rounded-lg border border-slate-100 flex flex-wrap gap-4 mt-1 mb-2">
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <label className="text-[10px] uppercase font-bold text-slate-500">CEST</label>
                      <input 
                        type="text" 
                        value={item.cest || ''} 
                        onChange={(e) => handleUpdateItem(item.id, { cest: e.target.value })}
                        disabled={isViewMode}
                        className="text-xs p-1 border rounded"
                        placeholder="00.000.00"
                      />
                    </div>
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Origem</label>
                      <select 
                        value={item.origem || '0'} 
                        onChange={(e) => handleUpdateItem(item.id, { origem: e.target.value as any })}
                        disabled={isViewMode}
                        className="text-xs p-1 border rounded"
                      >
                        <option value="0">0 - Nacional</option>
                        <option value="1">1 - Estrangeira - Importação Direta</option>
                        <option value="2">2 - Estrangeira - Adquirida no Mercado Interno</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <label className="text-[10px] uppercase font-bold text-slate-500">CST ICMS</label>
                      <input 
                        type="text" 
                        value={item.cst_icms || '00'} 
                        onChange={(e) => handleUpdateItem(item.id, { cst_icms: e.target.value })}
                        disabled={isViewMode}
                        className="text-xs p-1 border rounded"
                        placeholder="Ex: 00, 10, 101"
                      />
                    </div>
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <label className="text-[10px] uppercase font-bold text-slate-500">CST PIS/COFINS</label>
                      <div className="flex gap-1">
                        <input 
                          type="text" 
                          value={item.cst_pis || '01'} 
                          onChange={(e) => handleUpdateItem(item.id, { cst_pis: e.target.value })}
                          disabled={isViewMode}
                          className="text-xs p-1 border rounded w-12"
                          title="CST PIS"
                        />
                        <input 
                          type="text" 
                          value={item.cst_cofins || '01'} 
                          onChange={(e) => handleUpdateItem(item.id, { cst_cofins: e.target.value })}
                          disabled={isViewMode}
                          className="text-xs p-1 border rounded w-12"
                          title="CST COFINS"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 min-w-[80px]">
                      <label className="text-[10px] uppercase font-bold text-slate-500">CST IPI</label>
                      <input 
                        type="text" 
                        value={item.cst_ipi || '99'} 
                        onChange={(e) => handleUpdateItem(item.id, { cst_ipi: e.target.value })}
                        disabled={isViewMode}
                        className="text-xs p-1 border rounded w-16"
                      />
                    </div>
                  </div>
                </td>
              </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {!isViewMode && (
        <button className="btn-premium-outline mt-4" onClick={handleAddItem} style={{ width: '100%', height: '40px', borderStyle: 'dashed' }}>
          <Plus size={16} className="mr-2" /> Adicionar Novo Item
        </button>
      )}
    </div>
  );
};
