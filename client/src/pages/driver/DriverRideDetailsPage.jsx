import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingState from '../../components/LoadingState';
import StatusBadge from '../../components/StatusBadge';
import { getRide, getRideHistory, updateRideStatus } from '../../services/rideService';
import { formatCurrency, formatDateTime } from '../../utils/format';

const nextStatusByCurrentStatus = {
  ACCEPTED: 'DRIVER_ARRIVING',
  DRIVER_ARRIVING: 'STARTED',
  STARTED: 'COMPLETED'
};

const statusActionLabel = {
  DRIVER_ARRIVING: 'Mark Driver Arriving',
  STARTED: 'Start Ride',
  COMPLETED: 'Complete Ride'
};

const getCustomerName = (ride) => {
  if (ride.customerId?.name) {
    return ride.customerId.name;
  }

  return typeof ride.customerId === 'string' ? ride.customerId : 'Customer';
};

function DriverRideDetailsPage() {
  const { id } = useParams();
  const [ride, setRide] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const loadRide = async ({ keepLoading = false } = {}) => {
    if (!keepLoading) {
      setLoading(true);
    }

    try {
      const [rideData, historyData] = await Promise.all([
        getRide(id),
        getRideHistory(id)
      ]);

      setRide(rideData);
      setHistory(historyData);
      setError('');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not load ride details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRide();
  }, [id]);

  const handleStatusUpdate = async (nextStatus) => {
    setActionError('');
    setUpdating(true);

    try {
      await updateRideStatus(id, nextStatus);
      await loadRide({ keepLoading: true });
    } catch (apiError) {
      setActionError(apiError.response?.data?.message || 'Could not update ride status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading ride details..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!ride) {
    return <EmptyState message="Ride not found." />;
  }

  const nextStatus = nextStatusByCurrentStatus[ride.status];

  return (
    <section className="dashboard">
      <div className="section-heading section-heading-row">
        <div>
          <h1>{ride.bookingId}</h1>
          <p>{getCustomerName(ride)}</p>
        </div>
        <Link to="/driver/assigned-rides">Back to assigned rides</Link>
      </div>

      <ErrorMessage message={actionError} />

      <div className="details-grid">
        <div>
          <span>Customer</span>
          <strong>{getCustomerName(ride)}</strong>
        </div>
        <div>
          <span>Current status</span>
          <strong><StatusBadge status={ride.status} /></strong>
        </div>
        <div>
          <span>Pickup</span>
          <strong>{ride.pickup}</strong>
        </div>
        <div>
          <span>Destination</span>
          <strong>{ride.destination}</strong>
        </div>
        <div>
          <span>Fare</span>
          <strong>{formatCurrency(ride.estimatedFare)}</strong>
        </div>
        <div>
          <span>Requested time</span>
          <strong>{formatDateTime(ride.requestedTime)}</strong>
        </div>
      </div>

      {nextStatus ? (
        <div className="form-actions">
          <Button loading={updating} onClick={() => handleStatusUpdate(nextStatus)}>
            {statusActionLabel[nextStatus]}
          </Button>
        </div>
      ) : null}

      <section className="history-section">
        <h2>Status History</h2>
        {history.length === 0 ? <EmptyState message="No status history yet." /> : (
          <div className="history-list">
            {history.map((item) => (
              <div className="history-item" key={item._id || `${item.newStatus}-${item.createdAt}`}>
                <StatusBadge status={item.newStatus} />
                <div>
                  <strong>{item.previousStatus || 'Created'} to {item.newStatus}</strong>
                  <span>{formatDateTime(item.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

export default DriverRideDetailsPage;
