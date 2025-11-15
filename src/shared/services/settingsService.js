import api from './api';

export const settingsService = {
  getSettings: async () => {
    try {
      const response = await api.get('/User/settings'); 
      return response;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      throw error;
    }
  },

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
        endpoint = '/User/settings/system';
        payload = data; 
        break;
      // --- FIM CORREÇÃO ---
        
      case 'general':
        // TODO: Implementar este endpoint no backend também
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