// src/shared/services/settingsService.js
import api from './api';

export const settingsService = {
  getSettings: async () => {
    try {
      // Esta chamada agora retornará { profile: {...}, general: {...}, system: {...} }
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
        // O payload para profile é específico (UpdateProfileSettingsRequest)
        payload = { 
          name: data.name, 
          email: data.email, 
          phone: data.phone 
        };
        break;
        
      // ATUALIZADO: Apontando para o endpoint real
      case 'system':      
        endpoint = '/User/settings/system';
        // O payload é definido no componente (UpdateSystemSettingsRequest)
        payload = data; 
        break;
        
      // ATUALIZADO: Apontando para o endpoint real
      case 'general':
        endpoint = '/User/settings/general';
        // O payload é o objeto 'data' (UpdateGeneralSettingsRequest)
        payload = data;
        break;

      // A aba Segurança não tem API, então vamos mockar/avisar
      case 'security':
        console.warn('Mock: [SettingsService] PUT /User/settings/password (NÃO IMPLEMENTADO)', data);
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
        
      default:
        throw new Error(`Seção de configurações desconhecida: ${section}`);
    }

    try {
      console.log(`[SettingsService] PUT ${endpoint}`, payload);
      await api.put(endpoint, payload);
      
      // BOA PRÁTICA: Limpar o cache da API para que o próximo GET (getSettings)
      // busque os dados que acabamos de salvar.
      api.clearCache(); 
      
      return { success: true };
    } catch (error) {
      console.error(`Erro ao salvar configurações (${section}):`, error);
      throw error;
    }
  },
};