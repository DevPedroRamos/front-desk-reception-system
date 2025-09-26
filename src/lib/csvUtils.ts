import { PersonaAdminData } from '@/hooks/usePersonaAdminData';

// Comprehensive mapping of all questionnaire fields
export const PERSONA_COLUMN_MAPPING: Record<string, string> = {
  // Basic info
  'nome': 'Nome',
  'cpf': 'CPF',
  'email': 'Email',
  'superintendencia': 'Superintendência',
  'gerencia': 'Gerência',
  'created_at': 'Data de Submissão',
  
  // Dados Pessoais
  'idade': 'Idade',
  'sexo': 'Sexo',
  'estado_civil': 'Estado Civil',
  'profissao': 'Profissão',
  'renda_familiar': 'Renda Familiar',
  'escolaridade': 'Escolaridade',
  'tem_filhos': 'Tem Filhos',
  'numero_filhos': 'Número de Filhos',
  
  // Estilo de Vida
  'exercicios_fisicos': 'Pratica Exercícios Físicos',
  'frequencia_viagens': 'Frequência de Viagens',
  'frequencia_praias_parques': 'Frequência Praias/Parques',
  'canais_comunicacao': 'Canais de Comunicação Preferidos',
  'receber_informacoes': 'Prefere Receber Informações Por',
  
  // Experiência Profissional
  'area_atuacao': 'Área de Atuação',
  'tempo_experiencia': 'Tempo de Experiência',
  'interesse_mudanca': 'Interesse em Mudança de Carreira',
  'habilidades': 'Principais Habilidades',
  
  // Experiência Imobiliária
  'experiencia_imobiliaria': 'Experiência no Mercado Imobiliário',
  'tipo_imovel_anterior': 'Tipo de Imóvel Anterior',
  'motivacao_principal': 'Principal Motivação',
  'orcamento': 'Orçamento',
  'regiao_preferencia': 'Região de Preferência',
  'caracteristicas_importantes': 'Características Importantes',
  'forma_pagamento': 'Forma de Pagamento Preferida'
};

export function flattenPersonaResponse(response: PersonaAdminData): Record<string, any> {
  const flattened: Record<string, any> = {
    nome: response.nome,
    cpf: response.cpf,
    email: response.email,
    superintendencia: response.superintendencia,
    gerencia: response.gerencia,
    created_at: response.created_at
  };

  // Flatten nested responses
  const respostas = response.respostas || {};
  
  // Handle direct properties
  Object.keys(respostas).forEach(key => {
    const value = respostas[key];
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Handle nested objects (sections)
      Object.keys(value).forEach(nestedKey => {
        const nestedValue = value[nestedKey];
        if (Array.isArray(nestedValue)) {
          flattened[nestedKey] = nestedValue.join(', ');
        } else {
          flattened[nestedKey] = nestedValue;
        }
      });
    } else if (Array.isArray(value)) {
      flattened[key] = value.join(', ');
    } else {
      flattened[key] = value;
    }
  });

  return flattened;
}

export function generateCSV(data: PersonaAdminData[]): string {
  if (data.length === 0) return '';

  // Get all possible columns from all records
  const allColumns = new Set<string>();
  data.forEach(record => {
    const flattened = flattenPersonaResponse(record);
    Object.keys(flattened).forEach(key => allColumns.add(key));
  });

  // Create headers using mapping
  const columns = Array.from(allColumns);
  const headers = columns.map(col => PERSONA_COLUMN_MAPPING[col] || col);
  
  // Create CSV content
  const csvRows = [headers.join(',')];
  
  data.forEach(record => {
    const flattened = flattenPersonaResponse(record);
    const row = columns.map(col => {
      const value = flattened[col] || '';
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function getExportFilename(type: string, filters?: any): string {
  const timestamp = new Date().toISOString().split('T')[0];
  
  switch (type) {
    case 'all':
      return `persona-questionarios-todos-${timestamp}.csv`;
    case 'superintendencia':
      return `persona-questionarios-${filters?.superintendencia || 'superintendencia'}-${timestamp}.csv`;
    case 'gerente':
      return `persona-questionarios-${filters?.gerente || 'gerente'}-${timestamp}.csv`;
    case 'filtered':
    default:
      return `persona-questionarios-filtrados-${timestamp}.csv`;
  }
}