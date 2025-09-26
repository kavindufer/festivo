import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useSearchParams } from 'react-router-dom';
import {
  Badge,
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
  List,
  ListItem,
  HStack
} from '@chakra-ui/react';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

const defaultEventId = 1;

type DashboardResponse = {
  upcoming: Array<{ id: number; startTime?: string; start?: string; status: string }>;
  counts: { totalBookings: number; payments: number };
};

export const DashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const eventIdParam = searchParams.get('eventId');
  const eventId = Number(eventIdParam ?? defaultEventId);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard', eventId],
    queryFn: async () => {
      const response = await apiClient.get<DashboardResponse>('/api/dashboard', { params: { eventId } });
      return response.data;
    },
    retry: false
  });

  if (isLoading) {
    return <CenteredSpinner label="Fetching event dashboard" />;
  }

  if (isError) {
    const message = deriveErrorMessage(error);
    return (
      <Box bg="white" p={8} borderRadius="xl" shadow="sm">
        <Heading size="md" mb={2}>
          Unable to load your dashboard
        </Heading>
        <Text color="gray.600">{message}</Text>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box bg="white" p={8} borderRadius="xl" shadow="sm">
        <Heading size="md" mb={2}>
          Dashboard data unavailable
        </Heading>
        <Text color="gray.600">We couldn&apos;t find any dashboard data to display.</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={8}>
      <Box>
        <Heading size="lg" mb={2}>
          Planner overview
        </Heading>
        <Text color="gray.600">Track your bookings, payments, and upcoming event milestones.</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <MetricCard title="Total bookings" value={data.counts.totalBookings.toLocaleString()} />
        <MetricCard title="Payments" value={data.counts.payments.toLocaleString()} />
      </SimpleGrid>

      <Box bg="white" borderRadius="xl" shadow="sm" p={6}>
        <Heading size="md" mb={4}>
          Upcoming timeline
        </Heading>
        <List spacing={4}>
          {data.upcoming.map((booking) => (
            <ListItem key={booking.id} borderWidth="1px" borderRadius="lg" p={4}>
              <HStack justify="space-between">
                <Box>
                  <Text fontWeight="semibold">Booking #{booking.id}</Text>
                  <Text color="gray.600">{new Date(booking.startTime ?? booking.start ?? '').toLocaleString()}</Text>
                </Box>
                <Badge colorScheme="purple" textTransform="capitalize">
                  {booking.status.toLowerCase()}
                </Badge>
              </HStack>
            </ListItem>
          ))}
          {data.upcoming.length === 0 && <Text color="gray.500">No bookings scheduled.</Text>}
        </List>
      </Box>
    </VStack>
  );
};

const MetricCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <Stat bg="white" borderRadius="xl" shadow="sm" p={6}>
    <StatLabel color="gray.500">{title}</StatLabel>
    <StatNumber>{value}</StatNumber>
  </Stat>
);

const deriveErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    if (error.response?.status === 403) {
      return 'You do not have permission to view this dashboard. Try signing in with a customer account.';
    }

    const responseMessage =
      (typeof error.response?.data === 'string' && error.response.data) ||
      (error.response?.data && typeof (error.response.data as any).message === 'string'
        ? (error.response.data as any).message
        : undefined);
    if (responseMessage) {
      return responseMessage;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong while loading the dashboard. Please try again later.';
};
