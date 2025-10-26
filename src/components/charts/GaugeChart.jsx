import PropTypes from 'prop-types';

const GaugeChart = ({ value = 0, max = 100, title, subtitle }) => {
  const percentage = Math.min((value / max) * 100, 100);

  const getColor = () => {
    if (percentage >= 80) return '#22c55e';
    if (percentage >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-60 h-32 sm:w-72 sm:h-36">
        {/* SVG mais espaçado (viewBox aumentado e arco ajustado) */}
        <svg className="w-full h-full" viewBox="0 0 220 180">
          {/* Arco de fundo */}
          <path
            d="M 30 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Arco preenchido */}
          <path
            d="M 30 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke={getColor()}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.83}, 1000`}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Texto central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-3">
          <span className="text-4xl font-bold" style={{ color: getColor() }}>
            {value}
          </span>
          <span className="text-sm text-gray-500">de {max}</span>
        </div>
      </div>

      {title && (
        <h4 className="mt-3 text-base font-semibold text-gray-800">{title}</h4>
      )}
      {subtitle && (
        <p className="text-xs text-gray-500">{subtitle}</p>
      )}
    </div>
  );
};

GaugeChart.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

export default GaugeChart;