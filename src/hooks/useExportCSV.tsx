
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VisitData {
  id: string;
  cliente_nome: string;
  cliente_cpf: string;
  cliente_whatsapp?: string;
  corretor_nome: string;
  corretor_id: string;
  empreendimento?: string;
  loja: string;
  andar: string;
  mesa: number;
  status: string;
  horario_entrada: string;
  horario_saida?: string;
  created_at: string;
}

export function useExportCSV() {
  const exportToCSV = (data: VisitData[], filename = 'visitas-finalizadas.csv') => {
    if (!data.length) return;

    // Cabeçalhos do CSV com todos os campos
    const headers = [
      'ID',
      'Cliente',
      'CPF',
      'WhatsApp',
      'Corretor',
      'ID Corretor',
      'Empreendimento',
      'Loja',
      'Andar',
      'Mesa',
      'Status',
      'Entrada',
      'Saída',
      'Data Criação'
    ];

    // Converter dados para CSV
    const csvContent = [
      headers.join(','),
      ...data.map(visit => [
        visit.id,
        `"${visit.cliente_nome}"`,
        visit.cliente_cpf,
        visit.cliente_whatsapp || '',
        `"${visit.corretor_nome}"`,
        visit.corretor_id,
        visit.empreendimento ? `"${visit.empreendimento}"` : '',
        `"${visit.loja}"`,
        visit.andar,
        visit.mesa,
        visit.status,
        format(new Date(visit.horario_entrada), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        visit.horario_saida ? format(new Date(visit.horario_saida), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '',
        format(new Date(visit.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })
      ].join(','))
    ].join('\n');

    // Criar e baixar arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { exportToCSV };
}
