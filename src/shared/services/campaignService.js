import api from './api';

// Helper para construir query string a partir de um objeto de filtros
const buildQueryString = (params) => {
  const query = new URLSearchParams();
  for (const key in params) {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      // Formata datas para ISO string se forem objetos Date
      if (params[key] instanceof Date) {
        query.append(key, params[key].toISOString());
      } else {
        query.append(key, params[key]);
      }
    }
  }
  return query.toString();
};

export const campaignService = {
  /**
   * Obtém campanhas monitoradas com paginação e filtros.
   * @param {object} filters - Objeto com filtros (clientName, monitoringStatus, hasErrors, dataInicio, dataFim, pagina, tamanhoPagina).
   * @returns {Promise<Array<object>>} Lista de campanhas monitoradas.
   */
  getMonitoredCampaigns: async (filters = {}) => {
    try {
      const queryString = buildQueryString(filters);
      const response = await api.get(`/CampaignMonitoring?${queryString}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar campanhas monitoradas:', error);
      throw error;
    }
  },

  /**
   * Obtém detalhes de uma campanha monitorada pelo seu ID de monitoramento (ObjectId).
   * @param {string} id - O ID de monitoramento da campanha.
   * @returns {Promise<object>} Detalhes da campanha.
   */
  getMonitoredCampaignById: async (id) => {
    try {
      const response = await api.get(`/CampaignMonitoring/${id}`);
      return response;
    } catch (error) {
      console.error(`Erro ao buscar campanha monitorada com ID ${id}:`, error);
      throw error;
    }
  },

   /**
   * Obtém detalhes de uma campanha monitorada pelo nome do cliente e ID original.
   * @param {string} clientName - Nome do cliente.
   * @param {string} idCampanha - ID original da campanha.
   * @returns {Promise<object>} Detalhes da campanha.
   */
    getMonitoredCampaignByOriginalId: async (clientName, idCampanha) => {
      try {
        const response = await api.get(`/CampaignMonitoring/original/${encodeURIComponent(clientName)}/${encodeURIComponent(idCampanha)}`);
        return response;
      } catch (error) {
        console.error(`Erro ao buscar campanha original ${idCampanha} do cliente ${clientName}:`, error);
        throw error;
      }
    },

  /**
   * Obtém as métricas de uma campanha específica.
   * @param {string} id - O ID de monitoramento da campanha.
   * @returns {Promise<object>} Objeto com as métricas.
   */
  getCampaignMetrics: async (id) => {
    try {
      const response = await api.get(`/CampaignMonitoring/${id}/metrics`);
      return response;
    } catch (error) {
      console.error(`Erro ao buscar métricas da campanha ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtém o diagnóstico de uma campanha específica.
   * @param {string} id - O ID de monitoramento da campanha.
   * @returns {Promise<object>} Objeto com o diagnóstico.
   */
  getCampaignDiagnostic: async (id) => {
    try {
      const response = await api.get(`/CampaignMonitoring/${id}/diagnostic`);
      return response;
    } catch (error) {
      console.error(`Erro ao buscar diagnóstico da campanha ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtém as execuções de uma campanha específica.
   * @param {string} id - O ID de monitoramento da campanha.
   * @returns {Promise<Array<object>>} Lista de execuções.
   */
  getCampaignExecutions: async (id) => {
    try {
      const response = await api.get(`/CampaignMonitoring/${id}/executions`);
      return response;
    } catch (error) {
      console.error(`Erro ao buscar execuções da campanha ${id}:`, error);
      throw error;
    }
  },

  // --- Funções relacionadas a Execuções (ExecutionMonitoringController) ---

  /**
   * Obtém detalhes de uma execução específica pelo seu ID original.
   * @param {string} executionId - O ID original da execução.
   * @returns {Promise<object>} Detalhes da execução.
   */
  getExecutionById: async (executionId) => {
    try {
      const response = await api.get(`/ExecutionMonitoring/${executionId}`);
      return response;
    } catch (error) {
      console.error(`Erro ao buscar execução com ID ${executionId}:`, error);
      throw error;
    }
  },

  /**
   * Obtém execuções que tiveram erros de monitoramento.
   * @param {object} filters - Filtros opcionais (clientName, dataInicio, dataFim).
   * @returns {Promise<Array<object>>} Lista de execuções com erros.
   */
  getExecutionsWithErrors: async (filters = {}) => {
    try {
      const queryString = buildQueryString(filters);
      const response = await api.get(`/ExecutionMonitoring/with-errors?${queryString}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar execuções com erros:', error);
      throw error;
    }
  }

  // Adicione outras funções conforme necessário para interagir com CampaignMonitoringController e ExecutionMonitoringController
};