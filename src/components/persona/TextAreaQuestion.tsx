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
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">
        {question}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Sua resposta..."}
        rows={3}
        required={required}
      />
    </div>
  );
}