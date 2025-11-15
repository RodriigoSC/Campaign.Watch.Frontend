import api from './api'; 

const getCurrentUserFromStorage = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const getTokenFromStorage = () => {
  return localStorage.getItem('token');
};

export const authService = {
  /**
   * Realiza o login na API real.
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<object>}
   */
  login: async (username, password) => {
    try {
      const response = await api.post('/User/login', {
        email: username,
        password: password
      });

      if (response && response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        console.log("Login via API bem-sucedido:", response.user);
        
        return { user: response.user, token: response.token };
      } else {
        throw new Error("Resposta da API de login inválida.");
      }

    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      console.error("Falha no login via API:", error.message);
      
      throw error; 
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    const token = getTokenFromStorage();
    return !!token;
  },

 
  getCurrentUser: () => {
    return getCurrentUserFromStorage();
  },

  getToken: () => {
    return getTokenFromStorage();
  }
};