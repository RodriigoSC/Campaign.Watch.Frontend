import api from './api';

export const settingsService = {
  getSettings: async () => {
    try {
      console.log('[SettingsService] GET /User/settings');
      // O interceptor do api.js já retorna 'response.data'
      const response = await api.get('/User/settings'); 
      return response;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      throw error;
    }
  },

  /**
   * Salva uma seção específica das configurações.
   * @param {string} section - 'profile', 'system', ou 'general'
   * @param {object} data - Os dados a serem salvos.
   */
  saveSettings: async (section, data) => {
    let endpoint = '';
    let payload = data;
    
    switch(section) {
      case 'profile':
        endpoint = '/User/settings/profile';
        payload = { 
          name: data.name, 
          email: data.email, 
          phone: data.phone 
        };
        break;
        
      case 'system':      
        console.warn('Mock: [SettingsService] PUT /User/settings/system', data);
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
        
      case 'general':
        console.warn('Mock: [SettingsService] PUT /User/settings/general', data);
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
        
      default:
        throw new Error(`Seção de configurações desconhecida: ${section}`);
    }

    try {
      console.log(`[SettingsService] PUT ${endpoint}`, payload);
      await api.put(endpoint, payload);
      return { success: true };
    } catch (error) {
      console.error(`Erro ao salvar configurações (${section}):`, error);
      throw error;
    }
  },
};