import React from 'react';
import { Package, Trash2, Plus, Calculator } from 'lucide-react';
import { NotaEntrada, ItemNota } from '../../../../types';

interface Props {
  data: Partial<NotaEntrada>;
  onChange: (data: Partial<NotaEntrada>) => void;
  isViewMode?: boolean;
}

export const InvoiceItems: React.FC<Props> = ({ data, onChange, isViewMode }) => {
  const items = data.itens || [];

  const handleAddItem = () => {
    const newItem: ItemNota = {
      id: Math.random().toString(36).substr(2, 9),
      insumoId: '',
      insumoNome: '',
      quantidade: 0,
      unidade: 'UN',
      precoUnitario: 0,
      subtotal: 0,
      ncm: '',
      cfop: '',
      origem: '0',
      cst_icms: '00',
      baseIcms: 0,
      aliquotaIcms: 0,
      valorIcms: 0,
      cst_pis: '01',
      cst_cofins: '01'
    };
    onChange({ ...data, itens: [...items, newItem] });
  };

  const handleRemoveItem = (id: string) => {
    onChange({ ...data, itens: items.filter((item: ItemNota) => item.id !== id) });
  };

  const handleUpdateItem = (id: string, updates: Partial<ItemNota>) => {
    const newItems = items.map((item: ItemNota) => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates };
        // Recalculate totals
        const qty = updatedItem.quantidade || 0;
        const price = updatedItem.precoUnitario || 0;
        updatedItem.subtotal = qty * price;
        updatedItem.baseIcms = updatedItem.subtotal;
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
        <span>Itens & Insumos Recebidos</span>
      </div>

      <div className="items-table-container">
        <table className="items-table">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>Insumo / Descrição</th>
              <th style={{ width: '10%' }}>NCM</th>
              <th style={{ width: '6%' }}>CFOP</th>
              <th style={{ width: '5%' }}>Unid</th>
              <th style={{ width: '7%' }}>Qtd</th>
              <th style={{ width: '10%' }}>Vl. Unit</th>
              <th style={{ width: '11%' }}>Subtotal</th>
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
                      value={item.insumoNome} 
                      onChange={(e) => handleUpdateItem(item.id, { insumoNome: e.target.value })}
                      disabled={isViewMode}
                      placeholder="Nome do insumo..."
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
                      placeholder="1.102"
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
                      value={item.precoUnitario} 
                      onChange={(e) => handleUpdateItem(item.id, { precoUnitario: Number(e.target.value) })}
                      disabled={isViewMode}
                      className="text-right"
                    />
                  </td>
                  <td className="font-bold text-right text-slate-700">
                    {(item.subtotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={item.aliquotaIcms || 0} 
                      onChange={(e) => handleUpdateItem(item.id, { aliquotaIcms: Number(e.target.value) })}
                      disabled={isViewMode}
                      className="text-center"
                    />
                  </td>
                  <td className="text-right text-emerald-600 font-medium">
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
                {/* Fiscal Details Bar */}
                <tr>
                  <td colSpan={isViewMode ? 9 : 10} className="p-0 border-none">
                    <div className="flex gap-4 px-4 py-2 bg-slate-50 border-x border-slate-100 mb-2 rounded-b-lg">
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase font-bold text-slate-400">Origem</label>
                        <select 
                          value={item.origem || '0'} 
                          onChange={(e) => handleUpdateItem(item.id, { origem: e.target.value as any })}
                          disabled={isViewMode}
                          className="text-[11px] bg-transparent border-none p-0 h-4 focus:ring-0"
                        >
                          <option value="0">0-Nacional</option>
                          <option value="1">1-Estrangeira Direct</option>
                          <option value="2">2-Estrangeira Inter</option>
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase font-bold text-slate-400">CST ICMS</label>
                        <input 
                          type="text" 
                          value={item.cst_icms || '00'} 
                          onChange={(e) => handleUpdateItem(item.id, { cst_icms: e.target.value })}
                          disabled={isViewMode}
                          className="text-[11px] bg-transparent border-none p-0 w-8 h-4 focus:ring-0"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[9px] uppercase font-bold text-slate-400">CST PIS/COF</label>
                        <div className="flex gap-1 items-center">
                          <input 
                            type="text" 
                            value={item.cst_pis || '01'} 
                            onChange={(e) => handleUpdateItem(item.id, { cst_pis: e.target.value })}
                            disabled={isViewMode}
                            className="text-[11px] bg-transparent border-none p-0 w-6 h-4 focus:ring-0"
                          />
                          <span className="text-slate-300">/</span>
                          <input 
                            type="text" 
                            value={item.cst_cofins || '01'} 
                            onChange={(e) => handleUpdateItem(item.id, { cst_cofins: e.target.value })}
                            disabled={isViewMode}
                            className="text-[11px] bg-transparent border-none p-0 w-6 h-4 focus:ring-0"
                          />
                        </div>
                      </div>
                      {item.cest && (
                        <div className="flex flex-col">
                          <label className="text-[9px] uppercase font-bold text-slate-400">CEST</label>
                          <span className="text-[11px] text-slate-600 font-mono">{item.cest}</span>
                        </div>
                      )}
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
          <Plus size={16} className="mr-2" /> Novo Insumo
        </button>
      )}
    </div>
  );
};
