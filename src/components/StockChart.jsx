import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
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
        color: colors.priceStroke, margin: '2px 0 0',
        fontVariantNumeric: 'tabular-nums',
      }}>
        Bs {payload[0]?.value?.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
};

export default function StockChart({ historyData, symbol }) {
  const colors = useChartColors();

  const chartData = useMemo(() => {
    if (!historyData?.data) return [];
    return historyData.data.map(d => ({
      date: d.market_date,
      price: d.price_bs,
    }));
  }, [historyData]);

  if (!chartData.length) {
    return (
      <div className="chart-container">
        <h3 className="section-title">Evolución de Precios (Bs)</h3>
        <p className="chart-empty">Sin datos históricos disponibles</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="section-title">{symbol} — Precio (Bs)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.priceStroke} stopOpacity={0.15} />
              <stop offset="100%" stopColor={colors.priceStroke} stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="price"
            stroke={colors.priceStroke}
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#priceGrad)"
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
