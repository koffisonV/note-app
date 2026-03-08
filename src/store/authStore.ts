import { create } from 'zustand';
import {
  signIn,
  signUp,
  signOut,
  confirmSignUp,
  getCurrentUser,
  type SignInInput,
  type SignUpInput,
  type ConfirmSignUpInput,
} from 'aws-amplify/auth';

interface AuthUser {
  userId: string;
  email: string;
}

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  confirmAccount: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const currentUser = await getCurrentUser();
      set({
        user: {
          userId: currentUser.userId,
          email: currentUser.signInDetails?.loginId ?? '',
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const input: SignInInput = { username: email, password };
      await signIn(input);
      const currentUser = await getCurrentUser();
      set({
        user: {
          userId: currentUser.userId,
          email: currentUser.signInDetails?.loginId ?? email,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
      throw e;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const input: SignUpInput = {
        username: email,
        password,
        options: { userAttributes: { email } },
      };
      const result = await signUp(input);
      set({ isLoading: false });
      return {
        needsConfirmation: result.nextStep.signUpStep === 'CONFIRM_SIGN_UP',
      };
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
      throw e;
    }
  },

  confirmAccount: async (email, code) => {
    set({ isLoading: true, error: null });
    try {
      const input: ConfirmSignUpInput = {
        username: email,
        confirmationCode: code,
      };
      await confirmSignUp(input);
      set({ isLoading: false });
    } catch (e) {
      set({ isLoading: false, error: (e as Error).message });
      throw e;
    }
  },

  logout: async () => {
    try {
      await signOut();
    } finally {
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));
