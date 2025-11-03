// src/features/alerts/pages/AlertsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, Mail, MessageSquare, Bell, Trash2, Edit, RefreshCw, AlertCircle, CheckCircle, AlertTriangle, History, Users, Globe } from 'lucide-react'; // Importar Globe
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/Card/Card';
import Button from '../../../shared/components/Button/Button';
import Badge from '../../../shared/components/Badge/Badge';
import CampaignModal from '../../../shared/components/Modal/CampaignModal';
import Input from '../../../shared/components/Input/Input';
import Select from '../../../shared/components/Select/Select';
import Loading from '../../../shared/components/Loading/Loading';
import ErrorMessage from '../../../shared/components/ErrorMessage/ErrorMessage';
import { alertService } from '../../../shared/services/alertService';
import { clientService } from '../../../shared/services/clientService'; 
import { formatDateTime } from '../../../shared/utils';
import { cn } from '../../../shared/utils';

// --- Mapeamentos (Idênticos) ---
const severityInfo = {
  Healthy: { icon: CheckCircle, color: 'text-success-600', bgColor: 'bg-success-100', label: 'Healthy' },
  Warning: { icon: AlertTriangle, color: 'text-warning-600', bgColor: 'bg-warning-100', label: 'Warning' },
  Error: { icon: AlertCircle, color: 'text-error-600', bgColor: 'bg-error-100', label: 'Error' },
  Critical: { icon: AlertCircle, color: 'text-red-800', bgColor: 'bg-red-200', label: 'Critical' },
};
const diagnosticTypeOptions = [
  { value: '', label: 'Qualquer Condição' },
  { value: 'StepFailed', label: 'Etapa Falhou (StepFailed)' },
  { value: 'ExecutionDelayed', label: 'Execução Atrasada (ExecutionDelayed)' },
  { value: 'FilterStuck', label: 'Filtro Travado (FilterStuck)' },
  { value: 'IntegrationError', label: 'Erro de Integração (IntegrationError)' },
  { value: 'CampaignNotFinalized', label: 'Campanha Não Finalizada (CampaignNotFinalized)' },
];
const severityOptions = [
  { value: '', label: 'Qualquer Gravidade' },
  { value: 'Healthy', label: 'Healthy' },
  { value: 'Warning', label: 'Warning' },
  { value: 'Error', label: 'Error' },
  { value: 'Critical', label: 'Critical' },
];
const channelIcon = {
  email: Mail,
  webhook: Bell,
  sms: MessageSquare,
};

// --- Componente da Página ---

