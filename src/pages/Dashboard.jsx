import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { TrendingUp, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import GaugeChart from '../components/charts/GaugeChart';
import StatusChart from '../components/charts/StatusChart';
import BarChart from '../components/charts/BarChart';
import Loading from '../components/ui/Loading';
import ErrorMessage from '../components/ui/ErrorMessage';
import Button from '../components/ui/Button';
import { dashboardService } from '../services/dashboardService';
import { formatNumber } from '../utils';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError(err.message || 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading size="lg" text="Carregando dashboard..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <ErrorMessage
          title="Erro ao carregar dashboard"
          message={error}
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <ErrorMessage
          title="Nenhum dado disponível"
          message="Não foi possível carregar os dados do dashboard"
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  const { summary, campaignsByStatus, campaignsByHealth, recentIssues, upcomingExecutions } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {lastUpdate ? `Última atualização: ${lastUpdate.toLocaleString('pt-BR')}` : 'Carregando...'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadDashboardData}
          disabled={loading}
        >
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Campanhas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatNumber(summary?.totalCampaigns || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-primary-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Campanhas Ativas</p>
                <p className="text-3xl font-bold text-success-600 mt-2">
                  {formatNumber(summary?.activeCampaigns || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-success-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Com Problemas</p>
                <p className="text-3xl font-bold text-error-600 mt-2">
                  {formatNumber(summary?.campaignsWithIssues || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-error-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Execuções Hoje</p>
                <p className="text-3xl font-bold text-primary-600 mt-2">
                  {formatNumber(summary?.totalExecutionsToday || 0)}
                </p>
                <p className="text-xs text-success-600 mt-1">
                  {formatNumber(summary?.successfulExecutionsToday || 0)} bem-sucedidas
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Clock className="text-primary-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Saúde Geral do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-6">
            <GaugeChart
              value={Math.round(summary?.overallHealthScore || 0)}
              max={100}
              title={`${(summary?.overallHealthScore || 0).toFixed(1)}%`}
              subtitle="score de saúde"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status das Campanhas</CardTitle>
          </CardHeader>
          <CardContent>
            {campaignsByStatus && campaignsByStatus.length > 0 ? (
              <StatusChart data={campaignsByStatus.map(item => ({
                status: item.status,
                count: item.count
              }))} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campanhas por Nível de Saúde</CardTitle>
          </CardHeader>
          <CardContent>
            {campaignsByHealth && campaignsByHealth.length > 0 ? (
              <BarChart 
                data={campaignsByHealth.map(item => ({
                  name: item.healthLevel,
                  value: item.count
                }))}
                dataKey="value"
                nameKey="name"
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Execuções (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {upcomingExecutions && upcomingExecutions.length > 0 ? (
                upcomingExecutions.map((execution, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">
                          {execution.campaignName}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(execution.scheduledFor).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded font-medium">
                        {execution.campaignType}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-500">
                  Nenhuma execução agendada
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues */}
      {recentIssues && recentIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Problemas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentIssues.slice(0, 5).map((issue, index) => (
                <div 
                  key={index} 
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <AlertCircle 
                          className={issue.severity === 'Error' ? 'text-error-500' : 'text-warning-500'} 
                          size={16} 
                        />
                        <h4 className="font-semibold text-gray-900">{issue.campaignName}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{issue.issueType}</span>
                        <span>•</span>
                        <span>{new Date(issue.detectedAt).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      issue.severity === 'Error' 
                        ? 'bg-error-100 text-error-700' 
                        : 'bg-warning-100 text-warning-700'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard