import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

const organizerId = 1;

type Booking = {
  id: number;
  status: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  currency: string;
};

export const BookingsPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['bookings', organizerId],
    queryFn: async () => {
      const response = await apiClient.get<Booking[]>(`/api/bookings/organizer/${organizerId}`);
      return response.data;
    }
  });

  if (isLoading) {
    return <CenteredSpinner label="Loading bookings" />;
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {data?.map((booking) => (
        <article key={booking.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(15,23,42,0.05)' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <strong>Booking #{booking.id}</strong>
            <span style={{ textTransform: 'capitalize' }}>{booking.status.toLowerCase()}</span>
          </header>
          <div style={{ display: 'flex', gap: '1.5rem', color: '#334155' }}>
            <span>{new Date(booking.startTime).toLocaleString()}</span>
            <span>→</span>
            <span>{new Date(booking.endTime).toLocaleString()}</span>
          </div>
          <div style={{ marginTop: '0.5rem', color: '#475569' }}>
            Total: {booking.currency} {booking.totalAmount}
          </div>
        </article>
      ))}
      {data?.length === 0 && <div>No bookings yet. Browse vendors to get started.</div>}
    </div>
  );
};
