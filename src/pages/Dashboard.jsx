import React, { useState, useEffect, useCallback } from 'react';
import {
  VStack,
  Flex,
  Box,
  Text,
  useColorModeValue,
  Grid,
  GridItem,
  HStack,
  Icon,
  Button,
} from '@chakra-ui/react';
import { FiCalendar, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import StatCards from '../components/dashboard/StatCards.jsx';
import AnalyticsChart from '../components/dashboard/AnalyticsChart.jsx';
import ModuleOverview from '../components/dashboard/ModuleOverview.jsx';
import RecentActivity from '../components/dashboard/RecentActivity.jsx';

const API_BASE = import.meta.env.VITE_API_BASE;

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mutedBanner = useColorModeValue('rgba(255,255,255,0.85)', 'rgba(255,255,255,0.8)');

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/dashboard`, { credentials: 'include' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to load dashboard');
      setData(json.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const adminName = data?.admin?.name || 'Admin';
  const pending = data?.summary?.totalPending ?? 0;

  return (
    <VStack spacing={{ base: 5, md: 7 }} align="stretch" w="full">
      <Box
        p={{ base: 5, md: 7 }}
        borderRadius="2xl"
        bgGradient="linear(135deg, #03735F 0%, #08362E 100%)"
        color="white"
        boxShadow="0 4px 24px rgba(3,115,95,0.25)"
        position="relative"
        overflow="hidden"
      >
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ base: 'flex-start', md: 'center' }}
          gap={4}
          position="relative"
          zIndex={1}
        >
          <Box flex={1}>
            <Text fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="widest" color="#FFC108" mb={1}>
              NGO Admin Dashboard
            </Text>
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontFamily="'Outfit', sans-serif" fontWeight="800" mb={1}>
              Welcome back, {adminName}!
            </Text>
            <Text fontSize="sm" opacity={0.85} maxW="lg">
              {loading
                ? 'Loading live overview from your database...'
                : pending > 0
                  ? `You have ${pending} item${pending === 1 ? '' : 's'} needing attention across donations, enquiries and queries.`
                  : 'All caught up — no pending submissions right now.'}
            </Text>
          </Box>

          <HStack spacing={2} alignSelf={{ base: 'stretch', md: 'auto' }}>
            <Button
              leftIcon={<FiRefreshCw />}
              size="sm"
              variant="outline"
              color="white"
              borderColor="rgba(255,255,255,0.3)"
              borderRadius="xl"
              _hover={{ bg: 'rgba(255,255,255,0.12)' }}
              onClick={fetchDashboard}
              isLoading={loading}
            >
              Refresh
            </Button>
            <HStack
              bg="rgba(255,255,255,0.12)"
              backdropFilter="blur(10px)"
              px={4}
              py={3}
              borderRadius="xl"
              spacing={3}
              border="1px solid rgba(255,255,255,0.15)"
            >
              <Icon as={FiCalendar} color="#FFC108" fontSize="16" />
              <VStack align="flex-start" spacing={0}>
                <Text fontSize="10px" color={mutedBanner} fontWeight="600" textTransform="uppercase">Today</Text>
                <Text fontSize="xs" fontWeight="700">{today}</Text>
              </VStack>
            </HStack>
          </HStack>
        </Flex>

        <Box position="absolute" right="-40px" top="-40px" w="200px" h="200px" borderRadius="full" bg="rgba(255,193,8,0.08)" pointerEvents="none" />
        <Box position="absolute" left="-20px" bottom="-60px" w="160px" h="160px" borderRadius="full" bg="rgba(255,255,255,0.04)" pointerEvents="none" />
      </Box>

      {error && (
        <Flex p={4} borderRadius="xl" bg="red.50" border="1px solid" borderColor="red.200" align="center" gap={3}>
          <Icon as={FiAlertCircle} color="red.500" />
          <Text fontSize="sm" color="red.700" flex={1}>{error}</Text>
          <Button size="sm" colorScheme="red" variant="outline" onClick={fetchDashboard}>Retry</Button>
        </Flex>
      )}

      <StatCards summary={data?.summary} loading={loading} />

      <Grid templateColumns={{ base: '1fr', xl: '3fr 2fr' }} gap={{ base: 5, md: 6 }} w="full">
        <GridItem w="full">
          <AnalyticsChart charts={data?.charts} loading={loading} />
        </GridItem>
        <GridItem w="full">
          <ModuleOverview modules={data?.modules} loading={loading} />
        </GridItem>
      </Grid>

      <RecentActivity items={data?.recentActivity} loading={loading} />
    </VStack>
  );
};

export default Dashboard;
