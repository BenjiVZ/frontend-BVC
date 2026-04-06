import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useChartColors } from '../hooks/useChartColors';

const CustomTooltip = ({ active, payload, label, colors }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: colors.tooltipBg,
      border: `1px solid ${colors.tooltipBorder}`,
      borderRadius: '4px',
      padding: '8px 12px',
    }}>
      <p style={{ fontFamily: 'Fira Code', fontSize: '10px', color: colors.tick, margin: 0 }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'Fira Code', fontSize: '13px', fontWeight: 600,
        color: colors.dollarStroke, margin: '2px 0 0',
        fontVariantNumeric: 'tabular-nums',
      }}>
        Bs {payload[0]?.value?.toLocaleString('es-VE', { minimumFractionDigits: 4 })}
      </p>
    </div>
  );
};

export default function DollarChart({ dollarData }) {
  const colors = useChartColors();

  const chartData = useMemo(() => {
    if (!dollarData?.history) return [];
    return dollarData.history.map(d => ({
      date: d.rate_date,
      rate: d.rate,
    }));
  }, [dollarData]);

  if (!chartData.length) {
    return (
      <div className="chart-container">
        <h3 className="section-title">Tasa del Dólar Oficial</h3>
        <p className="chart-empty">Sin datos de dólar disponibles</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="section-title">Tasa del Dólar Oficial</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="none" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="transparent"
            tick={{ fill: colors.tick, fontSize: 10, fontFamily: 'Fira Code' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="transparent"
            tick={{ fill: colors.tick, fontSize: 10, fontFamily: 'Fira Code' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => v.toLocaleString('es-VE')}
          />
          <Tooltip content={<CustomTooltip colors={colors} />} />
          <Line
            type="monotone"
            dataKey="rate"
            stroke={colors.dollarStroke}
            strokeWidth={1.5}
            dot={{ fill: colors.dollarDotFill, stroke: colors.dollarStroke, strokeWidth: 2, r: 3 }}
            activeDot={{ fill: colors.dollarStroke, r: 5, strokeWidth: 0 }}
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
