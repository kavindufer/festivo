import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

const bookingId = 1;
const organizerId = 1;

type Message = {
  id: number;
  content: string;
  createdAt: string;
  sender: { displayName: string };
};

export const ChatPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['chat', bookingId],
    queryFn: async () => {
      const response = await apiClient.get<Message[]>(`/api/chat/booking/${bookingId}`);
      return response.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async () => {
      await apiClient.post(`/api/chat/booking/${bookingId}`, { senderId: organizerId, content: message });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat', bookingId] });
    }
  });

  if (isLoading) {
    return <CenteredSpinner label="Loading chat" />;
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(15,23,42,0.05)', display: 'flex', flexDirection: 'column', height: '70vh' }}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gap: '0.75rem' }}>
        {data?.map((msg) => (
          <div key={msg.id} style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: '#e0f2fe' }}>
            <div style={{ fontSize: '0.85rem', color: '#0369a1' }}>{msg.sender?.displayName ?? 'Participant'}</div>
            <div>{msg.content}</div>
            <small style={{ color: '#64748b' }}>{new Date(msg.createdAt).toLocaleString()}</small>
          </div>
        ))}
        {data?.length === 0 && <div>No messages yet. Say hello to your vendor!</div>}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!message.trim()) return;
          mutation.mutate();
        }}
        style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #cbd5f5' }}
        />
        <button
          type="submit"
          disabled={mutation.isLoading}
          style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 1.5rem', cursor: 'pointer' }}
        >
          Send
        </button>
      </form>
    </div>
  );
};
