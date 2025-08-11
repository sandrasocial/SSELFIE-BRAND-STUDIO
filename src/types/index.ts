// Base Types for the Project

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MEMBER = 'MEMBER'
}

// Authentication Types
export interface AuthResponse {
  token: string;
  user: User;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Database Types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern';
  value?: any;
  message: string;
}