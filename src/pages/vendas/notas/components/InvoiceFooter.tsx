import React, { useEffect } from 'react';
import { Calculator, Truck, FileText, Info } from 'lucide-react';
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

    if (valorProdutos !== data.valorProdutos || valorTotal !== data.valorTotal) {
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
    <div className="invoice-footer-grid">
      <div className="invoice-section">
        <div className="section-title">
          <Truck size={18} />
          <span>Transporte & Dados Adicionais</span>
        </div>
        
        <div className="invoice-header-grid">
          <div className="form-group col-span-12">
            <label>Observações / Dados Adicionais</label>
            <textarea 
              value={data.observacoes || ''}
              onChange={(e) => onChange({...data, observacoes: e.target.value})}
              disabled={isViewMode}
              rows={3}
              className="w-full p-3 border border-slate-200 rounded-lg text-sm"
              placeholder="Ex: Pecuária 4.0 - Referente ao pedido #123. Isento de ICMS conf. art..."
            ></textarea>
          </div>
          
          <div className="form-group col-span-12 md:col-span-6">
            <label>Modalidade do Frete</label>
            <select 
              value={data.modFrete || '9'} 
              onChange={(e) => onChange({...data, modFrete: e.target.value as any})}
              disabled={isViewMode}
              className="w-full"
            >
              <option value="0">0 - Contratação do Frete por conta do Remetente (CIF)</option>
              <option value="1">1 - Contratação do Frete por conta do Destinatário (FOB)</option>
              <option value="2">2 - Contratação do Frete por conta de Terceiros</option>
              <option value="3">3 - Transporte Próprio por conta do Remetente</option>
              <option value="4">4 - Transporte Próprio por conta do Destinatário</option>
              <option value="9">9 - Sem Ocorrência de Transporte</option>
            </select>
          </div>

          <div className="form-group col-span-12 md:col-span-6">
            <label>Transportadora (Nome/Razão)</label>
            <input 
              type="text" 
              value={data.transportadora_id || ''} // Using transportadora_id as name for now or add name field
              onChange={(e) => onChange({...data, transportadora_id: e.target.value})}
              placeholder="Nome ou Razão Social"
              disabled={isViewMode}
            />
          </div>

          <div className="form-group col-span-6 md:col-span-3">
            <label>Placa do Veículo</label>
            <div className="flex gap-1">
              <input 
                type="text" 
                value={data.placa || ''}
                onChange={(e) => onChange({...data, placa: e.target.value})}
                placeholder="ABC-1234"
                disabled={isViewMode}
                className="flex-1"
              />
              <input 
                type="text" 
                value={data.uf_placa || ''}
                onChange={(e) => onChange({...data, uf_placa: e.target.value})}
                placeholder="UF"
                disabled={isViewMode}
                className="w-12 text-center"
                maxLength={2}
              />
            </div>
          </div>

          <div className="form-group col-span-6 md:col-span-3">
             <label>Qtd. Volumes</label>
             <input 
              type="number" 
              value={data.volumes || 0}
              onChange={(e) => onChange({...data, volumes: Number(e.target.value)})}
              placeholder="0"
              disabled={isViewMode}
            />
          </div>

          <div className="form-group col-span-6 md:col-span-3">
             <label>Peso Líquido (kg)</label>
             <input 
              type="number" 
              value={data.pesoLiquido || 0}
              onChange={(e) => onChange({...data, pesoLiquido: Number(e.target.value)})}
              placeholder="0.00"
              disabled={isViewMode}
            />
          </div>

          <div className="form-group col-span-6 md:col-span-3">
             <label>Peso Bruto (kg)</label>
             <input 
              type="number" 
              value={data.pesoBruto || 0}
              onChange={(e) => onChange({...data, pesoBruto: Number(e.target.value)})}
              placeholder="0.00"
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>

      <div className="totals-panel invoice-section">
        <div className="section-title">
          <Calculator size={18} />
          <span>Totais da Nota</span>
        </div>

        <div className="total-row">
          <span>Total dos Produtos</span>
          <strong>R$ {data.valorProdutos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
        </div>
        <div className="total-row">
          <span>(+) Valor do ICMS</span>
          <span>R$ {data.valorIcms?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="total-row">
          <span>(+) Valor do IPI</span>
          <span>R$ {data.valorIpi?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="total-row">
          <span>(+) Frete</span>
          <input 
            type="number" 
            value={data.valorFrete} 
            onChange={(e) => onChange({...data, valorFrete: Number(e.target.value)})}
            disabled={isViewMode}
            className="text-right w-24 border-b"
          />
        </div>
        <div className="total-row">
          <span>(+) Seguro</span>
          <input 
            type="number" 
            value={data.valorSeguro} 
            onChange={(e) => onChange({...data, valorSeguro: Number(e.target.value)})}
            disabled={isViewMode}
            className="text-right w-24 border-b"
          />
        </div>
        <div className="total-row">
          <span>(-) Desconto</span>
          <input 
            type="number" 
            value={data.valorDesconto} 
            onChange={(e) => onChange({...data, valorDesconto: Number(e.target.value)})}
            disabled={isViewMode}
            className="text-right w-24 border-b text-red-500"
          />
        </div>
        
        <div className="total-row grand-total">
          <span>VALOR TOTAL DA NOTA</span>
          <span className="text-indigo-600">
            R$ {data.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Meio de Pagamento (SEFAZ)</label>
          <select 
            value={data.meioPagamento || '01'} 
            onChange={(e) => onChange({...data, meioPagamento: e.target.value})}
            disabled={isViewMode}
            className="w-full text-sm p-2 border rounded bg-white"
          >
            <option value="01">01 - Dinheiro</option>
            <option value="02">02 - Cheque</option>
            <option value="03">03 - Cartão de Crédito</option>
            <option value="04">04 - Cartão de Débito</option>
            <option value="15">15 - Boleto Bancário</option>
            <option value="17">17 - PIX (Pagamento Instantâneo)</option>
            <option value="90">90 - Sem Pagamento (ex: Bonificação)</option>
            <option value="99">99 - Outros</option>
          </select>
        </div>

        <div className="mt-6 p-4 bg-emerald-50 rounded-lg flex gap-3 border border-emerald-100">
           <Info size={20} className="text-emerald-600 shrink-0" />
           <p className="text-xs text-emerald-800 leading-relaxed font-medium">
             Os totais são calculados automaticamente com base nos itens inseridos e tributação parametrizada.
           </p>
        </div>
      </div>
    </div>
  );
};
