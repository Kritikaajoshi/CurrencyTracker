import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('JPY');
  const [error, setError] = useState('');

  async function load() {
    try {
      const { data } = await api.get('/watchlist');
      setItems(data.items);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function addPair(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/watchlist', { from, to });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    await api.delete(`/watchlist/${id}`);
    load();
  }

  return (
    <div className="panel">
      <div className="panel-header"><h2>Watchlist</h2></div>

      <form className="inline-form" onSubmit={addPair}>
        <input className="mono small-input" value={from} onChange={(e) => setFrom(e.target.value.toUpperCase())} maxLength={3} />
        <span>/</span>
        <input className="mono small-input" value={to} onChange={(e) => setTo(e.target.value.toUpperCase())} maxLength={3} />
        <button type="submit" className="secondary-btn">Add</button>
      </form>

      {error && <p className="error-text">{error}</p>}

      <ul className="list">
        {items.length === 0 && <li className="empty-state">No pairs yet — add one above to track it.</li>}
        {items.map((item) => (
          <li key={item._id} className="list-row">
            <span className="mono pair-label">{item.from}/{item.to}</span>
            <span className="mono rate-label">{item.currentRate ? item.currentRate.toFixed(4) : '—'}</span>
            <button className="text-btn" onClick={() => remove(item._id)} aria-label={`Remove ${item.from}/${item.to}`}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
