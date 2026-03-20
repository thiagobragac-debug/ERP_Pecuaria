import React from 'react';
import { Package, Search, Trash2, Beef, Scale, DollarSign, Plus } from 'lucide-react';
import { SearchableSelect } from '../../../../components/SearchableSelect';
import { SalesInvoice, SalesItem, Animal } from '../../../../types';

interface Props {
  data: Partial<SalesInvoice>;
  onChange: (data: Partial<SalesInvoice>) => void;
  isViewMode?: boolean;
  animals: Animal[];
}

export const SaleItems: React.FC<Props> = ({ data, onChange, isViewMode, animals }) => {
  const items = (data.itens as SalesItem[]) || [];

  const handleAddAnimal = (animalId: string) => {
    const animal = animals.find(a => a.id === animalId);
    if (!animal) return;

    if (items.some(i => i.brinco === animal.brinco)) {
      alert('Este animal já foi adicionado ao pedido.');
      return;
    }

    const newItem: SalesItem = {
      id: Math.random().toString(36).substr(2, 9),
      brinco: animal.brinco,
      raca: animal.raca || 'N/A',
      sexo: animal.sexo || 'N/A',
      peso: animal.peso || 0,
      valorKg: 15.00,
      subtotal: (animal.peso || 0) * 15.00
    };
    onChange({ ...data, itens: [...items, newItem] });
  };

  const handleUpdateItem = (id: string, field: keyof SalesItem, value: any) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'peso' || field === 'valorKg') {
          updatedItem.subtotal = updatedItem.peso * updatedItem.valorKg;
        }
        return updatedItem;
      }
      return item;
    });
    onChange({ ...data, itens: newItems });
  };

  const handleRemoveItem = (id: string) => {
    onChange({ ...data, itens: items.filter(i => i.id !== id) });
  };

  return (
    <div className="modern-form-section">
      <div className="section-header mb-6">
        <div className="flex items-center gap-2">
          <Beef size={16} className="text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Animais / Itens da Venda</h3>
        </div>
        {!isViewMode && (
          <div className="w-[300px]">
            <SearchableSelect
              placeholder="Adicionar animal pelo brinco..."
              options={animals.map(a => ({ 
                id: a.id, 
                label: a.brinco, 
                sublabel: `${a.raca} - ${a.peso}kg - ${a.sexo === 'M' ? 'Macho' : 'Fêmea'}` 
              }))}
              value=""
              onChange={handleAddAnimal}
            />
          </div>
        )}
      </div>

      <div className="modern-table-container rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <table className="modern-table w-full">
          <thead>
            <tr>
              <th className="w-[20%]">Brinco / Ident.</th>
              <th className="w-[20%] text-center">Raça / Sexo</th>
              <th className="w-[15%] text-right">Peso (Kg)</th>
              <th className="w-[15%] text-right">Vl. Kg (R$)</th>
              <th className="w-[20%] text-right">Subtotal</th>
              {!isViewMode && <th className="w-[10%] text-center">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-[11px]">
            {items.map((item) => (
              <tr key={item.id} className="group transition-colors hover:bg-slate-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Beef size={14} strokeWidth={3} />
                    </div>
                    <strong className="text-slate-900 text-sm">{item.brinco}</strong>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className="font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                    {item.raca} / {item.sexo}
                  </span>
                </td>
                <td className="p-4">
                  <div className="modern-input-wrapper no-icon h-9">
                    <input 
                      type="number" 
                      className="modern-input text-right font-black"
                      value={item.peso} 
                      onChange={(e) => handleUpdateItem(item.id, 'peso', Number(e.target.value))}
                      disabled={isViewMode}
                    />
                    <Scale size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  </div>
                </td>
                <td className="p-4">
                  <div className="modern-input-wrapper no-icon h-9">
                    <input 
                      type="number" 
                      className="modern-input text-right font-bold text-indigo-600"
                      value={item.valorKg} 
                      onChange={(e) => handleUpdateItem(item.id, 'valorKg', Number(e.target.value))}
                      disabled={isViewMode}
                    />
                    <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none" />
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span className="font-black text-slate-700 text-sm whitespace-nowrap">
                    R$ {item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                {!isViewMode && (
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleRemoveItem(item.id)} 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all mx-auto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={isViewMode ? 5 : 6} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <Package size={40} strokeWidth={1} className="text-slate-400" />
                    <p className="text-sm font-medium text-slate-500">Nenhum animal adicionado ao pedido de venda.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
