// Shared types for the application
export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}