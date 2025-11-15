import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Save, User, Lock, Database, CheckCircle, Palette } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../shared/components/Card/Card';
import Button from '../../../shared/components/Button/Button';
import Input from '../../../shared/components/Input/Input';
import Select from '../../../shared/components/Select/Select';
import Loading from '../../../shared/components/Loading/Loading';
import ErrorMessage from '../../../shared/components/ErrorMessage/ErrorMessage';
import { useAuthStore } from '../../../store/authStore';
import { settingsService } from '../../../shared/services/settingsService';

// --- Abas de Navegação ---
const tabs = [
  { id: 'profile', name: 'Perfil', icon: User, description: 'Gerencie suas informações pessoais e de contato.' },
  { id: 'general', name: 'Geral', icon: Palette, description: 'Defina preferências de idioma, fuso horário e notificações.' },
  { id: 'security', name: 'Segurança', icon: Lock, description: 'Altere sua senha e gerencie a autenticação.' },
  { id: 'system', name: 'Sistema', icon: Database, description: 'Veja informações do ambiente e defina preferências de UI.' },
];

// --- Componente de Toggle (Switch) ---
const ToggleSwitch = ({ id, label, description, checked, onChange, disabled = false }) => (
  <div className="flex items-center justify-between">
    <label htmlFor={id} className="flex flex-col flex-1 pr-4 cursor-pointer">
      <span className="text-sm font-medium text-gray-900">{label}</span>
      {description && <span className="text-sm text-gray-500">{description}</span>}
    </label>
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
        checked ? 'bg-primary-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

ToggleSwitch.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};


