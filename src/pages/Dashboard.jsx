import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import GaugeChart from '../components/charts/GaugeChart';
import StatusChart from '../components/charts/StatusChart';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import Loading from '../components/ui/Loading';
import { campaignService } from '../services/campaignService';
import { formatNumber } from '../utils';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    errors: 0,
    delayed: 0,
  });
  const [statusData, setStatusData] = useState([]);
  const [monitoringStatusData, setMonitoringStatusData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar dados em paralelo
      const [successCampaigns, errorCampaigns, delayedCampaigns, statusCounts, monitoringCounts] = await Promise.all([
        campaignService.getSuccessfullyMonitoredCampaigns(),
        campaignService.getCampaignsWithIntegrationErrors(),
        campaignService.getCampaignsWithDelayedExecution(),
        campaignService.getCountByCampaignStatus(),
        campaignService.getCountByMonitoringStatus(),
      ]);

      // Calcular estatísticas
      const totalCampaigns = statusCounts.reduce((sum, item) => sum + item.count, 0);

      setStats({
        total: totalCampaigns,
        success: successCampaigns.length,
        errors: errorCampaigns.length,
        delayed: delayedCampaigns.length,
      });

      setStatusData(statusCounts);
      setMonitoringStatusData(monitoringCounts);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading size="lg" text="Carregando dashboard..." />;
  }

  const successRate = stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do monitoramento de campanhas</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Campanhas</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(stats.total)}</p>
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
                <p className="text-sm font-medium text-gray-600">Monitoradas com Sucesso</p>
                <p className="text-3xl font-bold text-success-600 mt-2">{formatNumber(stats.success)}</p>
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
                <p className="text-sm font-medium text-gray-600">Com Erros</p>
                <p className="text-3xl font-bold text-error-600 mt-2">{formatNumber(stats.errors)}</p>
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
                <p className="text-sm font-medium text-gray-600">Execução Atrasada</p>
                <p className="text-3xl font-bold text-warning-600 mt-2">{formatNumber(stats.delayed)}</p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <Clock className="text-warning-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <GaugeChart 
              value={stats.success} 
              max={stats.total}
              title={`${successRate}%`}
              subtitle="de campanhas monitoradas"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status das Campanhas</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <StatusChart data={statusData} />
            ) : (
              <p className="text-center text-gray-500 py-8">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status de Monitoramento</CardTitle>
          </CardHeader>
          <CardContent>
            {monitoringStatusData.length > 0 ? (
              <BarChart 
                data={monitoringStatusData.map(item => ({
                  name: item.status,
                  value: item.count
                }))}
                dataKey="value"
                nameKey="name"
              />
            ) : (
              <p className="text-center text-gray-500 py-8">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendência de Campanhas</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={[
                { name: 'Jan', total: 45, sucesso: 38, erro: 7 },
                { name: 'Fev', total: 52, sucesso: 44, erro: 8 },
                { name: 'Mar', total: 61, sucesso: 53, erro: 8 },
                { name: 'Abr', total: 58, sucesso: 49, erro: 9 },
                { name: 'Mai', total: 67, sucesso: 59, erro: 8 },
                { name: 'Jun', total: 73, sucesso: 65, erro: 8 },
              ]}
              lines={[
                { dataKey: 'total', name: 'Total', color: '#3b82f6' },
                { dataKey: 'sucesso', name: 'Sucesso', color: '#22c55e' },
                { dataKey: 'erro', name: 'Erro', color: '#ef4444' },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;