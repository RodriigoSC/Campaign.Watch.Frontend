import { jwtDecode } from 'jwt-decode';

// Mock de um token JWT para desenvolvimento
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIiwicm9sZSI6IkFkbWluIiwiZW1haWwiOiJhZG1pbkBjYW1wYWlnbndhdGNoLmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.tV5jOEGb-c_p8f_g_s4Z8Y_n_n_w_j_z_q_y_x_w';

export const authService = {
  // Simula um login, retornando um usuário e salvando o token
  mockLogin: (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'admin') {
          localStorage.setItem('token', mockToken);
          const user = jwtDecode(mockToken);
          localStorage.setItem('user', JSON.stringify(user));
          resolve({ user });
        } else {
          reject(new Error('Usuário ou senha inválidos.'));
        }
      }, 500);
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};