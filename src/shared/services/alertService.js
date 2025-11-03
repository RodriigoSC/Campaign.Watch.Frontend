import api from './api'; // Removemos os mocks e importamos o 'api' real

export const alertService = {
  /**
   * Busca configurações de alerta.
   * @param {string} clientId - ID do cliente, 'global' para alertas gerais, ou '' para não buscar.
   * @returns {Promise<Array<object>>}
   */
  getAllAlerts: async (clientId) => {
    // Se nenhum cliente/escopo for selecionado, não faz a chamada.
    if (!clientId) return Promise.resolve([]);

    try {
      // O 'api.js' já trata a URL base.
      // A API espera um parâmetro de query ?clientId=...
      //
      const response = await api.get('/Alert/AlertConfiguration', {
        params: { clientId }
      });
      return response; // O interceptor do 'api' já retorna 'response.data'
    } catch (error) {
      console.error('Erro ao buscar configurações de alerta:', error);
      throw error; // Re-lança o erro formatado pelo interceptor
    }
  },

  /**
   * Busca histórico de alertas.
   * @param {string} clientId - ID do cliente, 'global' para alertas gerais, ou '' para não buscar.
   * @returns {Promise<Array<object>>}
   */
  getAlertHistory: async (clientId) => {
    if (!clientId) return Promise.resolve([]);

    try {
      // Endpoint para o histórico de alertas
      //
      const response = await api.get('/Alert/AlertHistory', {
        params: { clientId }
      });
      return response;
    } catch (error) {
      console.error('Erro ao buscar histórico de alertas:', error);
      throw error;
    }
  },

  /**
   * Cria um novo alerta (global ou específico).
   * @param {object} alertData - { ...dados, clientId: "id_cliente" | null }
   * @returns {Promise<object>} O alerta criado (com ID)
   */
  createAlert: async (alertData) => {
    try {
      // Endpoint POST para criação
      //
      const response = await api.post('/Alert/AlertConfiguration', alertData);
      return response; // Retorna o objeto criado (Resposta 201)
    } catch (error) {
      console.error('Erro ao criar alerta:', error);
      throw error;
    }
  },

  /**
   * Atualiza um alerta existente.
   * @param {string} id - O ID do alerta a ser atualizado.
   * @param {object} alertData - Os novos dados.
   * @returns {Promise<boolean>}
   */
  updateAlert: async (id, alertData) => {
    try {
      // Endpoint PUT para atualização
      //
      await api.put(`/Alert/AlertConfiguration/${id}`, alertData);
      // A API retorna 204 (NoContent), o interceptor do axios pode retornar undefined.
      // Retornamos true se a chamada não lançar erro.
      return true;
    } catch (error) {
      console.error(`Erro ao atualizar alerta ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deleta um alerta.
   * @param {string} id - O ID do alerta a ser deletado.
   * @returns {Promise<boolean>}
   */
  deleteAlert: async (id) => {
    try {
      // Endpoint DELETE para exclusão
      //
      await api.delete(`/Alert/AlertConfiguration/${id}`);
      // A API também retorna 204 (NoContent)
      return true;
    } catch (error) {
      console.error(`Erro ao deletar alerta ${id}:`, error);
      throw error;
    }
  },
};