import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminRidesPage from './pages/admin/AdminRidesPage.jsx';
import CreateRidePage from './pages/customer/CreateRidePage.jsx';
import CustomerDashboard from './pages/customer/CustomerDashboard.jsx';
import CustomerRideDetailsPage from './pages/customer/CustomerRideDetailsPage.jsx';
import CustomerRidesPage from './pages/customer/CustomerRidesPage.jsx';
import AssignedRidesPage from './pages/driver/AssignedRidesPage.jsx';
import AvailableRidesPage from './pages/driver/AvailableRidesPage.jsx';
import DriverDashboard from './pages/driver/DriverDashboard.jsx';
import DriverRideDetailsPage from './pages/driver/DriverRideDetailsPage.jsx';
import HomePage from './pages/HomePage.jsx';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/create-ride" element={<CreateRidePage />} />
          <Route path="/customer/rides" element={<CustomerRidesPage />} />
          <Route path="/customer/rides/:id" element={<CustomerRideDetailsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['DRIVER']} />}>
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/driver/available-rides" element={<AvailableRidesPage />} />
          <Route path="/driver/assigned-rides" element={<AssignedRidesPage />} />
          <Route path="/driver/rides/:id" element={<DriverRideDetailsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/rides" element={<AdminRidesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
