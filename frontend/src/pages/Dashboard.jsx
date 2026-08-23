import { useState } from 'react';
import RateLedger from '../components/RateLedger';
import Converter from '../components/Converter';
import TrendChart from '../components/TrendChart';
import Watchlist from '../components/Watchlist';
import Alerts from '../components/Alerts';
import History from '../components/History';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="dashboard">
      <RateLedger />

      <div className="hero">
        <span className="eyebrow">Live exchange desk</span>
        <h1>Every rate, entered in the ledger.</h1>
        <p className="hero-sub">
          Real-time conversion backed by Fixer, with your own trend charts, watchlists,
          and target-rate alerts — checked in the background, whether or not you're looking.
        </p>
      </div>

      <div className="grid-2">
        <Converter onConverted={() => setRefreshKey((k) => k + 1)} />
        <TrendChart />
      </div>

      {user ? (
        <div className="grid-3">
          <Watchlist />
          <Alerts />
          <History refreshKey={refreshKey} />
        </div>
      ) : (
        <div className="panel signin-nudge">
          <p>Sign in to build a watchlist, set target-rate alerts, and keep a conversion history.</p>
        </div>
      )}
    </div>
  );
}
