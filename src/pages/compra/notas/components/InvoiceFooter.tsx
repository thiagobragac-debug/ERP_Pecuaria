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
    <div className="modern-form-section mt-8 pt-8 border-t border-slate-100">
      <div className="section-header mb-6">
        <DollarSign size={16} className="text-indigo-500" />
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Totais & Fechamento</h3>
      </div>

      <div className="modern-form-row four-cols mb-6">
        <div className="modern-form-group">
          <label className="flex items-center gap-2">
            <Truck size={14} className="text-slate-400" /> Valor do Frete
          </label>
          <div className="modern-input-wrapper no-icon">
            <input 
              type="number" 
              className="modern-input font-bold"
              value={data.valorFrete || 0} 
              onChange={(e) => updateTotal({ valorFrete: Number(e.target.value) })}
              disabled={isViewMode}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">R$</span>
          </div>
        </div>

        <div className="modern-form-group">
          <label className="flex items-center gap-2">
            <Shield size={14} className="text-slate-400" /> Valor do Seguro
          </label>
          <div className="modern-input-wrapper no-icon">
            <input 
              type="number" 
              className="modern-input font-bold"
              value={data.valorSeguro || 0} 
              onChange={(e) => updateTotal({ valorSeguro: Number(e.target.value) })}
              disabled={isViewMode}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">R$</span>
          </div>
        </div>

        <div className="modern-form-group">
          <label className="flex items-center gap-2">
            <Info size={14} className="text-slate-400" /> Outras Despesas
          </label>
          <div className="modern-input-wrapper no-icon">
            <input 
              type="number" 
              className="modern-input font-bold"
              value={data.valorOutrasDespesas || 0} 
              onChange={(e) => updateTotal({ valorOutrasDespesas: Number(e.target.value) })}
              disabled={isViewMode}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">R$</span>
          </div>
        </div>

        <div className="modern-form-group">
          <label className="flex items-center gap-2">
            <Tag size={14} className="text-rose-400" /> Desconto Total
          </label>
          <div className="modern-input-wrapper no-icon">
            <input 
              type="number" 
              className="modern-input font-bold text-rose-600"
              value={data.valorDesconto || 0} 
              onChange={(e) => updateTotal({ valorDesconto: Number(e.target.value) })}
              disabled={isViewMode}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-rose-400">R$</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 h-full">
            <div className="flex items-center gap-2 mb-6">
              <Truck size={16} className="text-indigo-500" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informações de Transporte</h4>
            </div>
            
            <div className="modern-form-row two-cols mb-6">
              <div className="modern-form-group">
                <label>Modalidade Frete</label>
                <div className="modern-input-wrapper no-icon">
                  <select 
                    className="modern-input font-bold"
                    value={data.modFrete || '9'} 
                    onChange={(e) => onChange({ ...data, modFrete: e.target.value as any })}
                    disabled={isViewMode}
                  >
                    <option value="0">0 - CIF (Remetente)</option>
                    <option value="1">1 - FOB (Destinatário)</option>
                    <option value="2">2 - Terceiros</option>
                    <option value="3">3 - Próprio (Remetente)</option>
                    <option value="9">9 - Sem Ocorrência</option>
                  </select>
                </div>
              </div>
              <div className="modern-form-group">
                <label>Peso Bruto (KG)</label>
                <div className="modern-input-wrapper no-icon">
                  <input 
                    type="number" 
                    className="modern-input font-bold"
                    value={data.pesoBruto || 0} 
                    onChange={(e) => onChange({ ...data, pesoBruto: Number(e.target.value) })}
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>
            
            <div className="modern-form-row three-cols">
              <div className="modern-form-group two-cols">
                <label>Placa Veículo</label>
                <div className="modern-input-wrapper no-icon">
                  <input 
                    type="text" 
                    className="modern-input uppercase font-bold"
                    value={data.placaVeiculo || ''} 
                    onChange={(e) => onChange({ ...data, placaVeiculo: e.target.value })}
                    placeholder="AAA-0000"
                    disabled={isViewMode}
                  />
                </div>
              </div>
              <div className="modern-form-group">
                <label>UF</label>
                <div className="modern-input-wrapper no-icon">
                  <input 
                    type="text" 
                    className="modern-input uppercase font-bold"
                    value={data.ufVeiculo || ''} 
                    onChange={(e) => onChange({ ...data, ufVeiculo: e.target.value })}
                    placeholder="SP"
                    disabled={isViewMode}
                    maxLength={2}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-800 rounded-xl">
                    <DollarSign size={20} className="text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Resumo da Nota</h3>
                </div>
                <div className="text-emerald-500 font-mono text-xs font-bold px-2 py-1 bg-emerald-500/10 rounded-lg">
                  NF-e {data.numero || '----'}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
                  <span>Valor dos Produtos</span>
                  <span className="text-slate-200 font-mono">
                    R$ {(data.valorProdutos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
                  <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    Frete & Acréscimos
                  </span>
                  <span className="text-slate-200 font-mono">
                    + R$ {((data.valorFrete || 0) + (data.valorSeguro || 0) + (data.valorOutrasDespesas || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400 text-xs font-medium">
                  <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
                    Descontos
                  </span>
                  <span className="text-rose-400 font-mono text-xs">
                    - R$ {(data.valorDesconto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400 text-xs font-medium pt-2 border-t border-slate-800/50">
                   <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    ICMS Provisionado
                  </span>
                  <span className="text-emerald-400 font-mono">
                    R$ {(data.valorIcmsTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Valor Total Líquido</span>
                    <span className="text-3xl font-black text-emerald-400 tracking-tighter drop-shadow-sm">
                      R$ {(data.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative z-10 p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 mt-auto">
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                Note: Os impostos informados são baseados nos itens lançados. Verifique a conformidade com o documento físico.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
