import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast
} from '@chakra-ui/react';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

type BookingSummary = {
  id: number;
  vendorId?: number;
  vendorName?: string;
  status: string;
  totalAmount: number | string;
  startTime: string;
  endTime: string;
};

type PagedResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

type Vendor = {
  id: number;
  name: string;
};

const bookingStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export const AdminBookingsPage: React.FC = () => {
  const [status, setStatus] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [page, setPage] = useState(0);
  const toast = useToast();
  const queryClient = useQueryClient();

  const vendorsQuery = useQuery({
    queryKey: ['admin', 'vendors'],
    queryFn: async () => {
      const response = await apiClient.get<Vendor[]>('/api/vendors');
      return response.data;
    }
  });

  const bookingsQuery = useQuery({
    queryKey: ['admin', 'bookings', { status, vendorId, start, end, page }],
    queryFn: async () => {
      const response = await apiClient.get<PagedResponse<BookingSummary>>('/api/admin/bookings', {
        params: {
          status: status || undefined,
          vendorId: vendorId || undefined,
          start: start || undefined,
          end: end || undefined,
          page,
          size: 10,
          sort: 'startTime,DESC'
        }
      });
      return response.data;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: number) => apiClient.put(`/api/admin/bookings/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      toast({ title: 'Booking cancelled', status: 'info', duration: 3000, isClosable: true });
    },
    onError: () => {
      toast({ title: 'Unable to cancel booking', status: 'error', duration: 4000, isClosable: true });
    }
  });

  const totalPages = bookingsQuery.data?.totalPages ?? 0;

  return (
    <Box bg="white" borderRadius="xl" shadow="sm" p={6}>
      <Heading size="lg" mb={6}>
        Booking management
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4} mb={6}>
        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {bookingStatuses.map((option) => (
              <option key={option} value={option}>
                {option.toLowerCase()}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Vendor</FormLabel>
          <Select value={vendorId} onChange={(event) => setVendorId(event.target.value)}>
            <option value="">All vendors</option>
            {vendorsQuery.data?.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Start</FormLabel>
          <Input type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>End</FormLabel>
          <Input type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>&nbsp;</FormLabel>
          <Button onClick={() => bookingsQuery.refetch()} isLoading={bookingsQuery.isRefetching}>
            Apply filters
          </Button>
        </FormControl>
      </SimpleGrid>

      {bookingsQuery.isLoading ? (
        <CenteredSpinner label="Loading bookings" />
      ) : bookingsQuery.isError ? (
        <Text color="red.500">Unable to load bookings.</Text>
      ) : (
        <>
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>ID</Th>
                <Th>Vendor</Th>
                <Th>Status</Th>
                <Th>Total</Th>
                <Th>Start</Th>
                <Th>End</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {bookingsQuery.data?.content.map((booking) => (
                <Tr key={booking.id}>
                  <Td fontWeight="semibold">#{booking.id}</Td>
                  <Td>{booking.vendorName ?? '—'}</Td>
                  <Td>
                    <Badge colorScheme={booking.status === 'CANCELLED' ? 'red' : booking.status === 'CONFIRMED' ? 'green' : 'blue'}>
                      {booking.status.toLowerCase()}
                    </Badge>
                  </Td>
                  <Td>${formatCurrency(booking.totalAmount)}</Td>
                  <Td>{new Date(booking.startTime).toLocaleString()}</Td>
                  <Td>{new Date(booking.endTime).toLocaleString()}</Td>
                  <Td textAlign="right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => cancelMutation.mutate(booking.id)}
                      isDisabled={booking.status === 'CANCELLED'}
                    >
                      Cancel
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <HStack justify="space-between" mt={6}>
            <Text color="gray.600" fontSize="sm">
              Page {page + 1} of {Math.max(totalPages, 1)}
            </Text>
            <HStack>
              <Button size="sm" onClick={() => setPage((prev) => Math.max(prev - 1, 0))} isDisabled={page === 0}>
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                isDisabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </HStack>
          </HStack>
        </>
      )}
    </Box>
  );
};

const formatCurrency = (value: number | string) => {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : value;
};


