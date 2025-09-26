import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Heading,
  Input,
  List,
  ListItem,
  Text,
  VStack,
  HStack,
  Badge,
  SimpleGrid
} from '@chakra-ui/react';
import { apiClient } from '../../shared/api/client';
import { CenteredSpinner } from '../../shared/components/CenteredSpinner';

type ConversationSummary = {
  bookingId: number;
  vendorName?: string;
  lastMessageSnippet: string;
  lastSender: string;
  lastMessageAt: string;
  totalMessages: number;
};

export const AdminMessagingPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const conversationsQuery = useQuery({
    queryKey: ['admin', 'messages', search],
    queryFn: async () => {
      const response = await apiClient.get<ConversationSummary[]>('/api/admin/messages', {
        params: { q: search || undefined }
      });
      return response.data;
    }
  });

  return (
    <VStack align="stretch" spacing={6}>
      <Box bg="white" borderRadius="xl" shadow="sm" p={6}>
        <Heading size="lg" mb={4}>
          Messaging oversight
        </Heading>
        <Text color="gray.600" mb={4}>
          Monitor vendor and customer communications. Search by vendor, sender, or message content to surface specific
          interactions.
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Input
            placeholder="Search conversations"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </SimpleGrid>
      </Box>

      <Box bg="white" borderRadius="xl" shadow="sm" p={6}>
        {conversationsQuery.isLoading ? (
          <CenteredSpinner label="Fetching conversations" />
        ) : conversationsQuery.isError ? (
          <Text color="red.500">Unable to load conversations.</Text>
        ) : (
          <List spacing={4}>
            {conversationsQuery.data?.map((conversation) => (
              <ListItem key={conversation.bookingId} borderWidth="1px" borderRadius="lg" p={4}>
                <HStack justify="space-between" align="flex-start">
                  <Box>
                    <Text fontWeight="semibold">Booking #{conversation.bookingId}</Text>
                    <Text color="gray.600">Vendor: {conversation.vendorName ?? 'Unknown vendor'}</Text>
                  </Box>
                  <Badge colorScheme="blue">{conversation.totalMessages} messages</Badge>
                </HStack>
                <Text mt={3} color="gray.700">
                  “{conversation.lastMessageSnippet}” — {conversation.lastSender}
                </Text>
                <Text mt={1} fontSize="sm" color="gray.500">
                  Last activity {new Date(conversation.lastMessageAt).toLocaleString()}
                </Text>
              </ListItem>
            ))}
            {conversationsQuery.data?.length === 0 && (
              <Text color="gray.500">No conversations found for your query.</Text>
            )}
          </List>
        )}
      </Box>
    </VStack>
  );
};

