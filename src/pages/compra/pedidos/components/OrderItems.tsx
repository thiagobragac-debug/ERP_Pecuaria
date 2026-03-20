import React from 'react';
import { Package, Trash2, Plus, Info } from 'lucide-react';
import { PurchaseOrder, PurchaseItem, Insumo } from '../../../../types';
import { SearchableSelect } from '../../../../components/SearchableSelect';

interface Props {
  data: Partial<PurchaseOrder>;
  onChange: (data: Partial<PurchaseOrder>) => void;
  isViewMode?: boolean;
  inventory: Insumo[];
}

export const OrderItems: React.FC<Props> = ({ data, onChange, isViewMode, inventory }) => {
  const items = data.itens || [];

  const handleAddItem = () => {
    const newItem: PurchaseItem = {
      id: Math.random().toString(36).substr(2, 9),
      insumo_id: '',
      insumoNome: '',
      quantidade: 0,
      unidade: '-',
      valorUnitario: 0,
      desconto: 0,
      subtotal: 0,
      categoria: 'Insumos'
    };
    onChange({ ...data, itens: [...items, newItem] });
  };

  const handleRemoveItem = (id: string) => {
    onChange({ ...data, itens: items.filter((item: PurchaseItem) => item.id !== id) });
  };

  const handleUpdateItem = (id: string, updates: Partial<PurchaseItem>) => {
    const newItems = items.map((item: PurchaseItem) => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates };
        
        // Auto-fill from inventory
        if (updates.insumo_id) {
          const insumo = inventory.find(i => i.id === updates.insumo_id);
          if (insumo) {
            updatedItem.insumoNome = insumo.nome;
            updatedItem.unidade = insumo.unidade;
            updatedItem.categoria = insumo.categoria;
            updatedItem.valorUnitario = insumo.valorUnitario;
          }
        }

        const qty = updatedItem.quantidade || 0;
        const price = updatedItem.valorUnitario || 0;
        const discount = updatedItem.desconto || 0;
        updatedItem.subtotal = (qty * price) - discount;
        
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
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Itens do Pedido</h3>
        </div>
        {!isViewMode && (
          <button type="button" className="btn-premium-solid indigo btn-sm" onClick={handleAddItem}>
            <Plus size={16} strokeWidth={3} />
            <span>Adicionar Item</span>
          </button>
        )}
      </div>

      <div className="modern-table-container rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="modern-table w-full">
          <thead>
            <tr>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ width: '40%' }}>Insumo / Produto</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center" style={{ width: '10%' }}>Unid</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center" style={{ width: '12%' }}>Qtd</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right" style={{ width: '12%' }}>Vl. Unit (R$)</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right" style={{ width: '12%' }}>Desc (R$)</th>
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right" style={{ width: '14%' }}>Subtotal</th>
              {!isViewMode && <th className="p-4 w-[50px]"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center">
                  <Package size={48} className="text-slate-100 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">Nenhum item adicionado ao pedido.</p>
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors animate-slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  <td className="p-3">
                    <SearchableSelect
                      options={inventory.map(ins => ({ id: ins.id, label: ins.nome, sublabel: ins.categoria }))}
                      value={item.insumo_id}
                      onChange={(val) => handleUpdateItem(item.id, { insumo_id: val })}
                      disabled={isViewMode}
                      placeholder="Selecionar insumo..."
                    />
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">{item.unidade}</span>
                  </td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      className="modern-input px-2 h-9 text-center font-black"
                      value={item.quantidade} 
                      onChange={(e) => handleUpdateItem(item.id, { quantidade: Number(e.target.value) })}
                      disabled={isViewMode}
                      min="0.01"
                      step="any"
                    />
                  </td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      className="modern-input px-2 h-9 text-right font-bold text-slate-600"
                      value={item.valorUnitario} 
                      onChange={(e) => handleUpdateItem(item.id, { valorUnitario: Number(e.target.value) })}
                      disabled={isViewMode}
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      className="modern-input px-2 h-9 text-right font-bold text-rose-600"
                      value={item.desconto || 0} 
                      onChange={(e) => handleUpdateItem(item.id, { desconto: Number(e.target.value) })}
                      disabled={isViewMode}
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-black text-slate-800 tracking-tight">
                      R$ {(item.subtotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
