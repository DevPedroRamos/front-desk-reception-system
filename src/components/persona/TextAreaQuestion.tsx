import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TextAreaQuestionProps {
  question: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

export function TextAreaQuestion({ 
  question, 
  value, 
  onChange, 
  required, 
  placeholder 
}: TextAreaQuestionProps) {
  const maxLength = 500;
  const currentLength = value.length;

  return (
    <div className="space-y-4">
      <Label className="text-lg font-medium text-metrocasa-gray">
        {question}
        {required && <span className="text-metrocasa-red ml-1">*</span>}
      </Label>
      
      <div className="space-y-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Digite sua resposta aqui..."}
          rows={4}
          required={required}
          maxLength={maxLength}
          className="resize-none border-2 focus:border-metrocasa-red"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Seja específico em sua resposta</span>
          <span className={currentLength > maxLength * 0.9 ? 'text-metrocasa-red' : ''}>
            {currentLength}/{maxLength}
          </span>
        </div>
      </div>
    </div>
  );
}