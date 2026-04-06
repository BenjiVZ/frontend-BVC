export default function TickerBar({ stocks }) {
  if (!stocks?.stocks?.length) return null;

  const items = stocks.stocks;
  // Duplicate for infinite scroll effect
  const doubled = [...items, ...items];

  return (
    <div className="ticker-bar">
      <div className="ticker-track">
        {doubled.map((s, i) => {
          const varClass = s.variation > 0 ? 'ticker-item__var--up'
            : s.variation < 0 ? 'ticker-item__var--down'
            : 'ticker-item__var--neutral';
          const arrow = s.variation > 0 ? '▲' : s.variation < 0 ? '▼' : '';

          return (
            <div key={`${s.symbol}-${i}`} className="ticker-item">
              <span className="ticker-item__symbol">{s.symbol}</span>
              <span className="ticker-item__price">
                {s.price_bs?.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </span>
              <span className={`ticker-item__var ${varClass}`}>
                {arrow} {Math.abs(s.variation).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
