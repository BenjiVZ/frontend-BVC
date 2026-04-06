import { useMemo } from 'react';
import { IconActivity } from './Icons';

export default function PredictionsGrid({ predictions }) {
  const preds = useMemo(() => {
    if (!predictions?.predictions) return [];
    return predictions.predictions;
  }, [predictions]);

  if (!preds.length) {
    return (
      <div className="predictions-section">
        <h2 className="section-title">
          <IconActivity size={16} />
          Predicciones del Mercado
        </h2>
        <p className="chart-empty">No hay predicciones disponibles</p>
      </div>
    );
  }

  return (
    <div className="predictions-section">
      <h2 className="section-title">
        <IconActivity size={16} />
        Predicciones del Mercado
      </h2>
      <div className="predictions-grid">
        {preds.map((p) => {
          const dir = p.predicted_direction;

          return (
            <div key={p.id} className="pred-card">
              <div className="pred-card__header">
                <span className="pred-card__symbol">{p.symbol}</span>
                <span className={`pred-card__dir badge badge--${dir.toLowerCase()}`}>
                  {dir === 'UP' ? '▲ SUBE' : (dir === 'DOWN' ? '▼ BAJA' : '— NEUTRO')}
                </span>
              </div>
              <div className="pred-card__confidence">
                <div className="progress-bar">
                  <div
                    className="progress-bar__fill"
                    style={{
                      width: `${Math.min(p.confidence, 100)}%`,
                      background: dir === 'UP' ? 'var(--signal-up)' :
                        (dir === 'DOWN' ? 'var(--signal-down)' : 'var(--signal-neutral)')
                    }}
                  />
                </div>
                <span className="pred-card__pct">{p.confidence?.toFixed(1)}%</span>
              </div>
              <div className="pred-card__signals">
                <Signal label="SMA" value={p.sma_signal} />
                <Signal label="RSI" value={p.rsi_signal} sub={p.rsi_value != null ? p.rsi_value.toFixed(1) : null} />
                <Signal label="MACD" value={p.macd_signal} />
                <Signal label="REG" value={p.regression_signal} />
              </div>
              <div className="pred-card__ai">
                {p.gemini_signal ? (
                  <>
                    <div className="ai-header">
                      <span className="ai-title">🤖 AI Gemini</span>
                      <span className={`badge badge--${p.gemini_signal.toLowerCase()}`}>
                        {p.gemini_signal}
                      </span>
                    </div>
                    {p.gemini_reasoning && <p className="ai-reason">{p.gemini_reasoning}</p>}
                  </>
                ) : (
                  <div className="ai-header">
                    <span className="ai-title" style={{opacity: 0.5}}>🤖 Sin análisis IA</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Signal({ label, value, sub }) {
  const cls = value === 'UP' ? 'signal--up' :
    (value === 'DOWN' ? 'signal--down' : 'signal--neutral');
  return (
    <div className={`signal ${cls}`}>
      <span className="signal__label">{label}</span>
      <span className="signal__value">{value || '—'}</span>
      {sub && <span className="signal__sub">{sub}</span>}
    </div>
  );
}
