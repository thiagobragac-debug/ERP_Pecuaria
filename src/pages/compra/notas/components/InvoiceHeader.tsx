import React from 'react';
import { FileText, Building2, Calendar, Hash, Globe, User } from 'lucide-react';
import { NotaEntrada, Company, Supplier } from '../../../../types';

interface Props {
  data: Partial<NotaEntrada>;
  onChange: (data: Partial<NotaEntrada>) => void;
  isViewMode?: boolean;
  empresas: Company[];
  fornecedores: Supplier[];
}

export const InvoiceHeader: React.FC<Props> = ({ data, onChange, isViewMode, empresas, fornecedores }) => {
  return (
    <div className="invoice-section">
      <div className="section-title">
        <FileText size={18} />
        <span>Identificação da NF-e</span>
      </div>
      
      <div className="form-grid">
        <div className="form-group col-12">
          <label>Chave de Acesso (44 dígitos)</label>
          <div className="input-with-icon">
            <input 
              type="text" 
              value={data.chaveAcesso || ''} 
              onChange={(e) => onChange({ ...data, chaveAcesso: e.target.value })}
              disabled={isViewMode}
              maxLength={44}
              placeholder="0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000"
            />
            <Hash size={18} className="field-icon" />
          </div>
        </div>

        <div className="form-group col-6">
          <label>Empresa Destinatária</label>
          <div className="input-with-icon">
            <select 
              value={data.empresaId || ''} 
              onChange={(e) => onChange({ ...data, empresaId: e.target.value })}
              disabled={isViewMode}
            >
              <option value="">Selecione a Empresa...</option>
              {empresas.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nomeFantasia} ({emp.cnpj})</option>
              ))}
            </select>
            <Building2 size={18} className="field-icon" />
          </div>
        </div>

        <div className="form-group col-6">
          <label>Fornecedor (Emitente)</label>
          <div className="input-with-icon">
            <select 
              value={data.fornecedorId || ''} 
              onChange={(e) => {
                const selected = fornecedores.find(f => f.id === e.target.value);
                onChange({ 
                  ...data, 
                  fornecedorId: e.target.value, 
                  fornecedorNome: selected?.nome || '',
                  inscricaoEstadual: selected?.inscricaoEstadual,
                  indIEDest: selected?.indIEDest,
                  cMun: selected?.cMun,
                  cPais: selected?.cPais
                });
              }}
              disabled={isViewMode}
            >
              <option value="">Selecione o Fornecedor...</option>
              {fornecedores.map(f => (
                <option key={f.id} value={f.id}>{f.nome} ({f.documento})</option>
              ))}
            </select>
            <User size={18} className="field-icon" />
          </div>
        </div>

        <div className="form-group col-2">
          <label>Número NF</label>
          <input 
            type="text" 
            value={data.numero || ''} 
            onChange={(e) => onChange({ ...data, numero: e.target.value })}
            disabled={isViewMode}
          />
        </div>

        <div className="form-group col-1">
          <label>Série</label>
          <input 
            type="text" 
            value={data.serie || ''} 
            onChange={(e) => onChange({ ...data, serie: e.target.value })}
            disabled={isViewMode}
          />
        </div>

        <div className="form-group col-3">
          <label>Data Emissão</label>
          <div className="input-with-icon">
            <input 
              type="date" 
              value={data.dataEmissao || ''} 
              onChange={(e) => onChange({ ...data, dataEmissao: e.target.value })}
              disabled={isViewMode}
            />
            <Calendar size={18} className="field-icon" />
          </div>
        </div>

        <div className="form-group col-3">
          <label>Data Entrada</label>
          <div className="input-with-icon">
            <input 
              type="date" 
              value={data.dataEntrada || ''} 
              onChange={(e) => onChange({ ...data, dataEntrada: e.target.value })}
              disabled={isViewMode}
            />
            <Calendar size={18} className="field-icon" />
          </div>
        </div>

        <div className="form-group col-9">
          <label>Natureza da Operação</label>
          <input 
            type="text" 
            value={data.naturezaOperacao || ''} 
            onChange={(e) => onChange({ ...data, naturezaOperacao: e.target.value })}
            disabled={isViewMode}
            placeholder="Ex: Compra para comercialização"
          />
        </div>

        <div className="form-group col-3">
          <label>Ind. Presença</label>
          <select 
            value={data.indPres || '1'} 
            onChange={(e) => onChange({ ...data, indPres: e.target.value as any })}
            disabled={isViewMode}
          >
            <option value="0">0-Não se aplica</option>
            <option value="1">1-Presencial</option>
            <option value="2">2-Internet</option>
            <option value="3">3-Telefone</option>
            <option value="4">4-Entrega</option>
            <option value="9">9-Outros</option>
          </select>
        </div>
      </div>
    </div>
  );
};
