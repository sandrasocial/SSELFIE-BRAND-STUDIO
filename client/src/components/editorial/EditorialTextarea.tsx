import React from 'react';

interface EditorialTextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  id?: string;
  name?: string;
  rows?: number;
}

export function EditorialTextarea({ 
  placeholder,
  value,
  onChange,
  disabled = false,
  className = '',
  required = false,
  id,
  name,
  rows = 4,
  ...props 
}: EditorialTextareaProps) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      id={id}
      name={name}
      rows={rows}
      className={`editorial-input w-full resize-none focus:outline-none ${className}`}
      {...props}
    />
  );
}