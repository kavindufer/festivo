import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Stack,
  Switch,
  Text,
  useToast
} from '@chakra-ui/react';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

type SystemSettings = {
  maintenanceMode: boolean;
  registrationsEnabled: boolean;
  reviewsEnabled: boolean;
  messagingEnabled: boolean;
  paymentsEnabled: boolean;
};

const defaultSettings: SystemSettings = {
  maintenanceMode: false,
  registrationsEnabled: true,
  reviewsEnabled: true,
  messagingEnabled: true,
  paymentsEnabled: true
};

export const AdminSettingsPage: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const response = await apiClient.get<SystemSettings>('/api/admin/settings');
      return response.data;
    },
    initialData: defaultSettings
  });

  const [form, setForm] = useState<SystemSettings | null>(null);

  React.useEffect(() => {
    if (settingsQuery.data) {
      setForm(settingsQuery.data);
    }
  }, [settingsQuery.data]);

  const updateMutation = useMutation({
    mutationFn: async (payload: SystemSettings) => apiClient.put('/api/admin/settings', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast({ title: 'Settings updated', status: 'success', duration: 3000, isClosable: true });
    },
    onError: () => {
      toast({ title: 'Failed to update settings', status: 'error', duration: 4000, isClosable: true });
    }
  });

  if (settingsQuery.isLoading || !form) {
    return <CenteredSpinner label="Loading settings" />;
  }

  return (
    <Box bg="white" borderRadius="xl" shadow="sm" p={6} maxW="640px">
      <Heading size="lg" mb={4}>
        Platform settings
      </Heading>
      <Text color="gray.600" mb={6}>
        Toggle key features and maintenance states. These settings apply globally across all user roles.
      </Text>
      <Stack spacing={6}>
        <ToggleRow
          label="Maintenance mode"
          description="Temporarily disable access for all non-admin users."
          value={form.maintenanceMode}
          onChange={(value) => setForm({ ...form, maintenanceMode: value })}
        />
        <ToggleRow
          label="User registrations"
          description="Allow new customers and vendors to create accounts."
          value={form.registrationsEnabled}
          onChange={(value) => setForm({ ...form, registrationsEnabled: value })}
        />
        <ToggleRow
          label="Reviews"
          description="Enable vendor review submissions from customers."
          value={form.reviewsEnabled}
          onChange={(value) => setForm({ ...form, reviewsEnabled: value })}
        />
        <ToggleRow
          label="Messaging"
          description="Allow in-app messaging between customers and vendors."
          value={form.messagingEnabled}
          onChange={(value) => setForm({ ...form, messagingEnabled: value })}
        />
        <ToggleRow
          label="Payments"
          description="Process online payments through Festivo's checkout experience."
          value={form.paymentsEnabled}
          onChange={(value) => setForm({ ...form, paymentsEnabled: value })}
        />
      </Stack>
      <Button
        mt={8}
        colorScheme="brand"
        onClick={() => updateMutation.mutate(form)}
        isLoading={updateMutation.isPending}
      >
        Save settings
      </Button>
    </Box>
  );
};

type ToggleRowProps = {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, value, onChange }) => (
  <FormControl display="flex" alignItems="center" justifyContent="space-between">
    <Box>
      <FormLabel mb={1}>{label}</FormLabel>
      <Text color="gray.500" fontSize="sm">
        {description}
      </Text>
    </Box>
    <Switch isChecked={value} onChange={(event) => onChange(event.target.checked)} />
  </FormControl>
);

