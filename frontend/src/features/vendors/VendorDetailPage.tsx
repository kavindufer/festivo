import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

export const VendorDetailPage: React.FC = () => {
  const { vendorId } = useParams();
  const id = Number(vendorId);

  const { data, isLoading } = useQuery({
    queryKey: ['vendor', id],
    enabled: Number.isFinite(id),
    queryFn: async () => {
      const response = await apiClient.get(`/api/vendors/${id}`);
      const availability = await apiClient.get(`/api/vendors/${id}/calendar`, {
        params: {
          start: new Date().toISOString(),
          end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
        }
      });
      return { vendor: response.data, availability: availability.data };
    }
  });

  if (isLoading || !data) {
    return <CenteredSpinner label="Loading vendor" />;
  }

  const { vendor, availability } = data as { vendor: any; availability: { events: any[] } };

  return (
    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(15,23,42,0.05)' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{vendor.name}</h1>
      <p style={{ color: '#475569', marginBottom: '1rem' }}>{vendor.description}</p>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <span>Location: {vendor.location ?? 'TBD'}</span>
        <span>Rating: {vendor.rating ?? 'N/A'}</span>
        <span>Verified: {vendor.verified ? 'Yes' : 'Pending'}</span>
      </div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Availability snapshot</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
        {availability.events.map((event: any) => (
          <li key={event.bookingId} style={{ padding: '0.75rem', border: '1px solid #cbd5f5', borderRadius: '0.75rem' }}>
            <strong>{new Date(event.start).toLocaleString()}</strong> → {new Date(event.end).toLocaleString()} ({event.status})
          </li>
        ))}
        {availability.events.length === 0 && <li>No upcoming bookings yet.</li>}
      </ul>
    </div>
  );
};
