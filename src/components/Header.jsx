import { useState } from 'react';
import { api } from '../api/client';
import { IconRefresh, IconSun, IconMoon } from './Icons';

export default function Header({ summary, onRefresh, theme, onToggleTheme }) {
  const [scraping, setScraping] = useState(false);

  const handleScrape = async () => {
    setScraping(true);
    try {
      await api.runScrape();
      onRefresh?.();
    } catch (e) {
      console.error(e);
    } finally {
      setScraping(false);
    }
  };

  return (
    <header className="header">
      <div className="header__brand">
        <div>
          <h1 className="header__title">BVC Terminal</h1>
          <p className="header__subtitle">Bolsa de Valores de Caracas</p>
        </div>
      </div>

      <nav className="header__nav">
        <div className="header__stat">
          <span className="header__stat-label">Tasa USD/VES</span>
          <span className="header__stat-value">
            {summary?.dollar_rate?.toLocaleString('es-VE', { minimumFractionDigits: 2 }) || '—'}
          </span>
        </div>
        <div className="header__stat">
          <span className="header__stat-label">Acciones</span>
          <span className="header__stat-value">{summary?.stock_count || 0}</span>
        </div>
        <div className="header__stat">
          <span className="header__stat-label">Subiendo</span>
          <span className="header__stat-value text-up">{summary?.ups || 0}</span>
        </div>
        <div className="header__stat">
          <span className="header__stat-label">Bajando</span>
          <span className="header__stat-value text-down">{summary?.downs || 0}</span>
        </div>
      </nav>

      <div className="header__actions">
        <span className="header__timestamp">
          <span className="pulse-dot" />
          {summary?.latest_date || '—'}
        </span>
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
        </button>
        <button
          className="btn btn--primary"
          onClick={handleScrape}
          disabled={scraping}
        >
          <IconRefresh size={14} />
          {scraping ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>
    </header>
  );
}
