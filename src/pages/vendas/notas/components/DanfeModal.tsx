import React from 'react';
import { Printer, Download, X, FileText } from 'lucide-react';
import { SalesInvoice, Cliente } from '../../../../types';

interface DanfeModalProps {
  nota: SalesInvoice;
  cliente?: Cliente;
  onClose: () => void;
}

export const DanfeModal: React.FC<DanfeModalProps> = ({ nota, cliente, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Header de Ações */}
        <div className="bg-slate-50 border-bottom p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Visualização de DANFE</h3>
              <p className="text-xs text-slate-500">Nota Fiscal Eletrônica Nº {nota.numero}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-all font-semibold text-sm">
              <Download size={16} />
              PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-semibold text-sm shadow-md" onClick={() => window.print()}>
              <Printer size={16} />
              Imprimir
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Conteúdo do DANFE (Papel A4) */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-8 flex justify-center">
          <div className="bg-white w-[210mm] min-h-[297mm] p-[10mm] shadow-lg border border-slate-300 text-[10px] font-sans text-black leading-tight">
            
            {/* Primeira Seção: Identificação do Emitente e DANFE */}
            <div className="grid grid-cols-12 border-2 border-black mb-1">
              <div className="col-span-4 border-r-2 border-black p-2 flex items-center justify-center">
                <div className="text-center">
                  <div className="font-bold text-lg mb-1">FAZENDA MODELO S.A.</div>
                  <div>BR 364, KM 120 - ZONA RURAL</div>
                  <div>VILHENA - RO</div>
                  <div>CEP: 76980-000 - Fone: (69) 3322-1100</div>
                </div>
              </div>
              <div className="col-span-3 border-r-2 border-black p-2 text-center flex flex-col justify-center">
                <div className="font-bold text-sm mb-2">DANFE</div>
                <div className="text-[8px] mb-1">DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA</div>
                <div className="flex justify-center gap-4 text-[9px]">
                  <div className="text-left font-bold">
                    0 - ENTRADA<br/>1 - SAÍDA
                  </div>
                  <div className="border border-black px-3 py-1 text-lg font-bold">1</div>
                </div>
                <div className="mt-2 font-bold">Nº {nota.numero}</div>
                <div className="font-bold text-[9px]">SÉRIE {nota.serie}</div>
              </div>
              <div className="col-span-5 p-2">
                <div className="mb-2">
                  <div className="text-[7px]">CHAVE DE ACESSO</div>
                  <div className="font-mono text-[9px] font-bold">{nota.chaveAcesso || '3523 0300 1234 5600 0112 5500 1000 0012 3415 6789 0123'}</div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-[7px]">Consulta de autenticidade no portal nacional da NF-e</div>
                  <div className="font-bold text-[8px]">www.nfe.fazenda.gov.br/portal ou no site da Sefaz Autorizadora</div>
                </div>
              </div>
            </div>

            {/* Natureza da Operação */}
            <div className="border-2 border-black p-1 mb-1 grid grid-cols-12 items-center">
              <div className="col-span-8">
                <div className="text-[7px]">NATUREZA DA OPERAÇÃO</div>
                <div className="font-bold">{nota.naturezaOperacao}</div>
              </div>
              <div className="col-span-4 border-l-2 border-black pl-2">
                <div className="text-[7px]">PROTOCOLO DE AUTORIZAÇÃO DE USO</div>
                <div className="font-bold">135230006789123 - {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString()}</div>
              </div>
            </div>

            {/* Destinatário / Remetente */}
            <div className="mb-1">
              <div className="text-[8px] font-bold mb-0.5">DESTINATÁRIO / REMETENTE</div>
              <div className="border-2 border-black p-1">
                <div className="grid grid-cols-12 gap-2 border-b border-black pb-1 mb-1">
                  <div className="col-span-8">
                    <div className="text-[7px]">NOME / RAZÃO SOCIAL</div>
                    <div className="font-bold uppercase">{cliente?.nome || 'NÃO INFORMADO'}</div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-[7px]">CNPJ / CPF</div>
                    <div className="font-bold">{cliente?.documento || '---'}</div>
                  </div>
                  <div className="col-span-1">
                    <div className="text-[7px]">DATA EMISSÃO</div>
                    <div className="font-bold">{new Date(nota.dataEmissao).toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <div className="text-[7px]">ENDEREÇO</div>
                    <div className="font-bold uppercase">{cliente?.endereco || 'ZONA RURAL'}</div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-[7px]">BAIRRO / DISTRITO</div>
                    <div className="font-bold uppercase">CENTRO</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[7px]">CEP</div>
                    <div className="font-bold">{cliente?.cep || '00000-000'}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[7px]">DATA SAÍDA</div>
                    <div className="font-bold">{new Date(nota.dataSaida).toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cálculo do Imposto */}
            <div className="mb-1">
              <div className="text-[8px] font-bold mb-0.5">CÁLCULO DO IMPOSTO</div>
              <div className="border-2 border-black">
                <div className="grid grid-cols-5 border-b border-black">
                  <div className="border-r border-black p-1">
                    <div className="text-[7px]">BASE DE CÁLC. ICMS</div>
                    <div className="text-right font-bold">R$ {nota.valorProdutos.toLocaleString()}</div>
                  </div>
                  <div className="border-r border-black p-1">
                    <div className="text-[7px]">VALOR DO ICMS</div>
                    <div className="text-right font-bold">R$ {nota.valorIcms.toLocaleString()}</div>
                  </div>
                  <div className="border-r border-black p-1">
                    <div className="text-[7px]">BASE CÁLC. ICMS ST</div>
                    <div className="text-right font-bold">R$ 0,00</div>
                  </div>
                  <div className="border-r border-black p-1">
                    <div className="text-[7px]">VALOR DO ICMS ST</div>
                    <div className="text-right font-bold">R$ 0,00</div>
                  </div>
                  <div className="p-1">
                    <div className="text-[7px]">VALOR TOTAL DOS PRODUTOS</div>
                    <div className="text-right font-bold">R$ {nota.valorProdutos.toLocaleString()}</div>
                  </div>
                </div>
                <div className="grid grid-cols-5">
                  <div className="border-r border-black p-1">
                    <div className="text-[7px]">VALOR DO FRETE</div>
                    <div className="text-right font-bold">R$ {nota.valorFrete.toLocaleString()}</div>
                  </div>
                  <div className="border-r border-black p-1">
                    <div className="text-[7px]">VALOR DO SEGURO</div>
                    <div className="text-right font-bold">R$ {nota.valorSeguro.toLocaleString()}</div>
                  </div>
                  <div className="border-r border-black p-1">
                    <div className="text-[7px]">DESCONTO</div>
                    <div className="text-right font-bold">R$ {nota.valorDesconto.toLocaleString()}</div>
                  </div>
                  <div className="border-r border-black p-1">
                    <div className="text-[7px]">OUTRAS DESP. ACESS.</div>
                    <div className="text-right font-bold">R$ {nota.valorOutrasDespesas.toLocaleString()}</div>
                  </div>
                  <div className="p-1">
                    <div className="text-[7px]">VALOR TOTAL DA NOTA</div>
                    <div className="text-right font-bold text-[11px]">R$ {nota.valorTotal.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dados do Produto / Serviços */}
            <div className="mb-1 flex-1">
              <div className="text-[8px] font-bold mb-0.5">DADOS DO PRODUTO / SERVIÇOS</div>
              <table className="w-full border-2 border-black border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[7px] font-bold border-b border-black">
                    <th className="border-r border-black p-0.5 text-left w-20">CÓDIGO</th>
                    <th className="border-r border-black p-0.5 text-left">DESCRIÇÃO DO PRODUTO / SERVIÇO</th>
                    <th className="border-r border-black p-0.5 text-center w-8">NCM</th>
                    <th className="border-r border-black p-0.5 text-center w-8">CST</th>
                    <th className="border-r border-black p-0.5 text-center w-8">CFOP</th>
                    <th className="border-r border-black p-0.5 text-center w-8">UNID.</th>
                    <th className="border-r border-black p-0.5 text-center w-12">QTD.</th>
                    <th className="border-r border-black p-0.5 text-center w-14">VLR.UNIT.</th>
                    <th className="p-0.5 text-center w-16">VLR.TOTAL</th>
                  </tr>
                </thead>
                <tbody className="text-[8px]">
                  {nota.itens.map((item: any, idx: number) => (
                    <tr key={idx} className="border-b border-black">
                      <td className="border-r border-black p-0.5">PRD-{item.id?.substring(0,5) || '001'}</td>
                      <td className="border-r border-black p-0.5 uppercase">{item.produto || item.descricao || 'Bovino'}</td>
                      <td className="border-r border-black p-0.5 text-center">01021000</td>
                      <td className="border-r border-black p-0.5 text-center">000</td>
                      <td className="border-r border-black p-0.5 text-center">5405</td>
                      <td className="border-r border-black p-0.5 text-center">{item.unidade || 'UN'}</td>
                      <td className="border-r border-black p-0.5 text-right">{item.quantidade || 0}</td>
                      <td className="border-r border-black p-0.5 text-right">{(item.valorUnitario || 0).toFixed(2)}</td>
                      <td className="text-right p-0.5 font-bold">{(item.valorTotal || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  {/* Linhas vazias para preencher se necessário */}
                  {nota.itens.length < 5 && Array(5 - nota.itens.length).fill(0).map((_, i) => (
                    <tr key={`empty-${i}`} className="border-b border-black h-4">
                      <td className="border-r border-black"></td><td className="border-r border-black"></td>
                      <td className="border-r border-black"></td><td className="border-r border-black"></td>
                      <td className="border-r border-black"></td><td className="border-r border-black"></td>
                      <td className="border-r border-black"></td><td className="border-r border-black"></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Dados Adicionais */}
            <div className="mt-2 grid grid-cols-12 border-2 border-black min-h-[50px]">
              <div className="col-span-8 p-1">
                <div className="text-[7px]">INFORMAÇÕES COMPLEMENTARES</div>
                <div className="text-[8px] whitespace-pre-wrap">{nota.observacoes || 'SEM OBSERVAÇÕES ADICIONAIS.'}</div>
                <div className="mt-2 font-bold text-[7px]">VALOR APROXIMADO DOS TRIBUTOS FEDERAIS E ESTADUAIS (BPT): R$ {(nota.valorTotal * 0.12).toFixed(2)}</div>
              </div>
              <div className="col-span-4 border-l-2 border-black p-1">
                <div className="text-[7px]">RESERVADO AO FISCO</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
