import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  NumberInput,
  NumberInputField,
  SimpleGrid,
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

type ServiceOffering = {
  id: number;
  title: string;
  description: string;
  price: number | string;
  currency: string;
};

type ServicePayload = {
  title: string;
  description: string;
  price: number;
  currency: string;
  categoryId?: number;
};

export const VendorServicesPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ServicePayload>({ title: '', description: '', price: 0, currency: 'USD' });

  const servicesQuery = useQuery({
    queryKey: ['vendor', vendorId, 'services'],
    queryFn: async () => {
      const response = await apiClient.get<ServiceOffering[]>(`/api/vendors/${vendorId}/services`);
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: ServicePayload) => apiClient.post(`/api/vendors/${vendorId}/services`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId, 'services'] });
      toast({ title: 'Service added', status: 'success', duration: 3000, isClosable: true });
      setForm({ title: '', description: '', price: 0, currency: form.currency });
    },
    onError: () => {
      toast({ title: 'Unable to add service', status: 'error', duration: 4000, isClosable: true });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (serviceId: number) => apiClient.delete(`/api/vendors/${vendorId}/services/${serviceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId, 'services'] });
      toast({ title: 'Service removed', status: 'info', duration: 3000, isClosable: true });
    },
    onError: () => toast({ title: 'Unable to remove service', status: 'error', duration: 4000, isClosable: true })
  });

  return (
    <Stack spacing={8}>
      <Box bg="white" borderRadius="xl" shadow="sm" p={6}>
        <Heading size="lg" mb={4}>
          Create a new service
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl>
            <FormLabel>Title</FormLabel>
            <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </FormControl>
          <FormControl>
            <FormLabel>Currency</FormLabel>
            <Input value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })} />
          </FormControl>
          <FormControl gridColumn={{ md: 'span 2' }}>
            <FormLabel>Description</FormLabel>
            <Input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </FormControl>
          <FormControl>
            <FormLabel>Price</FormLabel>
            <NumberInput min={0} value={form.price} onChange={(_, value) => setForm({ ...form, price: value })}>
              <NumberInputField />
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel>Category ID (optional)</FormLabel>
            <NumberInput
              min={0}
              value={form.categoryId ?? ''}
              onChange={(_, value) => setForm({ ...form, categoryId: Number.isFinite(value) ? value : undefined })}
            >
              <NumberInputField placeholder="e.g. 2" />
            </NumberInput>
          </FormControl>
        </SimpleGrid>
        <Button
          mt={6}
          colorScheme="brand"
          onClick={() => createMutation.mutate(form)}
          isLoading={createMutation.isPending}
          isDisabled={!form.title || createMutation.isPending}
        >
          Publish service
        </Button>
      </Box>

      <Box bg="white" borderRadius="xl" shadow="sm" p={6}>
        <Heading size="md" mb={4}>
          Your services
        </Heading>
        {servicesQuery.isLoading ? (
          <CenteredSpinner label="Loading services" />
        ) : servicesQuery.isError ? (
          <Text color="red.500">Unable to load services.</Text>
        ) : (
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>Title</Th>
                <Th>Description</Th>
                <Th>Price</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {servicesQuery.data?.map((service) => (
                <Tr key={service.id}>
                  <Td fontWeight="medium">{service.title}</Td>
                  <Td>{service.description}</Td>
                  <Td>
                    {service.currency} {formatCurrency(service.price)}
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => deleteMutation.mutate(service.id)}
                      isLoading={deleteMutation.isPending}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
              {servicesQuery.data?.length === 0 && (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={6} color="gray.500">
                    No services published yet.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
      </Box>
    </Stack>
  );
};

const formatCurrency = (value: number | string) => {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : value;
};

