import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';

export default function TrendChart() {
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/currency/trend', { params: { from, to, days: 14 } });
      setSeries(data.series.filter((p) => p.rate != null));
    } catch {
      setSeries([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>14-day trend</h2>
        <form
          className="trend-controls"
          onSubmit={(e) => { e.preventDefault(); load(); }}
        >
          <input className="mono small-input" value={from} onChange={(e) => setFrom(e.target.value.toUpperCase())} maxLength={3} />
          <span>/</span>
          <input className="mono small-input" value={to} onChange={(e) => setTo(e.target.value.toUpperCase())} maxLength={3} />
          <button type="submit" className="secondary-btn">{loading ? '…' : 'Update'}</button>
        </form>
      </div>

      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>
          <LineChart data={series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="var(--hairline)" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--parchment-dim)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              tickFormatter={(d) => d.slice(5)}
              axisLine={{ stroke: 'var(--hairline)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--parchment-dim)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              domain={['auto', 'auto']}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--hairline)', borderRadius: 3 }}
              labelStyle={{ color: 'var(--parchment-dim)', fontFamily: 'var(--font-mono)' }}
              itemStyle={{ color: 'var(--gold-bright)', fontFamily: 'var(--font-mono)' }}
            />
            <Line type="monotone" dataKey="rate" stroke="var(--gold-bright)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
