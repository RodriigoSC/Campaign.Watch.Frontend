// src/features/alerts/pages/AlertsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, Mail, MessageSquare, Bell, Trash2, Edit, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/Card/Card';
import Button from '../../../shared/components/Button/Button';
import Badge from '../../../shared/components/Badge/Badge';
import CampaignModal from '../../../shared/components/Modal/CampaignModal';
import Input from '../../../shared/components/Input/Input';
import Select from '../../../shared/components/Select/Select';
import Loading from '../../../shared/components/Loading/Loading';
import ErrorMessage from '../../../shared/components/ErrorMessage/ErrorMessage';
import { alertService } from '../../../shared/services/alertService';
import { formatDateTime } from '../../../shared/utils';

const getAlertIcon = (type) => {
    switch (type) {
      case 'email': return <Mail size={20} />;
      case 'sms': return <MessageSquare size={20} />;
      case 'webhook': return <Bell size={20} />;
      default: return <Bell size={20} />;
    }
};

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    condition: 'error',
    recipient: '',
    isActive: true,
  });

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await alertService.getAllAlerts();
      setAlerts(data || []);
    } catch (err) {
      console.error('Erro ao carregar alertas:', err);
      setError(err.message || 'Não foi possível buscar os alertas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const handleOpenModal = (alert = null) => {
    if (alert) {
      setEditingAlert(alert);
      setFormData({
        name: alert.name || '',
        type: alert.type || 'email',
        condition: alert.condition || 'error',
        recipient: alert.recipient || '',
        isActive: alert.isActive ?? true,
      });
    } else {
      setEditingAlert(null);
      setFormData({
        name: '',
        type: 'email',
        condition: 'error',
        recipient: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleSaveAlert = async () => {
    setIsSaving(true);
    setError(null);
    try {
      if (editingAlert) {
        await alertService.updateAlert(editingAlert.id, formData);
      } else {
        await alertService.createAlert(formData);
      }
      setShowModal(false);
      loadAlerts();
    } catch (err) {
      console.error('Erro ao salvar alerta:', err);
      alert(`Erro ao salvar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAlert = async (id) => {
    if (confirm('Tem certeza que deseja excluir este alerta?')) {
      try {
        await alertService.deleteAlert(id);
        loadAlerts();
      } catch (err) {
        console.error('Erro ao deletar alerta:', err);
        alert(`Erro ao deletar: ${err.message}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alertas</h1>
          <p className="text-gray-600 mt-1">Configure notificações e alertas do sistema</p>
        </div>
        <div className="flex items-center space-x-3">
           <Button
              variant="outline"
              size="sm"
              onClick={loadAlerts}
              disabled={loading}
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button variant="primary" onClick={() => handleOpenModal()}>
              <Plus size={20} className="mr-2" />
              Novo Alerta
            </Button>
        </div>
      </div>

      {loading && <Loading text="Carregando alertas..." />}
      {error && !loading && (
        <ErrorMessage
          title="Erro ao carregar Alertas"
          message={error}
          onRetry={loadAlerts}
        />
      )}

      {!loading && !error && (
        <Card>
          <CardHeader>
            <CardTitle>Alertas Configurados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                        {getAlertIcon(alert.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{alert.name}</h4>
                          <Badge variant={alert.isActive ? 'success' : 'default'}>
                            {alert.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                           <span className="truncate" title={alert.recipient}>
                            <strong>Destino:</strong> {alert.recipient}
                          </span>
                        </div>
                         <p className="text-xs text-gray-400 mt-1">
                           Criado em: {formatDateTime(alert.createdAt)}
                         </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(alert)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAlert(alert.id)}
                      >
                        <Trash2 size={16} className="text-error-600" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Bell className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500">Nenhum alerta configurado</p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-4"
                    onClick={() => handleOpenModal()}
                  >
                    Criar Primeiro Alerta
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <CampaignModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAlert ? 'Editar Alerta' : 'Novo Alerta'}
      >
        <div className="space-y-4">
          <Input
            label="Nome do Alerta"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Alerta de Erro de Integração"
          />

          <Select
            label="Tipo de Alerta"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={[
              { value: 'email', label: 'E-mail' },
              { value: 'webhook', label: 'Webhook' },
            ]}
          />

          <Select
            label="Condição"
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            options={[
              { value: 'error', label: 'Erro de Integração' },
              { value: 'delayed', label: 'Execução Atrasada' },
            ]}
          />

          <Input
            label={formData.type === 'email' ? 'E-mail' : 'URL do Webhook'}
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

          <div className="flex justify-end space-x-3 pt-4">
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