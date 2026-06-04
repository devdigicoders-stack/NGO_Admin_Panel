import React, { useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  Text,
  Flex,
  ButtonGroup,
  Button,
  useColorModeValue,
  HStack,
  Icon,
  Skeleton,
} from '@chakra-ui/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiActivity } from 'react-icons/fi';

const CustomTooltip = ({ active, payload, label }) => {
  const tooltipBg = useColorModeValue('#ffffff', '#2a0c06');
  const tooltipBorder = useColorModeValue('#f0c4bb', '#1a5a50');
  const textColor = useColorModeValue('#2e0d09', '#f5e0dc');
  const mutedColor = useColorModeValue('#a05040', '#c08070');

  if (active && payload && payload.length) {
    return (
      <Box bg={tooltipBg} border="1px solid" borderColor={tooltipBorder} p={3} borderRadius="xl" boxShadow="0 4px 16px rgba(0,0,0,0.2)">
        <Text fontWeight="700" fontSize="xs" mb={1.5} color={textColor}>{label}</Text>
        {payload.map((entry, index) => (
          <HStack key={index} spacing={2} py={0.5} justifyContent="space-between">
            <HStack spacing={1.5}>
              <Box w={2} h={2} borderRadius="full" bg={entry.color} />
              <Text fontSize="11px" color={mutedColor} fontWeight="500">{entry.name}:</Text>
            </HStack>
            <Text fontSize="xs" fontWeight="700" color={textColor}>{entry.value}</Text>
          </HStack>
        ))}
      </Box>
    );
  }
  return null;
};

const AnalyticsChart = ({ charts, loading }) => {
  const [timeframe, setTimeframe] = useState('weekly');
  const cardBg = useColorModeValue('#ffffff', '#2a0c06');
  const cardBorder = useColorModeValue('#f0c4bb', '#4a1208');
  const titleColor = useColorModeValue('#2e0d09', '#f5e0dc');
  const descColor = useColorModeValue('#a05040', '#c08070');
  const gridStroke = useColorModeValue('#faeae7', 'rgba(255,255,255,0.06)');
  const tickColor = useColorModeValue('#a05040', '#a06050');
  const btnBorder = useColorModeValue('#f0c4bb', '#1a5a50');
  const btnInactiveBg = useColorModeValue('transparent', 'transparent');
  const btnInactiveColor = useColorModeValue('#a05040', '#c08070');

  const chartData = timeframe === 'weekly'
    ? (charts?.weekly || [])
    : (charts?.monthly || []);

  return (
    <Card bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="2xl" shadow="sm">
      <CardBody p={{ base: 4, sm: 5 }}>
        <Flex direction={{ base: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ base: 'flex-start', sm: 'center' }} mb={5} gap={4}>
          <Box>
            <HStack spacing={2} mb={0.5}>
              <Icon as={FiActivity} color="#821905" fontSize="lg" />
              <Text fontSize="md" fontWeight="800" color={titleColor}>Submissions Overview</Text>
            </HStack>
            <Text fontSize="xs" color={descColor}>Donations, contact enquiries & donation queries over time.</Text>
          </Box>
          <ButtonGroup size="sm" isAttached variant="outline" borderRadius="xl">
            <Button
              onClick={() => setTimeframe('weekly')}
              bg={timeframe === 'weekly' ? '#821905' : btnInactiveBg}
              color={timeframe === 'weekly' ? 'white' : btnInactiveColor}
              borderColor={btnBorder}
              borderRadius="xl"
              fontSize="xs"
            >
              Last 7 Days
            </Button>
            <Button
              onClick={() => setTimeframe('monthly')}
              bg={timeframe === 'monthly' ? '#821905' : btnInactiveBg}
              color={timeframe === 'monthly' ? 'white' : btnInactiveColor}
              borderColor={btnBorder}
              borderRadius="xl"
              fontSize="xs"
            >
              Last 12 Months
            </Button>
          </ButtonGroup>
        </Flex>

        <Box h="280px" w="full">
          {loading ? (
            <Skeleton height="280px" borderRadius="xl" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#821905" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#821905" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEnquiries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFC108" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FFC108" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e8907a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#e8907a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: tickColor }} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(130,25,5,0.15)', strokeWidth: 2 }} />
                <Legend verticalAlign="top" height={32} iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '11px', fontWeight: '600', color: tickColor }} />
                <Area type="monotone" dataKey="donations" name="Donations" stroke="#821905" strokeWidth={2} fillOpacity={1} fill="url(#colorDonations)" />
                <Area type="monotone" dataKey="enquiries" name="Enquiries" stroke="#FFC108" strokeWidth={2} fillOpacity={1} fill="url(#colorEnquiries)" />
                <Area type="monotone" dataKey="queries" name="Donation Queries" stroke="#e8907a" strokeWidth={2} fillOpacity={1} fill="url(#colorQueries)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Box>
      </CardBody>
    </Card>
  );
};

export default AnalyticsChart;
