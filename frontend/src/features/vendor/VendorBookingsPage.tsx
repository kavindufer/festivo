import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { addDays, formatISO } from 'date-fns';
import { Box, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, Badge } from '@chakra-ui/react';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

const vendorId = 1;

type CalendarEvent = {
  bookingId: number;
  start: string;
  end: string;
  status: string;
};

export const VendorBookingsPage: React.FC = () => {
  const bookingsQuery = useQuery({
    queryKey: ['vendor', vendorId, 'bookings'],
    queryFn: async () => {
      const response = await apiClient.get<{ events: CalendarEvent[] }>(`/api/vendors/${vendorId}/calendar`, {
        params: { start: formatISO(addDays(new Date(), -30)), end: formatISO(addDays(new Date(), 60)) }
      });
      return response.data.events;
    }
  });

  return (
    <Box bg="white" borderRadius="xl" shadow="sm" p={6}>
      <Heading size="lg" mb={4}>
        Booking pipeline
      </Heading>
      <Text color="gray.600" mb={6}>
        Review your recent and upcoming bookings. Manage your availability from the schedule tab to avoid conflicts.
      </Text>
      {bookingsQuery.isLoading ? (
        <CenteredSpinner label="Loading bookings" />
      ) : bookingsQuery.isError ? (
        <Text color="red.500">Unable to load bookings.</Text>
      ) : (
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
            {bookingsQuery.data?.map((booking) => (
              <Tr key={booking.bookingId}>
                <Td fontWeight="medium">#{booking.bookingId}</Td>
                <Td>{new Date(booking.start).toLocaleString()}</Td>
                <Td>{new Date(booking.end).toLocaleString()}</Td>
                <Td>
                  <Badge colorScheme={booking.status === 'CONFIRMED' ? 'green' : booking.status === 'PENDING' ? 'yellow' : 'blue'}>
                    {booking.status.toLowerCase()}
                  </Badge>
                </Td>
              </Tr>
            ))}
            {bookingsQuery.data?.length === 0 && (
              <Tr>
                <Td colSpan={4} textAlign="center" py={6} color="gray.500">
                  No bookings available for the selected window.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

