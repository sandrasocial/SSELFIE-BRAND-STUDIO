// Component Types

import { ReactNode } from 'react';

// Base Props
export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

// Button Props
export interface ButtonProps extends BaseProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

// Input Props
export interface InputProps extends BaseProps {
  type?: 'text' | 'password' | 'email' | 'number';
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// Form Props
export interface FormProps extends BaseProps {
  onSubmit: (data: any) => void;
  defaultValues?: Record<string, any>;
  validationSchema?: any;
}

// Card Props
export interface CardProps extends BaseProps {
  title?: string;
  footer?: ReactNode;
  bordered?: boolean;
}

// Layout Props
export interface LayoutProps extends BaseProps {
  header?: ReactNode;
  footer?: ReactNode;
  sidebar?: ReactNode;
}