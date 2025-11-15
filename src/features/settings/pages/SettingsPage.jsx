import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Save, User, Lock, Globe, Database, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/Card/Card';
import Button from '../../../shared/components/Button/Button';
import Input from '../../../shared/components/Input/Input';
import Select from '../../../shared/components/Select/Select';
import Loading from '../../../shared/components/Loading/Loading';
import ErrorMessage from '../../../shared/components/ErrorMessage/ErrorMessage';
import { useAuthStore } from '../../../store/authStore';
import { settingsService } from '../../../shared/services/settingsService';

// Componente "dumb" para abas (sem alteração)
const tabs = [
  { id: 'profile', name: 'Perfil', icon: User },
  { id: 'security', name: 'Segurança', icon: Lock },
  { id: 'system', name: 'Sistema', icon: Database },
  { id: 'general', name: 'Geral', icon: Globe },
];

// --- Componentes filhos (agora controlados) ---

const ProfileSettings = ({ data, onSave, isSaving, onChange }) => {
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

          <Input 
            label="Nome Completo" 
            value={data.name} 
            onChange={(e) => onChange('name', e.target.value)}
          />
          <Input 
            label="E-mail" 
            type="email" 
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)} 
          />
          <Input 
            label="Telefone" 
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)} 
          />
          <Input 
            label="Cargo" 
            value={data.role}
            readOnly
            className="bg-gray-100"
          />

          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={() => onSave('profile', data)} isLoading={isSaving}>
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
          {/*
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
          */}
          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={() => onSave('security', {})} isLoading={isSaving}>
              <Save size={16} className="mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    );
};


