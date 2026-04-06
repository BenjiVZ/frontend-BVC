import { useState, useMemo } from 'react';
import { IconBarChart } from './Icons';

export default function StockTable({ stocks, predictions, onSelectSymbol }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('symbol');
  const [sortDir, setSortDir] = useState('asc');

  const predMap = useMemo(() => {
    if (!predictions?.predictions) return {};
    const map = {};
    predictions.predictions.forEach(p => { map[p.symbol] = p; });
    return map;
  }, [predictions]);

  const filtered = useMemo(() => {
    if (!stocks?.stocks) return [];
    let list = [...stocks.stocks];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase(); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [stocks, search, sortBy, sortDir]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const arrow = (col) => sortBy === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <div className="stock-table-wrapper">
      <div className="stock-table__header">
        <h2 className="section-title">
          <IconBarChart size={16} />
          Cotizaciones del Mercado
        </h2>
        <input
          className="search-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar símbolo..."
        />
      </div>
      <div className="table-scroll">
        <table className="stock-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('symbol')}>Símbolo{arrow('symbol')}</th>
              <th onClick={() => handleSort('name')}>Nombre{arrow('name')}</th>
              <th onClick={() => handleSort('price_bs')}>Precio Bs{arrow('price_bs')}</th>
              <th onClick={() => handleSort('price_usd')}>Precio USD{arrow('price_usd')}</th>
              <th onClick={() => handleSort('variation')}>Var %{arrow('variation')}</th>
              <th onClick={() => handleSort('effective_amount')}>Monto{arrow('effective_amount')}</th>
              <th onClick={() => handleSort('shares_traded')}>Títulos{arrow('shares_traded')}</th>
              <th>Señal</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const pred = predMap[s.symbol];
              const varClass = s.variation > 0 ? 'text-up' : (s.variation < 0 ? 'text-down' : 'text-neutral');
              const predDir = pred?.predicted_direction || 'NEUTRAL';

              return (
                <tr key={s.id} onClick={() => onSelectSymbol?.(s.symbol)}>
                  <td className="stock-symbol">{s.symbol}</td>
                  <td>{s.name}</td>
                  <td>{s.price_bs?.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td>
                  <td>${s.price_usd?.toFixed(4) || '—'}</td>
                  <td className={varClass}>
                    {s.variation > 0 ? '▲' : (s.variation < 0 ? '▼' : '—')}{' '}
                    {Math.abs(s.variation).toFixed(2)}%
                  </td>
                  <td>{s.effective_amount?.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td>
                  <td>{s.shares_traded?.toLocaleString('es-VE')}</td>
                  <td>
                    <span className={`badge badge--${predDir.toLowerCase()}`}>
                      {predDir === 'UP' ? '▲' : (predDir === 'DOWN' ? '▼' : '—')}{' '}
                      {predDir} {pred?.confidence?.toFixed(0) || 0}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
