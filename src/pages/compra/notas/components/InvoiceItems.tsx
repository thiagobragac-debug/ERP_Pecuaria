import React from 'react';
import { Package, Trash2, Plus } from 'lucide-react';
import { NotaEntrada, ItemNota, Insumo } from '../../../../types';
import { SearchableSelect } from '../../../../components/SearchableSelect';

interface Props {
  data: Partial<NotaEntrada>;
  onChange: (data: Partial<NotaEntrada>) => void;
  isViewMode?: boolean;
  insumos: Insumo[];
}

export const InvoiceItems: React.FC<Props> = ({ data, onChange, isViewMode, insumos }) => {
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
    <div className="modern-form-section">
      <div className="section-header mb-6">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Itens & Insumos Recebidos</h3>
        </div>
        {!isViewMode && (
          <button type="button" className="btn-premium-solid indigo btn-sm" onClick={handleAddItem}>
            <Plus size={16} strokeWidth={3} />
            <span>Adicionar Insumo</span>
          </button>
        )}
      </div>

      <div className="modern-table-container rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="modern-table w-full">
          <thead>
            <tr>
              <th className="w-[30%]">Insumo / Descrição</th>
              <th className="w-[10%]">NCM</th>
              <th className="w-[6%]">CFOP</th>
              <th className="w-[5%]">Unid</th>
              <th className="w-[8%] text-center">Qtd</th>
              <th className="w-[10%] text-right">Vl. Unit</th>
              <th className="w-[12%] text-right">Subtotal</th>
              <th className="w-[6%] text-center">% ICMS</th>
              <th className="w-[10%] text-right">Vl. ICMS</th>
              {!isViewMode && <th className="w-[3%]"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => (
              <React.Fragment key={item.id}>
                <tr className={`group transition-colors hover:bg-slate-50/50 ${isViewMode ? 'cursor-default' : ''}`}>
                  <td className="p-3">
                    <SearchableSelect
                      options={insumos.map(ins => ({ id: ins.id, label: ins.nome, sublabel: ins.unidade }))}
                      value={item.insumoId}
                      onChange={(val) => {
                        const ins = insumos.find(i => i.id === val);
                        handleUpdateItem(item.id, { 
                          insumoId: val, 
                          insumoNome: ins?.nome || '',
                          unidade: ins?.unidade || item.unidade,
                          precoUnitario: ins?.valorUnitario || item.precoUnitario
                        });
                      }}
                      disabled={isViewMode}
                      placeholder="Selecionar..."
                    />
                  </td>
                  <td className="p-3">
                    <input 
                      type="text" 
                      className="modern-input px-2 h-9 text-[11px] font-mono text-center"
                      value={item.ncm} 
                      onChange={(e) => handleUpdateItem(item.id, { ncm: e.target.value })}
                      disabled={isViewMode}
                      placeholder="0000.00.00"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <input 
                      type="text" 
                      className="modern-input px-1 h-9 text-[11px] text-center font-bold text-indigo-600"
                      value={item.cfop} 
                      onChange={(e) => handleUpdateItem(item.id, { cfop: e.target.value })}
                      disabled={isViewMode}
                      placeholder="1.102"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{item.unidade}</span>
                  </td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      className="modern-input px-2 h-9 text-right font-black"
                      value={item.quantidade} 
                      onChange={(e) => handleUpdateItem(item.id, { quantidade: Number(e.target.value) })}
                      disabled={isViewMode}
                    />
                  </td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      className="modern-input px-2 h-9 text-right font-bold text-slate-600"
                      value={item.precoUnitario} 
                      onChange={(e) => handleUpdateItem(item.id, { precoUnitario: Number(e.target.value) })}
                      disabled={isViewMode}
                    />
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-black text-slate-700 whitespace-nowrap">
                      R$ {(item.subtotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      className="modern-input px-2 h-9 text-center font-bold text-emerald-600"
                      value={item.aliquotaIcms || 0} 
                      onChange={(e) => handleUpdateItem(item.id, { aliquotaIcms: Number(e.target.value) })}
                      disabled={isViewMode}
                    />
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-bold text-emerald-600 whitespace-nowrap">
                      R$ {(item.valorIcms || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  {!isViewMode && (
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => handleRemoveItem(item.id)} 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
                {/* Fiscal Details Bar */}
                <tr className="bg-slate-50/40 border-b border-slate-100">
                  <td colSpan={isViewMode ? 9 : 10} className="p-0">
                    <div className="flex items-center gap-8 px-6 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Origem do Produto</span>
                        <select 
                          value={item.origem || '0'} 
                          onChange={(e) => handleUpdateItem(item.id, { origem: e.target.value as any })}
                          disabled={isViewMode}
                          className="bg-transparent border-none p-0 text-[11px] font-bold text-slate-600 focus:ring-0 cursor-pointer hover:text-indigo-600 transition-colors"
                        >
                          <option value="0">0 - Nacional</option>
                          <option value="1">1 - Estrangeira Direta</option>
                          <option value="2">2 - Estrangeira Interna</option>
                          <option value="3">3 - Estrangeira (Insumo 40-70%)</option>
                          <option value="4">4 - Nacional (Produção Conf. Proc. Básicos)</option>
                          <option value="5">{"5 - Nacional (Insumo < 40%)"}</option>
                        </select>
                      </div>

                      <div className="w-px h-4 bg-slate-200" />

                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">CST ICMS</span>
                        <input 
                          type="text" 
                          value={item.cst_icms || '00'} 
                          onChange={(e) => handleUpdateItem(item.id, { cst_icms: e.target.value })}
                          disabled={isViewMode}
                          className="bg-slate-100/50 rounded px-1.5 py-0.5 w-8 text-[11px] font-mono font-black text-indigo-600 focus:ring-1 focus:ring-indigo-500/20 transition-all text-center"
                        />
                      </div>

                      <div className="w-px h-4 bg-slate-200" />

                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">CST PIS/COF</span>
                        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200/60 shadow-sm">
                          <input 
                            type="text" 
                            value={item.cst_pis || '01'} 
                            onChange={(e) => handleUpdateItem(item.id, { cst_pis: e.target.value })}
                            disabled={isViewMode}
                            className="bg-transparent border-none p-0 w-5 text-[10px] font-mono font-bold text-slate-600 text-center focus:ring-0"
                          />
                          <span className="text-[10px] text-slate-200">|</span>
                          <input 
                            type="text" 
                            value={item.cst_cofins || '01'} 
                            onChange={(e) => handleUpdateItem(item.id, { cst_cofins: e.target.value })}
                            disabled={isViewMode}
                            className="bg-transparent border-none p-0 w-5 text-[10px] font-mono font-bold text-slate-600 text-center focus:ring-0"
                          />
                        </div>
                      </div>

                      <div className="ml-auto flex items-center gap-4">
                        {item.cest && (
                          <div className="flex items-center gap-2 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                            <span className="text-[9px] uppercase font-black text-indigo-400 tracking-wider">CEST</span>
                            <span className="text-[10px] text-indigo-700 font-black font-mono tracking-tight">{item.cest}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                          <span className="text-[9px] uppercase font-bold text-emerald-500">Base ICMS</span>
                          <span className="text-[11px] font-black text-emerald-700 font-mono">
                            R$ {(item.baseIcms || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
