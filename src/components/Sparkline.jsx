import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

/**
 * Tiny sparkline chart for embedding inside table rows.
 * Shows price trend with color based on direction (up=green, down=red).
 */
export default function Sparkline({ data, width = 120, height = 36 }) {
  const { chartData, color, gradientId } = useMemo(() => {
    if (!data?.length) return { chartData: [], color: '#64748b', gradientId: 'sparkNeutral' };

    const chartData = data.map((d, i) => ({
      idx: i,
      price: d.price_bs ?? d.price ?? 0,
    }));

    const first = chartData[0]?.price || 0;
    const last = chartData[chartData.length - 1]?.price || 0;
    const direction = last > first ? 'up' : last < first ? 'down' : 'neutral';

    const colorMap = {
      up: '#22c55e',
      down: '#ef4444',
      neutral: '#64748b',
    };

    const id = `spark_${Math.random().toString(36).slice(2, 8)}`;

    return {
      chartData,
      color: colorMap[direction],
      gradientId: id,
    };
  }, [data]);

  if (!chartData.length) {
    return (
      <div className="sparkline-empty" style={{ width, height }}>
        <span>—</span>
      </div>
    );
  }

  return (
    <div className="sparkline-container" style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            dot={false}
            activeDot={false}
            animationDuration={400}
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
