import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';
import { Link } from 'react-router-dom';

type Vendor = {
  id: number;
  name: string;
  description?: string;
  location?: string;
  rating?: number;
  startingPrice?: number;
};

export const VendorSearchPage: React.FC = () => {
  const [filters, setFilters] = useState({ categoryId: '', minRating: '' });
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['vendors', filters],
    queryFn: async () => {
      const response = await apiClient.get<Vendor[]>('/api/vendors', {
        params: {
          categoryId: filters.categoryId || undefined,
          minRating: filters.minRating || undefined
        }
      });
      return response.data;
    }
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    refetch();
  };

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', gap: '1rem', backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(15,23,42,0.05)' }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          Category ID
          <input
            value={filters.categoryId}
            onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value }))}
            placeholder="e.g. 1"
            style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5f5' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          Minimum rating
          <input
            value={filters.minRating}
            onChange={(e) => setFilters((prev) => ({ ...prev, minRating: e.target.value }))}
            placeholder="4"
            style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #cbd5f5' }}
          />
        </label>
        <button
          type="submit"
          style={{ alignSelf: 'flex-end', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.75rem 1.5rem', cursor: 'pointer' }}
        >
          Search
        </button>
      </form>
      {isLoading && <CenteredSpinner label="Loading vendors" />}
      {!isLoading && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {data?.map((vendor) => (
            <article key={vendor.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(15,23,42,0.05)' }}>
              <h3 style={{ marginBottom: '0.25rem', fontSize: '1.25rem' }}>{vendor.name}</h3>
              <p style={{ color: '#475569', marginBottom: '0.5rem' }}>{vendor.description ?? 'No description yet.'}</p>
              <div style={{ display: 'flex', gap: '1.5rem', color: '#1e3a8a' }}>
                <span>Location: {vendor.location ?? 'TBD'}</span>
                <span>Rating: {vendor.rating?.toFixed?.(1) ?? 'N/A'}</span>
                <span>Starting at: LKR {vendor.startingPrice ?? '—'}</span>
              </div>
              <Link to={`/vendors/${vendor.id}`} style={{ marginTop: '1rem', display: 'inline-block', color: '#2563eb' }}>
                View availability
              </Link>
            </article>
          ))}
          {data?.length === 0 && <div>No vendors match your filters.</div>}
        </div>
      )}
    </div>
  );
};
