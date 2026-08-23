import { useEffect, useState } from 'react';
import api from '../services/api';

// The signature element: a scrolling ledger strip of major currency pairs,
// styled like an old exchange board rather than a generic ticker.
const PAIRS = [
  ['USD', 'EUR'], ['USD', 'GBP'], ['USD', 'JPY'],
  ['EUR', 'GBP'], ['USD', 'CHF'], ['USD', 'CAD'],
];

export default function RateLedger() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await api.get('/currency/latest', { params: { base: 'USD' } });
        if (cancelled) return;
        setRows(
          PAIRS.map(([from, to]) => {
            if (from === 'USD') {
              return { from, to, rate: data.rates[to] };
            }
            // EUR/GBP: derive cross rate from USD-based table
            const usdToFrom = data.rates[from];
            const usdToTo = data.rates[to];
            return { from, to, rate: usdToFrom && usdToTo ? usdToTo / usdToFrom : null };
          })
        );
      } catch {
        setRows(PAIRS.map(([from, to]) => ({ from, to, rate: null })));
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="ledger-strip">
      <div className="ledger-strip-track">
        {[...rows, ...rows].map((r, i) => (
          <span key={i} className="ledger-item mono">
            <span className="ledger-pair">{r.from}/{r.to}</span>
            <span className={r.rate ? 'ledger-rate' : 'ledger-rate dim'}>
              {r.rate ? r.rate.toFixed(4) : '—'}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
