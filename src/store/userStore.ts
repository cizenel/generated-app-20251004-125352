import { create } from 'zustand';
import { User, AuthUser } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { t } from '@/lib/i18n';
type UserState = {
  users: AuthUser[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<AuthUser | undefined>;
  updateUser: (userId: string, user: Partial<User>) => Promise<AuthUser | undefined>;
  deleteUser: (userId: string) => Promise<void>;
};
export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api<{ items: AuthUser[] }>('/api/users');
      set({ users: data.items, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      set({ error: errorMessage, isLoading: false });
      toast.error(t.fetchUsersError);
    }
  },
  addUser: async (userData) => {
    set({ isLoading: true });
    try {
      const newUser = await api<AuthUser>('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      set((state) => ({
        users: [...state.users, newUser],
        isLoading: false,
      }));
      toast.success(t.userAddedSuccess);
      return newUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add user';
      set({ error: errorMessage, isLoading: false });
      toast.error(t.userAddedError + `: ${errorMessage}`);
      return undefined;
    }
  },
  updateUser: async (userId, userData) => {
    set({ isLoading: true });
    try {
      const updatedUser = await api<AuthUser>(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      set((state) => ({
        users: state.users.map((u) => (u.id === userId ? updatedUser : u)),
        isLoading: false,
      }));
      toast.success(t.userUpdatedSuccess);
      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      set({ error: errorMessage, isLoading: false });
      toast.error(t.userUpdatedError + `: ${errorMessage}`);
      return undefined;
    }
  },
  deleteUser: async (userId) => {
    set({ isLoading: true });
    try {
      await api(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      set((state) => ({
        users: state.users.filter((u) => u.id !== userId),
        isLoading: false,
      }));
      toast.success(t.userDeletedSuccess);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
      set({ error: errorMessage, isLoading: false });
      toast.error(t.userDeletedError + `: ${errorMessage}`);
    }
  },
}));