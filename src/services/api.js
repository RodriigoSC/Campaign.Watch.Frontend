import axios from 'axios';

// Garanta que VITE_API_URL esteja definida no seu .env ou ambiente
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição (mantém igual)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    }
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta (CORRIGIDO)
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      // Log mostra o status e a URL antes de retornar apenas os dados
      console.log(`[API] Response ${response.config.url}:`, response.status, response.data);
    }
    // *** CORREÇÃO AQUI: Retorna apenas os dados da resposta ***
    return response.data;
  },
  (error) => {
    console.error('[API] Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
         window.location.href = '/login';
      }
      return Promise.reject(new Error('Sessão expirada ou inválida. Faça login novamente.'));
    }

    let errorMessage = 'Erro ao comunicar com o servidor. Tente novamente mais tarde.';
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.title) {
        errorMessage = error.response.data.title;
        if (error.response.data.errors) {
          const validationErrors = Object.values(error.response.data.errors).flat().join(' ');
          errorMessage += ` Detalhes: ${validationErrors}`;
        }
      } else if (typeof error.response.data === 'object') {
        errorMessage = JSON.stringify(error.response.data);
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Tempo de resposta esgotado. Verifique sua conexão ou tente novamente.';
    } else if (error.message === 'Network Error') {
      errorMessage = 'Erro de conexão. Verifique sua internet e se a API está acessível.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default api;