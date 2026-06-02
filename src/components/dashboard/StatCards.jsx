import React from 'react';
import {
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Box,
  Flex,
  Icon,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';
import { FiHeart, FiClock, FiInbox, FiLayers } from 'react-icons/fi';

const formatAmount = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const StatCards = ({ summary, loading }) => {
  const cardBg = useColorModeValue('#ffffff', '#0a2e27');
  const cardBorder = useColorModeValue('#d4ede8', '#0d3d34');
  const labelColor = useColorModeValue('#4a9085', '#7ab8ae');
  const numberColor = useColorModeValue('#08362E', '#e8f8f5');
  const iconBgGreen = useColorModeValue('rgba(3,115,95,0.1)', 'rgba(93,219,187,0.12)');
  const iconBgOrange = useColorModeValue('rgba(217,119,6,0.12)', 'rgba(217,119,6,0.15)');
  const iconBgGold = useColorModeValue('rgba(255,193,8,0.12)', 'rgba(255,193,8,0.15)');

  const cardItems = [
    {
      label: 'Confirmed Donations',
      value: formatAmount(summary?.confirmedDonationAmount),
      help: `${summary?.totalDonations ?? 0} total records`,
      icon: FiHeart,
      themeColor: '#03735F',
      iconBg: iconBgGreen,
    },
    {
      label: 'Pending Actions',
      value: String(summary?.totalPending ?? 0),
      help: `Donations ${summary?.pendingDonations ?? 0} · Enquiries ${summary?.pendingEnquiries ?? 0} · Queries ${summary?.pendingQueries ?? 0}`,
      icon: FiClock,
      themeColor: '#d97706',
      iconBg: iconBgOrange,
    },
    {
      label: 'Website Submissions',
      value: String(summary?.totalSubmissions ?? 0),
      help: 'Donations, enquiries & about-page queries',
      icon: FiInbox,
      themeColor: '#03735F',
      iconBg: iconBgGreen,
    },
    {
      label: 'Managed Content',
      value: String(summary?.totalContent ?? 0),
      help: `${summary?.activeContent ?? 0} active on website`,
      icon: FiLayers,
      themeColor: '#FFC108',
      iconBg: iconBgGold,
    },
  ];

  return (
    <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 4, md: 5 }}>
      {cardItems.map((item) => (
        <Card
          key={item.label}
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorder}
          borderRadius="2xl"
          _hover={{ transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(3,115,95,0.15)' }}
          transition="all 0.25s ease"
        >
          <CardBody p={5}>
            <Stat>
              <Flex justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box flex={1} minW={0}>
                  <StatLabel color={labelColor} fontSize="xs" fontWeight="600" mb={1}>{item.label}</StatLabel>
                  {loading ? (
                    <Skeleton height="32px" width="80px" borderRadius="md" />
                  ) : (
                    <StatNumber color={numberColor} fontSize="2xl" fontWeight="800" lineHeight="1.2">{item.value}</StatNumber>
                  )}
                </Box>
                <Flex w={10} h={10} borderRadius="xl" alignItems="center" justifyContent="center" bg={item.iconBg} color={item.themeColor} flexShrink={0}>
                  <Icon as={item.icon} fontSize="18" />
                </Flex>
              </Flex>
              <StatHelpText m={0} fontSize="xs" fontWeight="500" color={labelColor} noOfLines={2}>
                {loading ? <Skeleton height="14px" mt={1} /> : item.help}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
};

export default StatCards;
