import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingState from '../../components/LoadingState';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { getAssignedRides, getAvailableRides } from '../../services/rideService';
import { formatCurrency, formatDateTime } from '../../utils/format';

const activeStatuses = ['ACCEPTED', 'DRIVER_ARRIVING', 'STARTED'];

function DriverDashboard() {
  const { user } = useAuth();
  const [availableRides, setAvailableRides] = useState([]);
  const [assignedRides, setAssignedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [availableData, assignedData] = await Promise.all([
          getAvailableRides(),
          getAssignedRides()
        ]);

        setAvailableRides(availableData);
        setAssignedRides(assignedData);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Could not load driver dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const activeRides = assignedRides.filter((ride) => activeStatuses.includes(ride.status));
  const driverName = user?.name || 'Driver';

  return (
    <section className="dashboard">
      <div className="section-heading section-heading-row">
        <div>
          <h1>Driver Dashboard</h1>
          <p>Welcome, {driverName}. Track available, assigned, and active rides.</p>
        </div>
        <Link className="button button-link" to="/driver/available-rides">Available Rides</Link>
      </div>

      {loading ? <LoadingState message="Loading driver dashboard..." /> : null}
      <ErrorMessage message={error} />

      {!loading && !error ? (
        <>
          <div className="metric-strip">
            <Link className="metric-box metric-link" to="/driver/available-rides">
              <span>Available rides</span>
              <strong>{availableRides.length}</strong>
            </Link>
            <Link className="metric-box metric-link" to="/driver/assigned-rides">
              <span>Assigned rides</span>
              <strong>{assignedRides.length}</strong>
            </Link>
            <Link className="metric-box metric-link" to="/driver/assigned-rides">
              <span>Active rides</span>
              <strong>{activeRides.length}</strong>
            </Link>
          </div>

          <div className="section-heading section-heading-row compact-heading">
            <div>
              <h2>Active Rides</h2>
            </div>
            <Link to="/driver/assigned-rides">View assigned</Link>
          </div>

          {activeRides.length === 0 ? (
            <EmptyState message="No active rides right now." />
          ) : (
            <div className="ride-card-list">
              {activeRides.map((ride) => (
                <Link className="ride-card" to={`/driver/rides/${ride._id || ride.id}`} key={ride._id || ride.id}>
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

export default DriverDashboard;
