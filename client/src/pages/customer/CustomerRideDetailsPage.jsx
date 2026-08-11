import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingState from '../../components/LoadingState';
import StatusBadge from '../../components/StatusBadge';
import { cancelRide, getRide, getRideHistory } from '../../services/rideService';
import { formatCurrency, formatDateTime } from '../../utils/format';

const cancellableStatuses = ['REQUESTED', 'ACCEPTED', 'DRIVER_ARRIVING'];
const pollingStatuses = ['REQUESTED', 'ACCEPTED', 'DRIVER_ARRIVING', 'STARTED'];
const POLLING_INTERVAL_MS = 5000;

const canCustomerCancelRide = (ride) => cancellableStatuses.includes(ride.status);

const getRideDetailsErrorMessage = (error) => (
  error.response?.data?.message || 'Could not load ride details. Please try again.'
);

const getCancelRideErrorMessage = (error) => (
  error.response?.data?.message || 'Could not cancel this ride. Please try again.'
);

function CustomerRideDetailsPage() {
  const { id } = useParams();
  const isMountedRef = useRef(false);
  const pollingRequestRef = useRef(false);
  const [ride, setRide] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [refreshError, setRefreshError] = useState('');

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      pollingRequestRef.current = false;
    };
  }, []);

  const loadRide = useCallback(async ({ isPolling = false } = {}) => {
    if (isPolling && pollingRequestRef.current) {
      return;
    }

    if (isPolling) {
      pollingRequestRef.current = true;
    }

    try {
      const [rideData, historyData] = await Promise.all([
        getRide(id),
        getRideHistory(id)
      ]);

      if (!isMountedRef.current) {
        return;
      }

      setRide(rideData);
      setHistory(historyData);
      setError('');
      setRefreshError('');
    } catch (apiError) {
      if (!isMountedRef.current) {
        return;
      }

      if (isPolling) {
        setRefreshError(getRideDetailsErrorMessage(apiError));
      } else {
        setError(getRideDetailsErrorMessage(apiError));
      }
    } finally {
      if (isPolling) {
        pollingRequestRef.current = false;
      } else if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    loadRide();
  }, [loadRide]);

  useEffect(() => {
    if (!ride || !pollingStatuses.includes(ride.status)) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      loadRide({ isPolling: true });
    }, POLLING_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      pollingRequestRef.current = false;
    };
  }, [loadRide, ride?.status]);

  const handleCancel = async () => {
    setActionError('');
    setCancelling(true);

    try {
      const cancelledRide = await cancelRide(id);
      const historyData = await getRideHistory(id);

      setRide(cancelledRide);
      setHistory(historyData);
    } catch (apiError) {
      setActionError(getCancelRideErrorMessage(apiError));
    } finally {
      setCancelling(false);
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

  const driverName = ride.driverId?.name || ride.driverId || 'Not assigned yet';
  const canCancel = canCustomerCancelRide(ride);

  return (
    <section className="dashboard">
      <div className="section-heading section-heading-row">
        <div>
          <h1>{ride.bookingId}</h1>
          <p>{ride.pickup} to {ride.destination}</p>
        </div>
        <Link to="/customer/rides">Back to rides</Link>
      </div>

      <ErrorMessage message={actionError || refreshError} />

      <div className="details-grid">
        <div>
          <span>Current status</span>
          <strong><StatusBadge status={ride.status} /></strong>
        </div>
        <div>
          <span>Fare</span>
          <strong>{formatCurrency(ride.estimatedFare)}</strong>
        </div>
        <div>
          <span>Requested time</span>
          <strong>{formatDateTime(ride.requestedTime)}</strong>
        </div>
        <div>
          <span>Assigned driver</span>
          <strong>{driverName}</strong>
        </div>
        <div>
          <span>Pickup</span>
          <strong>{ride.pickup}</strong>
        </div>
        <div>
          <span>Destination</span>
          <strong>{ride.destination}</strong>
        </div>
        <div className="detail-wide">
          <span>Notes</span>
          <strong>{ride.notes || 'No notes'}</strong>
        </div>
      </div>

      {canCancel ? (
        <div className="form-actions">
          <Button loading={cancelling} onClick={handleCancel}>Cancel Ride</Button>
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

export default CustomerRideDetailsPage;
