// import api from './api'; // Não precisamos mais do 'api' real para os mocks

// --- Simulação de Banco de Dados na Memória ---

let mockAlertConfigs = [
  { id: 'g-1', clientId: null, name: 'GLOBAL: Falha Crítica de Integração', type: 'email', conditionType: 'StepFailed', minSeverity: 'Critical', recipient: 'devops@empresa.com', isActive: true, createdAt: '2025-10-30T10:00:00Z' },
  { id: 'g-2', clientId: null, name: 'GLOBAL: Atrasos (Warning)', type: 'webhook', conditionType: 'ExecutionDelayed', minSeverity: 'Warning', recipient: 'https://slack.com/hook/global', isActive: true, createdAt: '2025-10-29T11:00:00Z' },
  // Use um ID de cliente real que você espera receber do clientService
  { id: 'c1-1', clientId: '6445d693b443206381ab91c2', name: 'Cliente ACME: Filtro Travado', type: 'email', conditionType: 'FilterStuck', minSeverity: 'Error', recipient: 'acme-admin@cliente.com', isActive: true, createdAt: '2025-10-28T12:00:00Z' },
  { id: 'c1-2', clientId: '6445d693b443206381ab91c2', name: 'Cliente ACME: Qualquer Erro (Inativo)', type: 'email', conditionType: '', minSeverity: 'Error', recipient: 'acme-admin@cliente.com', isActive: false, createdAt: '2025-10-27T13:00:00Z' },
  { id: 'c2-1', clientId: 'client-xyz-789', name: 'Cliente XYZ: Falhas de SMS', type: 'email', conditionType: 'IntegrationError', minSeverity: 'Error', recipient: 'xyz-admin@cliente.com', isActive: true, createdAt: '2025-10-26T14:00:00Z' },
];

let mockAlertHistory = [
  { id: 'h-g-1', clientId: null, severity: 'Critical', message: 'GLOBAL: Etapa de canal falhou: Authentication failed', campaignName: 'Campanha de Boas-Vindas (Cliente XYZ)', stepName: 'Enviar Email Boas Vindas', detectedAt: '2025-11-02T14:30:00Z' },
  { id: 'h-c1-1', clientId: '6445d693b443206381ab91c2', severity: 'Error', message: 'ALERTA: Etapa de filtro em execução há mais de 30 minutos.', campaignName: 'Segmentação Clientes VIP (ACME)', stepName: 'Filtrar Clientes VIP', detectedAt: '2025-11-02T11:15:00Z' },
  { id: 'h-c1-2', clientId: '6445d693b443206381ab91c2', severity: 'Error', message: "O sistema de canal reportou um status de 'Erro' para esta trigger.", campaignName: 'Campanha de Boas-Vindas (ACME)', stepName: 'Enviar SMS', detectedAt: '2025-11-01T18:05:00Z' },
];
// --- Fim da Simulação de BD ---


/**
 * Simula um delay de rede
 * @param {number} ms - Tempo em milissegundos
 */
const simulateApiCall = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const alertService = {
  /**
   * Busca configurações de alerta.
   * @param {string} clientId - ID do cliente, 'global' para alertas gerais, ou '' para não buscar.
   * @returns {Promise<Array<object>>}
   */
  getAllAlerts: async (clientId) => {
    if (!clientId) return Promise.resolve([]); 

    await simulateApiCall();
    
    console.log(`[MOCK] getAllAlerts(clientId: ${clientId})`);

    if (clientId === 'global') {
      const globalAlerts = mockAlertConfigs.filter(alert => alert.clientId === null);
      return [...globalAlerts]; // Retorna uma cópia
    } else {
      const clientAlerts = mockAlertConfigs.filter(alert => alert.clientId === clientId);
      return [...clientAlerts]; // Retorna uma cópia
    }
  },

  /**
   * Busca histórico de alertas.
   * @param {string} clientId - ID do cliente, 'global' para alertas gerais, ou '' para não buscar.
   * @returns {Promise<Array<object>>}
   */
  getAlertHistory: async (clientId) => {
    if (!clientId) return Promise.resolve([]);

    await simulateApiCall(800); // Um pouco mais lento para o histórico
    
    console.log(`[MOCK] getAlertHistory(clientId: ${clientId})`);

    if (clientId === 'global') {
      const globalHistory = mockAlertHistory.filter(h => h.clientId === null);
      return [...globalHistory];
    } else {
      const clientHistory = mockAlertHistory.filter(h => h.clientId === clientId);
      return [...clientHistory];
    }
  },

  /**
   * Cria um novo alerta (global ou específico).
   * @param {object} alertData - { ...dados, clientId: "id_cliente" | null }
   * @returns {Promise<object>}
   */
  createAlert: async (alertData) => {
    await simulateApiCall();

    const newAlert = {
      ...alertData,
      id: `new-${Math.random().toString(36).substring(7)}`, // ID aleatório
      createdAt: new Date().toISOString(),
    };

    console.log('[MOCK] createAlert', newAlert);
    mockAlertConfigs.push(newAlert);
    
    return newAlert;
  },

  /**
   * Atualiza um alerta existente.
   * @param {string} id
   * @param {object} alertData
   * @returns {Promise<boolean>}
   */
  updateAlert: async (id, alertData) => {
    await simulateApiCall();
    
    console.log(`[MOCK] updateAlert(id: ${id})`, alertData);
    
    const index = mockAlertConfigs.findIndex(alert => alert.id === id);
    if (index !== -1) {
      // Preserva o createdAt e clientId originais ao atualizar
      mockAlertConfigs[index] = { 
        ...mockAlertConfigs[index], // Mantém dados antigos (como createdAt)
        ...alertData, // Sobrescreve com novos dados
        id: id // Garante que o ID não mude
      };
      return true;
    }
    throw new Error('Alerta não encontrado para atualização.');
  },

  /**
   * Deleta um alerta.
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  deleteAlert: async (id) => {
    await simulateApiCall();
    
    console.log(`[MOCK] deleteAlert(id: ${id})`);
    
    const initialLength = mockAlertConfigs.length;
    mockAlertConfigs = mockAlertConfigs.filter(alert => alert.id !== id);
    
    if (mockAlertConfigs.length === initialLength) {
        throw new Error('Alerta não encontrado para exclusão.');
    }
    
    return true;
  },
};