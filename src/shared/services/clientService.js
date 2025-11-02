import api from './api';

export const clientService = {
  /**
   * Busca todos os clientes da API.
   * @returns {Promise<Array<object>>} Uma promessa que resolve com a lista de clientes.
   */
  getAllClients: async () => {
    try {
      const response = await api.get('/Client');
      return response; // O interceptor já retorna response.data
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error; // Re-lança o erro formatado pelo interceptor
    }
  },

  /**
   * Busca um cliente pelo ID.
   * @param {string} id - O ID do cliente.
   * @returns {Promise<object>} Uma promessa que resolve com os dados do cliente.
   */
  getClientById: async (id) => {
    try {
      const response = await api.get(`/Client/${id}`);
      return response;
    } catch (error) {
      console.error(`Erro ao buscar cliente com ID ${id}:`, error);
      throw error;
    }
  },

   /**
   * Busca um cliente pelo Nome.
   * @param {string} clientName - O Nome do cliente.
   * @returns {Promise<object>} Uma promessa que resolve com os dados do cliente.
   */
  getClientByName: async (clientName) => {
    try {
      // Ajuste o endpoint se for diferente na sua API
      const response = await api.get(`/Client/by-name/${encodeURIComponent(clientName)}`);
      return response;
    } catch (error) {
      console.error(`Erro ao buscar cliente com nome ${clientName}:`, error);
      throw error;
    }
  },

  /**
   * Cria um novo cliente.
   * @param {object} clientData - Os dados do novo cliente (formato SaveClientRequest).
   * @returns {Promise<object>} Uma promessa que resolve com os dados do cliente criado.
   */
  createClient: async (clientData) => {
    try {
      const response = await api.post('/Client', clientData);
      return response;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  },

  /**
   * Atualiza um cliente existente.
   * @param {string} id - O ID do cliente a ser atualizado.
   * @param {object} clientData - Os novos dados do cliente (formato SaveClientRequest).
   * @returns {Promise<boolean>} Uma promessa que resolve com true se bem-sucedido.
   */
  updateClient: async (id, clientData) => {
    try {
      // A API PUT retorna NoContent (204) em sucesso, o interceptor do axios pode retornar undefined ou string vazia
      // Tratamos isso retornando true explicitamente se a chamada não lançar erro.
      await api.put(`/Client/${id}`, clientData);
      return true;
    } catch (error) {
      console.error(`Erro ao atualizar cliente com ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Deleta um cliente.
   * @param {string} id - O ID do cliente a ser deletado.
   * @returns {Promise<boolean>} Uma promessa que resolve com true se bem-sucedido.
   */
  deleteClient: async (id) => {
    try {
      // A API DELETE retorna NoContent (204) em sucesso.
      await api.delete(`/Client/${id}`);
      return true;
    } catch (error) {
      console.error(`Erro ao deletar cliente com ID ${id}:`, error);
      throw error;
    }
  },

  // Adicione outras funções conforme necessário para interagir com o ClientController
};