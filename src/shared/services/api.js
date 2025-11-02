// src/shared/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:5001/api';

// Cache simples em memória
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Configuração do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper para cache
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

// Limpar cache periodicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}, CACHE_DURATION);

// Interceptor de requisição
api.interceptors.request.use(
  (config) => {
    // Adicionar token de autenticação
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Verificar cache para requisições GET
    if (config.method === 'get' && config.useCache !== false) {
      const cacheKey = `${config.url}?${JSON.stringify(config.params || {})}`;
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        config.adapter = () => Promise.resolve({
          data: cachedData,
          status: 200,
          statusText: 'OK (cached)',
          headers: {},
          config,
        });
      }
    }

    // Log em desenvolvimento
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

// Interceptor de resposta com retry automático
api.interceptors.response.use(
  (response) => {
    // Salvar no cache se for GET
    if (response.config.method === 'get' && response.config.useCache !== false) {
      const cacheKey = `${response.config.url}?${JSON.stringify(response.config.params || {})}`;
      setCachedData(cacheKey, response.data);
    }

    if (import.meta.env.DEV) {
      console.log(`[API] Response ${response.config.url}:`, response.status);
    }

    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log do erro
    console.error('[API] Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Retry automático para erros de rede (máximo 3 tentativas)
    if (
      error.code === 'ECONNABORTED' || 
      error.message === 'Network Error'
    ) {
      originalRequest._retry = (originalRequest._retry || 0) + 1;
      
      if (originalRequest._retry <= 3) {
        console.log(`[API] Retrying request (${originalRequest._retry}/3)...`);
        
        // Aguardar antes de tentar novamente (backoff exponencial)
        await new Promise(resolve => 
          setTimeout(resolve, originalRequest._retry * 1000)
        );
        
        return api(originalRequest);
      }
    }

    // Tratamento de autenticação
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      
      return Promise.reject(new Error('Sessão expirada. Faça login novamente.'));
    }

    // Formatação de mensagem de erro
    let errorMessage = 'Erro ao comunicar com o servidor.';
    
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.title) {
        errorMessage = error.response.data.title;
        
        if (error.response.data.errors) {
          const validationErrors = Object.values(error.response.data.errors)
            .flat()
            .join(', ');
          errorMessage += `: ${validationErrors}`;
        }
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Tempo de resposta esgotado. Tente novamente.';
    } else if (error.message === 'Network Error') {
      errorMessage = 'Erro de conexão. Verifique sua internet.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return Promise.reject(new Error(errorMessage));
  }
);

// Função para limpar cache manualmente
api.clearCache = () => {
  cache.clear();
  console.log('[API] Cache cleared');
};

// Função para pré-carregar dados (prefetch)
api.prefetch = async (url, params) => {
  try {
    await api.get(url, { params, useCache: true });
  } catch (error) {
    console.warn('[API] Prefetch failed:', error.message);
  }
};

export default api;