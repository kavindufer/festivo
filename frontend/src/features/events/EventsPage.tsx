import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Event } from '../../shared/types/events';
import { EventPayload, eventsApi } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';
import { useAuth } from '../../shared/auth/AuthContext';

export const EventsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { state: { profile } } = useAuth();
  const customerId = profile?.attributes?.customerId?.[0];
  const [form, setForm] = useState<EventPayload>({ name: '', description: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['events', customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const response = await eventsApi.listForCustomer(Number(customerId));
      return response as Event[];
    }
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: EventPayload) => eventsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', customerId] });
      setForm({ name: '', description: '' });
    }
  });

  if (!customerId) {
    return <div>We couldn't load your events because your customer profile is unavailable.</div>;
  }

  if (isLoading) {
    return <CenteredSpinner label="Loading your events" />;
  }

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(15,23,42,0.05)' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Create a new event</h2>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (!form.name.trim()) return;
            if (!customerId) return;
            await mutateAsync(form);
          }}
          style={{ display: 'grid', gap: '1rem' }}
        >
          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span>Event name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Samantha & Leo Wedding"
              style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #cbd5f5' }}
              required
            />
          </label>
          <label style={{ display: 'grid', gap: '0.5rem' }}>
            <span>Description</span>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Tell us about this celebration"
              style={{ padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #cbd5f5', minHeight: '6rem' }}
            />
          </label>
          <button
            type="submit"
            disabled={isPending || !customerId}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer'
            }}
          >
            {isPending ? 'Creating…' : 'Create event'}
          </button>
        </form>
      </section>

      <section style={{ display: 'grid', gap: '1rem' }}>
        {data?.map((event) => (
          <article
            key={event.id}
            style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(15,23,42,0.05)' }}
          >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{event.name}</h3>
              <Link to={`/events/${event.id}`} style={{ color: '#2563eb' }}>
                View details
              </Link>
            </header>
            <p style={{ margin: 0, color: '#475569' }}>{event.description ?? 'No description yet.'}</p>
          </article>
        ))}
        {data?.length === 0 && <div>No events yet. Create your first event to start planning.</div>}
      </section>
    </div>
  );
};
