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
    <section className="home-panel">
      <h1>Mini Fleet Platform</h1>
      <p>Fleet booking and tracking workspace.</p>
      <Link to="/login">
        <Button>Login</Button>
      </Link>
    </section>
  );
}

export default HomePage;
