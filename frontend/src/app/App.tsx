import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../shared/components/AppLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { VendorSearchPage } from '../features/vendors/VendorSearchPage';
import { VendorDetailPage } from '../features/vendors/VendorDetailPage';
import { BookingsPage } from '../features/bookings/BookingsPage';
import { ChatPage } from '../features/chat/ChatPage';
import { CheckoutPage } from '../features/payments/CheckoutPage';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<div style={{ padding: '2rem' }}>You are not authorized.</div>} />
      <Route element={<ProtectedRoute roles={['ROLE_ORGANIZER', 'ROLE_VENDOR', 'ROLE_ADMIN']} />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/vendors" element={<VendorSearchPage />} />
          <Route path="/vendors/:vendorId" element={<VendorDetailPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
