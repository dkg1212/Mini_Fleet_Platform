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
    <section className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
      <div className="mb-8 grid gap-3">
        <div className="inline-flex w-fit items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
          Sign in
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Login</h1>
        <p className="text-sm leading-6 text-slate-600">Use one of the seeded development accounts.</p>
      </div>

      <form className="grid gap-5" onSubmit={handleSubmit}>
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
