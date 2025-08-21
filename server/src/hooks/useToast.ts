import { useToast as useToastUI } from '@/components/ui/toast';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

export const useToast = () => {
  const { toast: showToast } = useToastUI();

  const toast = (options: ToastOptions) => {
    showToast({
      title: options.title,
      description: options.description,
      variant: options.variant || 'default'
    });
  };

  return { toast };
};