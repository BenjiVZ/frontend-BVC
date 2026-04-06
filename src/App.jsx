import { useState, useCallback } from 'react';
import Header from './components/Header';
import TickerBar from './components/TickerBar';
import SummaryCards from './components/SummaryCards';
import StockTable from './components/StockTable';
import StockChart from './components/StockChart';
import DollarChart from './components/DollarChart';
import PredictionsGrid from './components/PredictionsGrid';
import RecordsAnalytics from './components/RecordsAnalytics';
import { useSummary, useStocks, useDollar, usePredictions, useStockHistory, useStocksHistory } from './hooks/useApi';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const { theme, toggle: toggleTheme } = useTheme();

  const { data: summary, refetch: rSummary } = useSummary();
  const { data: stocks, refetch: rStocks } = useStocks();
  const { data: dollar, refetch: rDollar } = useDollar();
  const { data: predictions, refetch: rPreds } = usePredictions();
  const { data: stocksHistory } = useStocksHistory(30);
  const { data: stockHistory } = useStockHistory(
    selectedSymbol || stocks?.stocks?.[0]?.symbol || 'ABC.A'
  );

  const currentSymbol = selectedSymbol || stocks?.stocks?.[0]?.symbol || 'ABC.A';

  const handleRefresh = useCallback(() => {
    rSummary(); rStocks(); rDollar(); rPreds();
  }, [rSummary, rStocks, rDollar, rPreds]);

  return (
    <div className="app">
      <Header
        summary={summary}
        onRefresh={handleRefresh}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <TickerBar stocks={stocks} />

      <main className="main">
        <SummaryCards summary={summary} />

        <div className="charts-row">
          <div className="chart-panel">
            <div className="chart-panel__header">
              <select
                className="symbol-select"
                value={currentSymbol}
                onChange={e => setSelectedSymbol(e.target.value)}
              >
                {stocks?.stocks?.map(s => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol} — {s.name}
                  </option>
                ))}
              </select>
            </div>
            <StockChart historyData={stockHistory} symbol={currentSymbol} />
          </div>
          <div className="chart-panel">
            <DollarChart dollarData={dollar} />
          </div>
        </div>

        <StockTable
          stocks={stocks}
          predictions={predictions}
          onSelectSymbol={setSelectedSymbol}
          stocksHistory={stocksHistory}
        />

        <RecordsAnalytics
          stocks={stocks}
          predictions={predictions}
          stockHistory={stockHistory}
        />

        <PredictionsGrid predictions={predictions} />
      </main>

      <footer className="footer">
        <p>
          BVC Terminal — Datos:{' '}
          <a href="https://www.bolsadecaracas.com" target="_blank" rel="noreferrer">
            bolsadecaracas.com
          </a>
          {' · '}Tasa:{' '}
          <a href="https://ve.dolarapi.com" target="_blank" rel="noreferrer">
            ve.dolarapi.com
          </a>
        </p>
      </footer>
    </div>
  );
}
