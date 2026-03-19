import React from 'react';
import { DollarSign, Truck, Shield, Tag, Info } from 'lucide-react';
import { NotaEntrada } from '../../../../types';

interface Props {
  data: Partial<NotaEntrada>;
  onChange: (data: Partial<NotaEntrada>) => void;
  isViewMode?: boolean;
}

export const InvoiceFooter: React.FC<Props> = ({ data, onChange, isViewMode }) => {
  const updateTotal = (updates: Partial<NotaEntrada>) => {
    const newData = { ...data, ...updates };
    const items = newData.itens || [];
    const valorProdutos = items.reduce((acc, it) => acc + (it.subtotal || 0), 0);
    const valorIcmsTotal = items.reduce((acc, it) => acc + (it.valorIcms || 0), 0);
    
    const valorFrete = Number(newData.valorFrete || 0);
    const valorSeguro = Number(newData.valorSeguro || 0);
    const valorOutras = Number(newData.valorOutrasDespesas || 0);
    const valorDesconto = Number(newData.valorDesconto || 0);
    
    const valorTotal = (valorProdutos + valorFrete + valorSeguro + valorOutras) - valorDesconto;
    
    onChange({ 
      ...newData, 
      valorProdutos, 
      valorIcmsTotal, 
      valorTotal 
    });
  };

  return (
    <div className="invoice-section mt-8 pt-6 border-t border-slate-200">
      <div className="section-title">
        <DollarSign size={18} />
        <span>Totais & Fechamento</span>
      </div>

      <div className="totals-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="financial-inputs space-y-4">
          <div className="form-group">
            <label className="flex items-center gap-1">
              <Truck size={14} /> Valor do Frete
            </label>
            <input 
              type="number" 
              value={data.valorFrete || 0} 
              onChange={(e) => updateTotal({ valorFrete: Number(e.target.value) })}
              disabled={isViewMode}
              className="font-bold text-slate-700"
            />
          </div>
          <div className="form-group">
            <label className="flex items-center gap-1">
              <Shield size={14} /> Valor do Seguro
            </label>
            <input 
              type="number" 
              value={data.valorSeguro || 0} 
              onChange={(e) => updateTotal({ valorSeguro: Number(e.target.value) })}
              disabled={isViewMode}
            />
          </div>
        </div>

        <div className="financial-inputs space-y-4">
          <div className="form-group">
            <label className="flex items-center gap-1">
              <Info size={14} /> Outras Despesas
            </label>
            <input 
              type="number" 
              value={data.valorOutrasDespesas || 0} 
              onChange={(e) => updateTotal({ valorOutrasDespesas: Number(e.target.value) })}
              disabled={isViewMode}
            />
          </div>
          <div className="form-group">
            <label className="flex items-center gap-1">
              <Tag size={14} /> Desconto Total
            </label>
            <input 
              type="number" 
              value={data.valorDesconto || 0} 
              onChange={(e) => updateTotal({ valorDesconto: Number(e.target.value) })}
              disabled={isViewMode}
              className="text-red-600 font-bold"
            />
          </div>
        </div>

        <div className="totals-summary col-span-1 lg:col-span-2 bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between">
          <div className="summary-rows space-y-2">
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Total dos Produtos:</span>
              <span>R$ {(data.valorProdutos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Total ICMS:</span>
              <span className="text-emerald-400">R$ {(data.valorIcmsTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Acréscimos (Frete/Seg):</span>
              <span>R$ {((data.valorFrete || 0) + (data.valorSeguro || 0) + (data.valorOutrasDespesas || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          
          <div className="total-main mt-4 pt-4 border-t border-slate-800 flex justify-between items-baseline">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Valor Líquido:</span>
            <div className="text-right">
               <span className="text-3xl font-black text-emerald-400">
                R$ {(data.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="transport-info mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap gap-6">
        <div className="flex flex-col gap-1 min-w-[150px]">
          <label className="text-[10px] uppercase font-bold text-slate-400">Modalidade Frete</label>
          <select 
            value={data.modFrete || '9'} 
            onChange={(e) => onChange({ ...data, modFrete: e.target.value as any })}
            disabled={isViewMode}
            className="text-sm bg-transparent border-none p-0 focus:ring-0 font-bold"
          >
            <option value="0">0 - Contratação por conta do Remetente (CIF)</option>
            <option value="1">1 - Contratação por conta do Destinatário (FOB)</option>
            <option value="2">2 - Contratação por conta de Terceiros</option>
            <option value="3">3 - Próprio por conta do Remetente</option>
            <option value="9">9 - Sem Ocorrência de Transporte</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400">Placa / UF</label>
          <div className="flex gap-2">
            <input type="text" value={data.placaVeiculo || ''} onChange={(e) => onChange({ ...data, placaVeiculo: e.target.value })} placeholder="ABC-1234" className="text-sm bg-transparent border-none p-0 w-20 uppercase font-mono" disabled={isViewMode} />
            <input type="text" value={data.ufVeiculo || ''} onChange={(e) => onChange({ ...data, ufVeiculo: e.target.value })} placeholder="MT" className="text-sm bg-transparent border-none p-0 w-8 uppercase font-mono" disabled={isViewMode} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400">Peso Bruto (KG)</label>
          <input type="number" value={data.pesoBruto || 0} onChange={(e) => onChange({ ...data, pesoBruto: Number(e.target.value) })} className="text-sm bg-transparent border-none p-0 w-20 font-bold" disabled={isViewMode} />
        </div>
      </div>
    </div>
  );
};
