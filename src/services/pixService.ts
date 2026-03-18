/**
 * Lógica para geração de QR Code PIX Estático (BR Code)
 * Baseado no padrão EMV QRCPS do Banco Central do Brasil.
 */

export const pixService = {
  /**
   * Gera o código "Copia e Cola" do PIX.
   */
  generateStaticPix(params: {
    chave: string;
    beneficiario: string;
    cidade: string;
    valor: number;
    txtId?: string;
  }): string {
    const { chave, beneficiario, cidade, valor, txtId = '***' } = params;

    const parts = [
      this.formatField('00', '01'), // Payload Format Indicator
      this.formatMerchantInfo(chave), // Merchant Account Information
      this.formatField('52', '0000'), // Merchant Category Code
      this.formatField('53', '986'),  // Transaction Currency (BRL)
      this.formatField('54', valor.toFixed(2)), // Transaction Amount
      this.formatField('58', 'BR'),   // Country Code
      this.formatField('59', this.normalizeText(beneficiario).substring(0, 25)), // Merchant Name
      this.formatField('60', this.normalizeText(cidade).substring(0, 15)), // Merchant City
      this.formatAdditionalData(txtId), // Additional Data Field Template
    ];

    const payload = parts.join('') + '6304';
    const crc = this.calculateCRC16(payload);
    
    return payload + crc;
  },

  /**
   * Formata um campo no padrão EMV (ID + Tamanho + Valor)
   */
  formatField(id: string, value: string): string {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  },

  /**
   * Formata as informações do beneficiário (ID 26)
   */
  formatMerchantInfo(chave: string): string {
    const gui = this.formatField('00', 'br.gov.bcb.pix');
    const key = this.formatField('01', chave);
    return this.formatField('26', gui + key);
  },

  /**
   * Formata dados adicionais (ID 62)
   */
  formatAdditionalData(txtId: string): string {
    const field = this.formatField('05', txtId);
    return this.formatField('62', field);
  },

  /**
   * Remove acentos e caracteres especiais (PIX aceita apenas ASCII)
   */
  normalizeText(text: string): string {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  },

  /**
   * Cálculo de Checksum CRC16 CCITT (0xFFFF)
   */
  calculateCRC16(payload: string): string {
    let crc = 0xFFFF;
    const polynomial = 0x1021;

    for (let i = 0; i < payload.length; i++) {
        const charCode = payload.charCodeAt(i);
        crc ^= (charCode << 8);
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ polynomial;
            } else {
                crc <<= 1;
            }
        }
    }

    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  },

  /**
   * Retorna a URL do QR Code usando o serviço goqr.me
   */
  getQrCodeUrl(pixCode: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`;
  }
};
