import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import Input from '../../components/Input';
import { createRide } from '../../services/rideService';
import { calculateEstimatedFare } from '../../utils/fare';
import { formatCurrency } from '../../utils/format';

const initialForm = {
  pickup: '',
  destination: '',
  requestedTime: '',
  estimatedDistance: '',
  notes: ''
};

const createIdempotencyKey = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getCreateRideErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (!error.response) {
    return 'Could not reach the server. Check your connection and try again.';
  }

  return 'Could not create ride. Please review the details and try again.';
};

const validateForm = (form) => {
  const errors = {};

  if (!form.pickup.trim()) {
    errors.pickup = 'Pickup location is required';
  }

  if (!form.destination.trim()) {
    errors.destination = 'Destination is required';
  }

  if (!form.requestedTime) {
    errors.requestedTime = 'Requested pickup date and time is required';
  }

  if (!Number(form.estimatedDistance) || Number(form.estimatedDistance) <= 0) {
    errors.estimatedDistance = 'Distance must be positive';
  }

  return errors;
};

function CreateRidePage() {
  const navigate = useNavigate();
  const submitLockRef = useRef(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const farePreview = useMemo(
    () => calculateEstimatedFare(form.estimatedDistance),
    [form.estimatedDistance]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
    setErrors((current) => ({
      ...current,
      [name]: ''
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitLockRef.current) {
      return;
    }

    setSubmitError('');
    const validationErrors = validateForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);

    try {
      const idempotencyKey = createIdempotencyKey();
      const ride = await createRide({
        pickup: form.pickup.trim(),
        destination: form.destination.trim(),
        estimatedDistance: Number(form.estimatedDistance),
        requestedTime: new Date(form.requestedTime).toISOString(),
        notes: form.notes.trim() || undefined
      }, idempotencyKey);

      navigate(`/customer/rides/${ride._id || ride.id}`);
    } catch (error) {
      setSubmitError(getCreateRideErrorMessage(error));
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <section className="dashboard">
      <div className="section-heading">
        <h1>Create Ride</h1>
        <p>Enter the trip details. The backend will calculate the final fare.</p>
      </div>

      <form className="form two-column-form" onSubmit={handleSubmit}>
        <ErrorMessage message={submitError} />
        <Input
          id="pickup"
          label="Pickup location"
          name="pickup"
          value={form.pickup}
          error={errors.pickup}
          onChange={handleChange}
          required
        />
        <Input
          id="destination"
          label="Destination"
          name="destination"
          value={form.destination}
          error={errors.destination}
          onChange={handleChange}
          required
        />
        <Input
          id="requestedTime"
          label="Requested pickup date and time"
          name="requestedTime"
          type="datetime-local"
          value={form.requestedTime}
          error={errors.requestedTime}
          onChange={handleChange}
          required
        />
        <Input
          id="estimatedDistance"
          label="Estimated distance"
          name="estimatedDistance"
          type="number"
          min="0.01"
          step="0.01"
          value={form.estimatedDistance}
          error={errors.estimatedDistance}
          onChange={handleChange}
          required
        />
        <div className="field form-wide">
          <label htmlFor="notes">Optional notes</label>
          <textarea
            id="notes"
            className="input textarea"
            name="notes"
            value={form.notes}
            onChange={handleChange}
          />
        </div>
        <div className="fare-preview form-wide">
          <span>Estimated fare</span>
          <strong>{formatCurrency(farePreview)}</strong>
        </div>
        <div className="form-actions form-wide">
          <Button type="submit" loading={submitting} disabled={submitting}>
            Create Ride
          </Button>
        </div>
      </form>
    </section>
  );
}

export default CreateRidePage;
