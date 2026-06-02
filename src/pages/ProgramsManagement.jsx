import React, { useState, useEffect, useCallback, useRef } from 'react';
import { uploadImage } from '../utils/uploadImage';
import { resolveImageUrl } from '../utils/imageUrl';
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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  useToast,
  SimpleGrid,
  Flex,
  Switch,
  Select,
  Divider,
  Tooltip,
  IconButton,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiHeart,
  FiTarget,
  FiTrendingUp,
  FiImage,
  FiTag,
  FiAlignLeft,
  FiUpload,
} from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_BASE;

// ─── Color picker presets ───────────────────────────────────────
const COLOR_PRESETS = [
  { label: 'Forest Green', value: '#1a5c38' },
  { label: 'Orange Red', value: '#e05a3a' },
  { label: 'Violet', value: '#7c3aed' },
  { label: 'Gold', value: '#f5b400' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Sky Blue', value: '#0ea5e9' },
  { label: 'Red', value: '#dc2626' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Indigo', value: '#4f46e5' },
  { label: 'Amber', value: '#d97706' },
];

const TAG_OPTIONS = [
  'शिक्षा', 'स्वास्थ्य', 'महिला', 'बाल कल्याण',
  'पर्यावरण', 'आश्रय', 'आपातकाल', 'रोजगार', 'कृषि', 'अन्य',
];

// ─── Empty form state ──────────────────────────────────────────
const EMPTY_FORM = {
  image: '',
  tag: 'शिक्षा',
  tagBg: '#1a5c38',
  tagColor: '#fff',
  title: '',
  desc: '',
  raised: '₹0',
  goal: '₹1,00,000',
  percentage: 0,
  accentColor: '#1a5c38',
  isActive: true,
};

// ─── Mini preview card ─────────────────────────────────────────
const PreviewCard = ({ form }) => {
  const borderColor = useColorModeValue('#f0f0f0', '#1a3530');
  return (
    <Box
      border="1.5px solid"
      borderColor={borderColor}
      borderRadius="20px"
      overflow="hidden"
      bg={useColorModeValue('#fff', '#0a2e27')}
      boxShadow="0 4px 16px rgba(0,0,0,0.06)"
      maxW="320px"
      w="full"
      mx="auto"
    >
      {/* Image area */}
      <Box position="relative" h="140px" bg={useColorModeValue('#f3f4f6', '#0d3d34')} overflow="hidden">
        {form.image ? (
          <Box as="img" src={resolveImageUrl(form.image)} alt="preview" w="full" h="full" objectFit="cover" />
        ) : (
          <Flex h="full" align="center" justify="center" opacity={0.4}>
            <Icon as={FiImage} fontSize="40" />
          </Flex>
        )}
        {/* Tag badge */}
        <Box
          position="absolute" top="10px" left="10px"
          bg={form.tagBg} color={form.tagColor}
          px={3} py={0.5} borderRadius="full"
          fontSize="10px" fontWeight="700"
        >
          {form.tag || 'Tag'}
        </Box>
        {/* Percentage badge */}
        <Box
          position="absolute" bottom="10px" right="10px"
          bg="white" borderRadius="8px" px={2} py={0.5}
          display="flex" alignItems="center" gap={1}
        >
          <Box w="6px" h="6px" borderRadius="full" bg={form.accentColor} />
          <Text fontSize="11px" fontWeight="700" color="#111827">{form.percentage}%</Text>
        </Box>
      </Box>
      {/* Body */}
      <Box p={4}>
        <Text fontWeight="700" fontSize="14px" color={useColorModeValue('#111827', '#e8f8f5')} mb={1} noOfLines={1}>
          {form.title || 'Program Title'}
        </Text>
        <Text fontSize="12px" color={useColorModeValue('#6b7280', '#7ab8ae')} noOfLines={2} mb={3}>
          {form.desc || 'Program description will appear here...'}
        </Text>
        {/* Progress bar */}
        <Box h="5px" bg={useColorModeValue('#f3f4f6', '#0d3d34')} borderRadius="full" mb={2}>
          <Box
            h="full" borderRadius="full"
            w={`${Math.min(form.percentage, 100)}%`}
            bg={form.accentColor}
            transition="width 0.3s ease"
          />
        </Box>
        <Flex justify="space-between">
          <Text fontSize="11px" color={useColorModeValue('#6b7280', '#7ab8ae')}>
            एकत्रित: <strong style={{ color: useColorModeValue('#111827', '#e8f8f5') }}>{form.raised}</strong>
          </Text>
          <Text fontSize="11px" color={useColorModeValue('#6b7280', '#7ab8ae')}>
            लक्ष्य: <strong style={{ color: useColorModeValue('#111827', '#e8f8f5') }}>{form.goal}</strong>
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};

// ─── Program Card ──────────────────────────────────────────────
const ProgramCard = ({ program, onEdit, onDelete, onToggle }) => {
  const cardBg = useColorModeValue('#ffffff', '#0a2e27');
  const borderColor = useColorModeValue('#d4ede8', '#0d3d34');
  const titleColor = useColorModeValue('#08362E', '#e8f8f5');
  const textColor = useColorModeValue('#1a5045', '#c8e8e2');
  const mutedColor = useColorModeValue('#6b7280', '#7ab8ae');

  return (
    <Card
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      overflow="hidden"
      transition="all 0.25s ease"
      _hover={{ transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}
      opacity={program.isActive ? 1 : 0.65}
    >
      {/* Image */}
      <Box position="relative" h="160px" overflow="hidden">
        <Box
          as="img"
          src={resolveImageUrl(program.image)}
          alt={program.title}
          w="full"
          h="full"
          objectFit="cover"
          fallbackSrc="https://via.placeholder.com/400x160/1a5c38/ffffff?text=Program"
        />
        <Box position="absolute" inset={0} bgGradient="linear(to-t, blackAlpha.500, transparent)" />
        {/* Tag */}
        <Box
          position="absolute" top={3} left={3}
          bg={program.tagBg} color={program.tagColor}
          px={3} py={0.5} borderRadius="full"
          fontSize="11px" fontWeight="700"
          boxShadow="0 2px 8px rgba(0,0,0,0.2)"
        >
          {program.tag}
        </Box>
        {/* Active badge */}
        <Box position="absolute" top={3} right={3}>
          <Badge
            colorScheme={program.isActive ? 'green' : 'gray'}
            borderRadius="full" px={2} fontSize="10px"
          >
            {program.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </Box>
        {/* Percentage */}
        <Box
          position="absolute" bottom={3} right={3}
          bg="whiteAlpha.900" borderRadius="lg" px={2} py={0.5}
          display="flex" alignItems="center" gap={1}
        >
          <Box w="6px" h="6px" borderRadius="full" bg={program.accentColor} />
          <Text fontSize="12px" fontWeight="700" color="#111827">{program.percentage}%</Text>
        </Box>
      </Box>

      <CardBody p={4}>
        <Text fontWeight="800" fontSize="14px" color={titleColor} mb={1} noOfLines={2} fontFamily="'Outfit', sans-serif">
          {program.title}
        </Text>
        <Text fontSize="12.5px" color={mutedColor} noOfLines={2} mb={3} lineHeight={1.6}>
          {program.desc}
        </Text>

        {/* Progress bar */}
        <Box mb={3}>
          <Box h="5px" bg={useColorModeValue('#f3f4f6', '#0d3d34')} borderRadius="full" mb={1.5}>
            <Box
              h="full" borderRadius="full"
              w={`${Math.min(program.percentage, 100)}%`}
              bg={program.accentColor}
            />
          </Box>
          <Flex justify="space-between">
            <Text fontSize="11px" color={mutedColor}>
              एकत्रित: <strong style={{ color: titleColor, fontWeight: 700 }}>{program.raised}</strong>
            </Text>
            <Text fontSize="11px" color={mutedColor}>
              लक्ष्य: <strong style={{ color: titleColor, fontWeight: 700 }}>{program.goal}</strong>
            </Text>
          </Flex>
        </Box>

        <Divider mb={3} />

        {/* Action buttons */}
        <HStack spacing={2} justify="space-between">
          <Tooltip label={program.isActive ? 'Deactivate' : 'Activate'}>
            <IconButton
              icon={<Icon as={program.isActive ? FiEyeOff : FiEye} />}
              size="sm"
              variant="ghost"
              colorScheme={program.isActive ? 'orange' : 'green'}
              onClick={() => onToggle(program.id)}
              aria-label="Toggle active"
            />
          </Tooltip>
          <HStack spacing={2}>
            <Tooltip label="Edit Program">
              <IconButton
                icon={<Icon as={FiEdit2} />}
                size="sm"
                colorScheme="brand"
                variant="ghost"
                onClick={() => onEdit(program)}
                aria-label="Edit"
              />
            </Tooltip>
            <Tooltip label="Delete Program">
              <IconButton
                icon={<Icon as={FiTrash2} />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => onDelete(program)}
                aria-label="Delete"
              />
            </Tooltip>
          </HStack>
        </HStack>
      </CardBody>
    </Card>
  );
};

// ─── Main Programs Management Page ────────────────────────────
const ProgramsManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const programImageInputRef = useRef(null);

  // Delete confirm
  const [programToDelete, setProgramToDelete] = useState(null);

  const formModal = useDisclosure();
  const deleteModal = useDisclosure();
  const toast = useToast();

  const titleColor = useColorModeValue('#08362E', '#e8f8f5');
  const borderColor = useColorModeValue('#d4ede8', '#0d3d34');
  const mutedColor = useColorModeValue('#4a9085', '#7ab8ae');
  const cardBg = useColorModeValue('#ffffff', '#0a2e27');

  // ── Fetch programs ──────────────────────────────────────────
  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/programs`);
      const json = await res.json();
      if (json.success) {
        setPrograms(json.data);
      } else {
        setError(json.message || 'Failed to fetch programs');
      }
    } catch (err) {
      setError('Cannot connect to backend server. Make sure it is running on port 5000.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  // ── Filter programs ─────────────────────────────────────────
  const filteredPrograms = programs.filter(p => {
    const matchSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && p.isActive) ||
      (filterStatus === 'inactive' && !p.isActive);
    return matchSearch && matchStatus;
  });

  // ── Form handlers ───────────────────────────────────────────
  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormErrors({});
    formModal.onOpen();
  };

  const openEditModal = (program) => {
    setForm({
      image: program.image || '',
      tag: program.tag || 'शिक्षा',
      tagBg: program.tagBg || '#1a5c38',
      tagColor: program.tagColor || '#fff',
      title: program.title || '',
      desc: program.desc || '',
      raised: program.raised || '₹0',
      goal: program.goal || '₹1,00,000',
      percentage: program.percentage || 0,
      accentColor: program.accentColor || '#1a5c38',
      isActive: program.isActive !== undefined ? program.isActive : true,
    });
    setEditingId(program.id);
    setFormErrors({});
    formModal.onOpen();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadImage(file, 'programs');
      setForm((f) => ({ ...f, image: data.url }));
      toast({ title: 'Image uploaded', status: 'success', duration: 2000, isClosable: true, position: 'top-right' });
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setUploading(false);
    }
    e.target.value = '';
  };

  const validateForm = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Program title is required';
    if (!form.tag.trim()) errors.tag = 'Tag is required';
    if (!form.desc.trim()) errors.desc = 'Description is required';
    if (form.percentage < 0 || form.percentage > 100) errors.percentage = 'Percentage must be between 0–100';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const url = editingId ? `${API_BASE}/programs/${editingId}` : `${API_BASE}/programs`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, percentage: Number(form.percentage) }),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: editingId ? 'Program Updated!' : 'Program Created!',
          description: json.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
        fetchPrograms();
        formModal.onClose();
      } else {
        toast({ title: 'Error', description: json.message, status: 'error', duration: 4000, isClosable: true, position: 'top-right' });
      }
    } catch (err) {
      toast({ title: 'Connection Error', description: 'Cannot reach backend server.', status: 'error', duration: 4000, isClosable: true, position: 'top-right' });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle ──────────────────────────────────────────────────
  const handleToggle = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/programs/${id}/toggle`, { method: 'PATCH' });
      const json = await res.json();
      if (json.success) {
        setPrograms(prev => prev.map(p => p.id === id ? json.data : p));
        toast({
          title: json.data.isActive ? 'Program Activated' : 'Program Deactivated',
          status: json.data.isActive ? 'success' : 'warning',
          duration: 2000, isClosable: true, position: 'top-right',
        });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to toggle status', status: 'error', duration: 3000, isClosable: true });
    }
  };

  // ── Delete ──────────────────────────────────────────────────
  const openDeleteModal = (program) => {
    setProgramToDelete(program);
    deleteModal.onOpen();
  };

  const handleDelete = async () => {
    if (!programToDelete) return;
    try {
      const res = await fetch(`${API_BASE}/programs/${programToDelete.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast({ title: 'Deleted!', description: json.message, status: 'success', duration: 2500, isClosable: true, position: 'top-right' });
        fetchPrograms();
        deleteModal.onClose();
        setProgramToDelete(null);
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete program', status: 'error', duration: 3000, isClosable: true });
    }
  };

  // ── Stats ───────────────────────────────────────────────────
  const activeCount = programs.filter(p => p.isActive).length;
  const avgPercentage = programs.length
    ? Math.round(programs.reduce((a, p) => a + p.percentage, 0) / programs.length)
    : 0;

  return (
    <VStack spacing={{ base: 5, md: 7 }} align="stretch" w="full">

      {/* ── Page Header ── */}
      <Box
        p={{ base: 5, md: 7 }}
        borderRadius="2xl"
        bgGradient="linear(135deg, #1a5c38 0%, #0d3a22 100%)"
        color="white"
        boxShadow="0 4px 24px rgba(26,92,56,0.30)"
        position="relative"
        overflow="hidden"
      >
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'flex-start', md: 'center' }} gap={4} position="relative" zIndex={1}>
          <Box>
            <HStack spacing={2} mb={1}>
              <Icon as={FiHeart} color="#f5b400" fontSize="14" />
              <Text fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="widest" color="#f5b400">
                Website Content Management
              </Text>
            </HStack>
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontFamily="'Outfit', sans-serif" fontWeight="800" mb={1}>
              हमारे कार्यक्रम — Programs
            </Text>
            <Text fontSize="sm" opacity={0.85} maxW="lg">
              Manage and update the "हमारे कार्यक्रम" section on the website homepage. Add, edit, or remove campaign cards dynamically.
            </Text>
          </Box>
          <Button
            leftIcon={<Icon as={FiPlus} />}
            bg="#f5b400"
            color="#111827"
            _hover={{ bg: '#e6a300', transform: 'scale(1.03)' }}
            borderRadius="xl"
            fontWeight="700"
            size="md"
            onClick={openCreateModal}
            flexShrink={0}
            boxShadow="0 4px 12px rgba(245,180,0,0.35)"
          >
            Add New Program
          </Button>
        </Flex>
        {/* Decorative blobs */}
        <Box position="absolute" right="-40px" top="-40px" w="200px" h="200px" borderRadius="full" bg="rgba(245,180,0,0.07)" pointerEvents="none" />
        <Box position="absolute" left="-20px" bottom="-60px" w="160px" h="160px" borderRadius="full" bg="rgba(255,255,255,0.04)" pointerEvents="none" />
      </Box>

      {/* ── Stat Cards ── */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        {[
          { label: 'Total Programs', value: programs.length, icon: FiHeart, color: '#1a5c38' },
          { label: 'Active', value: activeCount, icon: FiEye, color: '#059669' },
          { label: 'Inactive', value: programs.length - activeCount, icon: FiEyeOff, color: '#e05a3a' },
          { label: 'Avg. Progress', value: `${avgPercentage}%`, icon: FiTrendingUp, color: '#7c3aed' },
        ].map((stat, i) => (
          <Card key={i} bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" boxShadow="sm">
            <CardBody p={4}>
              <HStack spacing={3} align="center">
                <Box p={2.5} borderRadius="xl" bg={`${stat.color}18`}>
                  <Icon as={stat.icon} fontSize="18" color={stat.color} />
                </Box>
                <Box>
                  <Text fontSize="22px" fontWeight="800" color={titleColor} lineHeight={1}>
                    {stat.value}
                  </Text>
                  <Text fontSize="11px" color={mutedColor} fontWeight="600">{stat.label}</Text>
                </Box>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* ── Filters Bar ── */}
      <Flex gap={3} direction={{ base: 'column', sm: 'row' }} align={{ sm: 'center' }}>
        <InputGroup flex={1}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color={mutedColor} />
          </InputLeftElement>
          <Input
            placeholder="Search programs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            variant="filled"
            borderRadius="xl"
            fontSize="sm"
          />
        </InputGroup>
        <Select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          variant="filled"
          borderRadius="xl"
          fontSize="sm"
          w={{ base: 'full', sm: '160px' }}
          flexShrink={0}
        >
          <option value="all">All Programs</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </Select>
        <Tooltip label="Refresh">
          <IconButton
            icon={<Icon as={FiRefreshCw} />}
            onClick={fetchPrograms}
            variant="ghost"
            colorScheme="brand"
            borderRadius="xl"
            isLoading={loading}
            aria-label="Refresh"
            flexShrink={0}
          />
        </Tooltip>
      </Flex>

      {/* ── Content ── */}
      {loading ? (
        <Flex justify="center" align="center" py={20}>
          <VStack spacing={3}>
            <Spinner size="xl" color="#1a5c38" thickness="3px" />
            <Text color={mutedColor} fontSize="sm">Loading programs...</Text>
          </VStack>
        </Flex>
      ) : error ? (
        <Alert status="error" borderRadius="2xl" flexDirection="column" alignItems="flex-start" py={5}>
          <AlertIcon />
          <AlertTitle>Backend Not Connected</AlertTitle>
          <AlertDescription fontSize="sm">{error}</AlertDescription>
          <Button mt={3} size="sm" colorScheme="red" variant="outline" onClick={fetchPrograms} leftIcon={<Icon as={FiRefreshCw} />}>
            Retry
          </Button>
        </Alert>
      ) : filteredPrograms.length === 0 ? (
        <Flex justify="center" align="center" py={16}>
          <VStack spacing={3}>
            <Icon as={FiHeart} fontSize="48" color={mutedColor} opacity={0.4} />
            <Text color={mutedColor} fontWeight="600">No programs found</Text>
            <Text fontSize="sm" color={mutedColor} opacity={0.7}>
              {searchQuery ? 'Try a different search term' : 'Click "Add New Program" to get started'}
            </Text>
          </VStack>
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={5}>
          {filteredPrograms.map(program => (
            <ProgramCard
              key={program.id}
              program={program}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onToggle={handleToggle}
            />
          ))}
        </SimpleGrid>
      )}

      {/* ══════════════════════════════════════════════════════
          CREATE / EDIT MODAL
      ══════════════════════════════════════════════════════ */}
      <Modal isOpen={formModal.isOpen} onClose={formModal.onClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" bg={cardBg} border="1px solid" borderColor={borderColor}>
          <ModalHeader fontFamily="'Outfit', sans-serif" fontWeight="800" color={titleColor} pb={2}>
            {editingId ? '✏️ Edit Program' : '➕ Add New Program'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
              {/* Form fields */}
              <VStack spacing={4} flex={1} align="stretch">

                {/* Title */}
                <FormControl isRequired isInvalid={!!formErrors.title}>
                  <FormLabel fontSize="sm" fontWeight="600" color={titleColor}>
                    <Icon as={FiAlignLeft} mr={1.5} /> Program Title (शीर्षक)
                  </FormLabel>
                  <Input
                    variant="filled" borderRadius="xl" placeholder="e.g. शिक्षा सहायता अभियान"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  />
                  {formErrors.title && <Text color="red.400" fontSize="xs" mt={1}>{formErrors.title}</Text>}
                </FormControl>

                {/* Tag */}
                <HStack spacing={3} align="flex-start">
                  <FormControl isRequired isInvalid={!!formErrors.tag} flex={1}>
                    <FormLabel fontSize="sm" fontWeight="600" color={titleColor}>
                      <Icon as={FiTag} mr={1.5} /> Category Tag
                    </FormLabel>
                    <Select
                      variant="filled" borderRadius="xl"
                      value={form.tag}
                      onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                    >
                      {TAG_OPTIONS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl flex={1}>
                    <FormLabel fontSize="sm" fontWeight="600" color={titleColor}>Tag Text Color</FormLabel>
                    <Select
                      variant="filled" borderRadius="xl"
                      value={form.tagColor}
                      onChange={e => setForm(f => ({ ...f, tagColor: e.target.value }))}
                    >
                      <option value="#fff">White</option>
                      <option value="#111">Black</option>
                    </Select>
                  </FormControl>
                </HStack>

                {/* Description */}
                <FormControl isRequired isInvalid={!!formErrors.desc}>
                  <FormLabel fontSize="sm" fontWeight="600" color={titleColor}>Description (विवरण)</FormLabel>
                  <Textarea
                    variant="filled" borderRadius="xl" rows={3}
                    placeholder="Describe the program in Hindi..."
                    value={form.desc}
                    onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                  />
                  {formErrors.desc && <Text color="red.400" fontSize="xs" mt={1}>{formErrors.desc}</Text>}
                </FormControl>

                {/* Image */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color={titleColor}>
                    <Icon as={FiImage} mr={1.5} /> Program Image
                  </FormLabel>
                  <HStack spacing={3}>
                    <Input
                      flex={1}
                      variant="filled" borderRadius="xl"
                      placeholder="/uploads/programs/..."
                      value={form.image}
                      onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    />
                    <input
                      ref={programImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                    <Button
                      leftIcon={<Icon as={FiUpload} />}
                      variant="outline"
                      borderRadius="xl"
                      onClick={() => programImageInputRef.current?.click()}
                      isLoading={uploading}
                      flexShrink={0}
                    >
                      Upload
                    </Button>
                  </HStack>
                </FormControl>

                {/* Raised & Goal */}
                <HStack spacing={3}>
                  <FormControl flex={1}>
                    <FormLabel fontSize="sm" fontWeight="600" color={titleColor}>Raised (एकत्रित)</FormLabel>
                    <Input
                      variant="filled" borderRadius="xl" placeholder="₹3,40,000"
                      value={form.raised}
                      onChange={e => setForm(f => ({ ...f, raised: e.target.value }))}
                    />
                  </FormControl>
                  <FormControl flex={1}>
                    <FormLabel fontSize="sm" fontWeight="600" color={titleColor}>Goal (लक्ष्य)</FormLabel>
                    <Input
                      variant="filled" borderRadius="xl" placeholder="₹5,00,000"
                      value={form.goal}
                      onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
                    />
                  </FormControl>
                </HStack>

                {/* Percentage */}
                <FormControl isInvalid={!!formErrors.percentage}>
                  <FormLabel fontSize="sm" fontWeight="600" color={titleColor}>
                    <Icon as={FiTarget} mr={1.5} /> Progress Percentage (0–100)
                  </FormLabel>
                  <NumberInput
                    min={0} max={100}
                    value={form.percentage}
                    onChange={(_, val) => setForm(f => ({ ...f, percentage: isNaN(val) ? 0 : val }))}
                  >
                    <NumberInputField variant="filled" borderRadius="xl" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  {formErrors.percentage && <Text color="red.400" fontSize="xs" mt={1}>{formErrors.percentage}</Text>}
                </FormControl>

                {/* Colors */}
                <HStack spacing={3} align="flex-start">
                  <FormControl flex={1}>
                    <FormLabel fontSize="sm" fontWeight="600" color={titleColor}>Tag Background Color</FormLabel>
                    <Select
                      variant="filled" borderRadius="xl"
                      value={form.tagBg}
                      onChange={e => setForm(f => ({ ...f, tagBg: e.target.value }))}
                    >
                      {COLOR_PRESETS.map(c => (
                        <option key={c.value} value={c.value}>{c.label} ({c.value})</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl flex={1}>
                    <FormLabel fontSize="sm" fontWeight="600" color={titleColor}>Accent Color (Progress Bar)</FormLabel>
                    <Select
                      variant="filled" borderRadius="xl"
                      value={form.accentColor}
                      onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))}
                    >
                      {COLOR_PRESETS.map(c => (
                        <option key={c.value} value={c.value}>{c.label} ({c.value})</option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>

                {/* Color preview dots */}
                <HStack spacing={3}>
                  <HStack spacing={2}>
                    <Box w={5} h={5} borderRadius="full" bg={form.tagBg} border="2px solid" borderColor={borderColor} />
                    <Text fontSize="11px" color={mutedColor}>Tag BG</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Box w={5} h={5} borderRadius="full" bg={form.accentColor} border="2px solid" borderColor={borderColor} />
                    <Text fontSize="11px" color={mutedColor}>Accent</Text>
                  </HStack>
                </HStack>

                {/* Active toggle */}
                <FormControl>
                  <HStack spacing={3} align="center">
                    <Switch
                      isChecked={form.isActive}
                      onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                      colorScheme="green"
                      size="md"
                    />
                    <FormLabel fontSize="sm" fontWeight="600" color={titleColor} mb={0}>
                      Show on Website (Active)
                    </FormLabel>
                  </HStack>
                </FormControl>
              </VStack>

              {/* Live Preview */}
              <Box w={{ base: 'full', lg: '320px' }} flexShrink={0}>
                <Text fontSize="12px" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color={mutedColor} mb={3}>
                  Live Preview
                </Text>
                <PreviewCard form={form} />
              </Box>
            </Flex>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor={borderColor} gap={3}>
            <Button variant="ghost" onClick={formModal.onClose} borderRadius="xl" isDisabled={submitting}>
              Cancel
            </Button>
            <Button
              bg="#1a5c38"
              color="white"
              _hover={{ bg: '#0d3a22' }}
              borderRadius="xl"
              fontWeight="700"
              onClick={handleSubmit}
              isLoading={submitting}
              loadingText={editingId ? 'Updating...' : 'Creating...'}
            >
              {editingId ? 'Update Program' : 'Create Program'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ══════════════════════════════════════════════════════
          DELETE CONFIRM MODAL
      ══════════════════════════════════════════════════════ */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} size="sm" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" bg={cardBg} border="1px solid" borderColor={borderColor}>
          <ModalHeader fontFamily="'Outfit', sans-serif" fontWeight="800" color="red.500" pb={2}>
            🗑️ Delete Program
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color={mutedColor}>
              Are you sure you want to delete{' '}
              <strong style={{ color: titleColor }}>"{programToDelete?.title}"</strong>?
              This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={deleteModal.onClose} borderRadius="xl">Cancel</Button>
            <Button colorScheme="red" borderRadius="xl" fontWeight="700" onClick={handleDelete}>
              Yes, Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </VStack>
  );
};

export default ProgramsManagement;
