import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Badge
} from '@chakra-ui/react';
import { addDays, formatISO } from 'date-fns';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

const defaultVendorId = 1;

type ServiceOffering = {
  id: number;
  title: string;
  price: number | string;
  currency: string;
};

type CalendarResponse = {
  events: { bookingId: number; start: string; end: string; status: string }[];
};

export const VendorDashboardPage: React.FC = () => {
  const servicesQuery = useQuery({
    queryKey: ['vendor', defaultVendorId, 'services'],
    queryFn: async () => {
      const response = await apiClient.get<ServiceOffering[]>(`/api/vendors/${defaultVendorId}/services`);
      return response.data;
    }
  });

  const calendarQuery = useQuery({
    queryKey: ['vendor', defaultVendorId, 'calendar'],
    queryFn: async () => {
      const start = formatISO(new Date());
      const end = formatISO(addDays(new Date(), 30));
      const response = await apiClient.get<CalendarResponse>(`/api/vendors/${defaultVendorId}/calendar`, {
        params: { start, end }
      });
      return response.data.events;
    }
  });

  const ratingQuery = useQuery({
    queryKey: ['vendor', defaultVendorId, 'rating'],
    queryFn: async () => {
      const response = await apiClient.get<{ rating: number }>(`/api/vendors/${defaultVendorId}/rating`);
      return response.data.rating ?? 0;
    }
  });

  if (servicesQuery.isLoading || calendarQuery.isLoading) {
    return <CenteredSpinner label="Loading vendor dashboard" />;
  }

  return (
    <VStack align="stretch" spacing={8}>
      <Box>
        <Heading size="lg" mb={2}>
          Your performance
        </Heading>
        <Text color="gray.600">Keep track of your services, bookings, and responsiveness.</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        <MetricCard label="Active services" value={servicesQuery.data?.length ?? 0} />
        <MetricCard label="Upcoming bookings" value={calendarQuery.data?.length ?? 0} />
        <MetricCard
          label="Average rating"
          value={(ratingQuery.data ?? 0).toFixed(2)}
          subtitle="Across all customer reviews"
        />
      </SimpleGrid>

      <Box bg="white" borderRadius="xl" shadow="sm" p={6}>
        <Heading size="md" mb={4}>
          Upcoming schedule
        </Heading>
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Booking</Th>
              <Th>Start</Th>
              <Th>End</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {calendarQuery.data?.map((event) => (
              <Tr key={event.bookingId}>
                <Td fontWeight="medium">#{event.bookingId}</Td>
                <Td>{new Date(event.start).toLocaleString()}</Td>
                <Td>{new Date(event.end).toLocaleString()}</Td>
                <Td>
                  <Badge colorScheme={event.status === 'CONFIRMED' ? 'green' : event.status === 'PENDING' ? 'yellow' : 'blue'}>
                    {event.status.toLowerCase()}
                  </Badge>
                </Td>
              </Tr>
            ))}
            {calendarQuery.data?.length === 0 && (
              <Tr>
                <Td colSpan={4} textAlign="center" py={6} color="gray.500">
                  No bookings in your next 30 days.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>

      <Box bg="white" borderRadius="xl" shadow="sm" p={6}>
        <Heading size="md" mb={4}>
          Service portfolio
        </Heading>
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Service</Th>
              <Th>Price</Th>
              <Th>Currency</Th>
            </Tr>
          </Thead>
          <Tbody>
            {servicesQuery.data?.map((service) => (
              <Tr key={service.id}>
                <Td>{service.title}</Td>
                <Td>${formatCurrency(service.price)}</Td>
                <Td>{service.currency}</Td>
              </Tr>
            ))}
            {servicesQuery.data?.length === 0 && (
              <Tr>
                <Td colSpan={3} textAlign="center" py={6} color="gray.500">
                  Add your first service to get discovered by customers.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </VStack>
  );
};

const MetricCard: React.FC<{ label: string; value: string | number; subtitle?: string }> = ({ label, value, subtitle }) => (
  <Stat bg="white" borderRadius="xl" shadow="sm" p={6}>
    <StatLabel color="gray.500">{label}</StatLabel>
    <StatNumber>{value}</StatNumber>
    {subtitle && (
      <Text fontSize="sm" color="gray.500">
        {subtitle}
      </Text>
    )}
  </Stat>
);

const formatCurrency = (value: number | string) => {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : value;
};

