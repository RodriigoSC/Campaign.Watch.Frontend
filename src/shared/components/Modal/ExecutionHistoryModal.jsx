import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import CampaignModal from './CampaignModal';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import Badge from './Badge';
import { ChevronDown, ChevronRight, AlertCircle, Clock, CheckCircle, Users, Send, Mail, MessageSquare, Smartphone } from 'lucide-react'; // Ícones adicionados/atualizados
import { campaignService } from '../../services/campaignService';
import { formatDateTime, truncate, formatNumber } from '../../utils'; // formatNumber adicionado
import { cn } from '../../utils';

// Mapeia o tipo de step para um ícone mais específico
const stepIcons = {
  Filter: <Users size={16} className="text-blue-500" title="Filtro" />,
  Channel: <Send size={16} className="text-purple-500" title="Canal" />,
  Wait: <Clock size={16} className="text-orange-500" title="Espera" />,
  End: <CheckCircle size={16} className="text-green-500" title="Fim" />,
};

// Ícones específicos para canais (opcional, para mais detalhes visuais)
const channelIcons = {
    EffectiveMail: <Mail size={12} className="inline mr-1 text-gray-500"/>,
    EffectiveSms: <MessageSquare size={12} className="inline mr-1 text-gray-500"/>,
    EffectivePush: <Smartphone size={12} className="inline mr-1 text-gray-500"/>,
    EffectiveWhatsApp: <MessageSquare size={12} className="inline mr-1 text-green-500"/>, // Exemplo de cor diferente
    // Adicione outros canais se necessário
};

