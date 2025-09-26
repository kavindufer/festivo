import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

type AnalyticsPoint = {
  period: { year: number; month: number } | string;
  value: number;
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const mapPoints = (points: AnalyticsPoint[]) =>
  points.map((point) => {
    if (typeof point.period === 'string') {
      return { label: point.period, value: point.value };
    }
    const monthIndex = (point.period.month ?? 1) - 1;
    const label = `${MONTH_LABELS[monthIndex] ?? '???'} ${point.period.year}`;
    return { label, value: point.value };
  });

export const AdminAnalyticsPage: React.FC = () => {
  const registrationsQuery = useQuery({
    queryKey: ['admin', 'analytics', 'registrations'],
    queryFn: async () => {
      const response = await apiClient.get<AnalyticsPoint[]>('/api/admin/analytics/registrations', {
        params: { months: 6 }
      });
      return mapPoints(response.data);
    }
  });

  const bookingsQuery = useQuery({
    queryKey: ['admin', 'analytics', 'bookings'],
    queryFn: async () => {
      const response = await apiClient.get<AnalyticsPoint[]>('/api/admin/analytics/bookings', {
        params: { months: 6 }
      });
      return mapPoints(response.data);
    }
  });

  const revenueQuery = useQuery({
    queryKey: ['admin', 'analytics', 'revenue'],
    queryFn: async () => {
      const response = await apiClient.get<AnalyticsPoint[]>('/api/admin/analytics/revenue', {
        params: { months: 6 }
      });
      return mapPoints(response.data);
    }
  });

  if (registrationsQuery.isLoading || bookingsQuery.isLoading || revenueQuery.isLoading) {
    return <CenteredSpinner label="Loading analytics" />;
  }

  if (registrationsQuery.isError || bookingsQuery.isError || revenueQuery.isError) {
    return <Text color="red.500">Unable to load analytics at this time.</Text>;
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Platform analytics
      </Heading>
      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={6}>
        <AnalyticsCard title="User registrations" description="New accounts created each month." data={registrationsQuery.data ?? []} color="#2563eb" />
        <AnalyticsCard title="Bookings" description="Confirmed bookings each month." data={bookingsQuery.data ?? []} color="#16a34a" />
        <AnalyticsCard title="Revenue" description="Paid revenue (in cents) captured each month." data={revenueQuery.data ?? []} color="#c026d3" />
      </SimpleGrid>
    </Box>
  );
};

type AnalyticsCardProps = {
  title: string;
  description: string;
  data: { label: string; value: number }[];
  color: string;
};

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, description, data, color }) => (
  <Box bg="white" borderRadius="xl" shadow="sm" p={6} minH="320px">
    <Heading size="md" mb={2}>
      {title}
    </Heading>
    <Text color="gray.600" mb={4}>
      {description}
    </Text>
    <Box h="220px">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.4)" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  </Box>
);

