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
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage';
import { AdminUsersPage } from '../features/admin/AdminUsersPage';
import { AdminBookingsPage } from '../features/admin/AdminBookingsPage';
import { AdminMessagingPage } from '../features/admin/AdminMessagingPage';
import { AdminAnalyticsPage } from '../features/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from '../features/admin/AdminSettingsPage';
import { VendorDashboardPage } from '../features/vendor/VendorDashboardPage';
import { VendorServicesPage } from '../features/vendor/VendorServicesPage';
import { VendorBookingsPage } from '../features/vendor/VendorBookingsPage';
import { VendorSchedulePage } from '../features/vendor/VendorSchedulePage';
import { VendorProfilePage } from '../features/vendor/VendorProfilePage';

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
          <Route path="/chat/:bookingId" element={<ChatPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route element={<ProtectedRoute roles={['ROLE_ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/messages" element={<AdminMessagingPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={['ROLE_VENDOR']} />}>
            <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
            <Route path="/vendor/services" element={<VendorServicesPage />} />
            <Route path="/vendor/bookings" element={<VendorBookingsPage />} />
            <Route path="/vendor/schedule" element={<VendorSchedulePage />} />
            <Route path="/vendor/profile" element={<VendorProfilePage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
