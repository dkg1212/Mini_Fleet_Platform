import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import ErrorMessage from '../../components/ErrorMessage';
import LoadingState from '../../components/LoadingState';
import { getAdminMetrics } from '../../services/adminService';
import { formatCurrency } from '../../utils/format';

const metricCards = [
  ['Total Rides', 'totalRides'],
  ['Requested Rides', 'requestedRides'],
  ['Active Rides', 'activeRides'],
  ['Completed Rides', 'completedRides'],
  ['Cancelled Rides', 'cancelledRides'],
  ['Completed Revenue', 'completedRevenue', 'currency']
];

function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await getAdminMetrics();
        setMetrics(data);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Could not load admin metrics.');
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  return (
    <section className="dashboard">
      <div className="section-heading section-heading-row">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Monitor fleet bookings, lifecycle status, and completed revenue.</p>
        </div>
        <Link className="button button-link" to="/admin/rides">View Rides</Link>
      </div>

      {loading ? <LoadingState message="Loading admin metrics..." /> : null}
      <ErrorMessage message={error} />

      {!loading && !error && metrics ? (
        <div className="metric-strip">
          {metricCards.map(([label, key, type]) => (
            <div className="metric-box" key={key}>
              <span>{label}</span>
              <strong>{type === 'currency' ? formatCurrency(metrics[key]) : metrics[key]}</strong>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default AdminDashboard;
