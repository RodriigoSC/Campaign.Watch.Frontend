import api from './api';

// Helper para construir query string (pode ser movido para utils se usado em mais lugares)
const buildQueryString = (params) => {
  const query = new URLSearchParams();
  for (const key in params) {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      if (params[key] instanceof Date) {
        query.append(key, params[key].toISOString());
      } else {
        query.append(key, params[key]);
      }
    }
  }
  return query.toString();
};

export const dashboardService = {
  /**
   * Obtém os dados consolidados do dashboard.
   * @param {string} [clientName] - Nome opcional do cliente para filtrar os dados.
   * @returns {Promise<object>} Dados do dashboard.
   */
  getDashboardData: async (clientName = null) => {
    try {
      const params = { clientName };
      const queryString = buildQueryString(params);
      const response = await api.get(`/MonitoringDashboard?${queryString}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    }
  },

  /**
   * Obtém as próximas execuções agendadas.
   * @param {number} proximasHoras - Período em horas (padrão 24).
   * @returns {Promise<Array<object>>} Lista das próximas execuções.
   */
  getUpcomingExecutions: async (proximasHoras = 24) => {
    try {
      const params = { proximasHoras };
      const queryString = buildQueryString(params);
      const response = await api.get(`/MonitoringDashboard/upcoming-executions?${queryString}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar próximas execuções:', error);
      throw error;
    }
  },

  /**
   * Obtém os problemas recentes detectados.
   * @param {object} filters - Filtros (severity, desde, limite).
   * @returns {Promise<Array<object>>} Lista de problemas recentes.
   */
  getRecentIssues: async (filters = {}) => {
    try {
      const queryString = buildQueryString(filters);
      const response = await api.get(`/MonitoringDashboard/recent-issues?${queryString}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar problemas recentes:', error);
      throw error;
    }
  },

  /**
   * Obtém estatísticas de campanhas por status de monitoramento.
   * @param {object} filters - Filtros (clientName, dataInicio, dataFim).
   * @returns {Promise<Array<object>>} Lista de grupos de status.
   */
  getStatsByMonitoringStatus: async (filters = {}) => {
    try {
      const queryString = buildQueryString(filters);
      const response = await api.get(`/MonitoringDashboard/stats/by-monitoring-status?${queryString}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar estatísticas por status de monitoramento:', error);
      throw error;
    }
  },

  /**
   * Obtém estatísticas de campanhas por nível de saúde.
   * @param {string} [clientName] - Nome opcional do cliente para filtrar.
   * @returns {Promise<Array<object>>} Lista de grupos de saúde.
   */
  getStatsByHealthLevel: async (clientName = null) => {
    try {
      const params = { clientName };
      const queryString = buildQueryString(params);
      const response = await api.get(`/MonitoringDashboard/stats/by-health-level?${queryString}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar estatísticas por nível de saúde:', error);
      throw error;
    }
  },

  /**
   * Obtém a taxa de sucesso das execuções.
   * @param {object} filters - Filtros (clientName, dataInicio, dataFim).
   * @returns {Promise<object>} Dicionário com taxas de sucesso.
   */
  getExecutionSuccessRate: async (filters = {}) => {
    try {
      const queryString = buildQueryString(filters);
      const response = await api.get(`/MonitoringDashboard/stats/success-rate?${queryString}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar taxa de sucesso das execuções:', error);
      throw error;
    }
  },
};