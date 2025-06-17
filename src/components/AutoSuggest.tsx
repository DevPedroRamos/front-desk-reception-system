
import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Option {
  id: string;
  name: string;
}

interface AutoSuggestProps {
  label: string;
  placeholder: string;
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  loading?: boolean;
}

export const AutoSuggest = ({ 
  label, 
  placeholder, 
  options, 
  value, 
  onValueChange, 
  required = false,
  loading = false 
}: AutoSuggestProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const filtered = options.filter(option =>
        option.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions([]);
    }
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onValueChange(newValue);
    setIsOpen(newValue.length > 0);
  };

  const handleOptionSelect = (option: Option) => {
    onValueChange(option.name);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label htmlFor={label.toLowerCase().replace(' ', '_')}>
        {label} {required && '*'}
      </Label>
      <div className="relative">
        <Input
          id={label.toLowerCase().replace(' ', '_')}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => value.length > 0 && setIsOpen(true)}
          required={required}
          disabled={loading}
        />
        {isOpen && filteredOptions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => handleOptionSelect(option)}
              >
                {option.name}
              </div>
            ))}
          </div>
        )}
        {isOpen && filteredOptions.length === 0 && value.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="px-4 py-2 text-sm text-gray-500">
              Nenhuma opção encontrada
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
