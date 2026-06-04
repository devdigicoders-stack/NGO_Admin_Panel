import React from 'react';
import {
  Card,
  CardBody,
  Text,
  Box,
  Flex,
  HStack,
  Badge,
  VStack,
  useColorModeValue,
  Divider,
  Icon,
  Skeleton,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiActivity } from 'react-icons/fi';

const STATUS_COLORS = {
  pending: 'orange',
  confirmed: 'brand',
  cancelled: 'red',
  in_progress: 'blue',
  resolved: 'brand',
  closed: 'gray',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const formatAmount = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const RecentActivity = ({ items, loading }) => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('#ffffff', '#2a0c06');
  const cardBorder = useColorModeValue('#f0c4bb', '#4a1208');
  const titleColor = useColorModeValue('#2e0d09', '#f5e0dc');
  const textMuted = useColorModeValue('#a05040', '#c08070');
  const itemHover = useColorModeValue('rgba(130,25,5,0.04)', 'rgba(232,144,122,0.06)');

  return (
    <Card bg={cardBg} border="1px solid" borderColor={cardBorder} borderRadius="2xl" shadow="sm">
      <CardBody p={{ base: 4, sm: 5 }}>
        <HStack spacing={2} mb={0.5}>
          <Icon as={FiActivity} color="#821905" fontSize="lg" />
          <Text fontSize="md" fontWeight="800" color={titleColor}>Recent Activity</Text>
        </HStack>
        <Text fontSize="xs" color={textMuted} mb={4}>Latest donations, enquiries and donation queries.</Text>
        <Divider mb={4} borderColor={cardBorder} />

        <VStack align="stretch" spacing={2}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height="56px" borderRadius="xl" />
            ))
          ) : (items || []).length === 0 ? (
            <Text fontSize="sm" color={textMuted} textAlign="center" py={8}>No recent activity yet.</Text>
          ) : (
            items.map((item) => (
              <Flex
                key={`${item.type}-${item.id}`}
                p={3}
                borderRadius="xl"
                alignItems="center"
                justifyContent="space-between"
                gap={3}
                cursor="pointer"
                _hover={{ bg: itemHover }}
                transition="all 0.15s ease"
                onClick={() => navigate(item.path)}
              >
                <Box flex={1} minW={0}>
                  <HStack spacing={2} mb={0.5}>
                    <Badge colorScheme="brand" borderRadius="full" fontSize="9px" px={2}>
                      {item.typeLabel}
                    </Badge>
                    <Badge colorScheme={STATUS_COLORS[item.status] || 'gray'} borderRadius="full" fontSize="9px" px={2} textTransform="capitalize">
                      {item.status?.replace('_', ' ')}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" fontWeight="700" color={titleColor} noOfLines={1}>{item.title}</Text>
                  <Text fontSize="11px" color={textMuted} noOfLines={1}>{item.subtitle}</Text>
                </Box>
                <Box textAlign="right" flexShrink={0}>
                  {item.amount != null && (
                    <Text fontSize="sm" fontWeight="700" color={titleColor}>{formatAmount(item.amount)}</Text>
                  )}
                  <Text fontSize="10px" color={textMuted} whiteSpace="nowrap">{formatDate(item.createdAt)}</Text>
                </Box>
              </Flex>
            ))
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default RecentActivity;
