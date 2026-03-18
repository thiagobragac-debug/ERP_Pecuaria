export interface OFXTransaction {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: 'ENTRADA' | 'SAIDA';
  status: 'PENDENTE' | 'CONCILIADO';
}

export const parseOFX = (ofxString: string): OFXTransaction[] => {
  const transactions: OFXTransaction[] = [];
  
  // Regex to find transaction blocks
  const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;

  while ((match = trnRegex.exec(ofxString)) !== null) {
    const block = match[1];
    
    const type = getTagValue(block, 'TRNTYPE');
    const dateStr = getTagValue(block, 'DTPOSTED');
    const amountStr = getTagValue(block, 'TRNAMT');
    const fitid = getTagValue(block, 'FITID');
    const memo = getTagValue(block, 'MEMO');
    const name = getTagValue(block, 'NAME');

    if (dateStr && amountStr) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      const date = `${year}-${month}-${day}`;
      
      const valor = parseFloat(amountStr.replace(',', '.'));
      const descricao = (memo || name || 'Transação sem descrição').trim();
      
      transactions.push({
        id: fitid || Math.random().toString(36).substr(2, 9),
        data: date,
        descricao,
        valor: Math.abs(valor),
        tipo: valor >= 0 ? 'ENTRADA' : 'SAIDA',
        status: 'PENDENTE'
      });
    }
  }

  return transactions;
};

const getTagValue = (block: string, tag: string): string | null => {
  const regex = new RegExp(`<${tag}>([^<\\n\\r]*)`, 'i');
  const match = block.match(regex);
  return match ? match[1].trim() : null;
};
