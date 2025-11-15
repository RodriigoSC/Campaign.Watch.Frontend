import api from './api';

export const userService = {
  
  /**
   * (Admin) Busca todos os usuários.
   */
  getAllUsers: async () => {
    try {
      const response = await api.get('/User');
      return response;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  },

  /**
   * (Admin) Cria um novo usuário.
   * @param {object} userData - { name, email, password, role }
   */
  createUser: async (userData) => {
    try {
      const response = await api.post('/User', userData);
      return response;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  },

  /**
   * (Admin) Atualiza um usuário.
   * @param {string} id - ID do usuário a atualizar
   * @param {object} userData - { name, email, role, isActive, phone }
   */
  updateUser: async (id, userData) => {
    try {
      await api.put(`/User/${id}`, userData);
      return { success: true };
    } catch (error) {
      console.error(`Erro ao atualizar usuário ${id}:`, error);
      throw error;
    }
  },

  /**
   * (Admin) Deleta um usuário.
   * @param {string} id - ID do usuário a deletar
   */
  deleteUser: async (id) => {
    try {
      await api.delete(`/User/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Erro ao deletar usuário ${id}:`, error);
      throw error;
    }
  },
};