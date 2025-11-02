import PropTypes from 'prop-types'; // 1. Importe o PropTypes
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  'Concluído': '#22c55e',
  'Em andamento': '#3b82f6',
  'Agendada': '#f59e0b',
  'Pendente': '#f59e0b',
  'Falha': '#ef4444',
  'Cancelada': '#ef4444',
};

const StatusChart = ({ data }) => {
  const chartData = data.map(item => ({ name: item.status, value: item.count }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// 2. Adicione este bloco de validação
StatusChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default StatusChart;