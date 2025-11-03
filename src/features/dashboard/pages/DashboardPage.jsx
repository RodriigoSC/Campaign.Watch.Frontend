// src/features/dashboard/pages/DashboardPage.jsx
import { useState, useEffect, useCallback } from "react";
// 1. Importar CardFooter (para conter a paginação) e o Pagination
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../shared/components/Card/Card";
import Pagination from "../../../shared/components/Pagination/Pagination";
// ---
import { TrendingUp, AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import GaugeChart from "../../../shared/components/Charts/GaugeChart";
import StatusChart from "../../../shared/components/Charts/StatusChart";
import BarChart from "../../../shared/components/Charts/BarChart";
import Loading from "../../../shared/components/Loading/Loading";
import ErrorMessage from "../../../shared/components/ErrorMessage/ErrorMessage";
import Button from "../../../shared/components/Button/Button";
import Input from "../../../shared/components/Input/Input"; 
import Select from "../../../shared/components/Select/Select"; 
import { dashboardService } from "../../../shared/services/dashboardService";
import { formatNumber, formatDateTime } from "../../../shared/utils";
import { clientService } from "../../../shared/services/clientService";

/**
 * Formata um objeto Date para uma string YYYY-MM-DD
 * (necessário para o valor padrão do input type="date")
 */
const formatDateForInput = (dateObj) => {
  if (!dateObj) return '';
  try {
    // Usar métodos locais para evitar problemas de fuso horário (Timezone)
    const year = dateObj.getFullYear();
    // getMonth() é base 0 (0=Jan), por isso +1
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Erro ao formatar data para input:", e);
    return '';
  }
};

/**
 * Define o estado inicial dos filtros (últimos 30 dias)
 */
const getInitialFilters = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30); // Subtrai 30 dias

  return {
    clientName: 'all',
    dataInicio: formatDateForInput(thirtyDaysAgo), // Data de 30 dias atrás
    dataFim: formatDateForInput(today),         // Data de hoje
  };
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [clients, setClients] = useState([]);
  
  const [filters, setFilters] = useState(getInitialFilters());
  
  // 2. Novo estado para controlar a paginação dos Problemas Recentes
  const [recentIssuesPage, setRecentIssuesPage] = useState(1);
  const ISSUES_PER_PAGE = 5; // 5 itens por página

  const healthLevelColors = {
    Healthy: "#22c55e",
    Warning: "#f59e0b",
    Critical: "#ef4444",
    Inactive: "#6b7280",
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const apiFilters = {
        clientName: filters.clientName === 'all' ? null : filters.clientName,
        dataInicio: filters.dataInicio ? new Date(filters.dataInicio + 'T00:00:00').toISOString() : null,
        dataFim: filters.dataFim ? new Date(filters.dataFim + 'T23:59:59').toISOString() : null,
      };

      const data = await dashboardService.getDashboardData(apiFilters);
      console.log("API Data Received:", data);
      setDashboardData(data);
      setLastUpdate(new Date());
      
      // 3. Resetar a página dos problemas para 1 a cada nova busca
      setRecentIssuesPage(1);

    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
      setError(err.message || "Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  }, [filters]); // Depende do estado 'filters'

  const loadClients = useCallback(async () => {
    try {
      const data = await clientService.getAllClients();
      setClients(data || []);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
    }
  }, []); // Vazio, executa apenas uma vez

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]); 

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  // 4. Handler para atualizar a página dos problemas (client-side)
  const handleIssuesPageChange = (newPage) => {
    setRecentIssuesPage(newPage);
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
          message="Não foi possível carregar os dados do dashboard ou os dados estão incompletos."
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

  const clientOptions = [
    { value: 'all', label: 'Todos os Clientes' },
    ...clients.map(client => ({
      value: client.name,
      label: client.name
    }))
  ];

  // 5. Lógica de paginação client-side para Problemas Recentes
  const allRecentIssues = recentIssues || [];
  const totalIssues = allRecentIssues.length;
  const totalIssuePages = Math.ceil(totalIssues / ISSUES_PER_PAGE);
  
  // "Corta" o array completo para pegar apenas os 5 itens da página atual
  const paginatedIssues = allRecentIssues.slice(
    (recentIssuesPage - 1) * ISSUES_PER_PAGE, // Início
    recentIssuesPage * ISSUES_PER_PAGE       // Fim
  );

  return (
    <div className="space-y-6">
      {/* --- SEÇÃO DO TÍTULO --- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {lastUpdate
              ? `Última atualização: ${lastUpdate.toLocaleString("pt-BR")}`
              : "Carregando..."}
          </p>
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

      {/* --- CARD DE FILTROS --- */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Cliente"
              name="clientName"
              options={clientOptions}
              value={filters.clientName}
              onChange={handleFilterChange}
            />
            <Input
              label="Data Início"
              name="dataInicio"
              type="date"
              value={filters.dataInicio}
              onChange={handleFilterChange}
            />
            <Input
              label="Data Fim"
              name="dataFim"
              type="date"
              value={filters.dataFim}
              onChange={handleFilterChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* --- CARDS DE RESUMO --- */}
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
                  Execuções no Período
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

      {/* --- GRÁFICOS --- */}
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

      {/* --- GRÁFICOS E LISTAS (LINHA INFERIOR) --- */}
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

      {/* --- PROBLEMAS RECENTES (COM PAGINAÇÃO) --- */}
      {allRecentIssues && allRecentIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Problemas Recentes ({totalIssues})</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 6. Mapear 'paginatedIssues' (o array cortado) */}
            <div className="space-y-3">
              {paginatedIssues.map((issue) => (
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

          {/* 7. Adicionar o Footer com o componente de Paginação */}
          {totalIssuePages > 1 && (
            <CardFooter>
              <Pagination
                currentPage={recentIssuesPage}
                totalPages={totalIssuePages}
                totalItems={totalIssues}
                pageSize={ISSUES_PER_PAGE}
                onPageChange={handleIssuesPageChange}
                // Ocultamos o seletor "por página" e info, pois é client-side
                showPageSizeSelector={false} 
                showPageInfo={false}
                // Prop obrigatória, passamos uma função vazia
                onPageSizeChange={() => {}} 
              />
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;