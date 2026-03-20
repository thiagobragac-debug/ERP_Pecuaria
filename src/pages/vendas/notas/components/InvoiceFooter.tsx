import React, { useEffect } from 'react';
import { Calculator, Truck, FileText, Info, DollarSign, Package, Shield, CreditCard, Tag, Plus, ShieldCheck } from 'lucide-react';
import { SalesInvoice, InvoiceItem } from '../../../../types';

interface Props {
  data: Partial<SalesInvoice>;
  onChange: (data: Partial<SalesInvoice>) => void;
  isViewMode?: boolean;
}

export const InvoiceFooter: React.FC<Props> = ({ data, onChange, isViewMode }) => {
  const items = data.itens || [];

  // Recalculate Master Totals when items change
  useEffect(() => {
    const valorProdutos = items.reduce((sum: number, item: InvoiceItem) => sum + (item.valorTotal || 0), 0);
    const valorIcms = items.reduce((sum: number, item: InvoiceItem) => sum + (item.valorIcms || 0), 0);
    const valorIpi = items.reduce((sum: number, item: InvoiceItem) => sum + (item.valorIpi || 0), 0);
    
    const valorFrete = data.valorFrete || 0;
    const valorSeguro = data.valorSeguro || 0;
    const valorOutrasDespesas = data.valorOutrasDespesas || 0;
    const valorDesconto = data.valorDesconto || 0;

    const valorTotal = (valorProdutos + valorIcms + valorIpi + valorFrete + valorSeguro + valorOutrasDespesas) - valorDesconto;

    if (Math.abs(valorProdutos - (data.valorProdutos || 0)) > 0.01 || Math.abs(valorTotal - (data.valorTotal || 0)) > 0.01) {
      onChange({ 
        ...data, 
        valorProdutos, 
        valorIcms, 
        valorIpi, 
        valorTotal 
      });
    }
  }, [items, data.valorFrete, data.valorSeguro, data.valorOutrasDespesas, data.valorDesconto]);

  return (
    <div className="space-y-10">
      <div className="modern-form-section">
        <div className="section-header mb-6">
          <Truck size={16} className="text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Transporte & Logística</h3>
        </div>
        
        <div className="modern-form-row two-cols mb-6">
          <div className="modern-form-group">
            <label>Modalidade do Frete</label>
            <div className="modern-input-wrapper">
              <select 
                className="modern-input"
                value={data.modFrete || '9'} 
                onChange={(e) => onChange({...data, modFrete: e.target.value as any})}
                disabled={isViewMode}
              >
                <option value="0">0 - CIF (Remetente)</option>
                <option value="1">1 - FOB (Destinatário)</option>
                <option value="2">2 - Terceiros</option>
                <option value="3">3 - Próprio Remetente</option>
                <option value="4">4 - Próprio Destinatário</option>
                <option value="9">9 - Sem Frete</option>
              </select>
              <Truck size={18} className="modern-field-icon" />
            </div>
          </div>

          <div className="modern-form-group">
            <label>Transportadora</label>
            <div className="modern-input-wrapper">
              <input 
                type="text" 
                className="modern-input"
                value={data.transportadora_id || ''} 
                onChange={(e) => onChange({...data, transportadora_id: e.target.value})}
                placeholder="Nome ou Razão Social"
                disabled={isViewMode}
              />
              <FileText size={18} className="modern-field-icon" />
            </div>
          </div>
        </div>

        <div className="modern-form-row four-cols">
          <div className="modern-form-group">
            <label>Veículo / Placa</label>
            <div className="flex gap-2">
              <div className="modern-input-wrapper flex-1">
                <input 
                  type="text" 
                  className="modern-input"
                  value={data.placa || ''}
                  onChange={(e) => onChange({...data, placa: e.target.value})}
                  placeholder="ABC-1234"
                  disabled={isViewMode}
                />
              </div>
              <div className="modern-input-wrapper w-16">
                <input 
                  type="text" 
                  className="modern-input text-center uppercase"
                  value={data.uf_placa || ''}
                  onChange={(e) => onChange({...data, uf_placa: e.target.value})}
                  placeholder="UF"
                  disabled={isViewMode}
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          <div className="modern-form-group">
             <label>Qtd. Volumes</label>
             <div className="modern-input-wrapper">
               <input 
                type="number" 
                className="modern-input"
                value={data.volumes || 0}
                onChange={(e) => onChange({...data, volumes: Number(e.target.value)})}
                disabled={isViewMode}
              />
              <Package size={18} className="modern-field-icon" />
             </div>
          </div>

          <div className="modern-form-group">
             <label>Peso Bruto (kg)</label>
             <div className="modern-input-wrapper">
               <input 
                type="number" 
                className="modern-input"
                value={data.pesoBruto || 0}
                onChange={(e) => onChange({...data, pesoBruto: Number(e.target.value)})}
                disabled={isViewMode}
              />
              <Tag size={18} className="modern-field-icon" />
             </div>
          </div>

          <div className="modern-form-group">
             <label>Peso Líquido (kg)</label>
             <div className="modern-input-wrapper">
               <input 
                type="number" 
                className="modern-input"
                value={data.pesoLiquido || 0}
                onChange={(e) => onChange({...data, pesoLiquido: Number(e.target.value)})}
                disabled={isViewMode}
              />
              <Tag size={18} className="modern-field-icon" />
             </div>
          </div>
        </div>
      </div>

      <div className="modal-divider my-10" />

      <div className="modern-form-section grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-12">
            <div className="section-header mb-6">
              <Calculator size={16} className="text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Fechamento & Totais</h3>
            </div>
        </div>

        <div className="col-span-12 lg:col-span-7">
          <div className="space-y-6">
            <div className="modern-form-row two-cols">
              <div className="modern-form-group">
                <label>Valor do Frete</label>
                <div className="modern-input-wrapper">
                  <input 
                    type="number" 
                    className="modern-input pl-10 font-bold"
                    value={data.valorFrete || 0} 
                    onChange={(e) => onChange({...data, valorFrete: Number(e.target.value)})}
                    disabled={isViewMode}
                  />
                  <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="modern-form-group">
                <label>Valor do Seguro</label>
                <div className="modern-input-wrapper">
                  <input 
                    type="number" 
                    className="modern-input pl-10 font-bold"
                    value={data.valorSeguro || 0} 
                    onChange={(e) => onChange({...data, valorSeguro: Number(e.target.value)})}
                    disabled={isViewMode}
                  />
                  <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="modern-form-row two-cols">
              <div className="modern-form-group">
                <label>Outras Despesas</label>
                <div className="modern-input-wrapper">
                  <input 
                    type="number" 
                    className="modern-input pl-10 font-bold"
                    value={data.valorOutrasDespesas || 0} 
                    onChange={(e) => onChange({...data, valorOutrasDespesas: Number(e.target.value)})}
                    disabled={isViewMode}
                  />
                  <Plus size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="modern-form-group">
                <label>Valor do Desconto</label>
                <div className="modern-input-wrapper">
                  <input 
                    type="number" 
                    className="modern-input pl-10 font-bold text-rose-600"
                    value={data.valorDesconto || 0} 
                    onChange={(e) => onChange({...data, valorDesconto: Number(e.target.value)})}
                    disabled={isViewMode}
                  />
                  <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
                </div>
              </div>
            </div>

            <div className="modern-form-group">
              <label>Meio de Pagamento (SEFAZ)</label>
              <div className="modern-input-wrapper">
                <select 
                  className="modern-input"
                  value={data.meioPagamento || '01'} 
                  onChange={(e) => onChange({...data, meioPagamento: e.target.value})}
                  disabled={isViewMode}
                >
                  <option value="01">01 - Dinheiro</option>
                  <option value="02">02 - Cheque</option>
                  <option value="03">03 - Cartão de Crédito</option>
                  <option value="04">04 - Cartão de Débito</option>
                  <option value="15">15 - Boleto Bancário</option>
                  <option value="17">17 - PIX</option>
                  <option value="90">90 - Sem Pagamento</option>
                  <option value="99">99 - Outros</option>
                </select>
                <CreditCard size={18} className="modern-field-icon" />
              </div>
            </div>

            <div className="modern-form-group">
              <label>Observações / Dados Adicionais</label>
              <textarea 
                className="modern-input min-h-[100px] resize-none p-4"
                value={data.observacoes || ''}
                onChange={(e) => onChange({...data, observacoes: e.target.value})}
                disabled={isViewMode}
                placeholder="Ex: Referente ao pedido #123. Mensagem de rodapé da nota..."
              />
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <div className="bg-slate-900 rounded-[32px] p-10 text-white shadow-2xl shadow-indigo-200/20 sticky top-4 overflow-hidden border border-slate-800">
            {/* Decorative Background Element */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8 flex items-center gap-3 relative z-10">
              <span className="w-8 h-[1px] bg-slate-800"></span>
              Resumo do Faturamento
            </h4>
            
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center group">
                <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider group-hover:text-slate-300 transition-colors">Produtos</span>
                <span className="font-black text-xl tracking-tight text-slate-100">R$ {data.valorProdutos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between items-center group">
                <div className="flex flex-col">
                  <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider group-hover:text-slate-300 transition-colors">Impostos</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">(ICMS + IPI)</span>
                </div>
                <span className="font-black text-xl tracking-tight text-slate-100">R$ {((data.valorIcms || 0) + (data.valorIpi || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between items-center group pt-2 text-indigo-400">
                <span className="font-bold text-[11px] uppercase tracking-wider group-hover:text-indigo-300 transition-colors">Acréscimos</span>
                <span className="font-black text-xl tracking-tight">+ R$ {((data.valorFrete || 0) + (data.valorSeguro || 0) + (data.valorOutrasDespesas || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between items-center group text-rose-400 pb-2">
                <span className="font-bold text-[11px] uppercase tracking-wider group-hover:text-rose-300 transition-colors">Descontos</span>
                <span className="font-black text-xl tracking-tight">- R$ {(data.valorDesconto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="h-[1px] bg-white/5 my-6 shadow-[0_1px_0_rgba(255,255,255,0.02)]"></div>
              
              <div className="pt-2">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-indigo-400 font-black text-[11px] uppercase tracking-[0.2em] mb-2">Total da Nota</span>
                    <span className="text-4xl font-black tracking-tighter text-white drop-shadow-sm">
                      <span className="text-indigo-400 mr-2 text-2xl font-light">R$</span>
                      {data.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-indigo-500 p-4 rounded-2xl text-white shadow-lg shadow-indigo-500/20 transform hover:scale-105 transition-transform duration-300">
                    <ShieldCheck size={32} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 p-5 bg-white/5 rounded-2xl border border-white/5 flex gap-4 relative z-10 backdrop-blur-sm">
              <div className="p-2 bg-indigo-500/20 rounded-lg h-fit">
                <Info size={16} className="text-indigo-400" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">
                Verifique as informações fiscais antes de autorizar a transmissão para a SEFAZ. Erros podem gerar multas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
