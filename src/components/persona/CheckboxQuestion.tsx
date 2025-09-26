import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface CheckboxQuestionProps {
  question: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
}

export function CheckboxQuestion({ question, options, value, onChange, required }: CheckboxQuestionProps) {
  const handleOptionChange = (option: string, checked: boolean) => {
    if (checked) {
      onChange([...value, option]);
    } else {
      onChange(value.filter(v => v !== option));
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-lg font-medium text-metrocasa-gray">
        {question}
        {required && <span className="text-metrocasa-red ml-1">*</span>}
      </Label>
      
      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-metrocasa-gray-light transition-colors">
            <Checkbox
              id={`${question}-${index}`}
              checked={value.includes(option)}
              onCheckedChange={(checked) => handleOptionChange(option, !!checked)}
              className="border-metrocasa-red data-[state=checked]:bg-metrocasa-red data-[state=checked]:border-metrocasa-red"
            />
            <Label htmlFor={`${question}-${index}`} className="cursor-pointer flex-1 text-base">
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}