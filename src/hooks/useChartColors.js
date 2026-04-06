import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Reads CSS custom properties from the document root,
 * re-reads when data-theme attribute changes.
 */
export function useChartColors() {
  const [colors, setColors] = useState(() => readColors());
  const observerRef = useRef(null);

  const update = useCallback(() => {
    setColors(readColors());
  }, []);

  useEffect(() => {
    // Watch for data-theme attribute changes on <html>
    observerRef.current = new MutationObserver(update);
    observerRef.current.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observerRef.current?.disconnect();
  }, [update]);

  return colors;
}

function readColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    grid: style.getPropertyValue('--chart-grid').trim() || 'rgba(148,163,184,0.04)',
    tick: style.getPropertyValue('--chart-tick').trim() || '#475569',
    priceStroke: style.getPropertyValue('--chart-price-stroke').trim() || '#22c55e',
    priceFillStart: style.getPropertyValue('--chart-price-fill-start').trim() || 'rgba(34,197,94,0.15)',
    priceFillEnd: style.getPropertyValue('--chart-price-fill-end').trim() || 'rgba(34,197,94,0)',
    dollarStroke: style.getPropertyValue('--chart-dollar-stroke').trim() || '#38bdf8',
    dollarDotFill: style.getPropertyValue('--chart-dollar-dot-fill').trim() || '#0f1629',
    tooltipBg: style.getPropertyValue('--chart-tooltip-bg').trim() || '#141c35',
    tooltipBorder: style.getPropertyValue('--chart-tooltip-border').trim() || 'rgba(148,163,184,0.16)',
  };
}
