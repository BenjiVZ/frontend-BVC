import { IconDollar, IconTrendUp, IconTrendDown, IconTarget, IconDatabase } from './Icons';

const CARDS = [
  { key: 'dollar', icon: IconDollar, label: 'Tasa del Dólar', iconClass: 'card__icon--dollar' },
  { key: 'ups', icon: IconTrendUp, label: 'Subiendo', iconClass: 'card__icon--up' },
  { key: 'downs', icon: IconTrendDown, label: 'Bajando', iconClass: 'card__icon--down' },
  { key: 'predictions', icon: IconTarget, label: 'Predicciones', iconClass: 'card__icon--pred' },
  { key: 'records', icon: IconDatabase, label: 'Registros', iconClass: 'card__icon--data' },
];

function formatValue(key, summary) {
  switch (key) {
    case 'dollar':
      return summary?.dollar_rate?.toLocaleString('es-VE', { minimumFractionDigits: 2 }) || '—';
    case 'ups': return summary?.ups || 0;
    case 'downs': return summary?.downs || 0;
    case 'predictions': return summary?.stock_count || 0;
    case 'records': return summary?.total_records || 0;
    default: return '—';
  }
}

function formatSubtext(key, summary) {
  switch (key) {
    case 'dollar': return summary?.dollar_date ? `Actualizado ${summary.dollar_date}` : '';
    case 'ups': return 'variación positiva';
    case 'downs': return 'variación negativa';
    case 'predictions': return 'señales activas';
    case 'records': return 'en base de datos';
    default: return '';
  }
}

export default function SummaryCards({ summary }) {
  return (
    <div className="summary-cards">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.key} className="card">
            <div className={`card__icon ${card.iconClass}`}>
              <Icon size={16} />
            </div>
            <p className="card__label">{card.label}</p>
            <p className="card__value">{formatValue(card.key, summary)}</p>
            <p className="card__sub">{formatSubtext(card.key, summary)}</p>
          </div>
        );
      })}
    </div>
  );
}
