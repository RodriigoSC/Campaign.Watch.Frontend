import { useState } from 'react';
import { Plus, Mail, MessageSquare, Bell, Trash2, Edit } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CampaignModal from '../components/ui/CampaignModal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const Alerts = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      name: 'Alerta de Erro de Integração',
      type: 'email',
      condition: 'error',
      recipient: 'admin@company.com',
      isActive: true,
      createdAt: '2024-01-15T10:00:00',
    },
    {
      id: 2,
      name: 'Alerta de Execução Atrasada',
      type: 'webhook',
      condition: 'delayed',
      recipient: 'https://api.company.com/webhook',
      isActive: true,
      createdAt: '2024-01-20T14:30:00',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    condition: 'error',
    recipient: '',
  });

  const handleOpenModal = (alert = null) => {
    if (alert) {
      setEditingAlert(alert);
      setFormData(alert);
    } else {
      setEditingAlert(null);
      setFormData({
        name: '',
        type: 'email',
        condition: 'error',
        recipient: '',
      });
    }
    setShowModal(true);
  };

  const handleSaveAlert = () => {
    if (editingAlert) {
      setAlerts(alerts.map(a => a.id === editingAlert.id ? { ...formData, id: a.id } : a));
    } else {
      setAlerts([...alerts, { ...formData, id: Date.now(), isActive: true, createdAt: new Date().toISOString() }]);
    }
    setShowModal(false);
  };

  const handleDeleteAlert = (id) => {
    if (confirm('Tem certeza que deseja excluir este alerta?')) {
      setAlerts(alerts.filter(a => a.id !== id));
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'email': return <Mail size={20} />;
      case 'sms': return <MessageSquare size={20} />;
      case 'webhook': return <Bell size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getAlertTypeLabel = (type) => {
    const types = {
      email: 'E-mail',
      sms: 'SMS',
      webhook: 'Webhook',
    };
    return types[type] || type;
  };

  const getConditionLabel = (condition) => {
    const conditions = {
      error: 'Erro de Integração',
      delayed: 'Execução Atrasada',
      success: 'Campanha Concluída',
      failed: 'Falha na Campanha',
    };
    return conditions[condition] || condition;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alertas</h1>
          <p className="text-gray-600 mt-1">Configure notificações e alertas do sistema</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus size={20} className="mr-2" />
          Novo Alerta
        </Button>
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
                <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
                <p className="text-sm text-gray-600">Total de Alertas</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {alerts.filter(a => a.isActive).length}
                </p>
                <p className="text-sm text-gray-600">Alertas Ativos</p>
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
                  {alerts.filter(a => a.type === 'email').length}
                </p>
                <p className="text-sm text-gray-600">Alertas por E-mail</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas Configurados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
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
                      <span>
                        <strong>Tipo:</strong> {getAlertTypeLabel(alert.type)}
                      </span>
                      <span>
                        <strong>Condição:</strong> {getConditionLabel(alert.condition)}
                      </span>
                      <span>
                        <strong>Destino:</strong> {alert.recipient}
                      </span>
                    </div>
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
            ))}

            {alerts.length === 0 && (
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

      {/* Modal de Criação/Edição */}
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
              { value: 'sms', label: 'SMS' },
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
              { value: 'success', label: 'Campanha Concluída' },
              { value: 'failed', label: 'Falha na Campanha' },
            ]}
          />

          <Input
            label={formData.type === 'email' ? 'E-mail' : formData.type === 'sms' ? 'Telefone' : 'URL do Webhook'}
            value={formData.recipient}
            onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
            placeholder={
              formData.type === 'email'
                ? 'exemplo@empresa.com'
                : formData.type === 'sms'
                ? '+5511999999999'
                : 'https://api.empresa.com/webhook'
            }
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSaveAlert}>
              {editingAlert ? 'Salvar Alterações' : 'Criar Alerta'}
            </Button>
          </div>
        </div>
      </CampaignModal>
    </div>
  );
};

export default Alerts;