import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area, ComposedChart, Line, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { useChartColors } from '../hooks/useChartColors';
import { IconDatabase, IconBarChart, IconActivity, IconTarget } from './Icons';

/* ─── Palette for multi-series ─── */
const PALETTE = [
  '#22c55e', '#38bdf8', '#f59e0b', '#a855f7', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#e879f9', '#eab308', '#fb7185', '#0ea5e9',
];

/* ─── Custom Tooltip ─── */
function ChartTooltip({ active, payload, label, colors, prefix = '', suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: colors.tooltipBg,
      border: `1px solid ${colors.tooltipBorder}`,
      borderRadius: '6px',
      padding: '10px 14px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }}>
      <p style={{
        fontFamily: 'Fira Code', fontSize: '10px',
        color: colors.tick, margin: 0, marginBottom: '6px',
      }}>{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} style={{
          fontFamily: 'Fira Code', fontSize: '12px', fontWeight: 600,
          color: entry.color || colors.priceStroke, margin: '2px 0',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {entry.name}: {prefix}{typeof entry.value === 'number'
            ? entry.value.toLocaleString('es-VE', { minimumFractionDigits: 2 })
            : entry.value}{suffix}
        </p>
      ))}
    </div>
  );
}

/* ─── Records per Day Bar Chart ─── */
function RecordsPerDayChart({ stocks, colors }) {
  const data = useMemo(() => {
    if (!stocks?.stocks) return [];
    // Group records by market_date
    const dateMap = {};
    stocks.stocks.forEach((s) => {
      const date = s.market_date;
      if (!dateMap[date]) dateMap[date] = { date, count: 0, totalVolume: 0 };
      dateMap[date].count += 1;
      dateMap[date].totalVolume += (s.shares_traded || 0);
    });
    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [stocks]);

  // If we only have one date (latest) — generate a bar-per-symbol
  const symbolData = useMemo(() => {
    if (!stocks?.stocks) return [];
    return stocks.stocks
      .filter(s => s.shares_traded > 0)
      .sort((a, b) => (b.shares_traded || 0) - (a.shares_traded || 0))
      .slice(0, 15)
      .map(s => ({
        symbol: s.symbol,
        volume: s.shares_traded || 0,
        price: s.price_bs || 0,
        variation: s.variation || 0,
      }));
  }, [stocks]);

  return (
    <div className="analytics-chart-card">
      <h3 className="section-title">
        <IconBarChart size={16} />
        Volumen por Acción (Top 15)
      </h3>
      {symbolData.length > 0 ? (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={symbolData} margin={{ top: 8, right: 16, left: 8, bottom: 40 }}>
            <defs>
              <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={colors.grid} strokeDasharray="none" vertical={false} />
            <XAxis
              dataKey="symbol"
              stroke="transparent"
              tick={{ fill: colors.tick, fontSize: 10, fontFamily: 'Fira Code' }}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis
              stroke="transparent"
              tick={{ fill: colors.tick, fontSize: 10, fontFamily: 'Fira Code' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
            />
            <Tooltip content={<ChartTooltip colors={colors} />} />
            <Bar
              dataKey="volume"
              name="Títulos"
              fill="url(#volGrad)"
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="chart-empty">Sin datos de volumen disponibles</p>
      )}
    </div>
  );
}

/* ─── Market Distribution Pie Chart ─── */
function MarketDistributionChart({ stocks, predictions, colors }) {
  const pieData = useMemo(() => {
    if (!stocks?.stocks) return [];

    let ups = 0, downs = 0, neutral = 0;
    stocks.stocks.forEach(s => {
      if (s.variation > 0) ups++;
      else if (s.variation < 0) downs++;
      else neutral++;
    });

    return [
      { name: 'Subiendo', value: ups, color: '#22c55e' },
      { name: 'Bajando', value: downs, color: '#ef4444' },
      { name: 'Sin cambio', value: neutral, color: '#64748b' },
    ].filter(d => d.value > 0);
  }, [stocks]);

  const predPieData = useMemo(() => {
    if (!predictions?.predictions) return [];

    let up = 0, down = 0, neutral = 0;
    predictions.predictions.forEach(p => {
      if (p.predicted_direction === 'UP') up++;
      else if (p.predicted_direction === 'DOWN') down++;
      else neutral++;
    });

    return [
      { name: 'Señal Subida', value: up, color: '#22c55e' },
      { name: 'Señal Bajada', value: down, color: '#ef4444' },
      { name: 'Señal Neutro', value: neutral, color: '#64748b' },
    ].filter(d => d.value > 0);
  }, [predictions]);

  return (
    <div className="analytics-chart-card">
      <h3 className="section-title">
        <IconTarget size={16} />
        Distribución del Mercado
      </h3>
      <div className="pie-charts-row">
        <div className="pie-section">
          <p className="pie-subtitle">Variación Actual</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={800}
                  animationBegin={0}
                  stroke="none"
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{
                        background: colors.tooltipBg,
                        border: `1px solid ${colors.tooltipBorder}`,
                        borderRadius: '6px',
                        padding: '8px 12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                      }}>
                        <p style={{
                          fontFamily: 'Fira Code', fontSize: '12px',
                          fontWeight: 600, color: d.color, margin: 0,
                        }}>
                          {d.name}: {d.value}
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="chart-empty">Sin datos</p>
          )}
          <div className="pie-legend">
            {pieData.map((d, i) => (
              <span key={i} className="pie-legend-item">
                <span className="pie-legend-dot" style={{ background: d.color }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>
        <div className="pie-section">
          <p className="pie-subtitle">Predicciones IA</p>
          {predPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={predPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={800}
                  animationBegin={200}
                  stroke="none"
                >
                  {predPieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{
                        background: colors.tooltipBg,
                        border: `1px solid ${colors.tooltipBorder}`,
                        borderRadius: '6px',
                        padding: '8px 12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                      }}>
                        <p style={{
                          fontFamily: 'Fira Code', fontSize: '12px',
                          fontWeight: 600, color: d.color, margin: 0,
                        }}>
                          {d.name}: {d.value}
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="chart-empty">Sin predicciones</p>
          )}
          <div className="pie-legend">
            {predPieData.map((d, i) => (
              <span key={i} className="pie-legend-item">
                <span className="pie-legend-dot" style={{ background: d.color }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Price Comparison / Top Movers ─── */
function TopMoversChart({ stocks, colors }) {
  const data = useMemo(() => {
    if (!stocks?.stocks) return [];
    return stocks.stocks
      .filter(s => s.variation !== 0)
      .sort((a, b) => Math.abs(b.variation) - Math.abs(a.variation))
      .slice(0, 12)
      .map(s => ({
        symbol: s.symbol,
        variation: s.variation,
        fill: s.variation > 0 ? '#22c55e' : '#ef4444',
      }));
  }, [stocks]);

  if (!data.length) {
    return (
      <div className="analytics-chart-card">
        <h3 className="section-title">
          <IconActivity size={16} />
          Top Movimientos del Día
        </h3>
        <p className="chart-empty">Sin movimientos registrados</p>
      </div>
    );
  }

  return (
    <div className="analytics-chart-card">
      <h3 className="section-title">
        <IconActivity size={16} />
        Top Movimientos del Día (%)
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 32, left: 8, bottom: 0 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="none" horizontal={false} />
          <XAxis
            type="number"
            stroke="transparent"
            tick={{ fill: colors.tick, fontSize: 10, fontFamily: 'Fira Code' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v.toFixed(1)}%`}
          />
          <YAxis
            type="category"
            dataKey="symbol"
            stroke="transparent"
            tick={{ fill: colors.tick, fontSize: 11, fontFamily: 'Fira Code', fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            width={70}
          />
          <Tooltip content={<ChartTooltip colors={colors} suffix="%" />} />
          <Bar
            dataKey="variation"
            name="Var %"
            radius={[0, 4, 4, 0]}
            animationDuration={800}
          >
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.fill} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Price vs USD Comparison ─── */
function PriceComparisonChart({ stocks, colors }) {
  const data = useMemo(() => {
    if (!stocks?.stocks) return [];
    return stocks.stocks
      .filter(s => s.price_usd && s.price_usd > 0)
      .sort((a, b) => b.price_usd - a.price_usd)
      .slice(0, 12)
      .map(s => ({
        symbol: s.symbol,
        price_usd: parseFloat(s.price_usd?.toFixed(4) || 0),
        price_bs: s.price_bs,
      }));
  }, [stocks]);

  if (!data.length) {
    return (
      <div className="analytics-chart-card">
        <h3 className="section-title">
          <IconDatabase size={16} />
          Top Precios en USD
        </h3>
        <p className="chart-empty">Sin datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="analytics-chart-card">
      <h3 className="section-title">
        <IconDatabase size={16} />
        Top Precios en USD
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 40 }}>
          <defs>
            <linearGradient id="usdGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={colors.grid} strokeDasharray="none" vertical={false} />
          <XAxis
            dataKey="symbol"
            stroke="transparent"
            tick={{ fill: colors.tick, fontSize: 10, fontFamily: 'Fira Code' }}
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis
            stroke="transparent"
            tick={{ fill: colors.tick, fontSize: 10, fontFamily: 'Fira Code' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `$${v.toFixed(2)}`}
          />
          <Tooltip content={<ChartTooltip colors={colors} prefix="$" />} />
          <Bar
            dataKey="price_usd"
            name="Precio USD"
            fill="url(#usdGrad)"
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Effective Amount (Monto) Chart ─── */
function EffectiveAmountChart({ stocks, colors }) {
  const data = useMemo(() => {
    if (!stocks?.stocks) return [];
    return stocks.stocks
      .filter(s => s.effective_amount > 0)
      .sort((a, b) => b.effective_amount - a.effective_amount)
      .slice(0, 12)
      .map(s => ({
        symbol: s.symbol,
        monto: s.effective_amount,
      }));
  }, [stocks]);

  if (!data.length) {
    return (
      <div className="analytics-chart-card">
        <h3 className="section-title">
          <IconBarChart size={16} />
          Monto Efectivo Transado
        </h3>
        <p className="chart-empty">Sin datos de monto disponibles</p>
      </div>
    );
  }

  return (
    <div className="analytics-chart-card">
      <h3 className="section-title">
        <IconBarChart size={16} />
        Monto Efectivo Transado (Top 12)
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 40 }}>
          <defs>
            <linearGradient id="montoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={colors.grid} strokeDasharray="none" vertical={false} />
          <XAxis
            dataKey="symbol"
            stroke="transparent"
            tick={{ fill: colors.tick, fontSize: 10, fontFamily: 'Fira Code' }}
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis
            stroke="transparent"
            tick={{ fill: colors.tick, fontSize: 10, fontFamily: 'Fira Code' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
              : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
          />
          <Tooltip content={<ChartTooltip colors={colors} prefix="Bs " />} />
          <Area
            type="monotone"
            dataKey="monto"
            name="Monto Bs"
            stroke="#f59e0b"
            strokeWidth={2}
            fill="url(#montoGrad)"
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Confidence Radar ─── */
function ConfidenceRadar({ predictions, colors }) {
  const data = useMemo(() => {
    if (!predictions?.predictions) return [];
    return predictions.predictions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8)
      .map(p => ({
        symbol: p.symbol,
        confidence: p.confidence,
        rsi: p.rsi_value || 0,
      }));
  }, [predictions]);

  if (!data.length) return null;

  return (
    <div className="analytics-chart-card">
      <h3 className="section-title">
        <IconTarget size={16} />
        Radar de Confianza — Predicciones
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke={colors.grid} />
          <PolarAngleAxis
            dataKey="symbol"
            tick={{ fill: colors.tick, fontSize: 10, fontFamily: 'Fira Code' }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: colors.tick, fontSize: 9, fontFamily: 'Fira Code' }}
          />
          <Radar
            name="Confianza"
            dataKey="confidence"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.15}
            strokeWidth={2}
            animationDuration={800}
          />
          <Radar
            name="RSI"
            dataKey="rsi"
            stroke="#a855f7"
            fill="#a855f7"
            fillOpacity={0.1}
            strokeWidth={1.5}
            animationDuration={800}
          />
          <Legend
            wrapperStyle={{
              fontFamily: 'Fira Code',
              fontSize: '11px',
              color: colors.tick,
            }}
          />
          <Tooltip content={<ChartTooltip colors={colors} />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Stats Summary ─── */
function StatsSummary({ stocks, predictions }) {
  const stats = useMemo(() => {
    if (!stocks?.stocks) return null;
    const list = stocks.stocks;
    const totalVolume = list.reduce((sum, s) => sum + (s.shares_traded || 0), 0);
    const totalMonto = list.reduce((sum, s) => sum + (s.effective_amount || 0), 0);
    const avgVariation = list.length
      ? (list.reduce((sum, s) => sum + Math.abs(s.variation || 0), 0) / list.length)
      : 0;
    const maxPrice = Math.max(...list.map(s => s.price_bs || 0));
    const minPrice = Math.min(...list.filter(s => s.price_bs > 0).map(s => s.price_bs));
    const avgConfidence = predictions?.predictions?.length
      ? (predictions.predictions.reduce((s, p) => s + p.confidence, 0) / predictions.predictions.length)
      : 0;

    return {
      totalStocks: list.length,
      totalVolume,
      totalMonto,
      avgVariation,
      maxPrice,
      minPrice,
      avgConfidence,
      totalPredictions: predictions?.predictions?.length || 0,
    };
  }, [stocks, predictions]);

  if (!stats) return null;

  const items = [
    { label: 'Total Títulos', value: stats.totalVolume.toLocaleString('es-VE'), accent: '#38bdf8' },
    { label: 'Monto Total Bs', value: stats.totalMonto >= 1_000_000
      ? `${(stats.totalMonto / 1_000_000).toFixed(2)}M`
      : stats.totalMonto.toLocaleString('es-VE', { minimumFractionDigits: 2 }), accent: '#f59e0b' },
    { label: 'Var. Promedio', value: `${stats.avgVariation.toFixed(2)}%`, accent: '#a855f7' },
    { label: 'Precio Máx Bs', value: stats.maxPrice.toLocaleString('es-VE', { minimumFractionDigits: 2 }), accent: '#22c55e' },
    { label: 'Precio Mín Bs', value: stats.minPrice.toLocaleString('es-VE', { minimumFractionDigits: 2 }), accent: '#ef4444' },
    { label: 'Confianza IA Prom.', value: `${stats.avgConfidence.toFixed(1)}%`, accent: '#06b6d4' },
  ];

  return (
    <div className="analytics-stats-grid">
      {items.map((item, i) => (
        <div key={i} className="analytics-stat">
          <div className="analytics-stat__bar" style={{ background: item.accent }} />
          <p className="analytics-stat__label">{item.label}</p>
          <p className="analytics-stat__value">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/*  MAIN EXPORT                                    */
/* ═══════════════════════════════════════════════ */
export default function RecordsAnalytics({ stocks, predictions, stockHistory }) {
  const colors = useChartColors();

  return (
    <section className="analytics-section">
      <div className="analytics-section__header">
        <h2 className="section-title">
          <IconDatabase size={18} />
          Análisis por Registros
        </h2>
        <span className="analytics-section__badge">
          {stocks?.count || stocks?.stocks?.length || 0} registros
        </span>
      </div>

      <StatsSummary stocks={stocks} predictions={predictions} />

      <div className="analytics-grid analytics-grid--2">
        <RecordsPerDayChart stocks={stocks} colors={colors} />
        <MarketDistributionChart stocks={stocks} predictions={predictions} colors={colors} />
      </div>

      <div className="analytics-grid analytics-grid--2">
        <TopMoversChart stocks={stocks} colors={colors} />
        <PriceComparisonChart stocks={stocks} colors={colors} />
      </div>

      <div className="analytics-grid analytics-grid--2">
        <EffectiveAmountChart stocks={stocks} colors={colors} />
        <ConfidenceRadar predictions={predictions} colors={colors} />
      </div>
    </section>
  );
}