const AlertsPage = () => {
  const [activeTab, setActiveTab] = useState('config'); 
  
  // Estados de Cliente
  //const [clients, setClients] = useState([]); 
  const [selectedClient, setSelectedClient] = useState(''); // '', 'global', ou 'client-id'
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientOptions, setClientOptions] = useState([]); 

  // Estados de Alertas (Config/History)
  const [alerts, setAlerts] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(false); 
  const [errorConfig, setErrorConfig] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false); 
  const [errorHistory, setErrorHistory] = useState(null);

  // Estados do Modal
  const [showModal, setShowModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    conditionType: '', 
    minSeverity: '', 
    recipient: '',
    isActive: true,
  });

  // --- Funções de Carregamento ---

  // Carregar clientes para o seletor
  useEffect(() => {
    const loadClients = async () => {
      setLoadingClients(true);
      try {
        const clientsData = await clientService.getAllClients();
        //setClients(clientsData || []);
        
        const options = (clientsData || []).map(client => ({
          value: client.id,
          label: client.name,
        }));
        
        // (ATUALIZADO) Adiciona "Geral" ao seletor
        setClientOptions([
          { value: '', label: 'Selecione um escopo...' },
          { value: 'global', label: 'TODOS OS CLIENTES' },
          ...options
        ]);

      } catch (err) {
        console.error('Erro ao carregar clientes:', err);
        setErrorConfig('Não foi possível carregar a lista de clientes.');
      } finally {
        setLoadingClients(false);
      }
    };
    loadClients();
  }, []);

  // Carregar Configurações (depende de selectedClient)
  const loadAlertsConfig = useCallback(async () => {
    if (!selectedClient) { 
      setAlerts([]);
      return; 
    }
    setLoadingConfig(true);
    setErrorConfig(null);
    try {
      // Passa 'global' ou o ID do cliente
      const data = await alertService.getAllAlerts(selectedClient);
      setAlerts(data || []);
    } catch (err) {
      console.error('Erro ao carregar alertas:', err);
      setErrorConfig(err.message || 'Não foi possível buscar as configurações de alerta.');
    } finally {
      setLoadingConfig(false);
    }
  }, [selectedClient]); 

  // Carregar Histórico (depende de selectedClient)
  const loadAlertHistory = useCallback(async () => {
    if (!selectedClient) { 
      setHistory([]);
      return; 
    }
    setLoadingHistory(true);
    setErrorHistory(null);
    try {
      const data = await alertService.getAlertHistory(selectedClient);
      setHistory(data || []);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setErrorHistory(err.message || 'Não foi possível buscar o histórico de alertas.');
    } finally {
      setLoadingHistory(false);
    }
  }, [selectedClient]); 

  // Dispara o carregamento da aba ativa quando o cliente muda
  useEffect(() => {
    if (activeTab === 'config') {
      loadAlertsConfig();
    } else {
      loadAlertHistory();
    }
  }, [activeTab, loadAlertsConfig, loadAlertHistory, selectedClient]);

  // --- Funções do Modal (CRUD) ---

  const handleOpenModal = (alert = null) => {
    // (Lógica idêntica à anterior)
    if (alert) {
      setEditingAlert(alert);
      setFormData({
        name: alert.name || '',
        type: alert.type || 'email',
        conditionType: alert.conditionType || '', 
        minSeverity: alert.minSeverity || '',
        recipient: alert.recipient || '',
        isActive: alert.isActive ?? true,
      });
    } else {
      setEditingAlert(null);
      setFormData({
        name: '',
        type: 'email',
        conditionType: '', 
        minSeverity: '', 
        recipient: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleSaveAlert = async () => {
    if (!selectedClient) {
        alert('Erro: Nenhum escopo (Geral ou Cliente) selecionado.');
        return;
    }
    setIsSaving(true);
    setErrorConfig(null);
    
    // (ATUALIZADO) Define clientId como null se for 'global'
    const payload = { 
      ...formData, 
      clientId: selectedClient === 'global' ? null : selectedClient 
    };

    // Se estiver editando, o clientId já está atrelado (ou é null)
    if (editingAlert) {
        payload.clientId = editingAlert.clientId; 
    }

    try {
      if (editingAlert) {
        await alertService.updateAlert(editingAlert.id, payload);
      } else {
        await alertService.createAlert(payload);
      }
      setShowModal(false);
      loadAlertsConfig(); 
    } catch (err) {
      console.error('Erro ao salvar alerta:', err);
      const apiError = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join('\n')
        : err.message;
      alert(`Erro ao salvar: ${apiError}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAlert = async (id) => {
    // (Lógica idêntica à anterior)
    if (confirm('Tem certeza que deseja excluir esta configuração de alerta?')) {
      setIsSaving(true); 
      try {
        await alertService.deleteAlert(id);
        loadAlertsConfig(); 
      } catch (err) {
        console.error('Erro ao deletar alerta:', err);
        alert(`Erro ao deletar: ${err.message}`);
      } finally {
        setIsSaving(false);
      }
    }
  };
  
  const isLoading = loadingConfig || loadingHistory || loadingClients;
  
  // --- Funções de Renderização ---

  const renderConfigTab = () => {
    if (loadingConfig) return <Loading text="Carregando configurações..." />;
    
    if (errorConfig) {
      return <ErrorMessage title="Erro ao carregar Configurações" message={errorConfig} onRetry={loadAlertsConfig} />;
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.length > 0 ? (
          alerts.map((alert) => {
            // ... (Lógica de renderização do card idêntica)
            const isAnySeverity = !alert.minSeverity;
            const sevLabel = isAnySeverity 
              ? 'Qualquer Gravidade' 
              : `Gravidade >= ${severityInfo[alert.minSeverity]?.label || alert.minSeverity}`;
            const SevIcon = isAnySeverity ? Bell : (severityInfo[alert.minSeverity]?.icon || AlertCircle);
            const sevColor = isAnySeverity ? 'text-gray-600' : (severityInfo[alert.minSeverity]?.color || 'text-gray-600');
            const sevBg = isAnySeverity ? 'bg-gray-100' : (severityInfo[alert.minSeverity]?.bgColor || 'bg-gray-100');
            const isAnyCondition = !alert.conditionType;
            const condLabel = isAnyCondition 
              ? 'Qualquer Condição' 
              : (diagnosticTypeOptions.find(o => o.value === alert.conditionType)?.label || alert.conditionType);
            const ChanIcon = channelIcon[alert.type] || Bell;

            return (
              <Card key={alert.id} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader className="border-b border-gray-200">
                   <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${sevBg} rounded-lg flex items-center justify-center ${sevColor}`}>
                        <SevIcon size={20} />
                      </div>
                      <div className="flex-1 mr-2 overflow-hidden">
                        <CardTitle className="text-base truncate" title={alert.name}>
                          {alert.name}
                        </CardTitle>
                        <p className="text-sm font-medium text-gray-600">
                          {sevLabel}
                        </p>
                        <p className="text-xs text-gray-500 truncate" title={condLabel}>
                          {condLabel}
                        </p>
                      </div>
                    </div>
                    <Badge variant={alert.isActive ? 'success' : 'default'}>
                      {alert.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow pt-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-sm text-gray-700 mb-3">
                      <ChanIcon size={16} className="text-primary-600" />
                      <span className="font-medium">Canal:</span>
                      <span className="capitalize">{alert.type}</span>
                    </div>
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Destino</p>
                      <p className="text-sm font-mono text-gray-800 break-all" title={alert.recipient}>
                        {alert.recipient}
                      </p>
                    </div>
                     <p className="text-xs text-gray-400 mt-1">
                       Criado em: {formatDateTime(alert.createdAt)}
                     </p>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-1/2 text-gray-600 hover:bg-gray-100"
                      onClick={() => handleOpenModal(alert)}
                      disabled={isSaving}
                    >
                      <Edit size={16} className="mr-2" /> Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-1/2 text-error-600 hover:bg-error-50"
                      onClick={() => handleDeleteAlert(alert.id)}
                      disabled={isSaving}
                    >
                      <Trash2 size={16} className="mr-2" /> Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="text-center py-12">
                <Bell className="mx-auto text-gray-400 mb-4" size={48} />
                {/* (ATUALIZADO) Mensagem dinâmica */}
                <p className="text-gray-500">
                  {selectedClient === 'global' 
                    ? 'Nenhuma configuração de alerta global encontrada.' 
                    : 'Nenhuma configuração de alerta encontrada para este cliente.'}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleOpenModal()}
                  disabled={!selectedClient}
                >
                  Criar Primeiro Alerta
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  const renderHistoryTab = () => {
    if (loadingHistory) return <Loading text="Carregando histórico de alertas..." />;
    
    if (errorHistory) {
      return <ErrorMessage title="Erro ao carregar Histórico" message={errorHistory} onRetry={loadAlertHistory} />;
    }

    if (history.length === 0) {
        return (
           <Card>
              <CardContent className="text-center py-12">
                <History className="mx-auto text-gray-400 mb-4" size={48} />
                {/* (ATUALIZADO) Mensagem dinâmica */}
                <p className="text-gray-500">
                  {selectedClient === 'global'
                    ? 'Nenhum alerta global foi disparado recentemente.'
                    : 'Nenhum alerta foi disparado recentemente para este cliente.'}
                </p>
              </CardContent>
            </Card>
        );
    }
    
    return (
      <Card>
        <CardContent className="pt-4">
          <ul className="divide-y divide-gray-200">
            {history.map((item) => {
              // ... (Lógica de renderização do item idêntica)
              const SevIcon = severityInfo[item.severity]?.icon || AlertCircle;
              const sevColor = severityInfo[item.severity]?.color || 'text-gray-600';
              const sevBg = severityInfo[item.severity]?.bgColor || 'bg-gray-100';

              return (
                <li key={item.id} className="py-4 flex space-x-3">
                  <div className={`w-10 h-10 ${sevBg} rounded-lg flex items-center justify-center ${sevColor} flex-shrink-0 mt-1`}>
                    <SevIcon size={20} />
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-center">
                       <p className={`text-sm font-bold ${sevColor}`}>{item.severity}</p>
                       <p className="text-xs text-gray-500">{formatDateTime(item.detectedAt)}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{item.message}</p>
                    <p className="text-sm text-gray-600">
                      Campanha: <span className="font-medium">{item.campaignName}</span>
                    </p>
                     <p className="text-sm text-gray-600">
                      Etapa: <span className="font-medium">{item.stepName}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    );
  };

  // --- Renderização Principal ---
  
  // (ATUALIZADO) Define o ícone do seletor
  const selectIcon = selectedClient === 'global' ? Globe : Users;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alertas</h1>
          <p className="text-gray-600 mt-1">Gerencie alertas globais ou por cliente.</p>
        </div>
        <div className="flex items-center space-x-3">
           <Button
             variant="outline"
             size="sm"
             onClick={activeTab === 'config' ? loadAlertsConfig : loadAlertHistory}
             disabled={isLoading || !selectedClient} 
           >
             <RefreshCw size={16} className={`mr-2 ${isLoading && selectedClient ? 'animate-spin' : ''}`} />
             Atualizar
           </Button>
           <Button 
            variant="primary" 
            onClick={() => handleOpenModal()} 
            disabled={!selectedClient || loadingClients} 
           >
             <Plus size={20} className="mr-2" />
             Nova Configuração
           </Button>
        </div>
      </div>

      {/* --- SELETOR DE ESCOPO (CLIENTE OU GERAL) --- */}
      <div className="max-w-md">
        <Select
            label="Escopo do Alerta"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            options={clientOptions}
            disabled={loadingClients}
            leadingIcon={selectIcon}
        />
      </div>


      {/* --- Abas --- */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('config')}
            disabled={!selectedClient}
            className={cn(
              'py-3 px-1 border-b-2 font-medium text-sm disabled:opacity-50',
              activeTab === 'config'
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Configurações
          </button>
          <button
            onClick={() => setActiveTab('history')}
            disabled={!selectedClient}
            className={cn(
              'py-3 px-1 border-b-2 font-medium text-sm disabled:opacity-50',
              activeTab === 'history'
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            Histórico de Alertas
          </button>
        </nav>
      </div>

      {/* --- Conteúdo da Aba --- */}
      <div>
        {!selectedClient && !loadingClients && (
            <Card>
                <CardContent className="text-center py-12">
                    <Globe className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500">Selecione um escopo (Geral ou um cliente) para começar.</p>
                </CardContent>
            </Card>
        )}
        
        {selectedClient && (
            <>
                {activeTab === 'config' ? renderConfigTab() : renderHistoryTab()}
            </>
        )}
      </div>

      {/* --- Modal (Idêntico) --- */}
      <CampaignModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAlert ? 'Editar Configuração' : 'Nova Configuração de Alerta'}
      >
        <div className="space-y-4">
          {/* ... (Conteúdo do Modal idêntico à versão anterior) ... */}
          <Input
            label="Nome da Configuração"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Alerta Crítico de Falha"
          />
          <Select
            label="Condição (QUANDO alertar?)"
            value={formData.conditionType}
            onChange={(e) => setFormData({ ...formData, conditionType: e.target.value })}
            options={diagnosticTypeOptions}
          />
          <Select
            label="Gravidade Mínima (QUAL gravidade?)"
            value={formData.minSeverity}
            onChange={(e) => setFormData({ ...formData, minSeverity: e.target.value })}
            options={severityOptions}
          />
          <Select
            label="Canal (COMO alertar?)"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value, recipient: '' })} 
            options={[
              { value: 'email', label: 'E-mail' },
              { value: 'webhook', label: 'Webhook' },
            ]}
          />
          <Input
            label={formData.type === 'email' ? 'E-mail(s) (separados por vírgula)' : 'URL do Webhook'}
            value={formData.recipient}
            onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
            placeholder={
              formData.type === 'email'
                ? 'exemplo@empresa.com'
                : 'https://api.empresa.com/webhook'
            }
          />
          <div className="flex items-center space-x-2 pt-2">
             <input
                 type="checkbox"
                 id="alertIsActive"
                 checked={formData.isActive}
                 onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                 className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
             />
             <label htmlFor="alertIsActive" className="text-sm font-medium text-gray-700">
                 Alerta Ativo
             </label>
           </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveAlert} isLoading={isSaving}>
              {editingAlert ? 'Salvar Alterações' : 'Criar Alerta'}
            </Button>
          </div>
        </div>
      </CampaignModal>
    </div>
  );
};

export default AlertsPage;