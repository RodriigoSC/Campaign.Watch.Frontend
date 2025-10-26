import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Search, Eye, RefreshCw } from 'lucide-react'; // Ícone Filter removido
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import CampaignModal from '../components/ui/CampaignModal';
import ErrorMessage from '../components/ui/ErrorMessage';
import ExecutionHistoryModal from '../components/ui/ExecutionHistoryModal'; 
import { campaignService } from '../services/campaignService';
import { clientService } from '../services/clientService';
import { formatDateTime, truncate, formatNumber } from '../utils';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [campaignForHistory, setCampaignForHistory] = useState(null);


  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    clientName: searchParams.get('client') || '',
    monitoringStatus: searchParams.get('status') || '',
    pagina: parseInt(searchParams.get('page') || '1'),
    tamanhoPagina: 50,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const clientsData = await clientService.getAllClients();
      setClients(clientsData);

      const currentFilters = {
          clientName: filters.clientName,
          monitoringStatus: filters.monitoringStatus,
          pagina: filters.pagina,
          tamanhoPagina: filters.tamanhoPagina,
      };
      // Incluir busca se a API suportar (exemplo comentado)
      // if (filters.search) {
      //   currentFilters.search = filters.search;
      // }

      const campaignsData = await campaignService.getMonitoredCampaigns(currentFilters);
      setCampaigns(campaignsData || []);

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar campanhas e clientes');
    } finally {
      setLoading(false);
    }
  }, [filters.clientName, filters.monitoringStatus, filters.pagina, filters.tamanhoPagina]); // Dependências corretas

  useEffect(() => {
    loadData();
  }, [loadData]); // Depende da função memoizada

  const cleanFilters = (obj) => {
    const cleaned = {};
    for (const key in obj) {
      if ((key === 'pagina' && obj[key] === 1) || (obj[key] !== null && obj[key] !== undefined && obj[key] !== '')) {
         if (key !== 'tamanhoPagina') {
             cleaned[key] = obj[key];
         }
      }
    }
    return cleaned;
  };

  useEffect(() => {
    setSearchParams( cleanFilters(filters) , { replace: true });
  }, [filters, setSearchParams]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const resetPage = (name !== 'pagina');
    setFilters(prev => ({
        ...prev,
        [name]: value,
        ...(resetPage && { pagina: 1 })
     }));
  };


  const handleViewDetails = async (campaignId) => {
    try {
        setLoading(true);
        setError(null);
      const campaign = await campaignService.getMonitoredCampaignById(campaignId);
      setSelectedCampaign(campaign);
      setShowModal(true);
    } catch (err) {
      console.error('Erro ao carregar detalhes da campanha:', err);
       setError(err.message || 'Não foi possível carregar os detalhes da campanha.');
        setSelectedCampaign(null);
        setShowModal(true);
    } finally {
        setLoading(false);
    }
  };

  const handleViewHistory = (campaign) => {
    setCampaignForHistory(campaign); // Define qual campanha será exibida no modal
    setShowHistoryModal(true); // Abre o modal de histórico
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const searchTerm = filters.search.toLowerCase();
    return !searchTerm ||
      campaign.name?.toLowerCase().includes(searchTerm) ||
      campaign.numberId?.toString().includes(searchTerm) ||
      campaign.idCampaign?.toLowerCase().includes(searchTerm);
  });

  const clientOptions = [
    { value: '', label: 'Todos os Clientes' },
    ...clients.map(client => ({
      value: client.name,
      label: client.name
    }))
  ];

  const statusOptions = [
    { value: '', label: 'Todos os Status (Monitoramento)' },
    { value: 'Pending', label: 'Pendente' },
    { value: 'InProgress', label: 'Em andamento' },
    { value: 'WaitingForNextExecution', label: 'Aguardando próxima execução' },
    { value: 'Completed', label: 'Concluído' },
    { value: 'Failed', label: 'Falha' },
    { value: 'ExecutionDelayed', label: 'Execução atrasada' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campanhas</h1>
          <p className="text-gray-600 mt-1">Gerencie e monitore todas as campanhas</p>
        </div>
         <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Lista
          </Button>
      </div>

       {error && !loading && (
         <ErrorMessage
           title="Erro ao carregar dados"
           message={error}
           onRetry={loadData}
         />
       )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                name="search"
                placeholder="Buscar por Nome, ID Original ou Número..."
                value={filters.search}
                onChange={handleFilterChange}
                className="pl-10"
              />
            </div>
            <Select
              name="clientName"
              options={clientOptions}
              value={filters.clientName}
              onChange={handleFilterChange}
            />
            <Select
              name="monitoringStatus"
              options={statusOptions}
              value={filters.monitoringStatus}
              onChange={handleFilterChange}
            />
          </div>
        </CardContent>
      </Card>

       {loading && <Loading text="Carregando campanhas..." />}

      {!loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredCampaigns.length} {filteredCampaigns.length === 1 ? 'Campanha encontrada' : 'Campanhas encontradas'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Número</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nome</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status (Origem)</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status (Monitor.)</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Última Verificação</th>
                    <th className="py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center whitespace-nowrap">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">#{campaign.numberId}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate" title={campaign.name}>{truncate(campaign.name, 40)}</p>
                          <p className="text-xs text-gray-500">{campaign.campaignType}</p>
                           <p className="text-xs text-gray-400 mt-1">ID: {campaign.idCampaign}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{campaign.clientName}</td>
                      <td className="py-3 px-4">
                        <Badge status={campaign.campaignStatus}>
                          {campaign.campaignStatus || '-'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={campaign.monitoringStatus}>
                           {campaign.monitoringStatus || '-'}
                        </Badge>
                      </td>
                      {/* --- AJUSTE CÉLULA --- */}
                      <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDateTime(campaign.lastCheckMonitoring) || '-'}
                      </td>
                      {/* --- AJUSTE CÉLULA --- */}
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(campaign.id)}
                          title="Ver Detalhes"
                          className="p-1" // Padding opcional
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
                  <p className="text-gray-500">Nenhuma campanha encontrada com os filtros aplicados.</p>
                </div>
              )}
            </div>
             {/* Adicionar Paginação */}
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalhes */}
      <CampaignModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setError(null); }}
        title={`Detalhes da Campanha #${selectedCampaign?.numberId || '...'}`}
        size="lg"
      >
         {loading && showModal && <Loading text="Carregando detalhes..."/>}
         {error && showModal && !loading && (
              <ErrorMessage
                  title="Erro ao carregar detalhes"
                  message={error}
                  onRetry={() => selectedCampaign?.id && handleViewDetails(selectedCampaign.id)}
              />
          )}
        {selectedCampaign && !loading && !error && ( 
          <CampaignDetails 
          campaign={selectedCampaign}
          onViewHistory={handleViewHistory}
           />
          )}
      </CampaignModal>

      {/* Modal de Histórico de Execuções */}
      {campaignForHistory && (
        <ExecutionHistoryModal
          isOpen={showHistoryModal}
          onClose={() => { setShowHistoryModal(false); setCampaignForHistory(null); }} // Limpa campaignForHistory ao fechar
          campaignId={campaignForHistory.id}
          campaignName={campaignForHistory.name}
        />
      )}


    </div>
  );
};

