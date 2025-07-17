import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface RollbackButtonProps {
  filePath: string;
  className?: string;
}

export function RollbackButton({ filePath, className }: RollbackButtonProps) {
  const [isRollingBack, setIsRollingBack] = useState(false);
  const { toast } = useToast();

  const handleRollback = async () => {
    if (!confirm(`Are you sure you want to rollback ${filePath}? This will restore the previous version.`)) {
      return;
    }

    setIsRollingBack(true);
    try {
      const response = await apiRequest('POST', '/api/admin/rollback-file', {
        filePath,
        adminToken: 'sandra-admin-2025'
      });

      if (response.ok) {
        toast({
          title: "File Rolled Back",
          description: `${filePath} has been restored to its previous version.`,
        });
        
        // Trigger page reload to show changes
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error('Rollback failed');
      }
    } catch (error) {
      toast({
        title: "Rollback Failed",
        description: "Could not rollback the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRollingBack(false);
    }
  };

  return (
    <Button
      onClick={handleRollback}
      disabled={isRollingBack}
      variant="outline"
      size="sm"
      className={`border-red-200 text-red-600 hover:bg-red-50 ${className}`}
    >
      {isRollingBack ? 'Rolling back...' : 'Rollback'}
    </Button>
  );
}