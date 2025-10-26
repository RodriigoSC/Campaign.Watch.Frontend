import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';

// ==========================================
// Formatação de Datas
// ==========================================

/**
 * Converte string de data da API (UTC) para objeto Date local
 */
export const parseApiDate = (dateString) => {
  if (!dateString) return null;
  try {
    return typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
  } catch {
    return null;
  }
};

/**
 * Formata data para enviar à API (ISO UTC)
 */
export const formatApiDate = (date) => {
  if (!date) return null;
  try {
    return new Date(date).toISOString();
  } catch {
    return null;
  }
};

/**
 * Formata data para exibição
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '-';
  try {
    const parsedDate = parseApiDate(date);
    if (!parsedDate) return '-';
    return format(parsedDate, formatStr, { locale: ptBR });
  } catch {
    return '-';
  }
};

/**
 * Formata data e hora para exibição
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

/**
 * Formata data e hora completa
 */
export const formatDateTimeFull = (date) => {
  return formatDate(date, 'dd/MM/yyyy HH:mm:ss');
};

/**
 * Formata data relativa (ex: "há 5 minutos")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-';
  
  try {
    const parsedDate = parseApiDate(date);
    if (!parsedDate) return '-';
    
    const now = new Date();
    const diffMs = now - parsedDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'agora';
    if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    
    return formatDate(date);
  } catch {
    return '-';
  }
};

// ==========================================
// Formatação de Números
// ==========================================

/**
 * Formata número com separadores de milhar
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('pt-BR').format(num);
};

/**
 * Formata número como moeda (Real)
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata percentual
 */
export const formatPercentage = (value, total = 100, decimals = 1) => {
  if (value === null || value === undefined || !total || total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Formata bytes para tamanho legível
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// ==========================================
// Utilitários de Classes CSS
// ==========================================

/**
 * Combina classes CSS condicionalmente
 */
export const cn = (...inputs) => {
  return clsx(inputs);
};

// ==========================================
// Status Helpers
// ==========================================

/**
 * Retorna a cor associada a um status
 */
export const getStatusColor = (status) => {
  const statusColors = {
    // Campaign Status
    'Concluída': 'success',
    'Concluído': 'success',
    'Completo': 'success',
    'Em Execução': 'primary',
    'Em andamento': 'primary',
    'Executando': 'primary',
    'Agendada': 'warning',
    'Agendado': 'warning',
    'Pendente': 'warning',
    'Erro': 'error',
    'Falha': 'error',
    'Failed': 'error',
    'Cancelada': 'error',
    'Cancelado': 'error',
    
    // Monitoring Status
    'WaitingForNextExecution': 'primary',
    'Aguardando próxima execução': 'primary',
    'InProgress': 'primary',
    'Pending': 'warning',
    'ExecutionDelayed': 'error',
    'Execução atrasada': 'error',
  };
  
  return statusColors[status] || 'gray';
};

/**
 * Retorna as classes CSS para um badge de status
 */
export const getStatusBadgeClass = (status) => {
  const color = getStatusColor(status);
  const classes = {
    success: 'bg-success-100 text-success-700 border-success-200',
    primary: 'bg-primary-100 text-primary-700 border-primary-200',
    warning: 'bg-warning-100 text-warning-700 border-warning-200',
    error: 'bg-error-100 text-error-700 border-error-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return classes[color];
};

// ==========================================
// Cálculo de Métricas
// ==========================================

/**
 * Calcula taxa de sucesso
 */
export const calculateSuccessRate = (success, total) => {
  if (!total || total === 0) return 0;
  return ((success / total) * 100).toFixed(1);
};

/**
 * Calcula latência média
 */
export const calculateAverageLatency = (executions) => {
  if (!executions || executions.length === 0) return 0;
  const totalLatency = executions.reduce(
    (sum, exec) => sum + (exec.startLatencyInSeconds || 0), 
    0
  );
  return (totalLatency / executions.length).toFixed(2);
};

/**
 * Calcula duração média
 */
export const calculateAverageDuration = (executions) => {
  if (!executions || executions.length === 0) return 0;
  const totalDuration = executions.reduce(
    (sum, exec) => sum + (exec.totalDurationInSeconds || 0), 
    0
  );
  return (totalDuration / executions.length).toFixed(2);
};

// ==========================================
// Manipulação de Strings
// ==========================================

/**
 * Trunca texto com reticências
 */
export const truncate = (str, length = 50) => {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

/**
 * Capitaliza primeira letra
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Converte snake_case ou kebab-case para Title Case
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

// ==========================================
// Debounce e Throttle
// ==========================================

/**
 * Debounce de função
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle de função
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ==========================================
// Validações
// ==========================================

/**
 * Valida email
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Valida URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida ObjectId do MongoDB
 */
export const isValidObjectId = (id) => {
  return /^[a-f\d]{24}$/i.test(id);
};

// ==========================================
// Helpers de Array
// ==========================================

/**
 * Agrupa array por propriedade
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Remove duplicatas de array
 */
export const unique = (array) => {
  return [...new Set(array)];
};

/**
 * Ordena array por propriedade
 */
export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// ==========================================
// Storage Helpers
// ==========================================

/**
 * Salva no localStorage com tratamento de erro
 */
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
    return false;
  }
};

/**
 * Obtém do localStorage com tratamento de erro
 */
export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Erro ao ler do localStorage:', error);
    return defaultValue;
  }
};

/**
 * Remove do localStorage
 */
export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Erro ao remover do localStorage:', error);
    return false;
  }
};

// ==========================================
// Download Helpers
// ==========================================

/**
 * Faz download de arquivo
 */
export const downloadFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Exporta dados como CSV
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(val => 
      typeof val === 'string' && val.includes(',') ? `"${val}"` : val
    ).join(',')
  );
  
  const csv = [headers, ...rows].join('\n');
  downloadFile(csv, filename, 'text/csv');
};

export default {
  // Datas
  parseApiDate,
  formatApiDate,
  formatDate,
  formatDateTime,
  formatDateTimeFull,
  formatRelativeTime,
  
  // Números
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatBytes,
  
  // Classes
  cn,
  
  // Status
  getStatusColor,
  getStatusBadgeClass,
  
  // Métricas
  calculateSuccessRate,
  calculateAverageLatency,
  calculateAverageDuration,
  
  // Strings
  truncate,
  capitalize,
  toTitleCase,
  
  // Performance
  debounce,
  throttle,
  
  // Validações
  isValidEmail,
  isValidUrl,
  isValidObjectId,
  
  // Arrays
  groupBy,
  unique,
  sortBy,
  
  // Storage
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  
  // Download
  downloadFile,
  exportToCSV,
};