// src/features/dashboard/pages/DashboardPage.jsx
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../shared/components/Card/Card";
import { TrendingUp, AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import GaugeChart from "../../../shared/components/Charts/GaugeChart";
import StatusChart from "../../../shared/components/Charts/StatusChart";
import BarChart from "../../../shared/components/Charts/BarChart";
import Loading from "../../../shared/components/Loading/Loading";
import ErrorMessage from "../../../shared/components/ErrorMessage/ErrorMessage";
import Button from "../../../shared/components/Button/Button";
import { dashboardService } from "../../../shared/services/dashboardService";
import { formatNumber, formatDateTime } from "../../../shared/utils";
import { clientService } from "../../../shared/services/clientService";

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("all");

  const healthLevelColors = {
    Healthy: "#22c55e",
    Warning: "#f59e0b",
    Critical: "#ef4444",
    Inactive: "#6b7280",
  };

  const loadDashboardData = async (clientName = null) => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardData(clientName);
      console.log("API Data Received:", data);
      setDashboardData(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
      setError(err.message || "Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const data = await clientService.getAllClients();
      setClients(data);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadClients();
  }, []);

  const handleRefresh = () => {
    const client = selectedClient === "all" ? null : selectedClient;
    loadDashboardData(client);
  };

  console.log("Dashboard State Updated:", dashboardData);

  if (loading) {
    return <Loading size="lg" text="Carregando dashboard..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <ErrorMessage
          title="Erro ao carregar dashboard"
          message={error}
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  if (!dashboardData || !dashboardData.summary) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <ErrorMessage
          title="Dados Indisponíveis"
          message="Não foi possível carregar os dados do dashboard ou os dados estão incompletos. Verifique a conexão com a API."
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  const {
    summary,
    campaignsByStatus,
    campaignsByHealth,
    recentIssues,
    upcomingExecutions,
  } = dashboardData;

  const healthChartData =
    campaignsByHealth?.map((item) => ({
      name: item.healthLevel,
      value: item.count,
      fill: healthLevelColors[item.healthLevel] || "#6b7280",
    })) || [];

  console.log("Health Chart Data (Mapped):", healthChartData);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {lastUpdate
              ? `Última atualização: ${lastUpdate.toLocaleString("pt-BR")}`
              : "Carregando..."}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="clientSelect"
              className="text-gray-700 font-medium whitespace-nowrap"
            >
              Cliente:
            </label>
            <select
              id="clientSelect"
              value={selectedClient}
              onChange={(e) => {
                const client = e.target.value === "all" ? null : e.target.value;
                setSelectedClient(e.target.value);
                loadDashboardData(client);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 transition-colors"
            >
              <option value="all">Todos</option>
              {clients.map((client) => (
                <option key={client.id} value={client.name}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={`mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total de Campanhas
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatNumber(summary?.totalCampaigns ?? 0)}
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
                <p className="text-sm font-medium text-gray-600">
                  Campanhas Ativas
                </p>
                <p className="text-3xl font-bold text-success-600 mt-2">
                  {formatNumber(summary?.activeCampaigns ?? 0)}
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
                <p className="text-sm font-medium text-gray-600">
                  Com Problemas
                </p>
                <p className="text-3xl font-bold text-error-600 mt-2">
                  {formatNumber(summary?.campaignsWithIssues ?? 0)}
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
                <p className="text-sm font-medium text-gray-600">
                  Execuções Hoje
                </p>
                <p className="text-3xl font-bold text-primary-600 mt-2">
                  {formatNumber(summary?.totalExecutionsToday ?? 0)}
                </p>
                <p className="text-xs text-success-600 mt-1">
                  {formatNumber(summary?.successfulExecutionsToday ?? 0)}{" "}
                  bem-sucedidas
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Clock className="text-primary-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle>Saúde Geral do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center flex-1 py-8">
            <GaugeChart
              value={Math.round(summary?.overallHealthScore ?? 0)}
              max={100}
              title={`${(summary?.overallHealthScore ?? 0).toFixed(1)}%`}
              subtitle="score de saúde"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status das Campanhas (Monitoramento)</CardTitle>
          </CardHeader>
          <CardContent>
            {campaignsByStatus && campaignsByStatus.length > 0 ? (
              <StatusChart data={campaignsByStatus} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Nenhum dado de status disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campanhas por Nível de Saúde</CardTitle>
          </CardHeader>
          <CardContent>
            {healthChartData && healthChartData.length > 0 ? (
              <BarChart data={healthChartData} dataKey="value" nameKey="name" />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Nenhum dado de saúde disponível
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
                upcomingExecutions.map((execution) => (
                  <div
                    key={execution.campaignId || Math.random()}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 overflow-hidden mr-2">
                        <p
                          className="font-medium text-sm text-gray-900 truncate"
                          title={execution.campaignName}
                        >
                          {execution.campaignName}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatDateTime(execution.scheduledFor)}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded font-medium whitespace-nowrap">
                        {execution.campaignType}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-500">
                  Nenhuma execução agendada nas próximas 24h
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {recentIssues && recentIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Problemas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentIssues.slice(0, 10).map((issue) => (
                <div
                  key={issue.campaignId + issue.detectedAt || Math.random()}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 overflow-hidden mr-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <AlertCircle
                          className={
                            issue.severity === "Error" ||
                            issue.severity === "Critical"
                              ? "text-error-500"
                              : "text-warning-500"
                          }
                          size={16}
                        />
                        <h4
                          className="font-semibold text-gray-900 truncate"
                          title={issue.campaignName}
                        >
                          {issue.campaignName}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {issue.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{issue.issueType}</span>
                        <span>•</span>
                        <span>{formatDateTime(issue.detectedAt)}</span>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap ${
                        issue.severity === "Error" ||
                        issue.severity === "Critical"
                          ? "bg-error-100 text-error-700"
                          : "bg-warning-100 text-warning-700"
                      }`}
                    >
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

export default DashboardPage;