// Componente para renderizar detalhes de um Step
const StepDetails = ({ step }) => {
    const integration = step.integrationData;
    const leads = integration?.leads;
    const file = integration?.file;

    // Função auxiliar para renderizar um item de detalhe
    const DetailItem = ({ label, value, className = '', isMono = false }) => (
        value !== null && value !== undefined && value !== '' && (
            <div className={`flex flex-col sm:flex-row sm:items-center ${className}`}>
                <span className="font-medium text-gray-700 w-28 flex-shrink-0">{label}:</span>
                <span className={cn("text-gray-600 break-words", isMono ? 'font-mono' : '')} title={typeof value === 'string' ? value : undefined}>
                    {value}
                </span>
            </div>
        )
    );

    DetailItem.propTypes = { label: PropTypes.string, value: PropTypes.any, className: PropTypes.string, isMono: PropTypes.bool };


    return (
        <li key={step.originalStepId} className="flex items-start space-x-3 p-3 border border-gray-200 rounded bg-white shadow-sm">
            <span className="mt-0.5">{stepIcons[step.type] || <AlertCircle size={16} className="text-gray-400" />}</span>
            <div className="flex-1 min-w-0">
                {/* Header do Step */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2 pb-1 border-b border-gray-100">
                    <span className="font-semibold text-gray-800 text-sm truncate" title={step.name || step.type}>
                        {step.name || step.type}
                        <span className='ml-2 text-gray-400 font-mono text-xs'>({truncate(step.originalStepId, 8)})</span>
                    </span>
                    <Badge status={step.status} className="mt-1 sm:mt-0">{step.status}</Badge>
                </div>

                {/* Informações Gerais do Step */}
                <div className="space-y-1 text-xs mb-2">
                    <DetailItem label="Usuários" value={formatNumber(step.totalUser)} />
                    <DetailItem label="Tempo Exec." value={formatDuration(step.totalExecutionTime)} />
                    {step.monitoringNotes && (
                        <div className="mt-1 text-yellow-700 bg-yellow-50 p-1.5 rounded text-[11px] flex items-start">
                            <AlertCircle size={14} className="mr-1 mt-0.5 flex-shrink-0"/>
                            <span><span className='font-medium'>Nota Monitoramento:</span> {step.monitoringNotes}</span>
                        </div>
                    )}
                    {step.error && (
                         <div className="mt-1 text-red-700 bg-red-50 p-1.5 rounded text-[11px] flex items-start">
                            <AlertCircle size={14} className="mr-1 mt-0.5 flex-shrink-0"/>
                            <span><span className='font-medium'>Erro Step:</span> {step.error}</span>
                        </div>
                    )}
                </div>

                {/* Detalhes de Integração (para Canais) */}
                {step.type === 'Channel' && integration && (
                    <div className="mt-2 text-gray-500 border-t border-gray-100 pt-2 space-y-1 text-[11px]">
                        <h5 className="font-medium text-gray-800 mb-1 text-xs">Integração Canal</h5>
                        <DetailItem
                          label="Canal"
                          value={<>{channelIcons[integration.channelName]} {integration.channelName}</>}
                          className="text-xs" />
                        <DetailItem label="Status Canal" value={integration.integrationStatus || '-'} className="text-xs"/>
                        <DetailItem label="Template ID" value={integration.templateId} className="text-xs" isMono/>
                        {/* Detalhes do Arquivo */}
                        {file && (
                           <div className='mt-1 pt-1 border-t border-dashed border-gray-200'>
                                <DetailItem label="Arquivo" value={file.name || '-'} className="text-xs truncate" isMono/>
                                <DetailItem label="Linhas" value={formatNumber(file.total)} className="text-xs"/>
                                <DetailItem label="Início Proc." value={formatDateTime(file.startedAt)} className="text-xs"/>
                                <DetailItem label="Fim Proc." value={formatDateTime(file.finishedAt)} className="text-xs"/>
                           </div>
                        )}
                         {/* Detalhes dos Leads */}
                        {leads && (
                            <div className='mt-1 pt-1 border-t border-dashed border-gray-200'>
                                <span className="font-medium text-gray-700 block mb-0.5">Leads:</span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2">
                                    <DetailItem label="Sucesso" value={formatNumber(leads.success)} className="text-green-700" />
                                    <DetailItem label="Erro" value={formatNumber(leads.error)} className="text-red-700" />
                                    <DetailItem label="Bloqueado" value={formatNumber(leads.blocked)} className="text-gray-700" />
                                    <DetailItem label="Optout" value={formatNumber(leads.optout)} className="text-orange-700" />
                                    <DetailItem label="Duplicado" value={formatNumber(leads.deduplication)} className="text-blue-700" />
                                </div>
                            </div>
                        )}
                    </div>
                 )}
            </div>
        </li>
    );
}

StepDetails.propTypes = {
    step: PropTypes.object.isRequired,
};


// Função global formatDuration (pode ir para utils/index.js se preferir)
const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined || isNaN(seconds)) return '-';
    if (seconds < 1) return '< 1s';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(0);
    return `${minutes}m ${remainingSeconds}s`;
};


