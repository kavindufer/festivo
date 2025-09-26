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
