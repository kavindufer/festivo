import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

type Booking = {
  id: number;
  status: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  currency: string;
};

export const BookingsList: React.FC<{ eventId: number }> = ({ eventId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['bookings', eventId],
    enabled: Number.isFinite(eventId),
    queryFn: async () => {
      const response = await apiClient.get<Booking[]>(`/api/bookings/event/${eventId}`);
      return response.data;
    }
  });

  if (isLoading) {
    return <CenteredSpinner label="Loading bookings" />;
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {data?.map((booking) => (
        <article
          key={booking.id}
          style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(15,23,42,0.05)' }}
        >
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

export const BookingsPage: React.FC = () => {
  const { eventId } = useParams();
  const id = Number(eventId);

  if (!Number.isFinite(id)) {
    return <div>Please open this page from an event to view its bookings.</div>;
  }

  return <BookingsList eventId={id} />;
};
