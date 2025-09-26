import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

export const VendorDetailPage: React.FC = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const id = Number(vendorId);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    serviceId: '',
    eventId: '',
    startTime: '',
    endTime: '',
    guests: 1,
    notes: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['vendor', id],
    enabled: Number.isFinite(id),
    queryFn: async () => {
      try {
        const [vendorResponse, availabilityResponse, servicesResponse] = await Promise.all([
          apiClient.get(`/api/vendors/${id}`),
          apiClient.get(`/api/vendors/${id}/calendar`, {
            params: {
              start: new Date().toISOString(),
              end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
            }
          }),
          apiClient.get(`/api/vendors/${id}/services`)
        ]);
        return { 
          vendor: vendorResponse.data, 
          availability: availabilityResponse.data,
          services: servicesResponse.data 
        };
      } catch (error) {
        console.error('Error fetching vendor details:', error);
        throw error;
      }
    }
  });

  const { data: eventsData } = useQuery({
    queryKey: ['user-events'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/events/my');
        return response.data;
      } catch (error) {
        console.error('Error fetching user events:', error);
        return [];
      }
    }
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiClient.post('/api/bookings', bookingData);
      return response.data;
    },
    onSuccess: (data) => {
      setShowBookingModal(false);
      alert('Booking request submitted successfully!');
      // Reset form
      setBookingForm({
        serviceId: '',
        eventId: '',
        startTime: '',
        endTime: '',
        guests: 1,
        notes: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    },
    onError: (error) => {
      console.error('Booking failed:', error);
      alert('Failed to submit booking request. Please try again.');
    }
  });

  if (isLoading || !data) {
    return <CenteredSpinner label="Loading vendor" />;
  }

  if (error) {
    return (
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(15,23,42,0.05)' }}>
        <h1 style={{ color: '#dc2626' }}>Error Loading Vendor</h1>
        <p>Unable to load vendor information. Please try again later.</p>
        <button 
          onClick={() => navigate('/vendors')}
          style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.75rem 1.5rem', cursor: 'pointer' }}
        >
          Back to Vendors
        </button>
      </div>
    );
  }

  const { vendor, availability, services } = data as { vendor: any; availability: { events: any[] }; services: any[] };

  return (
    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(15,23,42,0.05)' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{vendor.name}</h1>
      <p style={{ color: '#475569', marginBottom: '1rem' }}>{vendor.description}</p>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <span>Location: {vendor.location ?? 'TBD'}</span>
        <span>Rating: {vendor.rating ?? 'N/A'}</span>
        <span>Verified: {vendor.verified ? 'Yes' : 'Pending'}</span>
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setShowBookingModal(true)}
          style={{ 
            backgroundColor: '#10b981', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.75rem', 
            padding: '0.75rem 1.5rem', 
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          Book Now
        </button>
        <button
          onClick={() => navigate('/chat')}
          style={{ 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.75rem', 
            padding: '0.75rem 1.5rem', 
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          Send Message
        </button>
      </div>

      {services && services.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Services Offered</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {services.map((service: any) => (
              <div key={service.id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{service.title}</h3>
                <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>{service.description}</p>
                <p style={{ fontWeight: '600', color: '#059669' }}>
                  {service.price} {service.currency}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Availability snapshot</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem', marginBottom: '2rem' }}>
        {availability.events.map((event: any) => (
          <li key={event.bookingId} style={{ padding: '0.75rem', border: '1px solid #cbd5f5', borderRadius: '0.75rem' }}>
            <strong>{new Date(event.start).toLocaleString()}</strong> → {new Date(event.end).toLocaleString()} ({event.status})
          </li>
        ))}
        {availability.events.length === 0 && <li>No upcoming bookings yet.</li>}
      </ul>

      {/* Booking Modal */}
      {showBookingModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '1rem', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Book {vendor.name}</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!bookingForm.serviceId || !bookingForm.eventId || !bookingForm.startTime || !bookingForm.endTime) {
                alert('Please fill in all required fields');
                return;
              }
              
              const selectedService = services?.find(s => s.id === Number(bookingForm.serviceId));
              
              bookingMutation.mutate({
                vendorId: vendor.id,
                serviceId: Number(bookingForm.serviceId),
                eventId: Number(bookingForm.eventId),
                startTime: bookingForm.startTime,
                endTime: bookingForm.endTime,
                totalAmount: selectedService?.price || 0,
                depositAmount: (selectedService?.price || 0) * 0.2, // 20% deposit
                currency: selectedService?.currency || 'USD',
                notes: bookingForm.notes,
                timezone: bookingForm.timezone
              });
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Service *</label>
                <select
                  value={bookingForm.serviceId}
                  onChange={(e) => setBookingForm({ ...bookingForm, serviceId: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  required
                >
                  <option value="">Select a service</option>
                  {services?.map((service: any) => (
                    <option key={service.id} value={service.id}>
                      {service.title} - {service.price} {service.currency}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Event *</label>
                <select
                  value={bookingForm.eventId}
                  onChange={(e) => setBookingForm({ ...bookingForm, eventId: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                  required
                >
                  <option value="">Select an event</option>
                  {eventsData?.map((event: any) => (
                    <option key={event.id} value={event.id}>
                      {event.name} {event.eventDate && `- ${new Date(event.eventDate).toLocaleDateString()}`}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Start Time *</label>
                  <input
                    type="datetime-local"
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>End Time *</label>
                  <input
                    type="datetime-local"
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Number of Guests</label>
                <input
                  type="number"
                  min="1"
                  value={bookingForm.guests}
                  onChange={(e) => setBookingForm({ ...bookingForm, guests: parseInt(e.target.value) || 1 })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Additional Notes</label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  placeholder="Any special requirements or notes..."
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', minHeight: '80px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  style={{ 
                    backgroundColor: '#6b7280', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '0.5rem', 
                    padding: '0.75rem 1.5rem', 
                    cursor: 'pointer' 
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingMutation.isPending}
                  style={{ 
                    backgroundColor: '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '0.5rem', 
                    padding: '0.75rem 1.5rem', 
                    cursor: bookingMutation.isPending ? 'not-allowed' : 'pointer',
                    opacity: bookingMutation.isPending ? 0.6 : 1
                  }}
                >
                  {bookingMutation.isPending ? 'Submitting...' : 'Submit Booking Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
