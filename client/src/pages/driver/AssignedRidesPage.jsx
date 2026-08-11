import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingState from '../../components/LoadingState';
import StatusBadge from '../../components/StatusBadge';
import { getAssignedRides } from '../../services/rideService';
import { formatCurrency } from '../../utils/format';

const getCustomerName = (ride) => {
  if (ride.customerId?.name) {
    return ride.customerId.name;
  }

  return typeof ride.customerId === 'string' ? ride.customerId : 'Customer';
};

function AssignedRidesPage() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRides = async () => {
      try {
        const data = await getAssignedRides();
        setRides(data);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Could not load assigned rides.');
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
          <h1>Assigned Rides</h1>
          <p>Review rides assigned to you.</p>
        </div>
        <Link className="button button-link" to="/driver/available-rides">Available Rides</Link>
      </div>

      {loading ? <LoadingState message="Loading assigned rides..." /> : null}
      <ErrorMessage message={error} />
      {!loading && !error && rides.length === 0 ? <EmptyState message="No assigned rides yet." /> : null}
      {!loading && !error && rides.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Pickup</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Fare</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => {
                const rideId = ride._id || ride.id;

                return (
                  <tr key={rideId}>
                    <td>
                      <Link to={`/driver/rides/${rideId}`}>{ride.bookingId}</Link>
                    </td>
                    <td>{getCustomerName(ride)}</td>
                    <td>{ride.pickup}</td>
                    <td>{ride.destination}</td>
                    <td><StatusBadge status={ride.status} /></td>
                    <td>{formatCurrency(ride.estimatedFare)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

export default AssignedRidesPage;
