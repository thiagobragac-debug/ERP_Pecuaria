import React from 'react';
import { FileText, User, Calendar, MapPin, Building2, Hash, Globe } from 'lucide-react';
import { SalesInvoice, Cliente, Company } from '../../../../types';
import { SearchableSelect } from '../../../../components/SearchableSelect';

interface Props {
  data: Partial<SalesInvoice>;
  onChange: (data: Partial<SalesInvoice>) => void;
  clientes: Cliente[];
  empresas: Company[];
  isViewMode?: boolean;
}

export const InvoiceHeader: React.FC<Props> = ({ data, onChange, clientes, empresas, isViewMode }) => {
  return (
    <div className="modern-form-section">
      <div className="section-header mb-6">
        <FileText size={16} className="text-indigo-500" />
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Identificação do Documento</h3>
      </div>
      
      <div className="modern-form-row three-cols mb-6">
        <div className="modern-form-group col-span-2">
          <label>Natureza da Operação</label>
          <div className="modern-input-wrapper">
            <select 
              className="modern-input"
              value={data.naturezaOperacao} 
              onChange={(e) => onChange({ ...data, naturezaOperacao: e.target.value })}
              disabled={isViewMode}
            >
              <option value="Venda de Produção">Venda de Produção</option>
              <option value="Remessa para Pastoreio">Remessa para Pastoreio</option>
              <option value="Devolução de Compra">Devolução de Compra</option>
              <option value="Outras Saídas">Outras Saídas</option>
            </select>
            <Globe size={18} className="modern-field-icon" />
          </div>
        </div>

        <div className="modern-form-group">
          <label>Data de Emissão</label>
          <div className="modern-input-wrapper">
            <input 
              type="date" 
              className="modern-input"
              value={data.dataEmissao} 
              onChange={(e) => onChange({ ...data, dataEmissao: e.target.value })}
              disabled={isViewMode}
              required
            />
            <Calendar size={18} className="modern-field-icon" />
          </div>
        </div>
      </div>

      <div className="modern-form-row three-cols mb-6">
        <div className="modern-form-group">
          <label>Número NF</label>
          <div className="modern-input-wrapper">
            <input 
              type="text" 
              className="modern-input"
              value={data.numero} 
              onChange={(e) => onChange({ ...data, numero: e.target.value })}
              disabled={isViewMode}
              placeholder="000.000"
              required
            />
            <Hash size={18} className="modern-field-icon" />
          </div>
        </div>

        <div className="modern-form-group">
          <label>Série</label>
          <div className="modern-input-wrapper">
            <input 
              type="text" 
              className="modern-input"
              value={data.serie} 
              onChange={(e) => onChange({ ...data, serie: e.target.value })}
              disabled={isViewMode}
              required
            />
            <Hash size={18} className="modern-field-icon" />
          </div>
        </div>

        <div className="modern-form-group">
          <label>Data de Saída</label>
          <div className="modern-input-wrapper">
            <input 
              type="date" 
              className="modern-input"
              value={data.dataSaida} 
              onChange={(e) => onChange({ ...data, dataSaida: e.target.value })}
              disabled={isViewMode}
            />
            <MapPin size={18} className="modern-field-icon" />
          </div>
        </div>
      </div>

      <div className="modern-form-row mb-6">
        <div className="modern-form-group">
          <label>Chave de Acesso (44 dígitos)</label>
          <div className="modern-input-wrapper">
            <input 
              type="text" 
              className="modern-input font-mono text-xs bg-slate-50/50"
              value={data.chaveAcesso || ''} 
              disabled={true}
              placeholder="Gerada automaticamente na transmissão..."
              maxLength={44}
            />
            <Hash size={18} className="modern-field-icon" />
          </div>
        </div>
      </div>

      <div className="modal-divider my-8" />

      <div className="section-header mb-6">
        <Building2 size={16} className="text-indigo-500" />
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Emitente e Destinatário</h3>
      </div>

      <div className="modern-form-row two-cols">
        <div className="modern-form-group">
          <SearchableSelect
            label="Empresa Emissora"
            options={empresas.filter(e => e.status === 'Ativa').map(e => ({ 
              id: e.id, 
              label: e.nomeFantasia, 
              sublabel: !e.isMatriz ? 'Filial' : 'Matriz' 
            }))}
            value={data.empresaId || ''}
            onChange={(val) => onChange({ ...data, empresaId: val })}
            disabled={isViewMode}
            required
          />
        </div>

        <div className="modern-form-group">
          <SearchableSelect
            label="Cliente (Destinatário)"
            options={clientes.map(c => ({ 
              id: c.id, 
              label: c.nome, 
              sublabel: c.documento 
            }))}
            value={data.cliente_id || ''}
            onChange={(val) => {
              const selected = clientes.find(c => c.id === val);
              onChange({ 
                ...data, 
                cliente_id: val,
                nomeDestinatario: selected?.nome,
                documentoDestinatario: selected?.documento,
                inscricaoEstadualDestinatario: selected?.inscricaoEstadual,
                indIEDest: selected?.indIEDest,
                cMun: selected?.cMun,
                cPais: selected?.cPais
              });
            }}
            disabled={isViewMode}
            required
          />
        </div>
      </div>

      <div className="modern-form-row mt-6">
        <div className="modern-form-group">
          <label>Indicador de Presença</label>
          <div className="modern-input-wrapper">
            <select 
              className="modern-input"
              value={data.indPres || '1'} 
              onChange={(e) => onChange({ ...data, indPres: e.target.value as any })}
              disabled={isViewMode}
            >
              <option value="0">0 - Não se aplica (ex.: Nota Fiscal de Ajuste ou Complementar)</option>
              <option value="1">1 - Operação presencial</option>
              <option value="2">2 - Operação não presencial, pela Internet</option>
              <option value="3">3 - Operação não presencial, Teleatendimento</option>
              <option value="4">4 - NFC-e em operação com entrega a domicílio</option>
              <option value="9">9 - Operação não presencial, outros</option>
            </select>
            <Globe size={18} className="modern-field-icon" />
          </div>
        </div>
      </div>
    </div>
  );
};
