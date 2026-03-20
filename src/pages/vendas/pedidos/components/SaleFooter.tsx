import React from 'react';
import { CreditCard, Calendar, Info, DollarSign, ArrowRightLeft } from 'lucide-react';
import { SalesInvoice, SalesItem } from '../../../../types';

interface Props {
  data: Partial<SalesInvoice>;
  onChange: (data: Partial<SalesInvoice>) => void;
  isViewMode?: boolean;
}

export const SaleFooter: React.FC<Props> = ({ data, onChange, isViewMode }) => {
  const items = (data.itens as SalesItem[]) || [];
  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const totalWeight = items.reduce((acc, item) => acc + item.peso, 0);
  const headCount = items.length;

  return (
    <div className="modern-form-section mt-12 pt-12 border-t border-slate-100">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 h-full">
            <div className="flex items-center gap-2 mb-6">
              <ArrowRightLeft size={16} className="text-indigo-500" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Integração Financeira</h4>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h5 className="text-xs font-bold text-slate-700">Gerar Lançamento no Contas a Receber</h5>
                  <p className="text-[10px] text-slate-400 font-medium">Automatiza o fluxo de caixa com base nesta venda</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={(data as any).gerarFinanceiro !== false}
                    onChange={(e) => onChange({ ...data, gerarFinanceiro: e.target.checked } as any)}
                    disabled={isViewMode}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {((data as any).gerarFinanceiro !== false) && (
                <div className="modern-form-row two-cols animate-slide-up">
                  <div className="modern-form-group">
                    <label>Previsão de Recebimento</label>
                    <div className="modern-input-wrapper">
                      <input 
                        type="date" 
                        className="modern-input"
                        value={(data as any).dataVencimento || ''} 
                        onChange={(e) => onChange({ ...data, dataVencimento: e.target.value } as any)}
                        disabled={isViewMode}
                        required
                      />
                      <Calendar size={18} className="modern-field-icon" />
                    </div>
                  </div>

                  <div className="modern-form-group">
                    <label>Forma de Recebimento</label>
                    <div className="modern-input-wrapper">
                      <select 
                        className="modern-input font-bold"
                        value={(data as any).formaPagamento || 'Boleto'} 
                        onChange={(e) => onChange({ ...data, formaPagamento: e.target.value } as any)}
                        disabled={isViewMode}
                      >
                        <option value="Boleto">Boleto Bancário</option>
                        <option value="Pix">Pix / Transferência</option>
                        <option value="Cartao">Cartão de Crédito</option>
                        <option value="Dinheiro">Dinheiro</option>
                      </select>
                      <CreditCard size={18} className="modern-field-icon" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
           <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-800 rounded-xl">
                    <DollarSign size={20} className="text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Total da Venda</h3>
                </div>
                <div className="text-indigo-400 font-mono text-xs font-bold px-3 py-1 bg-indigo-400/10 rounded-lg">
                  {headCount.toString().padStart(2, '0')} Animais
                </div>
              </div>

              <div className="space-y-5 mb-8">
                <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    Peso Total Acumulado
                  </span>
                  <span className="text-slate-200 font-black font-mono">
                    {totalWeight.toLocaleString('pt-BR')} <span className="text-[10px] text-slate-500">KG</span>
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Média por Cabeça
                  </span>
                  <span className="text-slate-200 font-black font-mono">
                    R$ {(headCount > 0 ? subtotal / headCount : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Valor Total Líquido</span>
                    <span className="text-4xl font-black text-emerald-400 tracking-tighter drop-shadow-sm">
                      R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative z-10 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 mt-auto">
              <div className="flex items-start gap-3">
                <Info size={14} className="text-indigo-400 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                  Note: A confirmação desta venda alterará o status dos animais selecionados para "Vendido" e gerará os devidos lançamentos financeiros.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
