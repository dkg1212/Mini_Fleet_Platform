import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import ErrorMessage from '../../components/ErrorMessage';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import { getAdminMetrics } from '../../services/adminService';
import { getRides } from '../../services/rideService';
import { formatCurrency } from '../../utils/format';

const metricCards = [
  ['Total Rides', 'totalRides'],
  ['Requested Rides', 'requestedRides'],
  ['Active Rides', 'activeRides'],
  ['Completed Rides', 'completedRides'],
  ['Cancelled Rides', 'cancelledRides'],
  ['Completed Revenue', 'completedRevenue', 'currency']
];

const getUserId = (userValue) => {
  if (userValue?._id || userValue?.id) {
    return userValue._id || userValue.id;
  }

  return typeof userValue === 'string' ? userValue : '';
};

const getUniqueUsersFromRides = (rides, key) => {
  const users = new Map();

  rides.forEach((ride) => {
    const userValue = ride[key];
    const userId = getUserId(userValue);

    if (!userId || !userValue?.name) {
      return;
    }

    users.set(userId, {
      id: userId,
      name: userValue.name,
      email: userValue.email
    });
  });

  return Array.from(users.values()).sort((first, second) => first.name.localeCompare(second.name));
};

function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usersError, setUsersError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const metricsData = await getAdminMetrics();
        setMetrics(metricsData);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Could not load admin metrics.');
      }

      try {
        const ridesData = await getRides();

        setDrivers(getUniqueUsersFromRides(ridesData, 'driverId'));
        setCustomers(getUniqueUsersFromRides(ridesData, 'customerId'));
      } catch (apiError) {
        setUsersError(apiError.response?.data?.message || 'Could not load drivers and customers.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
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
      <ErrorMessage message={usersError} />

      {!loading && metrics ? (
        <>
          <div className="metric-strip">
            {metricCards.map(([label, key, type]) => (
              <div className="metric-box" key={key}>
                <span>{label}</span>
                <strong>{type === 'currency' ? formatCurrency(metrics[key]) : metrics[key]}</strong>
              </div>
            ))}
          </div>

          <div className="admin-users-grid">
            <section className="admin-users-panel">
              <div className="section-heading compact-heading">
                <h2>Drivers</h2>
              </div>
              {drivers.length === 0 ? <EmptyState message="No drivers found." /> : (
                <div className="user-list">
                  {drivers.map((driver) => (
                    <div className="user-list-item" key={driver._id || driver.id}>
                      <strong>{driver.name}</strong>
                      <span>{driver.email || 'Email not available'}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="admin-users-panel">
              <div className="section-heading compact-heading">
                <h2>Customers</h2>
              </div>
              {customers.length === 0 ? <EmptyState message="No customers found." /> : (
                <div className="user-list">
                  {customers.map((customer) => (
                    <div className="user-list-item" key={customer._id || customer.id}>
                      <strong>{customer.name}</strong>
                      <span>{customer.email || 'Email not available'}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default AdminDashboard;
