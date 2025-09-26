import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Event } from '../../shared/types/events';
import { eventsApi } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';
import { BookingsList } from '../bookings/BookingsPage';

export const EventDetailsPage: React.FC = () => {
  const { eventId } = useParams();
  const id = Number(eventId);

  const { data, isLoading } = useQuery({
    queryKey: ['event', id],
    enabled: Number.isFinite(id),
    queryFn: async () => {
      const response = await eventsApi.get(id);
      return response as Event;
    }
  });

  if (!Number.isFinite(id)) {
    return <div>Please select a valid event.</div>;
  }

  if (isLoading || !data) {
    return <CenteredSpinner label="Loading event" />;
  }

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(15,23,42,0.05)' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>{data.name}</h1>
          <Link to="/events" style={{ color: '#2563eb' }}>
            Back to events
          </Link>
        </header>
        <p style={{ color: '#475569' }}>{data.description ?? 'No description provided yet.'}</p>
        {data.eventDate && (
          <div style={{ marginTop: '1rem', color: '#1e293b' }}>
            Event date: {new Date(data.eventDate).toLocaleDateString()}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Bookings for this event</h2>
        <BookingsList eventId={id} />
      </section>
    </div>
  );
};
