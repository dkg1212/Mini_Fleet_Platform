import { Link, Outlet, useNavigate } from 'react-router-dom';

import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

function AppLayout() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand-link">Mini Fleet Platform</Link>
        <nav className="app-nav">
          {isAuthenticated ? (
            <>
              <span>{user.name} · {user.role}</span>
              <Button onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
