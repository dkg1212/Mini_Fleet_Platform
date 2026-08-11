import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import Input from '../../components/Input';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/routes';

const validateForm = ({ email, password }) => {
  const errors = {};

  if (!email.trim()) {
    errors.email = 'Email is required';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return errors;
};

function LoginPage() {
  const { isAuthenticated, loading, login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

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
    setSubmitError('');

    const validationErrors = validateForm(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const loggedInUser = await login(form);
      const fallbackPath = getDashboardPath(loggedInUser.role);
      const nextPath = location.state?.from?.pathname || fallbackPath;

      navigate(nextPath, { replace: true });
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <section className="auth-panel">
      <div className="section-heading">
        <h1>Login</h1>
        <p>Use one of the seeded development accounts.</p>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <ErrorMessage message={submitError} />
        <Input
          id="email"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          error={errors.email}
          onChange={handleChange}
        />
        <Input
          id="password"
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          error={errors.password}
          onChange={handleChange}
        />
        <Button type="submit" loading={loading}>Login</Button>
      </form>
    </section>
  );
}

export default LoginPage;
