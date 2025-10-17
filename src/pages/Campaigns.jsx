import { useState, useEffect } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';
import { campaignService } from '../services/campaignService';
import { clientService } from '../services/clientService';
import { formatDateTime, truncate } from '../utils';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    client: '',
    status: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [campaignsData, clientsData] = await Promise.all([
        campaignService.getCampaignsPaginated(1, 100),
        clientService.getAllClients(),
      ]);
      setCampaigns(campaignsData);
      setClients(clientsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (campaignId) => {
    try {
      const campaign = await campaignService.getCampaignById(campaignId);
      setSelectedCampaign(campaign);
      setShowModal(true);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchSearch = !filters.search || 
      campaign.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      campaign.numberId?.toString().includes(filters.search);
    
    const matchClient = !filters.client || campaign.clientName === filters.client;
    const matchStatus = !filters.status || campaign.monitoringStatus === filters.status;

    return matchSearch && matchClient && matchStatus;
  });

  const clientOptions = clients.map(client => ({
    value: client.name,
    label: client.name
  }));

  const statusOptions = [
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Em andamento', label: 'Em andamento' },
    { value: 'Aguardando próxima execução', label: 'Aguardando próxima execução' },
    { value: 'Concluído', label: 'Concluído' },
    { value: 'Falha', label: 'Falha' },
    { value: 'Execução atrasada', label: 'Execução atrasada' },
  ];

  if (loading) {
    return <Loading size="lg" text="Carregando campanhas..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campanhas</h1>
          <p className="text-gray-600 mt-1">Gerencie e monitore todas as campanhas</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Buscar por nome ou número..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>

            <Select
              placeholder="Todos os clientes"
              options={clientOptions}
              value={filters.client}
              onChange={(e) => setFilters({ ...filters, client: e.target.value })}
            />

            <Select
              placeholder="Todos os status"
              options={statusOptions}
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredCampaigns.length} {filteredCampaigns.length === 1 ? 'Campanha' : 'Campanhas'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Nome</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Cliente</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Monitoramento</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Última Verificação</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">#{campaign.numberId}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{truncate(campaign.name, 40)}</p>
                        <p className="text-xs text-gray-500">{campaign.campaignType}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{campaign.clientName}</td>
                    <td className="py-3 px-4">
                      <Badge variant={campaign.campaignType === 'Recorrente' ? 'primary' : 'default'}>
                        {campaign.campaignType}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={campaign.campaignStatus}>
                        {campaign.campaignStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={campaign.monitoringStatus}>
                        {campaign.monitoringStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDateTime(campaign.lastCheckMonitoring)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(campaign.id)}
                      >
                        <Eye size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCampaigns.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhuma campanha encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Detalhes da Campanha"
        size="xl"
      >
        {selectedCampaign && <CampaignDetails campaign={selectedCampaign} />}
      </Modal>
    </div>
  );
};

// Componente de Detalhes da Campanha
const CampaignDetails = ({ campaign }) => {
  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Nome</p>
            <p className="font-medium">{campaign.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cliente</p>
            <p className="font-medium">{campaign.clientName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tipo</p>
            <Badge>{campaign.campaignType}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <Badge status={campaign.campaignStatus}>{campaign.campaignStatus}</Badge>
          </div>
        </div>
      </div>

      {/* Agendamento */}
      {campaign.scheduler && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Agendamento</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Início</p>
              <p className="font-medium">{formatDateTime(campaign.scheduler.startDateTime)}</p>
            </div>
            {campaign.scheduler.endDateTime && (
              <div>
                <p className="text-sm text-gray-600">Término</p>
                <p className="font-medium">{formatDateTime(campaign.scheduler.endDateTime)}</p>
              </div>
            )}
            {campaign.scheduler.isRecurrent && (
              <div>
                <p className="text-sm text-gray-600">Crontab</p>
                <p className="font-mono text-sm">{campaign.scheduler.crontab}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Execuções */}
      {campaign.executions && campaign.executions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Execuções ({campaign.executions.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {campaign.executions.map((execution, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{execution.campaignName}</p>
                    <p className="text-xs text-gray-600">{formatDateTime(execution.startDate)}</p>
                  </div>
                  <Badge status={execution.status}>{execution.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;