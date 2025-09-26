import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  Badge,
  Stack,
  SimpleGrid
} from '@chakra-ui/react';
import { ChevronDownIcon, EditIcon, RepeatIcon } from '@chakra-ui/icons';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

type UserSummary = {
  id: number;
  displayName: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
};

type PagedResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
};

type CreateUserRequest = {
  displayName: string;
  email: string;
  password: string;
  role: string;
  active: boolean;
};

type UpdateUserRequest = {
  displayName: string;
  email: string;
  role: string;
  active: boolean;
  mfaEnabled: boolean;
};

const roleOptions = [
  { label: 'All roles', value: '' },
  { label: 'Customer', value: 'ROLE_CUSTOMER' },
  { label: 'Vendor', value: 'ROLE_VENDOR' },
  { label: 'Admin', value: 'ROLE_ADMIN' }
];

export const AdminUsersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [active, setActive] = useState('');
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();
  const toast = useToast();
  const editor = useDisclosure();
  const creator = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [form, setForm] = useState<UpdateUserRequest | null>(null);
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    displayName: '',
    email: '',
    password: '',
    role: 'ROLE_CUSTOMER',
    active: true
  });

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', { search, role, active, page }],
    queryFn: async () => {
      const response = await apiClient.get<PagedResponse<UserSummary>>('/api/admin/users', {
        params: {
          search: search || undefined,
          role: role || undefined,
          active: active || undefined,
          page,
          size: 10,
          sort: 'createdAt,DESC'
        }
      });
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateUserRequest) => {
      await apiClient.post('/api/admin/users', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({ title: 'User created successfully', status: 'success', duration: 3000, isClosable: true });
      creator.onClose();
      setCreateForm({
        displayName: '',
        email: '',
        password: '',
        role: 'ROLE_CUSTOMER',
        active: true
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unable to create user.';
      toast({ title: 'Creation failed', description: message, status: 'error', duration: 4000, isClosable: true });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: number; data: UpdateUserRequest }) => {
      await apiClient.put(`/api/admin/users/${payload.id}`, payload.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({ title: 'User updated', status: 'success', duration: 3000, isClosable: true });
      editor.onClose();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unable to update user.';
      toast({ title: 'Update failed', description: message, status: 'error', duration: 4000, isClosable: true });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiClient.delete(`/api/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({ title: 'User removed', status: 'info', duration: 3000, isClosable: true });
    },
    onError: (error) => {
      toast({
        title: 'Deletion failed',
        description: error instanceof Error ? error.message : 'Unable to delete user.',
        status: 'error',
        duration: 4000,
        isClosable: true
      });
    }
  });

  const handleCreate = () => {
    setCreateForm({
      displayName: '',
      email: '',
      password: '',
      role: 'ROLE_CUSTOMER',
      active: true
    });
    creator.onOpen();
  };

  const handleEdit = (user: UserSummary) => {
    setSelectedUser(user);
    setForm({
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      active: user.active,
      mfaEnabled: false
    });
    editor.onOpen();
  };

  const totalPages = usersQuery.data?.totalPages ?? 0;

  const paginatedSummary = useMemo(() => {
    if (!usersQuery.data) {
      return 'Showing 0 of 0 users';
    }
    const start = usersQuery.data.page * usersQuery.data.size + 1;
    const end = start + usersQuery.data.content.length - 1;
    return `Showing ${start}-${end} of ${usersQuery.data.totalElements} users`;
  }, [usersQuery.data]);

  return (
    <Box bg="white" borderRadius="xl" shadow="sm" p={6}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">
          User management
        </Heading>
        <Button 
          colorScheme="brand" 
          onClick={handleCreate}
          leftIcon={<span>+</span>}
        >
          Create User
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
        <FormControl>
          <FormLabel srOnly>Search</FormLabel>
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
          />
        </FormControl>
        <FormControl>
          <FormLabel srOnly>Role</FormLabel>
          <Select
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPage(0);
            }}
          >
            {roleOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel srOnly>Status</FormLabel>
          <Select
            value={active}
            onChange={(event) => {
              setActive(event.target.value);
              setPage(0);
            }}
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </FormControl>
        <Button leftIcon={<RepeatIcon />} onClick={() => usersQuery.refetch()} isLoading={usersQuery.isRefetching}>
          Refresh
        </Button>
      </SimpleGrid>

      {usersQuery.isLoading ? (
        <CenteredSpinner label="Loading users" />
      ) : usersQuery.isError ? (
        <Text color="red.500">Unable to fetch users. Please try again.</Text>
      ) : (
        <>
          <Table variant="simple" size="md">
            <Thead bg="gray.50">
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {usersQuery.data?.content.map((user) => (
                <Tr key={user.id}>
                  <Td fontWeight="medium">{user.displayName}</Td>
                  <Td>{user.email}</Td>
                  <Td textTransform="capitalize">{user.role.replace('ROLE_', '').toLowerCase()}</Td>
                  <Td>
                    <Badge colorScheme={user.active ? 'green' : 'red'}>{user.active ? 'Active' : 'Inactive'}</Badge>
                  </Td>
                  <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                  <Td textAlign="right">
                    <Menu placement="bottom-end">
                      <MenuButton as={IconButton} icon={<ChevronDownIcon />} variant="ghost" aria-label="Actions" />
                      <MenuList>
                        <MenuItem icon={<EditIcon />} onClick={() => handleEdit(user)}>
                          Edit
                        </MenuItem>
                        <MenuItem onClick={() => deleteMutation.mutate(user.id)}>Delete</MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <HStack justify="space-between" mt={6}>
            <Text color="gray.600" fontSize="sm">
              {paginatedSummary}
            </Text>
            <HStack>
              <Button size="sm" onClick={() => setPage((prev) => Math.max(prev - 1, 0))} isDisabled={page === 0}>
                Previous
              </Button>
              <Text fontSize="sm">
                Page {page + 1} of {Math.max(totalPages, 1)}
              </Text>
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

      <Drawer isOpen={editor.isOpen} placement="right" onClose={editor.onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Edit user</DrawerHeader>
          <DrawerBody>
            {form && (
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={form.displayName}
                    onChange={(event) => setForm({ ...form, displayName: event.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                </FormControl>
                <FormControl>
                  <FormLabel>Role</FormLabel>
                  <Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                    {roleOptions
                      .filter((option) => option.value)
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </Select>
                </FormControl>
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb="0">Active</FormLabel>
                  <Switch isChecked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
                </FormControl>
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb="0">Require MFA</FormLabel>
                  <Switch
                    isChecked={form.mfaEnabled}
                    onChange={(event) => setForm({ ...form, mfaEnabled: event.target.checked })}
                  />
                </FormControl>
              </Stack>
            )}
          </DrawerBody>
          <DrawerFooter borderTopWidth="1px">
            <HStack>
              <Button variant="ghost" onClick={editor.onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="brand"
                onClick={() =>
                  selectedUser && form && updateMutation.mutate({ id: selectedUser.id, data: form })
                }
                isLoading={updateMutation.isPending}
              >
                Save changes
              </Button>
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Create User Modal */}
      <Drawer isOpen={creator.isOpen} placement="right" onClose={creator.onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Create new user</DrawerHeader>
          <DrawerBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Display Name</FormLabel>
                <Input
                  value={createForm.displayName}
                  onChange={(event) => setCreateForm({ ...createForm, displayName: event.target.value })}
                  placeholder="Enter user's full name"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })}
                  placeholder="Enter email address"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={createForm.password}
                  onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })}
                  placeholder="Enter secure password"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select 
                  value={createForm.role} 
                  onChange={(event) => setCreateForm({ ...createForm, role: event.target.value })}
                >
                  {roleOptions
                    .filter((option) => option.value)
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </Select>
              </FormControl>
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb="0">Active</FormLabel>
                <Switch 
                  isChecked={createForm.active} 
                  onChange={(event) => setCreateForm({ ...createForm, active: event.target.checked })} 
                />
              </FormControl>
            </Stack>
          </DrawerBody>
          <DrawerFooter borderTopWidth="1px">
            <HStack>
              <Button variant="ghost" onClick={creator.onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="brand"
                onClick={() => {
                  if (!createForm.displayName || !createForm.email || !createForm.password) {
                    toast({ 
                      title: 'Validation Error', 
                      description: 'Please fill in all required fields', 
                      status: 'warning', 
                      duration: 3000, 
                      isClosable: true 
                    });
                    return;
                  }
                  createMutation.mutate(createForm);
                }}
                isLoading={createMutation.isPending}
              >
                Create User
              </Button>
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

