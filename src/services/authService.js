import { jwtDecode } from 'jwt-decode';

// Mock de um token JWT para desenvolvimento
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIiwicm9sZSI6IkFkbWluIiwiZW1haWwiOiJhZG1pbkBjYW1wYWlnbndhdGNoLmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.tV5jOEGb-c_p8f_g_s4Z8Y_n_n_w_j_z_q_y_x_w'; //

// Função para obter o usuário do localStorage (mantida)
const getCurrentUserFromStorage = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Função para obter o token do localStorage (mantida)
const getTokenFromStorage = () => {
  return localStorage.getItem('token');
};

export const authService = {
  login: (username, password) => { // Removido async, agora é síncrono ou usa Promise interna
    return new Promise((resolve, reject) => {
      setTimeout(() => { // Simula atraso da rede
        if (username === 'admin' && password === 'admin') {
          localStorage.setItem('token', mockToken); // Salva o token mockado
          let user = null;
          try {
            user = jwtDecode(mockToken); // Decodifica o token mockado
            user.token = mockToken; // Adiciona o token ao objeto user
            localStorage.setItem('user', JSON.stringify(user)); // Salva usuário mockado
            console.log("Mock Login bem-sucedido, usuário:", user);
            resolve({ user, token: mockToken }); // Resolve com usuário e token mockados
          } catch (decodeError) {
             console.error("Erro ao decodificar token JWT mockado:", decodeError);
             localStorage.removeItem('user');
             localStorage.removeItem('token');
             reject(new Error('Erro ao processar token mockado.')); // Rejeita se houver erro no decode
          }
        } else {
          localStorage.removeItem('token'); // Limpa em caso de falha
          localStorage.removeItem('user');
          console.error("Mock Login falhou: Credenciais inválidas.");
          reject(new Error('Usuário ou senha inválidos.')); // Rejeita a promessa com erro
        }
      }, 500); // Atraso de 500ms
    });
  }, // Fim da função login mockada

  // Logout permanece igual
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // isAuthenticated permanece igual
  isAuthenticated: () => {
    const token = getTokenFromStorage();
    return !!token;
  },

  // getCurrentUser permanece igual
  getCurrentUser: () => {
    return getCurrentUserFromStorage();
  },

  // getToken permanece igual
  getToken: () => {
    return getTokenFromStorage();
  }
};