import { useState, useEffect } from 'react';
import { Plus, Eye, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import { clientService } from '../services/clientService';
import { campaignService } from '../services/campaignService';
import { formatDateTime } from '../utils';
import { useNavigate } from 'react-router-dom';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [clientStats, setClientStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const clientsData = await clientService.getAllClients();
      setClients(clientsData);

      // Carregar estatísticas para cada cliente
      const stats = {};
      for (const client of clientsData) {
        try {
          const campaigns = await campaignService.getCampaignsByClient(client.name);
          stats[client.name] = {
            total: campaigns.length,
            active: campaigns.filter(c => c.isActive).length,
          };
        } catch (error) {
          stats[client.name] = { total: 0, active: 0 };
        }
      }
      setClientStats(stats);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClientCampaigns = (clientName) => {
    navigate(`/campaigns?client=${clientName}`);
  };

  if (loading) {
    return <Loading size="lg" text="Carregando clientes..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os clientes cadastrados</p>
        </div>
        <Button variant="primary">
          <Plus size={20} className="mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <p className="text-xs text-gray-500 mt-1">
                    Criado em {formatDateTime(client.createdAt)}
                  </p>
                </div>
                <Badge variant={client.isActive ? 'success' : 'default'}>
                  {client.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              {/* Estatísticas */}
              <div className="space-y-4 mb-4">
                <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Total de Campanhas</p>
                    <p className="text-2xl font-bold text-primary-700">
                      {clientStats[client.name]?.total || 0}
                    </p>
                  </div>
                  <TrendingUp className="text-primary-600" size={32} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-success-50 rounded-lg">
                    <p className="text-xs text-gray-600">Ativas</p>
                    <p className="text-xl font-bold text-success-700">
                      {clientStats[client.name]?.active || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Inativas</p>
                    <p className="text-xl font-bold text-gray-700">
                      {(clientStats[client.name]?.total || 0) - (clientStats[client.name]?.active || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Canais Configurados */}
              {client.effectiveChannels && client.effectiveChannels.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Canais Configurados</p>
                  <div className="flex flex-wrap gap-2">
                    {client.effectiveChannels.map((channel, idx) => (
                      <Badge key={idx} variant="default" className="text-xs">
                        {channel.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleViewClientCampaigns(client.name)}
              >
                <Eye size={16} className="mr-2" />
                Ver Campanhas
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {clients.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Nenhum cliente cadastrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Clients;