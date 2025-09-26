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
import { EventsPage } from '../features/events/EventsPage';
import { EventDetailsPage } from '../features/events/EventDetailsPage';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<div style={{ padding: '2rem' }}>You are not authorized.</div>} />
      <Route element={<ProtectedRoute roles={['ROLE_CUSTOMER', 'ROLE_VENDOR', 'ROLE_ADMIN']} />}> 
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:eventId" element={<EventDetailsPage />} />
          <Route path="/events/:eventId/bookings" element={<BookingsPage />} />
          <Route path="/vendors" element={<VendorSearchPage />} />
          <Route path="/vendors/:vendorId" element={<VendorDetailPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
