export const getDashboardPath = (role) => {
  if (role === 'CUSTOMER') {
    return '/customer/dashboard';
  }

  if (role === 'DRIVER') {
    return '/driver/dashboard';
  }

  if (role === 'ADMIN') {
    return '/admin/dashboard';
  }

  return '/login';
};
