import { useEffect, useState } from 'react';
import api from '../services/api';

export default function History({ refreshKey }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/currency/history', { params: { limit: 10 } })
      .then((res) => setItems(res.data.items))
      .catch(() => setItems([]));
  }, [refreshKey]);

  return (
    <div className="panel">
      <div className="panel-header"><h2>Recent conversions</h2></div>
      <ul className="list">
        {items.length === 0 && <li className="empty-state">Your converted amounts will show up here.</li>}
        {items.map((h) => (
          <li key={h._id} className="list-row">
            <span className="mono">{h.amount} {h.from} → {h.result.toFixed(2)} {h.to}</span>
            <span className="mono dim-text">{new Date(h.createdAt).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
