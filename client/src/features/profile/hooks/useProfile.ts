import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../../lib/api.js';

export type UserSettings = {
  notifications: {
    photoComplete: boolean;
    mayaUpdates: 'off' | 'daily' | 'weekly';
    tips: boolean;
  };
  photoQuality: {
    resolution: 'standard' | 'high';
    autoEnhance: boolean;
    backgroundRemoval: 'off' | 'auto';
  };
  account: {
    profileVisibility: 'private' | 'public';
    dataBackup: 'cloud' | 'local';
    photoSharing: boolean;
  };
};

export function useProfileSummary() {
  return useQuery({
    queryKey: ['/api/user/profile'],
    queryFn: async () => {
      return await apiFetch('/user/profile');
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useRecentImages(limit = 6) {
  return useQuery({
    queryKey: ['/api/user/recent-images', limit],
    queryFn: async () => {
      const data = await apiFetch(`/user/recent-images?limit=${limit}`);
      return (data?.images ?? []) as Array<{ id: number; url: string; createdAt?: string }>;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useUserSettings() {
  const qc = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['/api/user/settings'],
    queryFn: async () => {
      const data = await apiFetch('/user/settings');
      return (data?.settings ?? {}) as UserSettings;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      const resp = await apiFetch('/user/settings', {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return resp?.settings as UserSettings;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/user/settings'] });
    }
  });

  return { ...settingsQuery, updateSettings };
}

