import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;
if (!API_BASE_URL) {
  console.error("ERRO FATAL: VITE_API_URL não está definida no arquivo .env");
}

const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT 
  ? parseInt(import.meta.env.VITE_API_TIMEOUT, 10) 
  : 30000;

const CACHE_DURATION = import.meta.env.VITE_CACHE_DURATION 
  ? parseInt(import.meta.env.VITE_CACHE_DURATION, 10) 
  : 5 * 60 * 1000;

const MAX_RETRIES = import.meta.env.VITE_MAX_RETRIES
  ? parseInt(import.meta.env.VITE_MAX_RETRIES, 10)
  : 3; 


const cache = new Map();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});


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

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}, CACHE_DURATION);


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

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

api.interceptors.response.use(
  (response) => {
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

    console.error('[API] Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (
      (error.code === 'ECONNABORTED' || error.message === 'Network Error') &&
      !originalRequest._isRetry
    ) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      originalRequest._isRetry = true;
      
      if (originalRequest._retryCount <= MAX_RETRIES) { 
        console.log(`[API] Retrying request (${originalRequest._retryCount}/${MAX_RETRIES})...`);        
     
        await new Promise(resolve => 
          setTimeout(resolve, originalRequest._retryCount * 1000)
        );
        
        return api(originalRequest);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      
      return Promise.reject(new Error('Sessão expirada. Faça login novamente.'));
    }

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

// --- Funções Utilitárias da API ---

// Função para limpar cache manualmente (usada após POST/PUT/DELETE)
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