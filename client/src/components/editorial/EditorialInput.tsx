import React from 'react';

interface EditorialInputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  id?: string;
  name?: string;
}

export function EditorialInput({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  className = '',
  required = false,
  id,
  name,
  ...props 
}: EditorialInputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      id={id}
      name={name}
      className={`editorial-input w-full focus:outline-none ${className}`}
      {...props}
    />
  );
}