import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}

export function useSummary() {
  return useApi(() => api.getSummary());
}

export function useStocks() {
  return useApi(() => api.getStocks());
}

export function useDollar() {
  return useApi(() => api.getDollar());
}

export function usePredictions() {
  return useApi(() => api.getPredictions());
}

export function useStockHistory(symbol, days = 90) {
  return useApi(() => api.getStockHistory(symbol, days), [symbol, days]);
}

export function useStocksHistory(days = 30) {
  return useApi(() => api.getStocksHistory(days), [days]);
}
