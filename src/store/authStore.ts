import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser, LoginPayload } from '@shared/types';
import { api } from '@/lib/api-client';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: async (credentials) => {
        try {
          const { user } = await api<{ user: AuthUser }>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
          });
          if (!user.isActive) {
            throw new Error(t.inactiveUserError);
          }
          set({ user, isAuthenticated: true });
          toast.success(t.loginSuccess);
        } catch (error) {
          const message = (error instanceof Error && error.message) ? error.message : t.loginError;
          toast.error(message);
          throw error;
        }
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      checkAuth: async () => {
        // This function can be used to verify the user's session on app load if a token system were in place.
        // For this mock, we just trust the persisted state. If there's a user, we assume they are auth'd.
        const { user } = get();
        if (user) {
          set({ isAuthenticated: true, isLoading: false });
        } else {
          set({ isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);