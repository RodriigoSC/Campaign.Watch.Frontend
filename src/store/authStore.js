import { create } from 'zustand';
import { authService } from '../services/authService';

// Estado inicial tenta pegar usuário e token do storage
const initialUser = authService.getCurrentUser();
const initialIsAuthenticated = authService.isAuthenticated();

export const useAuthStore = create((set) => ({
  user: initialUser,
  isAuthenticated: initialIsAuthenticated,
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      // Chama o serviço de login real
      const { user } = await authService.login(username, password);
      // Atualiza o estado com o usuário retornado e marca como autenticado
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      // Atualiza o estado com a mensagem de erro
      set({ error: error.message || 'Falha no login', isLoading: false });
      return { success: false, error: error.message || 'Falha no login' };
    }
  },

  logout: () => {
    authService.logout();
    // Limpa o estado
    set({ user: null, isAuthenticated: false, error: null });
  },

  // Função para limpar erros manualmente, se necessário
  clearError: () => set({ error: null }),
}));