import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta para tratamento de erros
api.interceptors.response.use(
  (response) => {
    // Log em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`[API] Response ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error) => {
    // Log detalhado do erro
    console.error('[API] Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Tratamento de erros específicos
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Mensagem de erro amigável
    let errorMessage = 'Erro ao comunicar com o servidor';
    
    if (error.response?.data) {
      // Se a API retornou uma mensagem específica
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.title) {
        errorMessage = error.response.data.title;
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Tempo de resposta esgotado. Tente novamente.';
    } else if (error.message === 'Network Error') {
      errorMessage = 'Erro de conexão. Verifique sua internet e se a API está rodando.';
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default api;