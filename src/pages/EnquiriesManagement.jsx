import React, { useState, useEffect, useCallback } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Icon,
  useColorModeValue,
  Card,
  CardBody,
  Badge,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  useDisclosure,
  useToast,
  SimpleGrid,
  GridItem,
  Flex,
  Select,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiRefreshCw,
  FiSearch,
  FiMail,
  FiPhone,
  FiUser,
  FiTag,
  FiMessageSquare,
  FiTrash2,
  FiInbox,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiCalendar,
  FiCopy,
  FiExternalLink,
} from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_BASE;

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'orange' },
  { value: 'in_progress', label: 'In Progress', color: 'blue' },
  { value: 'resolved', label: 'Resolved', color: 'green' },
  { value: 'closed', label: 'Closed', color: 'gray' },
];

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const DetailField = ({ label, value, icon, href, onCopy, mutedColor, titleColor, borderColor, fieldBg }) => (
  <Box
    p={3}
    borderRadius="xl"
    border="1px solid"
    borderColor={borderColor}
    bg={fieldBg}
  >
    <HStack spacing={1.5} mb={1.5}>
      {icon && <Icon as={icon} fontSize="12" color="#03735F" />}
      <Text fontSize="10px" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color={mutedColor}>
        {label}
      </Text>
    </HStack>
    <HStack justify="space-between" align="flex-start">
      {href ? (
        <Text
          as="a"
          href={href}
          fontSize="sm"
          fontWeight="600"
          color="#03735F"
          wordBreak="break-all"
          _hover={{ textDecoration: 'underline' }}
        >
          {value || '—'}
        </Text>
      ) : (
        <Text fontSize="sm" fontWeight="600" color={titleColor} wordBreak="break-word" flex={1}>
          {value || '—'}
        </Text>
      )}
      {onCopy && value && (
        <Tooltip label="Copy" hasArrow>
          <IconButton
            aria-label={`Copy ${label}`}
            icon={<FiCopy />}
            size="xs"
            variant="ghost"
            borderRadius="lg"
            color={mutedColor}
            onClick={onCopy}
          />
        </Tooltip>
      )}
    </HStack>
  </Box>
);

