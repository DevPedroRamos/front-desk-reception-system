import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface RadioQuestionProps {
  question: string;
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function RadioQuestion({ question, options, value, onChange, required }: RadioQuestionProps) {
  return (
    <div className="space-y-4">
      <Label className="text-lg font-medium text-metrocasa-gray">
        {question}
        {required && <span className="text-metrocasa-red ml-1">*</span>}
      </Label>
      
      <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-metrocasa-gray-light transition-colors">
            <RadioGroupItem 
              value={option} 
              id={`${question}-${index}`}
              className="border-metrocasa-red data-[state=checked]:bg-metrocasa-red data-[state=checked]:border-metrocasa-red"
            />
            <Label htmlFor={`${question}-${index}`} className="cursor-pointer flex-1 text-base">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}