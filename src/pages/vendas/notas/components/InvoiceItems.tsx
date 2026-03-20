import React from 'react';
import { Package, Trash2, Plus, Calculator, ChevronDown, ChevronUp, ShieldCheck, Tag, Info } from 'lucide-react';
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
        const qty = updatedItem.quantidade || 0;
        const price = updatedItem.valorUnitario || 0;
        updatedItem.valorTotal = qty * price;
        updatedItem.baseIcms = updatedItem.valorTotal;
        updatedItem.valorIcms = (updatedItem.baseIcms * (updatedItem.aliquotaIcms || 0)) / 100;
        return updatedItem;
      }
      return item;
    });
    onChange({ ...data, itens: newItems });
  };

  return (
    <div className="modern-form-section">
      <div className="section-header flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Produtos & Serviços</h3>
        </div>
        {!isViewMode && (
          <button 
            type="button" 
            className="btn-premium-solid indigo btn-sm"
            onClick={handleAddItem}
          >
            <Plus size={16} strokeWidth={3} />
            <span>Adicionar Item</span>
          </button>
        )}
      </div>

      <div className="modern-table-container border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="modern-table w-full">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ width: '35%' }}>Descrição</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center" style={{ width: '10%' }}>NCM</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center" style={{ width: '8%' }}>CFOP</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center" style={{ width: '5%' }}>Unid</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right" style={{ width: '8%' }}>Qtd</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right" style={{ width: '12%' }}>Vl. Unit</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right" style={{ width: '14%' }}>Vl. Total</th>
              {!isViewMode && <th className="p-4 w-[50px]"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center">
                  <Package size={40} className="text-slate-100 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">Nenhum item adicionado.</p>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <React.Fragment key={item.id}>
                  <tr className="group hover:bg-slate-50/30 transition-colors">
                    <td className="p-3">
                      <input 
                        type="text" 
                        className="modern-input-table font-bold text-slate-700"
                        value={item.descricao} 
                        onChange={(e) => handleUpdateItem(item.id, { descricao: e.target.value })}
                        disabled={isViewMode}
                        placeholder="Nome do produto..."
                      />
                    </td>
                    <td className="p-3">
                      <input 
                        type="text" 
                        className="modern-input-table text-center text-slate-500"
                        value={item.ncm} 
                        onChange={(e) => handleUpdateItem(item.id, { ncm: e.target.value })}
                        disabled={isViewMode}
                        placeholder="0000.00.00"
                      />
                    </td>
                    <td className="p-3 text-center">
                       <input 
                        type="text" 
                        className="modern-input-table text-center text-slate-500"
                        value={item.cfop} 
                        onChange={(e) => handleUpdateItem(item.id, { cfop: e.target.value })}
                        disabled={isViewMode}
                        placeholder="5.101"
                      />
                    </td>
                    <td className="p-3">
                      <input 
                        type="text" 
                        className="modern-input-table text-center font-bold text-indigo-600"
                        value={item.unidade} 
                        onChange={(e) => handleUpdateItem(item.id, { unidade: e.target.value })}
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="p-3">
                      <input 
                        type="number" 
                        className="modern-input-table text-right font-black text-slate-700"
                        value={item.quantidade} 
                        onChange={(e) => handleUpdateItem(item.id, { quantidade: Number(e.target.value) })}
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="p-3">
                      <input 
                        type="number" 
                        className="modern-input-table text-right font-black text-slate-700"
                        value={item.valorUnitario} 
                        onChange={(e) => handleUpdateItem(item.id, { valorUnitario: Number(e.target.value) })}
                        disabled={isViewMode}
                      />
                    </td>
                    <td className="p-3 text-right">
                      <span className="font-black text-slate-800 text-sm">
                        R$ {(item.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    {!isViewMode && (
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => handleRemoveItem(item.id)} 
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                  {/* Fiscal Details Bar */}
                  <tr className="bg-slate-50/50">
                    <td colSpan={!isViewMode ? 8 : 7} className="p-0 border-b border-slate-100">
                      <div className="flex items-center gap-8 px-6 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CST ICMS</span>
                          <input 
                            type="text" 
                            className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] font-bold text-slate-600 w-12 focus:ring-1 focus:ring-indigo-500 transition-all"
                            value={item.cst_icms || '00'} 
                            onChange={(e) => handleUpdateItem(item.id, { cst_icms: e.target.value })}
                            disabled={isViewMode}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">% ICMS</span>
                          <input 
                            type="number" 
                            className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] font-bold text-slate-600 w-14 focus:ring-1 focus:ring-indigo-500 transition-all"
                            value={item.aliquotaIcms || 0} 
                            onChange={(e) => handleUpdateItem(item.id, { aliquotaIcms: Number(e.target.value) })}
                            disabled={isViewMode}
                          />
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100/50">
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Vl. ICMS</span>
                          <span className="text-[11px] font-black text-emerald-600">
                            R$ {(item.valorIcms || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origem</span>
                          <select 
                            className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] font-bold text-slate-600 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                            value={item.origem || '0'} 
                            onChange={(e) => handleUpdateItem(item.id, { origem: e.target.value as any })}
                            disabled={isViewMode}
                          >
                            <option value="0">0-Nacional</option>
                            <option value="1">1-Estrangeira Dir</option>
                            <option value="2">2-Estrangeira Int</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CEST</span>
                          <input 
                            type="text" 
                            className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[11px] font-bold text-slate-600 w-24 focus:ring-1 focus:ring-indigo-500 transition-all"
                            value={item.cest || ''} 
                            onChange={(e) => handleUpdateItem(item.id, { cest: e.target.value })}
                            disabled={isViewMode}
                            placeholder="00.000.00"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