const EnquiriesManagement = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [enquiries, setEnquiries] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({ status: 'pending', adminNotes: '' });
  const [saving, setSaving] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const cardBg = useColorModeValue('#ffffff', '#0a2e27');
  const borderColor = useColorModeValue('#d4ede8', '#0d3d34');
  const titleColor = useColorModeValue('#08362E', '#e8f8f5');
  const mutedColor = useColorModeValue('#6b7280', '#7ab8ae');
  const thColor = useColorModeValue('#03735F', '#5ddbbb');
  const thBg = useColorModeValue('rgba(3,115,95,0.04)', 'rgba(93,219,187,0.06)');
  const rowHover = useColorModeValue('rgba(3,115,95,0.03)', 'rgba(93,219,187,0.05)');
  const tdBorder = useColorModeValue('#eaf5f2', 'rgba(255,255,255,0.06)');
  const inputBg = useColorModeValue('#f0f7f5', 'rgba(255,255,255,0.1)');
  const pendingRowBg = useColorModeValue('rgba(245,180,0,0.04)', 'rgba(245,180,0,0.06)');
  const fieldBg = useColorModeValue('#f8fcfb', 'rgba(255,255,255,0.04)');
  const sectionBg = useColorModeValue('rgba(3,115,95,0.04)', 'rgba(93,219,187,0.06)');
  const messageBg = useColorModeValue('#f0f7f5', 'rgba(255,255,255,0.06)');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const [listRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/enquiries?${params}`, { credentials: 'include' }),
        fetch(`${API_BASE}/enquiries/stats`, { credentials: 'include' }),
      ]);

      const listJson = await listRes.json();
      const statsJson = await statsRes.json();

      if (listJson.success) setEnquiries(listJson.data || []);
      if (statsJson.success) setStats(statsJson.data || {});
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to load enquiries', status: 'error', duration: 3000 });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openDetail = (item) => {
    setSelected(item);
    setEditForm({ status: item.status || 'pending', adminNotes: item.adminNotes || '' });
    onOpen();
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/enquiries/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      toast({ title: 'Enquiry updated', status: 'success', duration: 2500 });
      onClose();
      fetchData();
    } catch (err) {
      toast({ title: err.message || 'Update failed', status: 'error', duration: 3000 });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`${API_BASE}/enquiries/${itemToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      toast({ title: 'Enquiry deleted', status: 'success', duration: 2500 });
      onDeleteClose();
      setItemToDelete(null);
      fetchData();
    } catch (err) {
      toast({ title: err.message || 'Delete failed', status: 'error', duration: 3000 });
    }
  };

  const statusBadge = (status) => {
    const opt = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
    return (
      <Badge colorScheme={opt.color} borderRadius="full" px={3} py={0.5} fontSize="xs">
        {opt.label}
      </Badge>
    );
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: `${label} copied`, status: 'success', duration: 2000, position: 'top' });
    }).catch(() => {
      toast({ title: 'Copy failed', status: 'error', duration: 2000 });
    });
  };

  return (
    <VStack spacing={6} align="stretch" w="full">
      <Flex justify="space-between" align={{ base: 'stretch', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={4}>
        <Box>
          <HStack spacing={2} mb={1}>
            <Icon as={FiInbox} color="#03735F" />
            <Text fontSize="xl" fontWeight="800" color={titleColor} fontFamily="'Outfit', sans-serif">
              Contact Enquiries
            </Text>
          </HStack>
          <Text fontSize="sm" color={mutedColor}>
            Messages from the Contact page संदेश भेजें form
          </Text>
        </Box>
        <Button leftIcon={<FiRefreshCw />} onClick={fetchData} variant="outline" borderRadius="xl" borderColor={borderColor}>
          Refresh
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
        {[
          { label: 'Total', value: stats.total, icon: FiInbox, color: '#03735F' },
          { label: 'Pending', value: stats.pending, icon: FiClock, color: '#d97706' },
          { label: 'In Progress', value: stats.in_progress, icon: FiMessageSquare, color: '#2563eb' },
          { label: 'Resolved', value: stats.resolved, icon: FiCheckCircle, color: '#16a34a' },
          { label: 'Closed', value: stats.closed, icon: FiCheckCircle, color: '#6b7280' },
        ].map((s) => (
          <Card key={s.label} bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl">
            <CardBody py={4}>
              <HStack justify="space-between">
                <Box>
                  <Text fontSize="xs" color={mutedColor} fontWeight="600" textTransform="uppercase">
                    {s.label}
                  </Text>
                  <Text fontSize="2xl" fontWeight="800" color={titleColor}>
                    {s.value ?? 0}
                  </Text>
                </Box>
                <Icon as={s.icon} fontSize="22" color={s.color} />
              </HStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Box
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="2xl"
        shadow="sm"
        overflow="hidden"
      >
        <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'stretch', md: 'center' }}
            gap={3}
          >
            <HStack spacing={3} flexWrap="wrap">
              <Select
                maxW="200px"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                borderRadius="xl"
                borderColor={borderColor}
                bg={inputBg}
                size="sm"
              >
                <option value="all">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
              <Text fontSize="xs" color={mutedColor} fontWeight="600">
                {enquiries.length} {enquiries.length === 1 ? 'enquiry' : 'enquiries'}
              </Text>
            </HStack>
            <InputGroup maxW={{ base: 'full', md: '340px' }}>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color={mutedColor} />
              </InputLeftElement>
              <Input
                placeholder="Search name, email, subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                borderRadius="xl"
                borderColor={borderColor}
                bg={inputBg}
                size="sm"
                _focus={{ borderColor: '#03735F', bg: cardBg }}
              />
            </InputGroup>
          </Flex>
        </Box>

        {loading ? (
          <Flex justify="center" py={16}>
            <Spinner size="lg" color="#03735F" />
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="md">
              <Thead>
                <Tr bg={thBg}>
                  <Th
                    color={thColor}
                    borderColor={tdBorder}
                    fontSize="11px"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    py={3}
                    pl={5}
                    w="50px"
                  >
                    #
                  </Th>
                  <Th
                    color={thColor}
                    borderColor={tdBorder}
                    fontSize="11px"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    py={3}
                  >
                    Status
                  </Th>
                  <Th
                    color={thColor}
                    borderColor={tdBorder}
                    fontSize="11px"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    py={3}
                    display={{ base: 'none', lg: 'table-cell' }}
                  >
                    Date & Time
                  </Th>
                  <Th
                    color={thColor}
                    borderColor={tdBorder}
                    fontSize="11px"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    py={3}
                  >
                    Name
                  </Th>
                  <Th
                    color={thColor}
                    borderColor={tdBorder}
                    fontSize="11px"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    py={3}
                    display={{ base: 'none', md: 'table-cell' }}
                  >
                    Email
                  </Th>
                  <Th
                    color={thColor}
                    borderColor={tdBorder}
                    fontSize="11px"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    py={3}
                    display={{ base: 'none', lg: 'table-cell' }}
                  >
                    Subject
                  </Th>
                  <Th
                    color={thColor}
                    borderColor={tdBorder}
                    fontSize="11px"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    py={3}
                  >
                    Message
                  </Th>
                  <Th
                    color={thColor}
                    borderColor={tdBorder}
                    fontSize="11px"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    py={3}
                    pr={5}
                    textAlign="right"
                    w="120px"
                  >
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {enquiries.length === 0 ? (
                  <Tr>
                    <Td colSpan={8} textAlign="center" py={12} borderColor={tdBorder}>
                      <VStack spacing={2}>
                        <Icon as={FiInbox} fontSize="28" color={mutedColor} />
                        <Text color={mutedColor} fontSize="sm">
                          No enquiries found for the selected filters.
                        </Text>
                      </VStack>
                    </Td>
                  </Tr>
                ) : (
                  enquiries.map((q, index) => (
                    <Tr
                      key={q.id}
                      _hover={{ bg: rowHover }}
                      cursor="pointer"
                      transition="background-color 0.15s ease"
                      onClick={() => openDetail(q)}
                      bg={q.status === 'pending' ? pendingRowBg : undefined}
                    >
                      <Td borderColor={tdBorder} py={3.5} pl={5}>
                        <Text fontSize="xs" fontWeight="700" color={mutedColor}>
                          {index + 1}
                        </Text>
                      </Td>
                      <Td borderColor={tdBorder} py={3.5}>
                        {statusBadge(q.status)}
                      </Td>
                      <Td borderColor={tdBorder} py={3.5} display={{ base: 'none', lg: 'table-cell' }}>
                        <Text fontSize="xs" color={mutedColor} fontWeight="500" whiteSpace="nowrap">
                          {formatDate(q.createdAt)}
                        </Text>
                      </Td>
                      <Td borderColor={tdBorder} py={3.5} maxW="160px">
                        <HStack spacing={2}>
                          <Icon as={FiUser} color="#03735F" flexShrink={0} />
                          <Text fontSize="sm" fontWeight="600" color={titleColor} noOfLines={1}>
                            {q.name}
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color={mutedColor} display={{ base: 'block', lg: 'none' }} mt={1}>
                          {formatDate(q.createdAt)}
                        </Text>
                      </Td>
                      <Td borderColor={tdBorder} py={3.5} maxW="200px" display={{ base: 'none', md: 'table-cell' }}>
                        <HStack spacing={2}>
                          <Icon as={FiMail} color={mutedColor} flexShrink={0} />
                          <Text fontSize="sm" color={titleColor} noOfLines={1}>
                            {q.email}
                          </Text>
                        </HStack>
                      </Td>
                      <Td borderColor={tdBorder} py={3.5} maxW="180px" display={{ base: 'none', lg: 'table-cell' }}>
                        <HStack spacing={2}>
                          <Icon as={FiTag} color={mutedColor} flexShrink={0} />
                          <Text fontSize="sm" color={titleColor} noOfLines={1}>
                            {q.subject}
                          </Text>
                        </HStack>
                      </Td>
                      <Td borderColor={tdBorder} py={3.5} maxW="280px">
                        <Tooltip label={q.message} hasArrow placement="top" openDelay={400}>
                          <Text fontSize="sm" color={mutedColor} noOfLines={2}>
                            {q.message}
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td borderColor={tdBorder} py={3.5} pr={5} textAlign="right" onClick={(e) => e.stopPropagation()}>
                        <HStack spacing={1} justify="flex-end">
                          <Tooltip label="View & manage" hasArrow>
                            <IconButton
                              aria-label="View enquiry"
                              icon={<FiEye />}
                              size="sm"
                              variant="ghost"
                              borderRadius="xl"
                              color="#03735F"
                              _hover={{ bg: 'rgba(3,115,95,0.1)' }}
                              onClick={() => openDetail(q)}
                            />
                          </Tooltip>
                          <Tooltip label="Delete" hasArrow>
                            <IconButton
                              aria-label="Delete enquiry"
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              borderRadius="xl"
                              colorScheme="red"
                              onClick={() => {
                                setItemToDelete(q);
                                onDeleteOpen();
                              }}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: 'full', md: '2xl' }}
        isCentered
        scrollBehavior="inside"
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent
          borderRadius={{ base: 0, md: '2xl' }}
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
          mx={{ base: 0, md: 4 }}
        >
          {selected && (
            <>
              <Box
                bg="linear-gradient(135deg, #03735F 0%, #08362E 100%)"
                px={6}
                py={5}
                position="relative"
              >
                <ModalCloseButton
                  color="white"
                  _hover={{ bg: 'rgba(255,255,255,0.15)' }}
                  borderRadius="full"
                  top={3}
                  right={3}
                />
                <HStack spacing={3} align="flex-start" pr={8}>
                  <Flex
                    w="48px"
                    h="48px"
                    borderRadius="xl"
                    bg="rgba(255,255,255,0.15)"
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <Icon as={FiInbox} fontSize="22" color="white" />
                  </Flex>
                  <Box flex={1} minW={0}>
                    <Text
                      fontSize="lg"
                      fontWeight="800"
                      color="white"
                      fontFamily="'Outfit', sans-serif"
                      mb={1}
                    >
                      Enquiry Details
                    </Text>
                    <HStack spacing={2} flexWrap="wrap">
                      {statusBadge(selected.status)}
                      <Badge
                        bg="rgba(255,255,255,0.12)"
                        color="white"
                        borderRadius="md"
                        fontSize="10px"
                        fontWeight="600"
                      >
                        ID: {selected.id}
                      </Badge>
                    </HStack>
                  </Box>
                </HStack>
              </Box>

              <ModalBody py={5} px={6}>
                <VStack align="stretch" spacing={5}>
                  <HStack spacing={2} color={mutedColor}>
                    <Icon as={FiCalendar} />
                    <Text fontSize="xs" fontWeight="600">
                      Submitted: {formatDate(selected.createdAt)}
                    </Text>
                    {selected.updatedAt && selected.updatedAt !== selected.createdAt && (
                      <Text fontSize="xs" color={mutedColor}>
                        · Updated: {formatDate(selected.updatedAt)}
                      </Text>
                    )}
                  </HStack>

                  <Box>
                    <Text
                      fontSize="11px"
                      fontWeight="700"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      color={thColor}
                      mb={3}
                    >
                      Contact Information
                    </Text>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                      <DetailField
                        label="Name"
                        value={selected.name}
                        icon={FiUser}
                        mutedColor={mutedColor}
                        titleColor={titleColor}
                        borderColor={borderColor}
                        fieldBg={fieldBg}
                      />
                      <DetailField
                        label="Email"
                        value={selected.email}
                        icon={FiMail}
                        href={`mailto:${selected.email}`}
                        onCopy={() => copyToClipboard(selected.email, 'Email')}
                        mutedColor={mutedColor}
                        titleColor={titleColor}
                        borderColor={borderColor}
                        fieldBg={fieldBg}
                      />
                      <DetailField
                        label="Phone"
                        value={selected.phone}
                        icon={FiPhone}
                        href={selected.phone ? `tel:${selected.phone}` : undefined}
                        onCopy={selected.phone ? () => copyToClipboard(selected.phone, 'Phone') : undefined}
                        mutedColor={mutedColor}
                        titleColor={titleColor}
                        borderColor={borderColor}
                        fieldBg={fieldBg}
                      />
                      <GridItem colSpan={{ base: 1, sm: 2 }}>
                        <DetailField
                          label="Subject"
                          value={selected.subject}
                          icon={FiTag}
                          mutedColor={mutedColor}
                          titleColor={titleColor}
                          borderColor={borderColor}
                          fieldBg={fieldBg}
                        />
                      </GridItem>
                    </SimpleGrid>
                  </Box>

                  <Box>
                    <HStack justify="space-between" mb={3}>
                      <Text
                        fontSize="11px"
                        fontWeight="700"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        color={thColor}
                      >
                        User Message
                      </Text>
                      <Button
                        as="a"
                        href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || 'Your enquiry')}`}
                        size="xs"
                        leftIcon={<FiExternalLink />}
                        variant="outline"
                        borderRadius="lg"
                        borderColor={borderColor}
                        color="#03735F"
                        _hover={{ bg: sectionBg }}
                      >
                        Reply via Email
                      </Button>
                    </HStack>
                    <Box
                      p={4}
                      borderRadius="xl"
                      bg={messageBg}
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      <Text fontSize="sm" color={titleColor} whiteSpace="pre-wrap" lineHeight="1.75">
                        {selected.message}
                      </Text>
                    </Box>
                  </Box>

                  <Box
                    p={4}
                    borderRadius="xl"
                    bg={sectionBg}
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <Text
                      fontSize="11px"
                      fontWeight="700"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      color={thColor}
                      mb={4}
                    >
                      Admin Management
                    </Text>
                    <VStack align="stretch" spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700" color={mutedColor} mb={2}>
                          Update Status
                        </FormLabel>
                        <HStack spacing={2} flexWrap="wrap">
                          {STATUS_OPTIONS.map((s) => {
                            const isActive = editForm.status === s.value;
                            return (
                              <Button
                                key={s.value}
                                size="sm"
                                borderRadius="full"
                                variant={isActive ? 'solid' : 'outline'}
                                bg={isActive ? '#03735F' : 'transparent'}
                                color={isActive ? 'white' : titleColor}
                                borderColor={isActive ? '#03735F' : borderColor}
                                _hover={{
                                  bg: isActive ? '#025a4a' : sectionBg,
                                  borderColor: '#03735F',
                                }}
                                onClick={() => setEditForm((f) => ({ ...f, status: s.value }))}
                              >
                                {s.label}
                              </Button>
                            );
                          })}
                        </HStack>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="xs" fontWeight="700" color={mutedColor}>
                          Admin Notes (internal)
                        </FormLabel>
                        <Textarea
                          value={editForm.adminNotes}
                          onChange={(e) => setEditForm((f) => ({ ...f, adminNotes: e.target.value }))}
                          placeholder="Add follow-up notes, call summary, or next steps..."
                          rows={4}
                          borderRadius="xl"
                          borderColor={borderColor}
                          bg={cardBg}
                          fontSize="sm"
                          _focus={{ borderColor: '#03735F', boxShadow: '0 0 0 1px #03735F' }}
                        />
                      </FormControl>
                    </VStack>
                  </Box>
                </VStack>
              </ModalBody>

              <ModalFooter
                borderTop="1px solid"
                borderColor={borderColor}
                bg={fieldBg}
                py={4}
                px={6}
                gap={3}
                flexDirection={{ base: 'column-reverse', sm: 'row' }}
              >
                <Button
                  variant="ghost"
                  onClick={onClose}
                  borderRadius="xl"
                  w={{ base: 'full', sm: 'auto' }}
                  color={mutedColor}
                >
                  Close
                </Button>
                <Button
                  flex={1}
                  bg="#03735F"
                  color="white"
                  _hover={{ bg: '#025a4a' }}
                  onClick={handleSave}
                  isLoading={saving}
                  loadingText="Saving..."
                  borderRadius="xl"
                  leftIcon={<FiCheckCircle />}
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Delete Enquiry</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Delete enquiry from <strong>{itemToDelete?.name}</strong> ({itemToDelete?.email})? This cannot be undone.</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose} borderRadius="xl">Cancel</Button>
            <Button colorScheme="red" onClick={handleDelete} borderRadius="xl">Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default EnquiriesManagement;
