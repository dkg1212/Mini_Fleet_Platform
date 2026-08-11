import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingState from '../../components/LoadingState';
import { acceptRide, getAvailableRides } from '../../services/rideService';
import { formatCurrency, formatDateTime } from '../../utils/format';

const getCustomerName = (ride) => {
  if (ride.customerId?.name) {
    return ride.customerId.name;
  }

  return typeof ride.customerId === 'string' ? ride.customerId : 'Customer';
};

const getAcceptErrorMessage = (error) => {
  if (error.response?.status === 409) {
    return 'Ride is no longer available.';
  }

  return error.response?.data?.message || 'Could not accept this ride. Please try again.';
};

function AvailableRidesPage() {
  const acceptingRef = useRef('');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState('');
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const loadRides = async ({ keepLoading = false } = {}) => {
    if (!keepLoading) {
      setLoading(true);
    }

    try {
      const data = await getAvailableRides();
      setRides(data);
      setError('');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not load available rides.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRides();
  }, []);

  const handleAccept = async (rideId) => {
    if (acceptingRef.current) {
      return;
    }

    acceptingRef.current = rideId;
    setAcceptingId(rideId);
    setActionError('');

    try {
      await acceptRide(rideId);
    } catch (apiError) {
      setActionError(getAcceptErrorMessage(apiError));
    } finally {
      acceptingRef.current = '';
      setAcceptingId('');
      await loadRides({ keepLoading: true });
    }
  };

  return (
    <section className="dashboard">
      <div className="section-heading section-heading-row">
        <div>
          <h1>Available Rides</h1>
          <p>Accept open ride requests before another driver takes them.</p>
        </div>
        <Link to="/driver/dashboard">Back to dashboard</Link>
      </div>

      {loading ? <LoadingState message="Loading available rides..." /> : null}
      <ErrorMessage message={error || actionError} />

      {!loading && !error && rides.length === 0 ? <EmptyState message="No available rides right now." /> : null}
      {!loading && !error && rides.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer Name</th>
                <th>Pickup</th>
                <th>Destination</th>
                <th>Requested Time</th>
                <th>Estimated Fare</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => {
                const rideId = ride._id || ride.id;

                return (
                  <tr key={rideId}>
                    <td>{ride.bookingId}</td>
                    <td>{getCustomerName(ride)}</td>
                    <td>{ride.pickup}</td>
                    <td>{ride.destination}</td>
                    <td>{formatDateTime(ride.requestedTime)}</td>
                    <td>{formatCurrency(ride.estimatedFare)}</td>
                    <td>
                      <Button
                        loading={acceptingId === rideId}
                        disabled={Boolean(acceptingId)}
                        onClick={() => handleAccept(rideId)}
                      >
                        Accept
                      </Button>
                    </td>
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

export default AvailableRidesPage;
