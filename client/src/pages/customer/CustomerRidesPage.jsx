import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingState from '../../components/LoadingState';
import StatusBadge from '../../components/StatusBadge';
import { getRides } from '../../services/rideService';
import { formatCurrency, formatDateTime } from '../../utils/format';

function CustomerRidesPage() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRides = async () => {
      try {
        const data = await getRides();
        setRides(data);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Could not load rides.');
      } finally {
        setLoading(false);
      }
    };

    loadRides();
  }, []);

  return (
    <section className="dashboard">
      <div className="section-heading section-heading-row">
        <div>
          <h1>Your Rides</h1>
          <p>Review your current bookings and ride history.</p>
        </div>
        <Link className="button button-link" to="/customer/create-ride">Create Ride</Link>
      </div>

      {loading ? <LoadingState message="Loading rides..." /> : null}
      <ErrorMessage message={error} />
      {!loading && !error && rides.length === 0 ? <EmptyState message="No rides booked yet." /> : null}
      {!loading && !error && rides.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Pickup</th>
                <th>Destination</th>
                <th>Requested Time</th>
                <th>Fare</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => (
                <tr key={ride._id || ride.id}>
                  <td>
                    <Link to={`/customer/rides/${ride._id || ride.id}`}>{ride.bookingId}</Link>
                  </td>
                  <td>{ride.pickup}</td>
                  <td>{ride.destination}</td>
                  <td>{formatDateTime(ride.requestedTime)}</td>
                  <td>{formatCurrency(ride.estimatedFare)}</td>
                  <td><StatusBadge status={ride.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

export default CustomerRidesPage;

