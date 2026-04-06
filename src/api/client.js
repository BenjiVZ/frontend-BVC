const API_BASE = import.meta.env.VITE_API_URL || 'https://3992.aplicacionesdamasco.com/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getStocks: () => request('/stocks/'),
  getStockHistory: (symbol, days = 90) =>
    request(`/stock/${symbol}/history/?days=${days}`),
  getDollar: () => request('/dollar/'),
  getPredictions: () => request('/predictions/'),
  getSummary: () => request('/summary/'),
  runScrape: () => request('/scrape/', { method: 'POST' }),
};
