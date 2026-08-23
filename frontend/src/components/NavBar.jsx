import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-mark">§</span>
        <span className="brand-name">Ledger</span>
      </Link>
      <nav className="nav-links">
        {user ? (
          <>
            <span className="nav-user mono">{user.name}</span>
            <button className="text-btn" onClick={() => { logout(); navigate('/'); }}>Sign out</button>
          </>
        ) : (
          <>
            <Link to="/login">Sign in</Link>
            <Link to="/register" className="cta-link">Create account</Link>
          </>
        )}
      </nav>
    </header>
  );
}