// Componente CampaignDetails (ajustado para usar formatNumber)
const CampaignDetails = ({ campaign, onViewHistory }) => {
  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Nome</p>
            <p className="font-medium text-gray-800">{campaign.name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Cliente</p>
            <p className="font-medium text-gray-800">{campaign.clientName || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">ID Original</p>
            <p className="font-mono text-sm text-gray-700">{campaign.idCampaign || '-'}</p>
          </div>
           <div>
            <p className="text-sm text-gray-500 mb-1">Número ID</p>
            <p className="font-medium text-gray-800">{campaign.numberId || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Tipo</p>
            <Badge variant={campaign.campaignType === 'Recorrente' ? 'primary' : 'default'}>
                {campaign.campaignType || '-'}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Status (Origem)</p>
            <Badge status={campaign.campaignStatus}>{campaign.campaignStatus || '-'}</Badge>
          </div>
           <div>
            <p className="text-sm text-gray-500 mb-1">Status (Monitoramento)</p>
            <Badge status={campaign.monitoringStatus}>{campaign.monitoringStatus || '-'}</Badge>
          </div>
           <div>
            <p className="text-sm text-gray-500 mb-1">Ativa?</p>
            <Badge variant={campaign.isActive ? 'success' : 'default'}>{campaign.isActive ? 'Sim' : 'Não'}</Badge>
          </div>
           <div className="md:col-span-2">
            <p className="text-sm text-gray-500 mb-1">Descrição</p>
            <p className="text-sm text-gray-700">{campaign.description || 'Nenhuma descrição fornecida.'}</p>
          </div>
        </div>
      </div>

       {/* Informações de Monitoramento */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-t pt-4 mt-4">Monitoramento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
             <div>
                <p className="text-sm text-gray-500 mb-1">Última Verificação</p>
                <p className="font-medium text-gray-800">{formatDateTime(campaign.lastCheckMonitoring) || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Próxima Verificação/Execução</p>
                <p className="font-medium text-gray-800">{formatDateTime(campaign.nextExecutionMonitoring) || '-'}</p>
              </div>
                {campaign.healthStatus && (
                 <>
                   <div>
                     <p className="text-sm text-gray-500 mb-1">Tem Erros de Integração?</p>
                     <Badge variant={campaign.healthStatus.hasIntegrationErrors ? 'error' : 'success'}>
                       {campaign.healthStatus.hasIntegrationErrors ? 'Sim' : 'Não'}
                     </Badge>
                   </div>
                   <div>
                     <p className="text-sm text-gray-500 mb-1">Execução Pendente?</p>
                     <Badge variant={campaign.healthStatus.hasPendingExecution ? 'warning' : 'success'}>
                       {campaign.healthStatus.hasPendingExecution ? 'Sim' : 'Não'}
                     </Badge>
                   </div>
                    <div className="md:col-span-2">
                     <p className="text-sm text-gray-500 mb-1">Última Mensagem de Saúde</p>
                     <p className="text-sm text-gray-700 break-words">{campaign.healthStatus.lastMessage || '-'}</p>
                   </div>
                 </>
                )}
                <div className="md:col-span-2">
                     <p className="text-sm text-gray-500 mb-1">Notas do Monitoramento</p>
                     <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border break-words">{campaign.monitoringNotes || 'Nenhuma nota.'}</p>
                 </div>
          </div>
        </div>

      {/* Agendamento */}
      {campaign.scheduler && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-t pt-4 mt-4">Agendamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Início Agendado</p>
              <p className="font-medium text-gray-800">{formatDateTime(campaign.scheduler.startDateTime) || '-'}</p>
            </div>
            {campaign.scheduler.endDateTime && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Término Agendado</p>
                <p className="font-medium text-gray-800">{formatDateTime(campaign.scheduler.endDateTime)}</p>
              </div>
            )}
             <div>
              <p className="text-sm text-gray-500 mb-1">Recorrente?</p>
              <p className="font-medium text-gray-800">{campaign.scheduler.isRecurrent ? 'Sim' : 'Não'}</p>
            </div>
            {campaign.scheduler.crontab && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Crontab</p>
                <p className="font-mono text-sm text-gray-700">{campaign.scheduler.crontab}</p>
              </div>
            )}
          </div>
        </div>
      )}

       {/* Métricas */}
       {campaign.metrics && (
         <div>
           <h3 className="text-lg font-semibold text-gray-900 mb-4 border-t pt-4 mt-4">Métricas</h3>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
             <div>
               <p className="text-sm text-gray-500 mb-1">Total Execuções</p>
               <p className="font-semibold text-xl text-gray-800">{formatNumber(campaign.metrics.totalExecutions)}</p>
             </div>
             <div>
               <p className="text-sm text-gray-500 mb-1">Exec. Completas</p>
               <p className="font-semibold text-xl text-success-600">{formatNumber(campaign.metrics.completedExecutions)}</p>
             </div>
              <div>
               <p className="text-sm text-gray-500 mb-1">Exec. Com Falha</p>
               <p className="font-semibold text-xl text-error-600">{formatNumber(campaign.metrics.failedExecutions)}</p>
             </div>
              <div>
               <p className="text-sm text-gray-500 mb-1">Taxa de Sucesso</p>
               <p className="font-semibold text-xl text-gray-800">{campaign.metrics.successRate?.toFixed(1) ?? '0.0'}%</p>
             </div>
              <div>
               <p className="text-sm text-gray-500 mb-1">Última Execução</p>
               <p className="font-medium text-sm text-gray-800">{formatDateTime(campaign.metrics.lastExecutionDate) || '-'}</p>
             </div>
              {/* Adicionar tempo médio se necessário */}
           </div>
         </div>
       )}

       {/* Botão para ver Execuções */}
        <div className="border-t pt-4 mt-4">
             <Button
                variant="primary"
                size="sm"
                onClick={() => onViewHistory(campaign)}>
                Ver Histórico de Execuções
              </Button>
        </div>

    </div>
  );
};

CampaignDetails.propTypes = {
    campaign: PropTypes.object.isRequired,
    onViewHistory: PropTypes.func.isRequired,
};

export default Campaigns;