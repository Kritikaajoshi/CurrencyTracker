import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Alerts() {
  const [items, setItems] = useState([]);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [direction, setDirection] = useState('above');
  const [targetRate, setTargetRate] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      const { data } = await api.get('/alerts');
      setItems(data.items);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function createAlert(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/alerts', { from, to, direction, targetRate });
      setTargetRate('');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function cancel(id) {
    await api.delete(`/alerts/${id}`);
    load();
  }

  return (
    <div className="panel">
      <div className="panel-header"><h2>Rate alerts</h2></div>

      <form className="alert-form" onSubmit={createAlert}>
        <div className="inline-form">
          <input className="mono small-input" value={from} onChange={(e) => setFrom(e.target.value.toUpperCase())} maxLength={3} />
          <span>/</span>
          <input className="mono small-input" value={to} onChange={(e) => setTo(e.target.value.toUpperCase())} maxLength={3} />
          <select value={direction} onChange={(e) => setDirection(e.target.value)}>
            <option value="above">rises above</option>
            <option value="below">falls below</option>
          </select>
          <input
            className="mono small-input"
            type="number"
            step="any"
            placeholder="rate"
            value={targetRate}
            onChange={(e) => setTargetRate(e.target.value)}
            required
          />
          <button type="submit" className="secondary-btn">Set alert</button>
        </div>
      </form>

      {error && <p className="error-text">{error}</p>}

      <ul className="list">
        {items.length === 0 && <li className="empty-state">No alerts yet, set a target rate above.</li>}
        {items.map((a) => (
          <li key={a._id} className="list-row">
            <span className="mono pair-label">
              {a.from}/{a.to} {a.direction} {a.targetRate}
            </span>
            <span className={`status-tag status-${a.status}`}>{a.status}</span>
            {a.status === 'active' && (
              <button className="text-btn" onClick={() => cancel(a._id)}>Cancel</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
