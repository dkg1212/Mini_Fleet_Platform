import { Link, Navigate } from 'react-router-dom';

import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../utils/routes';

function HomePage() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
        <div className="grid gap-6">
          <div className="inline-flex w-fit items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            Fleet operations
          </div>
          <div className="grid gap-4">
            <h1 className="max-w-xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Mini Fleet Platform
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Fleet booking and tracking workspace with a Tailwind-powered interface.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/login">
              <Button>Login</Button>
            </Link>
            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Fast setup, cleaner UI
            </div>
          </div>
        </div>
        <div className="grid gap-4 rounded-2xl bg-slate-950 p-6 text-slate-100 shadow-lg">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">What you get</div>
          <div className="grid gap-3 text-sm leading-6 text-slate-300">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">Responsive dashboard shell</div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">Reusable form controls</div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">Utility-first styling with Tailwind</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
