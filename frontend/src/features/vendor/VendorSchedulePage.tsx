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
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  Stack
} from '@chakra-ui/react';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

const vendorId = 1;

type ScheduleBlock = {
  id?: number;
  startDate: string;
  endDate: string;
  reason?: string;
};

export const VendorSchedulePage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [draftBlock, setDraftBlock] = useState<ScheduleBlock>({ startDate: '', endDate: '', reason: '' });
  const [pendingBlocks, setPendingBlocks] = useState<ScheduleBlock[]>([]);

  const scheduleQuery = useQuery({
    queryKey: ['vendor', vendorId, 'schedule'],
    queryFn: async () => {
      const response = await apiClient.get<ScheduleBlock[]>(`/api/vendors/${vendorId}/schedule`);
      return response.data;
    },
    onSuccess: (data) => setPendingBlocks(data)
  });

  const updateMutation = useMutation({
    mutationFn: async (blocks: ScheduleBlock[]) => apiClient.put(`/api/vendors/${vendorId}/schedule`, blocks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId, 'schedule'] });
      toast({ title: 'Schedule updated', status: 'success', duration: 3000, isClosable: true });
    },
    onError: () => {
      toast({ title: 'Unable to update schedule', status: 'error', duration: 4000, isClosable: true });
    }
  });

  const addBlock = () => {
    if (!draftBlock.startDate || !draftBlock.endDate) {
      toast({ title: 'Start and end dates are required', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    setPendingBlocks((prev) => [...prev, draftBlock]);
    setDraftBlock({ startDate: '', endDate: '', reason: '' });
  };

  const removeBlock = (index: number) => {
    setPendingBlocks((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <Stack spacing={8}>
      <Box bg="white" borderRadius="xl" shadow="sm" p={6}>
        <Heading size="lg" mb={4}>
          Manage availability
        </Heading>
        <Text color="gray.600" mb={6}>
          Block out dates to prevent new bookings and keep your calendar accurate.
        </Text>
        <HStack spacing={4} align="flex-end">
          <FormControl>
            <FormLabel>Start date</FormLabel>
            <Input type="date" value={draftBlock.startDate} onChange={(event) => setDraftBlock({ ...draftBlock, startDate: event.target.value })} />
          </FormControl>
          <FormControl>
            <FormLabel>End date</FormLabel>
            <Input type="date" value={draftBlock.endDate} onChange={(event) => setDraftBlock({ ...draftBlock, endDate: event.target.value })} />
          </FormControl>
          <FormControl flex="1">
            <FormLabel>Reason</FormLabel>
            <Input value={draftBlock.reason} onChange={(event) => setDraftBlock({ ...draftBlock, reason: event.target.value })} />
          </FormControl>
          <Button onClick={addBlock} colorScheme="brand">
            Add block
          </Button>
        </HStack>
      </Box>

      <Box bg="white" borderRadius="xl" shadow="sm" p={6}>
        <Heading size="md" mb={4}>
          Blocked dates
        </Heading>
        {scheduleQuery.isLoading ? (
          <CenteredSpinner label="Loading schedule" />
        ) : (
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Start</Th>
                <Th>End</Th>
                <Th>Reason</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pendingBlocks.map((block, index) => (
                <Tr key={`${block.startDate}-${block.endDate}-${index}`}>
                  <Td>{block.startDate}</Td>
                  <Td>{block.endDate}</Td>
                  <Td>{block.reason || <Badge colorScheme="gray">No reason</Badge>}</Td>
                  <Td>
                    <Button size="sm" variant="ghost" colorScheme="red" onClick={() => removeBlock(index)}>
                      Remove
                    </Button>
                  </Td>
                </Tr>
              ))}
              {pendingBlocks.length === 0 && (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={6} color="gray.500">
                    No blocked dates.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
        <Button
          mt={6}
          colorScheme="brand"
          onClick={() => updateMutation.mutate(pendingBlocks)}
          isLoading={updateMutation.isPending}
        >
          Save schedule
        </Button>
      </Box>
    </Stack>
  );
};

