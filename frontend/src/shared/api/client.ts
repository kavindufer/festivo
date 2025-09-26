import axios from 'axios';
import { appConfig } from '../config';

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl
});

export const attachTokenInterceptor = (tokenSupplier: () => string | undefined) => {
  apiClient.interceptors.request.use((config) => {
    const token = tokenSupplier();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

export type EventPayload = {
  customerId: number;
  name: string;
  description?: string;
  eventDate?: string;
};

export const eventsApi = {
  async listForCustomer(customerId: number) {
    const response = await apiClient.get('/api/events', { params: { customerId } });
    return response.data;
  },
  async get(eventId: number) {
    const response = await apiClient.get(`/api/events/${eventId}`);
    return response.data;
  },
  async create(payload: EventPayload) {
    const response = await apiClient.post('/api/events', payload);
    return response.data;
  },
  async update(eventId: number, payload: EventPayload) {
    const response = await apiClient.put(`/api/events/${eventId}`, payload);
    return response.data;
  },
  async remove(eventId: number) {
    await apiClient.delete(`/api/events/${eventId}`);
  }
};
