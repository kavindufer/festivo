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
  Th,
  Thead,
  Tr,
  VStack,
  Text,
  Divider
} from '@chakra-ui/react';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';
import { apiClient } from '../../shared/api/client';

type AdminStatsResponse = {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number | string;
  averageVendorRating: number;
};

type AdminUserSummary = {
  id: number;
  displayName: string;
  email: string;
  role: string;
  createdAt: string;
};

type AdminBookingSummary = {
  id: number;
  vendorName?: string;
  status: string;
  totalAmount: number | string;
  startTime: string;
};

export const AdminDashboardPage: React.FC = () => {
  const statsQuery = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<AdminStatsResponse>('/api/admin/stats');
      return response.data;
    }
  });

  const recentUsersQuery = useQuery({
    queryKey: ['admin', 'recent-users'],
    queryFn: async () => {
      const response = await apiClient.get<AdminUserSummary[]>('/api/admin/recent-users', {
        params: { limit: 5 }
      });
      return response.data;
    }
  });

  const recentBookingsQuery = useQuery({
    queryKey: ['admin', 'recent-bookings'],
    queryFn: async () => {
      const response = await apiClient.get<AdminBookingSummary[]>('/api/admin/recent-bookings', {
        params: { limit: 5 }
      });
      return response.data;
    }
  });

  if (statsQuery.isLoading) {
    return <CenteredSpinner label="Loading admin overview" />;
  }

  if (statsQuery.isError) {
    return (
      <Box bg="white" p={8} borderRadius="xl" shadow="lg">
        <Heading size="md" mb={2}>
          Unable to load platform metrics
        </Heading>
        <Text color="gray.600">{statsQuery.error instanceof Error ? statsQuery.error.message : 'Please try again later.'}</Text>
      </Box>
    );
  }

  const stats = statsQuery.data!;

  return (
    <VStack align="stretch" spacing={8}>
      <Box>
        <Heading size="lg" mb={2}>
          Platform snapshot
        </Heading>
        <Text color="gray.600">Key health metrics across the Festivo ecosystem.</Text>
      </Box>
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={6}>
        <MetricCard label="Total users" value={stats.totalUsers.toLocaleString()} />
        <MetricCard label="Total bookings" value={stats.totalBookings.toLocaleString()} />
        <MetricCard label="Total revenue" value={`$${formatRevenue(stats.totalRevenue)}`} />
        <MetricCard label="Avg vendor rating" value={stats.averageVendorRating.toFixed(2)} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8}>
        <Box bg="white" borderRadius="xl" shadow="sm" overflow="hidden">
          <Box px={6} py={4} borderBottomWidth="1px">
            <Heading size="md">Recent registrations</Heading>
          </Box>
          {recentUsersQuery.isLoading ? (
            <CenteredSpinner label="Loading users" />
          ) : (
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Joined</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recentUsersQuery.data?.map((user) => (
                  <Tr key={user.id}>
                    <Td>{user.displayName}</Td>
                    <Td>{user.email}</Td>
                    <Td textTransform="capitalize">{user.role.replace('ROLE_', '').toLowerCase()}</Td>
                    <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                  </Tr>
                ))}
                {recentUsersQuery.data?.length === 0 && (
                  <Tr>
                    <Td colSpan={4} textAlign="center" py={6} color="gray.500">
                      No registrations yet.
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          )}
        </Box>

        <Box bg="white" borderRadius="xl" shadow="sm" overflow="hidden">
          <Box px={6} py={4} borderBottomWidth="1px">
            <Heading size="md">Latest bookings</Heading>
          </Box>
          {recentBookingsQuery.isLoading ? (
            <CenteredSpinner label="Loading bookings" />
          ) : (
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>ID</Th>
                  <Th>Vendor</Th>
                  <Th>Status</Th>
                  <Th>Start</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recentBookingsQuery.data?.map((booking) => (
                  <Tr key={booking.id}>
                    <Td fontWeight="medium">#{booking.id}</Td>
                    <Td>{booking.vendorName ?? '—'}</Td>
                    <Td textTransform="capitalize">{booking.status.toLowerCase()}</Td>
                    <Td>{new Date(booking.startTime).toLocaleString()}</Td>
                  </Tr>
                ))}
                {recentBookingsQuery.data?.length === 0 && (
                  <Tr>
                    <Td colSpan={4} textAlign="center" py={6} color="gray.500">
                      No recent bookings found.
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          )}
        </Box>
      </SimpleGrid>

      <Box bg="white" borderRadius="xl" shadow="sm" p={6}>
        <Heading size="md" mb={4}>
          Operational insights
        </Heading>
        <Text color="gray.600">
          Monitor cross-role collaboration and keep tabs on platform health with the dedicated navigation above. Visit the
          analytics tab for trend visualisations or dive into messaging to audit customer-vendor conversations.
        </Text>
        <Divider my={6} />
        <Text color="gray.500" fontSize="sm">
          Pro tip: use the filters in the user and booking management views to slice by status, role, and vendor performance.
        </Text>
      </Box>
    </VStack>
  );
};

const MetricCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <Stat bg="white" borderRadius="xl" shadow="sm" p={6}>
    <StatLabel color="gray.500">{label}</StatLabel>
    <StatNumber>{value}</StatNumber>
  </Stat>
);

const formatRevenue = (value: number | string) => {
  if (typeof value === 'number') {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2 });
  }
  const parsed = Number(value);
  return Number.isFinite(parsed)
      ? parsed.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : value;
};

