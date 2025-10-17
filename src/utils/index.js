import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';

// Formatação de datas
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '-';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, formatStr, { locale: ptBR });
  } catch {
    return '-';
  }
};

export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

// Formatação de números
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('pt-BR').format(num);
};

export const formatPercentage = (value, total) => {
  if (!total || total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
};

// Utilitário para classes CSS condicionais
export const cn = (...inputs) => {
  return clsx(inputs);
};

// Status helpers
export const getStatusColor = (status) => {
  const statusColors = {
    'Concluída': 'success',
    'Concluído': 'success',
    'Em Execução': 'primary',
    'Em andamento': 'primary',
    'Agendada': 'warning',
    'Pendente': 'warning',
    'Erro': 'error',
    'Falha': 'error',
    'Cancelada': 'error',
  };
  return statusColors[status] || 'gray';
};

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

// Cálculo de métricas
export const calculateSuccessRate = (success, total) => {
  if (!total || total === 0) return 0;
  return ((success / total) * 100).toFixed(1);
};

export const calculateAverageLatency = (executions) => {
  if (!executions || executions.length === 0) return 0;
  const totalLatency = executions.reduce((sum, exec) => sum + (exec.startLatencyInSeconds || 0), 0);
  return (totalLatency / executions.length).toFixed(2);
};

// Debounce
export const debounce = (func, wait) => {
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

// Truncar texto
export const truncate = (str, length = 50) => {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
};