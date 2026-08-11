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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.16),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#eef6f5_100%)] text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-lg font-bold tracking-tight text-slate-900 transition hover:text-teal-700">Mini Fleet Platform</Link>
          <nav className="flex items-center gap-3 text-sm text-slate-600">
          {isAuthenticated ? (
            <>
              <span className="hidden rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 sm:inline-flex">{user.name} · {user.role}</span>
              <Button onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <Link className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-700" to="/login">Login</Link>
          )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
