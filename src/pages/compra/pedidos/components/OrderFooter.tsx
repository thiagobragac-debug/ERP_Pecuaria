import React from 'react';
import { DollarSign, Tag, Info, FileText } from 'lucide-react';
import { PurchaseOrder } from '../../../../types';

interface Props {
  data: Partial<PurchaseOrder>;
  onChange: (data: Partial<PurchaseOrder>) => void;
  isViewMode?: boolean;
}

export const OrderFooter: React.FC<Props> = ({ data, onChange, isViewMode }) => {
  const items = data.itens || [];
  const subtotal = items.reduce((acc, it) => acc + (it.subtotal || 0), 0);
  const totalDesconto = items.reduce((acc, it) => acc + (it.desconto || 0), 0);
  const valorTotal = subtotal; // Assuming subtotal already reflects individual discounts if logic dictates, 
                               // but here subtotal = (qty * price) - discount as per OrderItems.

  return (
    <div className="modern-form-section mt-8 pt-8 border-t border-slate-100">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Info size={16} className="text-slate-400" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observações do Pedido</h4>
            </div>
            <textarea 
              className="modern-input min-h-[120px] resize-none bg-white border-slate-200"
              placeholder="Digite aqui observações relevantes, instruções de entrega ou detalhes adicionais..."
              value={(data as any).observacoes || ''}
              onChange={(e) => onChange({ ...data, observacoes: e.target.value } as any)}
              disabled={isViewMode}
            />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl transition-all group-hover:bg-indigo-500/20" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                <div className="p-2 bg-slate-800 rounded-xl">
                  <DollarSign size={20} className="text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Resumo Financeiro</h3>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                    Subtotal Bruto
                  </span>
                  <span className="text-slate-200 font-mono">
                    R$ {(subtotal + totalDesconto).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
                    Descontos Aplicados
                  </span>
                  <span className="text-rose-400 font-mono">
                    - R$ {totalDesconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Líquido</span>
                    <span className="text-3xl font-black text-emerald-400 tracking-tighter drop-shadow-sm">
                      R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex flex-col items-end opacity-60">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Itens</span>
                    <span className="text-lg font-black text-slate-300">{items.length.toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <FileText size={14} className="text-indigo-400" />
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                  Valores sujeitos a alteração conforme tributação na emissão da Nota Fiscal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
