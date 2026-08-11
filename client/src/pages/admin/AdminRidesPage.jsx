import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import LoadingState from '../../components/LoadingState';
import StatusBadge from '../../components/StatusBadge';
import { getRides } from '../../services/rideService';
import { formatCurrency, formatDateTime } from '../../utils/format';

const statusOptions = ['REQUESTED', 'ACCEPTED', 'DRIVER_ARRIVING', 'STARTED', 'COMPLETED', 'CANCELLED'];

const initialFilters = {
  status: '',
  driver: '',
  customer: '',
  dateFrom: '',
  dateTo: ''
};

const getUserName = (userValue, fallback) => {
  if (userValue?.name) {
    return userValue.name;
  }

  return typeof userValue === 'string' && userValue ? userValue : fallback;
};

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
      name: userValue.name
    });
  });

  return Array.from(users.values()).sort((first, second) => first.name.localeCompare(second.name));
};

const buildRideFilters = (filters) => {
  const params = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params[key] = value;
    }
  });

  if (params.dateFrom) {
    params.dateFrom = new Date(`${params.dateFrom}T00:00:00`).toISOString();
  }

  if (params.dateTo) {
    params.dateTo = new Date(`${params.dateTo}T23:59:59`).toISOString();
  }

  return params;
};

function AdminRidesPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [rides, setRides] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const rideFilters = useMemo(() => buildRideFilters(filters), [filters]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const allRides = await getRides();

        setDrivers(getUniqueUsersFromRides(allRides, 'driverId'));
        setCustomers(getUniqueUsersFromRides(allRides, 'customerId'));
      } catch (error) {
        setDrivers([]);
        setCustomers([]);
      }
    };

    loadFilterOptions();
  }, []);

  useEffect(() => {
    const loadRides = async () => {
      setLoading(true);

      try {
        const data = await getRides(rideFilters);
        setRides(data);
        setError('');
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Could not load rides.');
      } finally {
        setLoading(false);
      }
    };

    loadRides();
  }, [rideFilters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleReset = () => {
    setFilters(initialFilters);
  };

  return (
    <section className="dashboard">
      <div className="section-heading section-heading-row">
        <div>
          <h1>Admin Rides</h1>
          <p>Search bookings using backend filters.</p>
        </div>
        <Link to="/admin/dashboard">Back to dashboard</Link>
      </div>
      <form className="filter-bar" onSubmit={(event) => event.preventDefault()}>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" className="input" value={filters.status} onChange={handleFilterChange}>
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option value={status} key={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="driver">Driver</label>
          <select
            id="driver"
            name="driver"
            className="input"
            value={filters.driver}
            onChange={handleFilterChange}
          >
            <option value="">All drivers</option>
            {drivers.map((driver) => (
              <option value={driver.id} key={driver.id}>{driver.name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="customer">Customer</label>
          <select
            id="customer"
            name="customer"
            className="input"
            value={filters.customer}
            onChange={handleFilterChange}
          >
            <option value="">All customers</option>
            {customers.map((customer) => (
              <option value={customer.id} key={customer.id}>{customer.name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="dateFrom">Date from</label>
          <input id="dateFrom" name="dateFrom" className="input" type="date" value={filters.dateFrom} onChange={handleFilterChange} />
        </div>

        <div className="field">
          <label htmlFor="dateTo">Date to</label>
          <input id="dateTo" name="dateTo" className="input" type="date" value={filters.dateTo} onChange={handleFilterChange} />
        </div>

        <div className="filter-actions">
          <button className="button secondary-button" type="button" onClick={handleReset}>Reset</button>
        </div>
      </form>

      {loading ? <LoadingState message="Loading rides..." /> : null}
      <ErrorMessage message={error} />

      {!loading && !error && rides.length === 0 ? <EmptyState message="No rides match these filters." /> : null}
      {!loading && !error && rides.length > 0 ? (
        <>
          <div className="table-wrap admin-rides-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Driver</th>
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
                    <td>{ride.bookingId}</td>
                    <td>{getUserName(ride.customerId, 'Customer')}</td>
                    <td>{getUserName(ride.driverId, 'Unassigned')}</td>
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

          <div className="admin-ride-list">
            {rides.map((ride) => (
              <article className="admin-ride-card" key={ride._id || ride.id}>
                <div className="section-heading-row">
                  <strong>{ride.bookingId}</strong>
                  <StatusBadge status={ride.status} />
                </div>
                <dl>
                  <div>
                    <dt>Customer</dt>
                    <dd>{getUserName(ride.customerId, 'Customer')}</dd>
                  </div>
                  <div>
                    <dt>Driver</dt>
                    <dd>{getUserName(ride.driverId, 'Unassigned')}</dd>
                  </div>
                  <div>
                    <dt>Pickup</dt>
                    <dd>{ride.pickup}</dd>
                  </div>
                  <div>
                    <dt>Destination</dt>
                    <dd>{ride.destination}</dd>
                  </div>
                  <div>
                    <dt>Requested time</dt>
                    <dd>{formatDateTime(ride.requestedTime)}</dd>
                  </div>
                  <div>
                    <dt>Fare</dt>
                    <dd>{formatCurrency(ride.estimatedFare)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

export default AdminRidesPage;
