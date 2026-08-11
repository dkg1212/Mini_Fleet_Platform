import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import ErrorMessage from '../../components/ErrorMessage';
import LoadingState from '../../components/LoadingState';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { getRides } from '../../services/rideService';
import { formatCurrency, formatDateTime } from '../../utils/format';

function CustomerDashboard() {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRides = async () => {
      try {
        const data = await getRides();
        setRides(data);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Could not load dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadRides();
  }, []);

  const recentRides = rides.slice(0, 5);
  const customerName = user?.name || 'Customer';

  return (
    <section className="dashboard">
      <div className="section-heading section-heading-row">
        <div>
          <h1>Customer Dashboard</h1>
          <p>Welcome, {customerName}. Manage your ride bookings here.</p>
        </div>
        <Link className="button button-link" to="/customer/create-ride">Create Ride</Link>
      </div>

      {loading ? <LoadingState message="Loading your rides..." /> : null}
      <ErrorMessage message={error} />
      {!loading && !error ? (
        <>
          <div className="metric-strip">
            <div className="metric-box">
              <span>Total rides</span>
              <strong>{rides.length}</strong>
            </div>
            <div className="metric-box">
              <span>Recent status</span>
              <strong>{recentRides[0] ? <StatusBadge status={recentRides[0].status} /> : 'None'}</strong>
            </div>
          </div>

          <div className="section-heading section-heading-row compact-heading">
            <div>
              <h2>Recent Rides</h2>
            </div>
            <Link to="/customer/rides">View all</Link>
          </div>

          {recentRides.length === 0 ? (
            <div className="state-message">No rides booked yet.</div>
          ) : (
            <div className="ride-card-list">
              {recentRides.map((ride) => (
                <Link className="ride-card" to={`/customer/rides/${ride._id || ride.id}`} key={ride._id || ride.id}>
                  <div>
                    <strong>{ride.bookingId}</strong>
                    <span>{ride.pickup} to {ride.destination}</span>
                  </div>
                  <div>
                    <span>{formatDateTime(ride.requestedTime)}</span>
                    <span>{formatCurrency(ride.estimatedFare)}</span>
                  </div>
                  <StatusBadge status={ride.status} />
                </Link>
              ))}
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}

export default CustomerDashboard;
