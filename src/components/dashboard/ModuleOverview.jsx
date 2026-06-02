import React from 'react';
import {
  Card,
  CardBody,
  Text,
  Box,
  Flex,
  HStack,
  VStack,
  SimpleGrid,
  useColorModeValue,
  Icon,
  Badge,
  Skeleton,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
  FiGrid, FiHeart, FiUsers, FiMessageSquare, FiFileText,
  FiInbox, FiMail, FiDollarSign, FiChevronRight,
} from 'react-icons/fi';

const ICON_MAP = {
  programs: FiHeart,
  team: FiUsers,
  testimonials: FiMessageSquare,
  news: FiFileText,
  donations: FiDollarSign,
  queries: FiInbox,
  enquiries: FiMail,
};

const formatAmount = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const ModuleOverview = ({ modules, loading }) => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('#ffffff', '#0a2e27');
  const cardBorder = useColorModeValue('#d4ede8', '#0d3d34');
  const titleColor = useColorModeValue('#08362E', '#e8f8f5');
  const textMuted = useColorModeValue('#4a9085', '#7ab8ae');
  const itemBg = useColorModeValue('#f7faf9', 'rgba(255,255,255,0.04)');
  const itemHover = useColorModeValue('rgba(3,115,95,0.06)', 'rgba(93,219,187,0.08)');

  return (
    <Card bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="2xl" shadow="sm" h="full">
      <CardBody p={{ base: 4, sm: 5 }}>
        <HStack spacing={2} mb={0.5}>
          <Icon as={FiGrid} color="#03735F" fontSize="lg" />
          <Text fontSize="md" fontWeight="800" color={titleColor}>All Pages Overview</Text>
        </HStack>
        <Text fontSize="xs" color={textMuted} mb={4}>Live counts from each admin section. Click to open.</Text>

        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} height="88px" borderRadius="xl" />
            ))
            : (modules || []).map((mod) => {
              const ModIcon = ICON_MAP[mod.key] || FiGrid;
              const showAmount = mod.key === 'donations' && mod.extra?.confirmedAmount != null;
              return (
                <Box
                  key={mod.key}
                  p={3}
                  borderRadius="xl"
                  bg={itemBg}
                  border="1px solid"
                  borderColor={cardBorder}
                  cursor="pointer"
                  transition="all 0.2s ease"
                  _hover={{ bg: itemHover, borderColor: '#03735F', transform: 'translateY(-2px)' }}
                  onClick={() => navigate(mod.path)}
                >
                  <Flex justify="space-between" align="flex-start" mb={2}>
                    <HStack spacing={2} align="flex-start" flex={1} minW={0}>
                      <Flex w={8} h={8} borderRadius="lg" bg="rgba(3,115,95,0.1)" align="center" justify="center" flexShrink={0}>
                        <Icon as={ModIcon} color="#03735F" fontSize="14" />
                      </Flex>
                      <Box minW={0}>
                        <Text fontSize="xs" fontWeight="700" color={titleColor} noOfLines={1}>{mod.label}</Text>
                        <Text fontSize="10px" color={textMuted}>{mod.metricLabel}: {mod.active}</Text>
                      </Box>
                    </HStack>
                    <Icon as={FiChevronRight} color={textMuted} fontSize="14" flexShrink={0} />
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="lg" fontWeight="800" color={titleColor}>{mod.total}</Text>
                    <HStack spacing={1}>
                      {mod.pending > 0 && (
                        <Badge colorScheme="orange" borderRadius="full" fontSize="9px" px={2}>
                          {mod.pending} pending
                        </Badge>
                      )}
                    </HStack>
                  </Flex>
                  {showAmount && (
                    <Text fontSize="10px" color="#03735F" fontWeight="600" mt={1}>
                      Confirmed: {formatAmount(mod.extra.confirmedAmount)}
                    </Text>
                  )}
                </Box>
              );
            })}
        </SimpleGrid>
      </CardBody>
    </Card>
  );
};

export default ModuleOverview;
