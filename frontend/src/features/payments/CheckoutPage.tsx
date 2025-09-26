import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

const bookingId = 1;

export const CheckoutPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['checkout', bookingId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/payments/booking/${bookingId}`);
      return response.data as Record<string, string>;
    }
  });

  if (isLoading || !data) {
    return <CenteredSpinner label="Preparing payment" />;
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(15,23,42,0.05)', display: 'grid', gap: '1rem' }}>
      <h1 style={{ fontSize: '1.75rem' }}>Secure checkout</h1>
      <p style={{ color: '#475569' }}>
        Festivo connects to PayHere sandbox for payment authorization. Use the sandbox credentials provided
        by PayHere to complete the deposit and we will mark the booking as paid when the webhook is
        received.
      </p>
      <div style={{ border: '1px dashed #2563eb', padding: '1rem', borderRadius: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Payment session parameters</h2>
        <dl style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '0.5rem' }}>
          {Object.entries(data).map(([key, value]) => (
            <React.Fragment key={key}>
              <dt style={{ fontWeight: 600, color: '#1d4ed8' }}>{key}</dt>
              <dd style={{ margin: 0, fontFamily: 'monospace' }}>{value}</dd>
            </React.Fragment>
          ))}
        </dl>
      </div>
      <a
        href={data.gateway}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          backgroundColor: '#22c55e',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.75rem',
          textDecoration: 'none',
          fontWeight: 600
        }}
      >
        Continue to PayHere sandbox
      </a>
    </div>
  );
};
