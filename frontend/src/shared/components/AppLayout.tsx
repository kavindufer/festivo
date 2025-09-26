import React, { useMemo } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Link as ChakraLink,
  Spacer,
  useColorModeValue
} from '@chakra-ui/react';
import { useAuth } from '../auth/AuthContext';

type NavItem = { to: string; label: string };

const customerNav: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/events', label: 'Events' },
  { to: '/vendors', label: 'Find Vendors' },
  { to: '/chat', label: 'Messages' },
  { to: '/checkout', label: 'Checkout' }
];

const vendorNav: NavItem[] = [
  { to: '/vendor/dashboard', label: 'Dashboard' },
  { to: '/vendor/services', label: 'Services' },
  { to: '/vendor/bookings', label: 'Bookings' },
  { to: '/vendor/schedule', label: 'Schedule' },
  { to: '/vendor/profile', label: 'Profile' }
];

const adminNav: NavItem[] = [
  { to: '/admin/dashboard', label: 'Overview' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/messages', label: 'Messaging' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/settings', label: 'Settings' }
];

export const AppLayout: React.FC = () => {
  const {
    logout,
    hasRole,
    state: { profile }
  } = useAuth();

  const navItems = useMemo<NavItem[]>(() => {
    if (hasRole('ROLE_ADMIN')) {
      return adminNav;
    }
    if (hasRole('ROLE_VENDOR')) {
      return vendorNav;
    }
    return customerNav;
  }, [hasRole]);

  const bg = useColorModeValue('gray.50', 'gray.900');
  const headerBg = useColorModeValue('brand.700', 'brand.800');
  const activeBg = useColorModeValue('whiteAlpha.200', 'whiteAlpha.300');

  return (
    <Flex direction="column" minH="100vh" bg={bg} color="gray.900">
      <Box as="header" bg={headerBg} color="white" shadow="sm">
        <Flex align="center" px={{ base: 4, md: 8 }} py={4} gap={6} wrap="wrap">
          <Heading size="md" letterSpacing="widest">
            Festivo
          </Heading>
          <HStack spacing={2} flexWrap="wrap">
            {navItems.map((item) => (
              <ChakraLink
                key={item.to}
                as={NavLink}
                to={item.to}
                px={3}
                py={1.5}
                fontWeight="medium"
                borderRadius="md"
                _hover={{ textDecoration: 'none', bg: activeBg }}
                style={({ isActive }) => ({
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : undefined,
                  color: '#fff'
                })}
              >
                {item.label}
              </ChakraLink>
            ))}
          </HStack>
          <Spacer />
          <HStack spacing={4} align="center">
            {profile?.firstName && (
              <Box fontSize="sm" color="whiteAlpha.800">
                Hi, {profile.firstName}
              </Box>
            )}
            <Button variant="outline" colorScheme="whiteAlpha" size="sm" onClick={logout}>
              Log out
            </Button>
          </HStack>
        </Flex>
      </Box>
      <Box as="main" flex="1" px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>
        <Outlet />
      </Box>
    </Flex>
  );
};