const SystemSettings = ({ data, onSave, isSaving, onChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Sistema</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            label="URL da API"
            value={data.apiUrl}
            onChange={(e) => onChange('apiUrl', e.target.value)}
          />

          <Input
            label="Timeout de Requisição (segundos)"
            type="number"
            value={data.timeout}
            onChange={(e) => onChange('timeout', Number(e.target.value))}
          />

          <Select
            label="Intervalo de Atualização"
            value={data.refreshInterval}
            onChange={(e) => onChange('refreshInterval', Number(e.target.value))}
            options={[
              { value: 1, label: '1 minuto' },
              { value: 5, label: '5 minutos' },
              { value: 10, label: '10 minutos' },
              { value: 30, label: '30 minutos' },
            ]}
          />
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logs e Diagnósticos</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <label htmlFor="detailedLogs" className="text-sm font-medium cursor-pointer">Habilitar Logs Detalhados</label>
                <input 
                  type="checkbox" 
                  id="detailedLogs" 
                  className="w-4 h-4" 
                  checked={data.enableDetailedLogs}
                  onChange={(e) => onChange('enableDetailedLogs', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <label htmlFor="debugMode" className="text-sm font-medium cursor-pointer">Modo Debug</label>
                <input 
                  type="checkbox" 
                  id="debugMode" 
                  className="w-4 h-4" 
                  checked={data.debugMode}
                  onChange={(e) => onChange('debugMode', e.target.checked)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={() => onSave('system', data)} isLoading={isSaving}>
              <Save size={16} className="mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const GeneralSettings = ({ data, onSave, isSaving, onChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Gerais</CardTitle>
      </CardHeader>
      <CardContent>
        {/* ***** INÍCIO DA CORREÇÃO JSX ***** */}
        <div className="space-y-4"> {/* Div principal que faltava fechar no local correto */}
          <Select
            label="Idioma"
            value={data.language}
            onChange={(e) => onChange('language', e.target.value)}
            options={[
              { value: 'pt-BR', label: 'Português (Brasil)' },
              { value: 'en-US', label: 'English (US)' },
              { value: 'es-ES', label: 'Español' },
            ]}
          />

          <Select
            label="Fuso Horário"
            value={data.timezone}
            onChange={(e) => onChange('timezone', e.target.value)}
            options={[
              { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
              { value: 'America/New_York', label: 'New York (GMT-5)' },
              { value: 'Europe/London', label: 'London (GMT+0)' },
            ]}
          />

          <Select
            label="Formato de Data"
            value={data.dateFormat}
            onChange={(e) => onChange('dateFormat', e.target.value)}
            options={[
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
            ]}
          />
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificações</h3>
             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <label htmlFor="emailNotif" className="text-sm font-medium cursor-pointer">Notificações por E-mail</label>
                <input 
                  type="checkbox" 
                  id="emailNotif" 
                  className="w-4 h-4" 
                  checked={data.emailNotifications}
                  onChange={(e) => onChange('emailNotifications', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <label htmlFor="pushNotif" className="text-sm font-medium cursor-pointer">Notificações Push</label>
                <input 
                  type="checkbox" 
                  id="pushNotif" 
                  className="w-4 h-4" 
                  checked={data.pushNotifications}
                  onChange={(e) => onChange('pushNotifications', e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <label htmlFor="alertSounds" className="text-sm font-medium cursor-pointer">Sons de Alerta</label>
                <input 
                  type="checkbox" 
                  id="alertSounds" 
                  className="w-4 h-4" 
                  checked={data.alertSounds}
                  onChange={(e) => onChange('alertSounds', e.target.checked)}
                />
              </div>
            </div>
          
          {/* O botão deve estar dentro da div 'space-y-4' */}
          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={() => onSave('general', data)} isLoading={isSaving}>
              <Save size={16} className="mr-2" />
              Salvar Alterações
            </Button>
          </div>
          
        </div> {/* Esta é a div 'space-y-4' que fecha corretamente AGORA */}
        {/* ***** FIM DA CORREÇÃO JSX ***** */}
      </CardContent>
    </Card>
  );
};


// --- Componente Principal (Pai) ---

const SettingsPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filtra as abas com base na role
  const isAdmin = user?.Role === 'Admin' || user?.role === 'Admin';
  const visibleTabs = tabs.filter(tab => {
    if (tab.id === 'system' && !isAdmin) {
      return false;
    }
    return true;
  });
  
  // Garante que a aba ativa seja válida
  useEffect(() => {
    if (!visibleTabs.find(t => t.id === activeTab)) {
      setActiveTab('profile'); 
    }
  }, [activeTab, visibleTabs]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await settingsService.getSettings();
      // Mescla dados do token (boa prática)
      if (data.profile) {
        data.profile.name = data.profile.name || user?.name;
        data.profile.email = data.profile.email || user?.email;
        data.profile.role = data.profile.role || user?.role;
      }
      setSettings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]); 

  const handleSave = async (section, data) => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      await settingsService.saveSettings(section, data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); 
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleChange = (section, key, value) => {
    setSettings(prev => ({
        ...prev,
        [section]: {
            ...prev[section],
            [key]: value,
        }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600 mt-1">Gerencie as configurações do sistema</p>
         </div>
         {saveSuccess && (
            <div className="flex items-center space-x-2 text-success-700 bg-success-100 p-2 rounded-lg">
                <CheckCircle size={18} />
                <span className="text-sm font-medium">Salvo com sucesso!</span>
            </div>
         )}
      </div>
      
      {error && (
        <ErrorMessage title="Erro" message={error} onRetry={() => setError(null)} />
      )}

      {loading ? (
        <Loading text="Carregando configurações..." size="lg" />
      ) : !settings ? (
         <ErrorMessage title="Erro ao Carregar" message="Não foi possível carregar as configurações." onRetry={loadData} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1 h-fit"> 
            <CardContent className="pt-6">
              <nav className="space-y-2">
                {/* Mapeia as abas visíveis */}
                {visibleTabs.map((tab) => {
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
            {activeTab === 'profile' && settings.profile && (
              <ProfileSettings 
                data={settings.profile} 
                onSave={handleSave} 
                isSaving={isSaving}
                onChange={(key, value) => handleChange('profile', key, value)}
              />
            )}
            {activeTab === 'security' && <SecuritySettings onSave={handleSave} isSaving={isSaving} />}
            
            {activeTab === 'system' && settings.system && (
                 <SystemSettings 
                    data={settings.system}
                    onSave={handleSave} 
                    isSaving={isSaving}
                    onChange={(key, value) => handleChange('system', key, value)}
                 />
            )}
            {activeTab === 'general' && settings.general && (
                <GeneralSettings 
                    data={settings.general}
                    onSave={handleSave} 
                    isSaving={isSaving}
                    onChange={(key, value) => handleChange('general', key, value)}
                />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// PropTypes (todos corretos)
ProfileSettings.propTypes = {
  data: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

SecuritySettings.propTypes = {
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
};

SystemSettings.propTypes = {
  data: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

GeneralSettings.propTypes = {
  data: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SettingsPage;