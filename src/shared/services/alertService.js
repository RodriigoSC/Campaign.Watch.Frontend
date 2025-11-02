// src/shared/services/alertService.js
// (Baseado no seu clientService.js)
import api from './api';

export const alertService = {
  /**
   * Busca todas as configurações de alerta.
   * @returns {Promise<Array<object>>}
   */
  getAllAlerts: async () => {
    try {
      // Use cache: false se for dados que mudam rapidamente
      const response = await api.get('/AlertConfiguration', { useCache: false });
      return response;
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      throw error;
    }
  },

  /**
   * Cria um novo alerta.
   * @param {object} alertData
   * @returns {Promise<object>}
   */
  createAlert: async (alertData) => {
    try {
      const response = await api.post('/AlertConfiguration', alertData);
      api.clearCache(); // Limpa o cache após criar
      return response;
    } catch (error) {
      console.error('Erro ao criar alerta:', error);
      throw error;
    }
  },

  /**
   * Atualiza um alerta existente.
   * @param {string} id
   * @param {object} alertData
   * @returns {Promise<boolean>}
   */
  updateAlert: async (id, alertData) => {
    try {
      await api.put(`/AlertConfiguration/${id}`, alertData);
      api.clearCache(); // Limpa o cache após atualizar
      return true;
    } catch (error) {
      console.error(`Erro ao atualizar alerta ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deleta um alerta.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  deleteAlert: async (id) => {
    try {
      await api.delete(`/AlertConfiguration/${id}`);
      api.clearCache(); // Limpa o cache após deletar
      return true;
    } catch (error) {
      console.error(`Erro ao deletar alerta ${id}:`, error);
      throw error;
    }
  },
};