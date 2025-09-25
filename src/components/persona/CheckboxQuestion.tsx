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
    <div className="space-y-3">
      <Label className="text-base font-medium">
        {question}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              id={`${question}-${index}`}
              checked={value.includes(option)}
              onCheckedChange={(checked) => handleOptionChange(option, !!checked)}
            />
            <Label htmlFor={`${question}-${index}`} className="text-sm cursor-pointer">
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}