import { SalesInvoice } from '../types';

export interface TransmissionResult {
  success: boolean;
  status: 'Autorizada' | 'Rejeitada';
  cStat?: string;
  xMotivo?: string;
  chaveAcesso?: string;
  nProt?: string;
  xml?: string;
}

/**
 * Service to simulate NF-e transmission logic (SEFAZ v4.00)
 * Integrated with Pecuária 4.0 Sales Module
 */
export const nfeService = {
  /**
   * Simulates the transmission of an invoice to SEFAZ
   */
  async transmitInvoice(invoice: Partial<SalesInvoice>): Promise<TransmissionResult> {
    console.log('Initiating NF-e Transmission for Invoice:', invoice.numero);
    
    // Simulate connection delay
    const delay = 1500 + Math.random() * 1500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Simulation logic: 90% success rate
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      // Generate a realistic 44-digit Access Key (Fake for demo)
      const state = '35'; // SP
      const year = new Date().getFullYear().toString().substring(2);
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const cnpj = '00123456000199';
      const mod = '55';
      const serie = (invoice.serie || '001').padStart(3, '0');
      const number = (invoice.numero || '000001').padStart(9, '0');
      const tpEmis = '1';
      const code = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
      
      const chaveAcesso = `${state}${year}${month}${cnpj}${mod}${serie}${number}${tpEmis}${code}`;
      const nProt = `1${Date.now().toString().substring(3)}`; // 15 digits fake protocol

      return {
        success: true,
        status: 'Autorizada',
        cStat: '100',
        xMotivo: 'Autorizado o uso da NF-e',
        chaveAcesso,
        nProt,
        xml: `<?xml version="1.0" encoding="UTF-8"?><nfeProc version="4.00">...</nfeProc>`
      };
    } else {
      // Simulate common SEFAZ rejection codes
      const rejections = [
        { code: '703', reason: 'Rejeição: Data de Emissão futura' },
        { code: '204', reason: 'Rejeição: Duplicidade de NF-e (Chave de Acesso)' },
        { code: '610', reason: 'Rejeição: Valor Total da NF-e difere do somatório dos Itens' },
        { code: '215', reason: 'Rejeição: Falha no esquema XML ou campo a mais/a menos' }
      ];
      
      const error = rejections[Math.floor(Math.random() * rejections.length)];

      return {
        success: false,
        status: 'Rejeitada',
        cStat: error.code,
        xMotivo: error.reason
      };
    }
  }
};