// --- Componente: Aba de Perfil ---
const ProfileSettings = ({ data, onSave, isSaving, onChange }) => {
  
  const handleSaveClick = () => {
     const payload = {
        name: data.name,
        email: data.email,
        phone: data.phone,
     };
     onSave('profile', payload);
  };
  
  return (
    <>
      {/* Card 1: Foto de Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Foto de Perfil</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Atualize sua foto de perfil e avatar.</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <Button variant="outline" size="sm" disabled>
              Carregar foto (Em breve)
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Card 2: Informações Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Edite seu nome, e-mail e telefone.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Nome Completo" 
              value={data.name} 
              onChange={(e) => onChange('profile', 'name', e.target.value)}
            />
            <Input 
              label="E-mail" 
              type="email" 
              value={data.email}
              onChange={(e) => onChange('profile', 'email', e.target.value)} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Telefone" 
              value={data.phone || ''}
              placeholder="(XX) XXXXX-XXXX"
              onChange={(e) => onChange('profile', 'phone', e.target.value)} 
            />
            <Input 
              label="Cargo" 
              value={data.role}
              readOnly={true}
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="primary" onClick={handleSaveClick} isLoading={isSaving}>
            <Save size={16} className="mr-2" />
            Salvar Perfil
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

// --- Componente: Aba de Segurança ---
const SecuritySettings = ({ onSave, isSaving }) => {
    return (
     <Card>
      <CardHeader>
        <CardTitle>Alterar Senha</CardTitle>
        <p className="text-sm text-gray-500 mt-1">Funcionalidade de alteração de senha ainda não implementada.</p>
      </CardHeader>
      <CardContent className="space-y-4 opacity-50">
        <Input label="Senha Atual" type="password" disabled />
        <Input label="Nova Senha" type="password" disabled />
        <Input label="Confirmar Nova Senha" type="password" disabled />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="primary" onClick={() => onSave('security', {})} isLoading={isSaving} disabled>
          <Save size={16} className="mr-2" />
          Salvar Alterações
        </Button>
      </CardFooter>
    </Card>
    );
};

// --- Componente: Aba de Sistema ---
const SystemSettings = ({ data, onSave, isSaving, onChange }) => {
  
  const envData = {
    apiUrl: import.meta.env.VITE_API_URL || "Não definida",
    environment: import.meta.env.VITE_ENV || "Não definido",
    cacheDuration: (parseInt(import.meta.env.VITE_CACHE_DURATION || 300000, 10) / 60000) + " min",
    maxRetries: import.meta.env.VITE_MAX_RETRIES || "3",
  };

  const handleSaveClick = () => {
    const payload = {
      enableDetailedLogs: data.enableDetailedLogs,
      debugMode: data.debugMode,
      // refreshInterval foi removido
    };
    onSave('system', payload);
  };

  return (
    <>
      {/* Card 1: Preferências de Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Preferências da Interface</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Ajuste o comportamento da interface de usuário.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleSwitch
            id="detailedLogs"
            label="Habilitar Logs Detalhados"
            description="Exibe logs detalhados no console (apenas front-end)."
            checked={data.enableDetailedLogs}
            onChange={(value) => onChange('system', 'enableDetailedLogs', value)}
          />
          <ToggleSwitch
            id="debugMode"
            label="Modo Debug"
            description="Ativa recursos de depuração (apenas front-end)."
            checked={data.debugMode}
            onChange={(value) => onChange('system', 'debugMode', value)}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="primary" onClick={handleSaveClick} isLoading={isSaving}>
            <Save size={16} className="mr-2" />
            Salvar Preferências
          </Button>
        </CardFooter>
      </Card>
      
      {/* Card 2: Ambiente (Somente Leitura) */}
      <Card>
        <CardHeader>
          <CardTitle>Ambiente (Somente Leitura)</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Variáveis de ambiente injetadas no build do front-end.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="URL da API (VITE_API_URL)"
            value={envData.apiUrl}
            readOnly={true}
            className="bg-gray-100 cursor-not-allowed"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Ambiente (VITE_ENV)"
              value={envData.environment}
              readOnly={true}
              className="bg-gray-100 cursor-not-allowed"
            />
            <Input
              label="Cache (VITE_CACHE_DURATION)"
              value={envData.cacheDuration}
              readOnly={true}
              className="bg-gray-100 cursor-not-allowed"
            />
            <Input
              label="Tentativas (VITE_MAX_RETRIES)"
              value={envData.maxRetries}
              readOnly={true}
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

// --- Componente: Aba Geral ---
const GeneralSettings = ({ data, onSave, isSaving, onChange }) => {
  
  const handleSaveClick = () => {
    onSave('general', data);
  };
  
  return (
    <>
      {/* Card 1: Localização */}
      <Card>
        <CardHeader>
          <CardTitle>Localização e Idioma</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Defina como datas, horas e idioma são exibidos.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            label="Idioma"
            value={data.language}
            onChange={(e) => onChange('general', 'language', e.target.value)}
            options={[
              { value: 'pt-BR', label: 'Português (Brasil)' },
              { value: 'en-US', label: 'English (US)' },
              { value: 'es-ES', label: 'Español' },
            ]}
          />
          <Select
            label="Fuso Horário"
            value={data.timezone}
            onChange={(e) => onChange('general', 'timezone', e.target.value)}
            options={[
              { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
              { value: 'America/New_York', label: 'New York (GMT-5)' },
              { value: 'Europe/London', label: 'London (GMT+0)' },
            ]}
          />
          <Select
            label="Formato de Data"
            value={data.dateFormat}
            onChange={(e) => onChange('general', 'dateFormat', e.target.value)}
            options={[
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
            ]}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
           <Button variant="primary" onClick={handleSaveClick} isLoading={isSaving}>
            <Save size={16} className="mr-2" />
            Salvar Localização
          </Button>
        </CardFooter>
      </Card>
      
      {/* Card 2: Notificações */}
      <Card>
         <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Escolha como você deseja receber notificações.</p>
          </CardHeader>
          <CardContent className="space-y-4">
             <ToggleSwitch
              id="emailNotif"
              label="Notificações por E-mail"
              description="Receber alertas importantes por e-mail."
              checked={data.emailNotifications}
              onChange={(value) => onChange('general', 'emailNotifications', value)}
            />
            <ToggleSwitch
              id="pushNotif"
              label="Notificações Push (Em breve)"
              description="Receber alertas no seu navegador."
              checked={data.pushNotifications}
              onChange={(value) => onChange('general', 'pushNotifications', value)}
              disabled
            />
            <ToggleSwitch
              id="alertSounds"
              label="Sons de Alerta"
              description="Ativar sons para novos alertas no dashboard."
              checked={data.alertSounds}
              onChange={(value) => onChange('general', 'alertSounds', value)}
            />
          </CardContent>
           <CardFooter className="flex justify-end">
             <Button variant="primary" onClick={handleSaveClick} isLoading={isSaving}>
              <Save size={16} className="mr-2" />
              Salvar Notificações
            </Button>
          </CardFooter>
      </Card>
    </>
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

  const isAdmin = user?.Role === 'Admin' || user?.role === 'Admin';
  const visibleTabs = tabs.filter(tab => {
    if (tab.id === 'system' && !isAdmin) {
      return false;
    }
    return true;
  });
  
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
      
      if (data.profile) {
        data.profile.name = data.profile.name || user?.name;
        data.profile.email = data.profile.email || user?.email;
        data.profile.role = data.profile.role || user?.role;
      }
      
      setSettings({
        profile: data.profile || {},
        general: data.general || { language: 'pt-BR', timezone: 'America/Sao_Paulo', dateFormat: 'DD/MM/YYYY', emailNotifications: true, alertSounds: true, pushNotifications: false },
        system: data.system || { enableDetailedLogs: false, debugMode: false },
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]); 

  useEffect(() => {
    loadData();
  }, [loadData]); 

  // Salva dados (a lógica de qual payload enviar está em cada subcomponente)
  const handleSave = async (section, payload) => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    
    // Mostra feedback de sucesso
    const showSuccess = () => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    };
    
    try {
      await settingsService.saveSettings(section, payload);
      
      // Se salvou o perfil, recarrega os dados para atualizar o fallback
      if (section === 'profile') {
         await loadData();
      }
      
      showSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Atualiza o estado pai
  const handleChange = (section, key, value) => {
    setSettings(prev => ({
        ...prev,
        [section]: {
            ...prev[section],
            [key]: value,
        }
    }));
  };

  // Encontra a descrição da aba ativa para o cabeçalho
  const activeTabInfo = visibleTabs.find(t => t.id === activeTab) || visibleTabs[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
         <div>
            <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600 mt-1">Gerencie suas preferências pessoais e de sistema.</p>
         </div>
         {saveSuccess && (
            <div className="flex items-center space-x-2 text-success-700 bg-success-100 p-3 rounded-lg animate-fade-in mt-4 sm:mt-0">
                <CheckCircle size={18} />
                <span className="text-sm font-medium">Salvo com sucesso!</span>
            </div>
         )}
      </div>
      
      {error && (
        <ErrorMessage title="Erro" message={error} onRetry={loadData} />
      )}

      {loading ? (
        <Loading text="Carregando configurações..." size="lg" />
      ) : !settings ? (
         <ErrorMessage title="Erro ao Carregar" message="Não foi possível carregar as configurações." onRetry={loadData} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Navegação das Abas (Esquerda) */}
          <Card className="lg:col-span-1 h-fit sticky top-24"> 
            <CardContent className="pt-4 lg:pt-6">
              <nav className="space-y-1">
                {visibleTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-100 text-primary-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      <span className="text-sm">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Conteúdo da Aba (Direita) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Cabeçalho da Seção Ativa */}
            <div className="mb-2">
              <h2 className="text-2xl font-semibold text-gray-900">{activeTabInfo.name}</h2>
              <p className="text-gray-500">{activeTabInfo.description}</p>
            </div>

            {activeTab === 'profile' && settings.profile && (
              <ProfileSettings 
                data={settings.profile} 
                onSave={handleSave} 
                isSaving={isSaving}
                onChange={handleChange}
              />
            )}
            
            {activeTab === 'general' && settings.general && (
                <GeneralSettings 
                    data={settings.general}
                    onSave={handleSave} 
                    isSaving={isSaving}
                    onChange={handleChange}
                />
            )}
            
            {activeTab === 'security' && (
                <SecuritySettings 
                    onSave={handleSave} 
                    isSaving={isSaving} 
                />
            )}
            
            {activeTab === 'system' && settings.system && isAdmin && (
                 <SystemSettings 
                    data={settings.system}
                    onSave={handleSave} 
                    isSaving={isSaving}
                    onChange={handleChange}
                 />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// PropTypes (Validação das props dos subcomponentes)
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