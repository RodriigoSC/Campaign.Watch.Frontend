import { useState, useEffect } from 'react';
// Removido TrendingUp
import { Plus, Eye, RefreshCw, Edit, Trash2, Bell, Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import CampaignModal from '../components/ui/CampaignModal';
import Input from '../components/ui/Input';
// Removido Select não utilizado
// import Select from '../components/ui/Select';
import { clientService } from '../services/clientService';
import { formatDateTime } from '../utils';
import { useNavigate } from 'react-router-dom';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({});

    const loadClients = async () => {
        try {
            setLoading(true);
            setError(null);
            const clientsData = await clientService.getAllClients();
            setClients(clientsData);
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

    const handleViewClientCampaigns = (clientName) => {
        navigate(`/campaigns?client=${encodeURIComponent(clientName)}`);
    };

    const handleOpenModal = (client = null) => {
        if (client) {
            setEditingClient(client);
            setFormData({
               ...client,
               campaignConfig: client.campaignConfig ? { ...client.campaignConfig } : { projectID: '', database: '' },
               effectiveChannels: client.effectiveChannels ? [...client.effectiveChannels] : []
            });
        } else {
            setEditingClient(null);
            setFormData({ name: '', isActive: true, campaignConfig: { projectID: '', database: '' }, effectiveChannels: [] });
        }
        setShowModal(true);
    };

    const handleSaveClient = async () => {
        setLoading(true);
        try {
            if (editingClient) {
                // CORREÇÃO: Não desestruturar 'id' se não for usado.
                // Passa o formData diretamente, a API espera os dados sem o ID no corpo.
                await clientService.updateClient(editingClient.id, formData);
            } else {
                await clientService.createClient(formData);
            }
            setShowModal(false);
            loadClients();
        } catch (err) {
             console.error('Erro ao salvar cliente:', err);
             alert(`Erro ao salvar cliente: ${err.message}`);
        } finally {
             setLoading(false);
        }
    };

    const handleDeleteClient = async (clientId, clientName) => {
        if (confirm(`Tem certeza que deseja excluir o cliente "${clientName}"? Esta ação não pode ser desfeita.`)) {
            setLoading(true);
            try {
                await clientService.deleteClient(clientId);
                loadClients();
            } catch (err) {
                 console.error('Erro ao excluir cliente:', err);
                 alert(`Erro ao excluir cliente: ${err.message}`);
            } finally {
                 setLoading(false);
            }
        }
    };


    if (loading && clients.length === 0) {
        return <Loading size="lg" text="Carregando clientes..." />;
    }

    if (error && clients.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <ErrorMessage
                    title="Erro ao carregar clientes"
                    message={error}
                    onRetry={loadClients}
                />
            </div>
        );
    }

    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.isActive).length;
    const clientsWithEmail = clients.filter(c => c.effectiveChannels?.some(ch => ch.typeChannel === 'EffectiveMail' || ch.name?.toLowerCase().includes('email'))).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
                    <p className="text-gray-600 mt-1">Gerencie todos os clientes cadastrados</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadClients}
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Atualizar
                    </Button>
                    <Button variant="primary" onClick={() => handleOpenModal()}>
                        <Plus size={20} className="mr-2" />
                        Novo Cliente
                    </Button>
                </div>
            </div>

             {/* Info Cards */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Bell className="text-primary-600" size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
                        <p className="text-sm text-gray-600">Total de Clientes</p>
                    </div>
                    </div>
                </CardContent>
                </Card>
                {/* Outros Info Cards ... */}
                 <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                        <Bell className="text-success-600" size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">
                         {activeClients}
                        </p>
                        <p className="text-sm text-gray-600">Clientes Ativos</p>
                    </div>
                    </div>
                </CardContent>
                </Card>

                <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                        <Mail className="text-warning-600" size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">
                         {clientsWithEmail}
                        </p>
                        <p className="text-sm text-gray-600">Com Canal E-mail</p>
                    </div>
                    </div>
                </CardContent>
                </Card>
            </div>

             {error && clients.length > 0 && (
                <ErrorMessage
                    title="Erro ao atualizar clientes"
                    message={error}
                    onRetry={loadClients}
                />
             )}

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                    <Card key={client.id} className="hover:shadow-lg transition-shadow flex flex-col">
                       {/* CardHeader e CardContent como antes... */}
                       <CardHeader className="border-b border-gray-200">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 mr-2 overflow-hidden">
                                    <CardTitle className="text-lg truncate" title={client.name}>{client.name}</CardTitle>
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
                                {client.effectiveChannels && client.effectiveChannels.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Canais Configurados</p>
                                        <div className="flex flex-wrap gap-2">
                                            {client.effectiveChannels.map((channel, idx) => (
                                                <Badge key={idx} variant="default" className="text-xs">
                                                    {channel.name || channel.typeChannel || `Canal ${idx + 1}`}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

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

            {clients.length === 0 && !loading && !error && (
                <Card>
                   {/* Conteúdo para quando não há clientes... */}
                   <CardContent className="text-center py-12">
                        <p className="text-gray-500 mb-4">Nenhum cliente cadastrado</p>
                        <Button variant="primary" onClick={() => handleOpenModal()}>
                            <Plus size={20} className="mr-2" />
                            Cadastrar Primeiro Cliente
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Modal de Criação/Edição */}
            <CampaignModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            >
                <div className="space-y-4">
                   {/* Inputs e Checkbox como antes... */}
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
                        onChange={(e) => setFormData({ ...formData, campaignConfig: { ...formData.campaignConfig, projectID: e.target.value } })}
                        placeholder="ID do Projeto"
                        required
                    />
                    <Input
                        label="Database Campanhas (Opcional)"
                        value={formData.campaignConfig?.database || ''}
                        onChange={(e) => setFormData({ ...formData, campaignConfig: { ...formData.campaignConfig, database: e.target.value } })}
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
                     <div className="border-t pt-4 mt-4">
                         <p className="text-sm font-medium text-gray-700 mb-2">Canais Efetivos</p>
                         <p className="text-xs text-gray-500">(Configuração de canais ainda não implementada na UI)</p>
                     </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
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

export default Clients;