import PropTypes from 'prop-types'; // 1. Importe o PropTypes
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const BarChart = ({ data, dataKey, nameKey }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RechartsBarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={nameKey} />
      <YAxis />
      <Tooltip />
      <Bar dataKey={dataKey} fill="#3b82f6" />
    </RechartsBarChart>
  </ResponsiveContainer>
);

// 2. Adicione este bloco de validação
BarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  dataKey: PropTypes.string.isRequired,
  nameKey: PropTypes.string.isRequired,
};

export default BarChart;