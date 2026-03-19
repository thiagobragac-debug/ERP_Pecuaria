import React from 'react';
import { FileText, User, Calendar, MapPin, Building2 } from 'lucide-react';
import { SalesInvoice, Cliente, Company } from '../../../../types';

interface Props {
  data: Partial<SalesInvoice>;
  onChange: (data: Partial<SalesInvoice>) => void;
  clientes: Cliente[];
  empresas: Company[];
  isViewMode?: boolean;
}

export const InvoiceHeader: React.FC<Props> = ({ data, onChange, clientes, empresas, isViewMode }) => {
  return (
    <div className="invoice-section">
      <div className="section-title">
        <FileText size={18} />
        <span>Cabeçalho do Documento</span>
      </div>
      
      <div className="invoice-header-grid">
        <div className="form-group col-span-12 md:col-span-8">
          <label>Natureza da Operação</label>
          <select 
            value={data.naturezaOperacao} 
            onChange={(e) => onChange({ ...data, naturezaOperacao: e.target.value })}
            disabled={isViewMode}
            className="w-full"
          >
            <option value="Venda de Produção">Venda de Produção</option>
            <option value="Remessa para Pastoreio">Remessa para Pastoreio</option>
            <option value="Devolução de Compra">Devolução de Compra</option>
            <option value="Outras Saídas">Outras Saídas</option>
          </select>
        </div>

        <div className="form-group col-span-6 md:col-span-3">
          <label>Número</label>
          <input 
            type="text" 
            value={data.numero} 
            onChange={(e) => onChange({ ...data, numero: e.target.value })}
            disabled={isViewMode}
            placeholder="000.000"
          />
        </div>

        <div className="form-group col-span-6 md:col-span-1">
          <label>Série</label>
          <input 
            type="text" 
            value={data.serie} 
            onChange={(e) => onChange({ ...data, serie: e.target.value })}
            disabled={isViewMode}
          />
        </div>

        <div className="form-group col-span-12">
          <label>Chave de Acesso (44 dígitos)</label>
          <input 
            type="text" 
            value={data.chaveAcesso} 
            disabled={true}
            placeholder="Gerada automaticamente na transmissão..."
            className="bg-slate-50 font-mono text-sm tracking-wider"
          />
        </div>

        <div className="form-group col-span-12 md:col-span-6">
          <label>Empresa Emissora</label>
          <div className="relative">
            <select
              value={data.empresaId || ''}
              onChange={(e) => onChange({ ...data, empresaId: e.target.value })}
              disabled={isViewMode}
              className="w-full pl-10"
            >
              <option value="">Selecione a empresa...</option>
              {empresas.filter(e => e.status === 'Ativa').map(e => (
                <option key={e.id} value={e.id}>
                  {e.nomeFantasia} {!e.isMatriz ? '(Filial)' : '(Matriz)'}
                </option>
              ))}
            </select>
            <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="form-group col-span-12 md:col-span-6">
          <label>Destinatário / Cliente</label>
          <div className="relative">
            <select 
              value={data.cliente_id} 
              onChange={(e) => {
                const selected = clientes.find(c => c.id === e.target.value);
                onChange({ 
                  ...data, 
                  cliente_id: e.target.value,
                  nomeDestinatario: selected?.nome,
                  documentoDestinatario: selected?.documento,
                  inscricaoEstadualDestinatario: selected?.inscricaoEstadual,
                  indIEDest: selected?.indIEDest,
                  cMun: selected?.cMun,
                  cPais: selected?.cPais
                });
              }}
              disabled={isViewMode}
              className="w-full pl-10"
            >
              <option value="">Selecione o destinatário...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome} ({c.documento})</option>
              ))}
            </select>
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="form-group col-span-6 md:col-span-3">
          <label>Data de Emissão</label>
          <div className="relative">
            <input 
              type="date" 
              value={data.dataEmissao} 
              onChange={(e) => onChange({ ...data, dataEmissao: e.target.value })}
              disabled={isViewMode}
              className="w-full pl-10"
            />
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="form-group col-span-6 md:col-span-3">
          <label>Data de Saída</label>
          <div className="relative">
            <input 
              type="date" 
              value={data.dataSaida} 
              onChange={(e) => onChange({ ...data, dataSaida: e.target.value })}
              disabled={isViewMode}
              className="w-full pl-10"
            />
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="form-group col-span-12 md:col-span-12">
          <label>Indicador de Presença</label>
          <select 
            value={data.indPres || '1'} 
            onChange={(e) => onChange({ ...data, indPres: e.target.value as any })}
            disabled={isViewMode}
            className="w-full"
          >
            <option value="0">0 - Não se aplica (ex.: Nota Fiscal de Ajuste ou Complementar)</option>
            <option value="1">1 - Operação presencial</option>
            <option value="2">2 - Operação não presencial, pela Internet</option>
            <option value="3">3 - Operação não presencial, Teleatendimento</option>
            <option value="4">4 - NFC-e em operação com entrega a domicílio</option>
            <option value="9">9 - Operação não presencial, outros</option>
          </select>
        </div>
      </div>
    </div>
  );
};
