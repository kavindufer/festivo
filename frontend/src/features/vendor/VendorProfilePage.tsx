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
  Stack,
  Text,
  Textarea,
  useToast
} from '@chakra-ui/react';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

const vendorId = 1;

type Vendor = {
  id: number;
  name: string;
  description: string;
  location: string;
  startingPrice: number;
};

export const VendorProfilePage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const vendorQuery = useQuery({
    queryKey: ['vendor', vendorId, 'profile'],
    queryFn: async () => {
      const response = await apiClient.get<Vendor>(`/api/vendors/${vendorId}`);
      return response.data;
    }
  });

  const [form, setForm] = useState<Vendor | null>(null);

  React.useEffect(() => {
    if (vendorQuery.data) {
      setForm(vendorQuery.data);
    }
  }, [vendorQuery.data]);

  const updateMutation = useMutation({
    mutationFn: async (payload: Vendor) => apiClient.put(`/api/vendors/${vendorId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', vendorId, 'profile'] });
      toast({ title: 'Profile updated', status: 'success', duration: 3000, isClosable: true });
    },
    onError: () => {
      toast({ title: 'Unable to update profile', status: 'error', duration: 4000, isClosable: true });
    }
  });

  if (vendorQuery.isLoading || !form) {
    return <CenteredSpinner label="Loading vendor profile" />;
  }

  return (
    <Box bg="white" borderRadius="xl" shadow="sm" p={6} maxW="720px">
      <Heading size="lg" mb={4}>
        Business profile
      </Heading>
      <Text color="gray.600" mb={6}>
        Keep your listing up to date so planners can understand your unique value and reach out with confidence.
      </Text>
      <Stack spacing={5}>
        <FormControl>
          <FormLabel>Business name</FormLabel>
          <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </FormControl>
        <FormControl>
          <FormLabel>Location</FormLabel>
          <Input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
        </FormControl>
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </FormControl>
        <FormControl>
          <FormLabel>Starting price</FormLabel>
          <NumberInput min={0} value={form.startingPrice} onChange={(_, value) => setForm({ ...form, startingPrice: value })}>
            <NumberInputField />
          </NumberInput>
        </FormControl>
      </Stack>
      <Button
        mt={8}
        colorScheme="brand"
        onClick={() => form && updateMutation.mutate(form)}
        isLoading={updateMutation.isPending}
      >
        Save profile
      </Button>
    </Box>
  );
};

