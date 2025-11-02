// src/features/settings/pages/SettingsPage.jsx
import { useState } from 'react';
import { Save, User, Lock, Globe, Database } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/Card/Card';
import Button from '../../../shared/components/Button/Button';
import Input from '../../../shared/components/Input/Input';
import Select from '../../../shared/components/Select/Select';
import { useAuthStore } from '../../../store/authStore';

const SettingsPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'security', name: 'Segurança', icon: Lock },
    { id: 'system', name: 'Sistema', icon: Database },
    { id: 'general', name: 'Geral', icon: Globe },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'profile' && <ProfileSettings user={user} onSave={handleSave} isSaving={isSaving} />}
          {activeTab === 'security' && <SecuritySettings onSave={handleSave} isSaving={isSaving} />}
          {activeTab === 'system' && <SystemSettings onSave={handleSave} isSaving={isSaving} />}
          {activeTab === 'general' && <GeneralSettings onSave={handleSave} isSaving={isSaving} />}
        </div>
      </div>
    </div>
  );
};

const ProfileSettings = ({ user, onSave, isSaving }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <Button variant="outline" size="sm">Alterar Foto</Button>
            </div>
          </div>

          <Input label="Nome Completo" defaultValue={user?.name} />
          <Input label="E-mail" type="email" defaultValue={user?.email} />
          <Input label="Telefone" defaultValue="+55 11 99999-9999" />
          <Input label="Cargo" defaultValue={user?.role} />

          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={onSave} isLoading={isSaving}>
              <Save size={16} className="mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SecuritySettings = ({ onSave, isSaving }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Segurança</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h3>
            <div className="space-y-4">
              <Input label="Senha Atual" type="password" />
              <Input label="Nova Senha" type="password" />
              <Input label="Confirmar Nova Senha" type="password" />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Autenticação em Dois Fatores</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Status</p>
                <p className="text-sm text-gray-600">Desabilitado</p>
              </div>
              <Button variant="outline" size="sm">Habilitar</Button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={onSave} isLoading={isSaving}>
              <Save size={16} className="mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SystemSettings = ({ onSave, isSaving }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            label="URL da API"
            defaultValue="https://localhost:5001/api"
            placeholder="https://api.campaignwatch.com"
          />

          <Input
            label="Timeout de Requisição (segundos)"
            type="number"
            defaultValue="30"
          />

          <Select
            label="Intervalo de Atualização"
            defaultValue="5"
            options={[
              { value: '1', label: '1 minuto' },
              { value: '5', label: '5 minutos' },
              { value: '10', label: '10 minutos' },
              { value: '30', label: '30 minutos' },
            ]}
          />

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logs e Diagnósticos</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Habilitar Logs Detalhados</span>
                <input type="checkbox" className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Modo Debug</span>
                <input type="checkbox" className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={onSave} isLoading={isSaving}>
              <Save size={16} className="mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const GeneralSettings = ({ onSave, isSaving }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Gerais</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select
            label="Idioma"
            defaultValue="pt-BR"
            options={[
              { value: 'pt-BR', label: 'Português (Brasil)' },
              { value: 'en-US', label: 'English (US)' },
              { value: 'es-ES', label: 'Español' },
            ]}
          />

          <Select
            label="Fuso Horário"
            defaultValue="America/Sao_Paulo"
            options={[
              { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
              { value: 'America/New_York', label: 'New York (GMT-5)' },
              { value: 'Europe/London', label: 'London (GMT+0)' },
            ]}
          />

          <Select
            label="Formato de Data"
            defaultValue="DD/MM/YYYY"
            options={[
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
            ]}
          />

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificações</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Notificações por E-mail</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Notificações Push</span>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Sons de Alerta</span>
                <input type="checkbox" className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={onSave} isLoading={isSaving}>
              <Save size={16} className="mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPage;