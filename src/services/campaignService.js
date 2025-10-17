// Mock de dados de campanhas
const mockCampaigns = [
    { id: 1, numberId: 101, name: 'Campanha de Verão 2024', clientName: 'Cliente A', campaignType: 'Recorrente', campaignStatus: 'Concluído', monitoringStatus: 'Concluído', lastCheckMonitoring: '2024-07-20T10:00:00Z' },
    { id: 2, numberId: 102, name: 'Lançamento Produto X', clientName: 'Cliente B', campaignType: 'Pontual', campaignStatus: 'Em andamento', monitoringStatus: 'Em andamento', lastCheckMonitoring: '2024-07-21T11:30:00Z' },
    { id: 3, numberId: 103, name: 'Promoção Dia dos Pais', clientName: 'Cliente A', campaignType: 'Recorrente', campaignStatus: 'Agendada', monitoringStatus: 'Pendente', lastCheckMonitoring: null },
    { id: 4, numberId: 104, name: 'Black Friday Antecipada', clientName: 'Cliente C', campaignType: 'Pontual', campaignStatus: 'Concluído', monitoringStatus: 'Falha', lastCheckMonitoring: '2024-07-19T15:00:00Z' },
    { id: 5, numberId: 105, name: 'Campanha de Inverno', clientName: 'Cliente B', campaignType: 'Recorrente', campaignStatus: 'Em andamento', monitoringStatus: 'Execução atrasada', lastCheckMonitoring: '2024-07-18T09:00:00Z' },
];

// Simula uma chamada de API com um pequeno atraso
const mockApiCall = (data) => new Promise(resolve => setTimeout(() => resolve(data), 300));

export const campaignService = {
  getCampaignsPaginated: (page, pageSize) => mockApiCall(mockCampaigns.slice((page - 1) * pageSize, page * pageSize)),
  getCampaignById: (id) => mockApiCall(mockCampaigns.find(c => c.id === id)),
  getCampaignsByClient: (clientName) => mockApiCall(mockCampaigns.filter(c => c.clientName === clientName)),
  getSuccessfullyMonitoredCampaigns: () => mockApiCall(mockCampaigns.filter(c => c.monitoringStatus === 'Concluído')),
  getCampaignsWithIntegrationErrors: () => mockApiCall(mockCampaigns.filter(c => c.monitoringStatus === 'Falha')),
  getCampaignsWithDelayedExecution: () => mockApiCall(mockCampaigns.filter(c => c.monitoringStatus === 'Execução atrasada')),
  getCountByCampaignStatus: () => mockApiCall([
    { status: 'Concluído', count: 2 },
    { status: 'Em andamento', count: 2 },
    { status: 'Agendada', count: 1 },
  ]),
  getCountByMonitoringStatus: () => mockApiCall([
    { status: 'Concluído', count: 1 },
    { status: 'Em andamento', count: 1 },
    { status: 'Pendente', count: 1 },
    { status: 'Falha', count: 1 },
    { status: 'Execução atrasada', count: 1 },
  ]),
};