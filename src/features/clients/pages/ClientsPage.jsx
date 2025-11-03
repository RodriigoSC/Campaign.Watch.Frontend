// src/features/clients/pages/ClientsPage.jsx
import { useState, useEffect } from 'react';
import { Plus, Eye, RefreshCw, Edit, Trash2, Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/Card/Card';
import Button from '../../../shared/components/Button/Button';
import Badge from '../../../shared/components/Badge/Badge';
import Loading from '../../../shared/components/Loading/Loading';
import ErrorMessage from '../../../shared/components/ErrorMessage/ErrorMessage';
import CampaignModal from '../../../shared/components/Modal/CampaignModal';
import Input from '../../../shared/components/Input/Input';
import { clientService } from '../../../shared/services/clientService';
import api from '../../../shared/services/api';
import { formatDateTime } from '../../../shared/utils';
import { useNavigate } from 'react-router-dom';
import ClientFilter from '../components/ClientFilter'; // Importação do filtro atualizado

const ClientsPage = () => {
  // Estado para a lista mestre de clientes (fonte da verdade)
  const [allClients, setAllClients] = useState([]);
  // Estado para o texto do filtro
  const [filter, setFilter] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    isActive: true,
    campaignConfig: { projectID: '', database: '' },
  });

  // Carrega todos os clientes da API
  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const clientsData = await clientService.getAllClients();
      setAllClients(clientsData || []); // Atualiza a lista mestre
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setError(err.message || 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);
  
  // Função para o botão "Atualizar"
  const handleRefreshAndClearFilter = () => {
    setFilter(''); // Limpa o campo de filtro
    loadClients(); // Recarrega os dados da API
  };

  const handleViewClientCampaigns = (clientName) => {
    navigate(`/campaigns?client=${encodeURIComponent(clientName)}`);
  };

  // Abre o modal para criar ou editar
  const handleOpenModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        id: client.id,
        name: client.name || '',
        isActive: client.isActive ?? true,
        campaignConfig: client.campaignConfig
          ? {
              projectID: client.campaignConfig.projectID || '',
              database: client.campaignConfig.database || '',
            }
          : { projectID: '', database: '' },
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        isActive: true,
        campaignConfig: { projectID: '', database: '' },
      });
    }
    setShowModal(true);
  };

  // Salva (cria ou atualiza) um cliente
  const handleSaveClient = async () => {
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        isActive: formData.isActive,
        campaignConfig: formData.campaignConfig,
      };

      if (editingClient) {
        await clientService.updateClient(editingClient.id, payload);
      } else {
        await clientService.createClient(payload);
      }

      setShowModal(false);
      api.clearCache();
      loadClients(); // Recarrega a lista mestre
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      const apiError = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join('\n')
        : err.message;
      alert(`Erro ao salvar cliente: ${apiError}`);
      setLoading(false);
    }
  };

  // Exclui um cliente
  const handleDeleteClient = async (clientId, clientName) => {
    if (confirm(`Tem certeza que deseja excluir o cliente "${clientName}"? Esta ação não pode ser desfeita.`)) {
      setLoading(true);
      try {
        await clientService.deleteClient(clientId);
        api.clearCache();
        loadClients(); // Recarrega a lista mestre
      } catch (err) {
        console.error('Erro ao excluir cliente:', err);
        alert(`Erro ao excluir cliente: ${err.message}`);
        setLoading(false);
      }
    }
  };

  // --- LÓGICA DE FILTRAGEM DINÂMICA (CLIENT-SIDE) ---
  const lowerCaseFilter = filter.toLowerCase();
  
  const filteredClients = allClients.filter(client => {
    // Se o filtro estiver vazio, retorna todos
    if (!lowerCaseFilter) return true;

    // Verifica nome, id e projectID
    const nameMatch = client.name.toLowerCase().includes(lowerCaseFilter);
    const idMatch = client.id.toString().includes(lowerCaseFilter);
    const projectMatch = client.campaignConfig?.projectID
      ? client.campaignConfig.projectID.toLowerCase().includes(lowerCaseFilter)
      : false;

    return nameMatch || idMatch || projectMatch;
  });
  // --- FIM DA LÓGICA DE FILTRAGEM ---

  // Loading inicial (só exibe se a lista mestre estiver vazia)
  if (loading && allClients.length === 0) {
    return <Loading size="lg" text="Carregando clientes..." />;
  }

  // Erro de carregamento (só exibe se a lista mestre estiver vazia)
  if (error && allClients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <ErrorMessage title="Erro ao carregar clientes" message={error} onRetry={loadClients} />
      </div>
    );
  }

  // Calcula estatísticas com base na lista MESTRE (allClients)
  // Isso garante que os cards de resumo sempre mostrem o total real
  const totalAllClients = allClients.length;
  const activeAllClients = allClients.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os clientes cadastrados</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Botão de atualizar agora também limpa o filtro */}
          <Button variant="outline" size="sm" onClick={handleRefreshAndClearFilter} disabled={loading}>
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <Plus size={20} className="mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Cards Resumo (baseados na lista mestre) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Bell className="text-primary-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalAllClients}</p>
                <p className="text-sm text-gray-600">Total de Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <Bell className="text-success-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeAllClients}</p>
                <p className="text-sm text-gray-600">Clientes Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- NOVO FILTRO DINÂMICO --- */}
      <div className="flex justify-start">
         <ClientFilter filter={filter} onFilterChange={setFilter} />
      </div>

      {/* Erro de atualização (se a lista já estiver carregada, mas a atualização falhar) */}
      {error && allClients.length > 0 && (
        <ErrorMessage title="Erro ao atualizar clientes" message={error} onRetry={loadClients} />
      )}

      {/* Lista de Clientes (renderiza a lista FILTRADA) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-2 overflow-hidden">
                  <CardTitle className="text-lg truncate" title={client.name}>
                    {client.name}
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">
                    Criado em {formatDateTime(client.createdAt)}
                  </p>
                </div>
                <Badge variant={client.isActive ? 'success' : 'default'}>
                  {client.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-grow pt-4 flex flex-col justify-between">
              <div>
                {client.campaignConfig && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Project ID / Database</p>
                    <p className="text-sm font-mono text-gray-800 break-all">
                      {client.campaignConfig.projectID}
                      {client.campaignConfig.database && ` / ${client.campaignConfig.database}`}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleViewClientCampaigns(client.name)}
                >
                  <Eye size={16} className="mr-2" />
                  Ver Campanhas
                </Button>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-1/2 text-gray-600 hover:bg-gray-100"
                    onClick={() => handleOpenModal(client)}
                    disabled={loading}
                  >
                    <Edit size={16} className="mr-2" /> Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-1/2 text-error-600 hover:bg-error-50"
                    onClick={() => handleDeleteClient(client.id, client.name)}
                    disabled={loading}
                  >
                    <Trash2 size={16} className="mr-2" /> Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- MENSAGENS DE "NENHUM CLIENTE" --- */}
      {filteredClients.length === 0 && allClients.length > 0 && !loading && (
         <Card>
           <CardContent className="text-center py-12">
             <p className="text-gray-500 mb-4">
               {`Nenhum cliente encontrado com o filtro "${filter}"`}
             </p>

             <Button variant="secondary" onClick={() => setFilter('')}>
               Limpar Filtro
             </Button>
           </CardContent>
         </Card>
      )}
      
      {/* 2. Se a lista mestre está vazia (não há clientes cadastrados) */}
      {allClients.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhum cliente cadastrado</p>
            <Button variant="primary" onClick={() => handleOpenModal()}>
              <Plus size={20} className="mr-2" />
              Cadastrar Primeiro Cliente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* --- FIM DAS MENSAGENS --- */}


      {/* Modal de Criação/Edição (sem alterações) */}
      <CampaignModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <div className="space-y-4">
          <Input
            label="Nome do Cliente"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nome do Cliente"
            required
          />
          <Input
            label="Project ID"
            value={formData.campaignConfig?.projectID || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                campaignConfig: { ...formData.campaignConfig, projectID: e.target.value },
              })
            }
            placeholder="ID do Projeto"
            required
          />
          <Input
            label="Database Campanhas (Opcional)"
            value={formData.campaignConfig?.database || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                campaignConfig: { ...formData.campaignConfig, database: e.target.value },
              })
            }
            placeholder="Nome do banco de dados de origem das campanhas"
          />
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="clientIsActive"
              checked={formData.isActive ?? true}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="clientIsActive" className="text-sm font-medium text-gray-700">
              Cliente Ativo
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveClient} isLoading={loading}>
              {editingClient ? 'Salvar Alterações' : 'Criar Cliente'}
            </Button>
          </div>
        </div>
      </CampaignModal>
    </div>
  );
};

export default ClientsPage;