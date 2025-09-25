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
    <div className="space-y-3">
      <Label className="text-base font-medium">
        {question}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={`${question}-${index}`} />
            <Label htmlFor={`${question}-${index}`} className="text-sm cursor-pointer">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}