import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

type Message = {
  id: number;
  content: string;
  createdAt: string;
  sender: { displayName: string };
};

export const ChatPage: React.FC = () => {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const id = bookingId ? Number(bookingId) : Number(searchParams.get('bookingId'));
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['chat', id],
    enabled: Number.isFinite(id) && id > 0,
    queryFn: async () => {
      try {
        const response = await apiClient.get<Message[]>(`/api/chat/booking/${id}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching chat messages:', error);
        throw error;
      }
    },
    refetchInterval: 5000, // Poll for new messages every 5 seconds
    refetchOnWindowFocus: true
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/api/chat/booking/${id}`, { content: message });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat', id] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  });

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(15,23,42,0.05)' }}>
        <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>No Booking Selected</h2>
        <p>Please select a booking to view its chat, or provide a valid booking ID in the URL.</p>
      </div>
    );
  }

  if (isLoading) {
    return <CenteredSpinner label="Loading chat" />;
  }

  if (error) {
    return (
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(15,23,42,0.05)' }}>
        <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Error Loading Chat</h2>
        <p>Unable to load chat messages. Please check if the booking exists and try again.</p>
        <button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['chat', id] })}
          style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.75rem 1.5rem', cursor: 'pointer', marginTop: '1rem' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(15,23,42,0.05)', display: 'flex', flexDirection: 'column', height: '70vh' }}>
      <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Chat - Booking #{id}</h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
          Messages refresh automatically every 5 seconds
        </p>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
        {data?.map((msg) => (
          <div key={msg.id} style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: '#e0f2fe' }}>
            <div style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: '600' }}>
              {msg.sender?.displayName ?? 'Participant'}
            </div>
            <div style={{ margin: '0.25rem 0' }}>{msg.content}</div>
            <small style={{ color: '#64748b' }}>{new Date(msg.createdAt).toLocaleString()}</small>
          </div>
        ))}
        {data?.length === 0 && (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!message.trim()) return;
          mutate();
        }}
        style={{ display: 'flex', gap: '1rem' }}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={isPending}
          style={{ 
            flex: 1, 
            padding: '0.75rem', 
            borderRadius: '0.75rem', 
            border: '1px solid #cbd5f5',
            fontSize: '1rem',
            opacity: isPending ? 0.6 : 1
          }}
        />
        <button
          type="submit"
          disabled={isPending || !message.trim()}
          style={{ 
            backgroundColor: isPending ? '#94a3b8' : '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.75rem', 
            padding: '0.75rem 1.5rem', 
            cursor: isPending ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          {isPending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};
