import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY', 'INR'];

export default function Converter({ onConverted }) {
  const { user } = useAuth();
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [amount, setAmount] = useState('100');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleConvert(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (user) {
        const { data } = await api.post('/currency/convert', { from, to, amount });
        setResult(data);
        onConverted?.();
      } else {
        // Not logged in: use the public latest-rates endpoint, don't log history
        const { data } = await api.get('/currency/latest', { params: { base: from } });
        const rate = data.rates[to];
        setResult({ from, to, amount: Number(amount), rate, result: Number(amount) * rate });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function swap() {
    setFrom(to);
    setTo(from);
    setResult(null);
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Convert</h2>
        {!user && <span className="badge">Sign in to save history</span>}
      </div>
      <form onSubmit={handleConvert} className="converter-form">
        <div className="field">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            className="mono"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="converter-row">
          <div className="field">
            <label htmlFor="from">From</label>
            <select id="from" value={from} onChange={(e) => setFrom(e.target.value)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button type="button" className="swap-btn" onClick={swap} aria-label="Swap currencies">⇄</button>

          <div className="field">
            <label htmlFor="to">To</label>
            <select id="to" value={to} onChange={(e) => setTo(e.target.value)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Converting…' : 'Convert'}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {result && !error && (
        <div className="result-block">
          <div className="result-figure mono">
            {result.result.toFixed(2)} <span className="result-code">{result.to}</span>
          </div>
          <div className="result-sub mono">
            1 {result.from} = {result.rate.toFixed(6)} {result.to}
          </div>
        </div>
      )}
    </div>
  );
}
