import React from 'react';
import { Spinner, VStack, Text } from '@chakra-ui/react';

export const CenteredSpinner: React.FC<{ label?: string }> = ({ label = 'Loading' }) => (
  <VStack spacing={4} minH="60vh" align="center" justify="center" color="gray.600">
    <Spinner size="xl" thickness="4px" color="brand.500" />
    <Text>{label}</Text>
  </VStack>
);