const ExecutionHistoryModal = ({ isOpen, onClose, campaignId, campaignName }) => {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const loadExecutionHistory = useCallback(async () => {
    if (!campaignId || !isOpen) return;

    setLoading(true);
    setError(null);
    try {
      const data = await campaignService.getCampaignExecutions(campaignId);
      const sortedData = (data || []).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      setExecutions(sortedData);
    } catch (err) {
      console.error(`Erro ao carregar histórico de execuções da campanha ${campaignId}:`, err);
      setError(err.message || 'Não foi possível carregar o histórico de execuções.');
      setExecutions([]);
    } finally {
      setLoading(false);
    }
  }, [campaignId, isOpen]);

  useEffect(() => {
    loadExecutionHistory();
  }, [loadExecutionHistory]);

  const toggleRowExpansion = (executionId) => {
    setExpandedRowId(prevId => (prevId === executionId ? null : executionId));
  };

  const getRowBgColor = (health) => {
    if (!health) return 'hover:bg-gray-50';
    switch (health.overallHealth) {
      case 'Error':
      case 'Critical':
        return 'bg-error-50 hover:bg-error-100';
      case 'Warning':
        return 'bg-warning-50 hover:bg-warning-100';
      default:
        return 'hover:bg-gray-50';
    }
  };

  return (
    <CampaignModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Histórico de Execuções: ${truncate(campaignName, 40)}`}
      size="4xl" // Mantido 4xl, ajuste se necessário
    >
      {loading && <Loading text="Carregando histórico..." />}
      {error && !loading && (
        <ErrorMessage
          title="Erro ao carregar histórico"
          message={error}
          onRetry={loadExecutionHistory}
        />
      )}
      {!loading && !error && (
        <div className="overflow-x-auto max-h-[70vh]">
          {executions.length > 0 ? (
            <table className="w-full min-w-[800px]">
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr className="border-b border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="py-3 px-2 w-10"></th>
                  <th className="py-3 px-4">ID Execução</th>
                  <th className="py-3 px-4">Início</th>
                  <th className="py-3 px-4">Fim</th>
                  <th className="py-3 px-4">Duração</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Saúde</th>
                  <th className="py-3 px-4">Problemas Principais</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {executions.map((exec) => (
                  <>
                    <tr
                      key={exec.id || exec.originalExecutionId}
                      className={cn("text-sm transition-colors duration-150", getRowBgColor(exec.healthSummary))}
                    >
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => toggleRowExpansion(exec.id || exec.originalExecutionId)}
                          className="p-1 rounded hover:bg-gray-200 text-gray-500"
                          title={expandedRowId === (exec.id || exec.originalExecutionId) ? "Recolher detalhes" : "Expandir detalhes"}
                        >
                          {expandedRowId === (exec.id || exec.originalExecutionId) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-700">{truncate(exec.originalExecutionId, 15) || '-'}</td>
                      <td className="py-3 px-4 text-gray-800 whitespace-nowrap">{formatDateTime(exec.startDate) || '-'}</td>
                      <td className="py-3 px-4 text-gray-800 whitespace-nowrap">{formatDateTime(exec.endDate) || '-'}</td>
                      <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{formatDuration(exec.totalDurationInSeconds)}</td>
                      <td className="py-3 px-4">
                        <Badge status={exec.status}>{exec.status || '-'}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            exec.healthSummary?.overallHealth === 'Error' || exec.healthSummary?.overallHealth === 'Critical' ? 'error' :
                            exec.healthSummary?.overallHealth === 'Warning' ? 'warning' :
                            exec.healthSummary?.overallHealth === 'Healthy' ? 'success' : 'default'
                          }
                        >
                          {exec.healthSummary?.overallHealth || (exec.hasMonitoringErrors ? 'Error' : 'Healthy')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {exec.healthSummary?.mainIssues?.length > 0
                          ? truncate(exec.healthSummary.mainIssues.join(', '), 50)
                          : '-'
                        }
                      </td>
                    </tr>
                    {/* Linha Expansível com Detalhes dos Steps */}
                    {expandedRowId === (exec.id || exec.originalExecutionId) && (
                      <tr className="bg-gray-50">
                        <td colSpan="8" className="p-0">
                          <div className="p-4 border-l-4 border-primary-200">
                            <h4 className="text-sm font-semibold mb-3 text-gray-700">Detalhes dos Steps ({exec.steps?.length || 0}):</h4>
                            {exec.steps && exec.steps.length > 0 ? (
                              // Adicionado scroll interno para a lista de steps se for muito longa
                              <ul className="space-y-3 text-xs max-h-[40vh] overflow-y-auto pr-2">
                                {exec.steps.map(step => (
                                  <StepDetails key={step.originalStepId} step={step} /> // Usa o componente StepDetails
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500 text-xs">Nenhum step detalhado disponível para esta execução.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Nenhuma execução encontrada para esta campanha.
            </div>
          )}
        </div>
      )}
    </CampaignModal>
  );
};

ExecutionHistoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  campaignId: PropTypes.string,
  campaignName: PropTypes.string,
};

export default ExecutionHistoryModal;