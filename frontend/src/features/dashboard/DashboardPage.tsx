import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

const organizerId = 1; // Demo seed user

export const DashboardPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', organizerId],
    queryFn: async () => {
      const response = await apiClient.get('/api/dashboard', { params: { organizerId } });
      return response.data as { upcoming: Array<any>; counts: { totalBookings: number; payments: number } };
    }
  });

  if (isLoading || !data) {
    return <CenteredSpinner label="Fetching planner dashboard" />;
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>At a glance</h2>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <MetricCard title="Total bookings" value={data.counts.totalBookings} />
          <MetricCard title="Payments" value={data.counts.payments} />
        </div>
      </section>
      <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Upcoming timeline</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {data.upcoming.map((booking) => (
            <li key={booking.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
              <strong>{new Date(booking.startTime ?? booking.start).toLocaleString()}</strong>
              <div style={{ color: '#475569' }}>Booking #{booking.id} — {booking.status}</div>
            </li>
          ))}
          {data.upcoming.length === 0 && <li>No bookings scheduled.</li>}
        </ul>
      </section>
    </div>
  );
};

const MetricCard: React.FC<{ title: string; value: number }> = ({ title, value }) => (
  <div style={{ flex: 1 }}>
    <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>{title}</div>
    <div style={{ fontSize: '2rem', fontWeight: 700 }}>{value}</div>
  </div>
);
