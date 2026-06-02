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
  useDisclosure,
  useToast,
  SimpleGrid,
  Flex,
  Switch,
  Divider,
  Tooltip,
  IconButton,
  InputGroup,
  InputLeftElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiMessageSquare,
  FiImage,
  FiUser,
  FiType,
  FiUpload,
  FiChevronUp,
  FiChevronDown,
  FiStar,
} from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_BASE;

const EMPTY_ITEM = {
  name: '',
  role: '',
  image: '',
  quote: '',
  rating: 5,
  highlight: false,
  order: 0,
  isActive: true,
};

const EMPTY_SETTINGS = {
  sectionSubtitle: '',
  sectionTitlePrefix: '',
  sectionTitleHighlight: '',
  sectionTitleSuffix: '',
};

const StarRow = ({ rating }) => (
  <HStack spacing={0.5}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Text key={n} fontSize="14px" color={n <= rating ? '#f5b400' : '#d1d5db'}>
        ★
      </Text>
    ))}
  </HStack>
);

const TestimonialCard = ({
  item,
  onEdit,
  onDelete,
  onToggle,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
  const cardBg = useColorModeValue('#ffffff', '#0a2e27');
  const borderColor = useColorModeValue(
    item.highlight ? '#f5b400' : '#d4ede8',
    item.highlight ? '#f5b400' : '#0d3d34',
  );
  const titleColor = useColorModeValue('#08362E', '#e8f8f5');
  const mutedColor = useColorModeValue('#6b7280', '#7ab8ae');

  return (
    <Card
      bg={cardBg}
      border="2px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      overflow="hidden"
      opacity={item.isActive ? 1 : 0.65}
      transition="all 0.25s ease"
      _hover={{ transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(0,0,0,0.10)' }}
    >
      <CardBody p={4}>
        <Flex justify="space-between" align="flex-start" mb={3}>
          <HStack spacing={3}>
            <Box
              w="48px"
              h="48px"
              borderRadius="full"
              overflow="hidden"
              border="2px solid"
              borderColor={item.highlight ? '#f5b400' : '#e5e7eb'}
              flexShrink={0}
            >
              <Box
                as="img"
                src={resolveImageUrl(item.image) || '/images/team1.png'}
                alt={item.name}
                w="full"
                h="full"
                objectFit="cover"
              />
            </Box>
            <Box>
              <Text fontWeight="800" fontSize="14px" color={titleColor} noOfLines={1}>
                {item.name}
              </Text>
              <Text fontSize="11px" color={mutedColor} noOfLines={1}>
                {item.role}
              </Text>
            </Box>
          </HStack>
          <VStack align="flex-end" spacing={1}>
            {item.highlight && (
              <Badge colorScheme="yellow" fontSize="9px">
                Featured
              </Badge>
            )}
            <Badge colorScheme={item.isActive ? 'green' : 'gray'} fontSize="9px">
              {item.isActive ? 'Active' : 'Hidden'}
            </Badge>
          </VStack>
        </Flex>

        <StarRow rating={item.rating} />
        <Text fontSize="12px" color={mutedColor} mt={2} noOfLines={3} lineHeight={1.6}>
          “{item.quote}”
        </Text>

        <Divider my={3} />
        <Flex justify="space-between" align="center">
          <HStack spacing={1}>
            <IconButton
              icon={<Icon as={FiChevronUp} />}
              size="sm"
              variant="ghost"
              isDisabled={isFirst}
              onClick={() => onMoveUp(item.id)}
              aria-label="Move up"
            />
            <IconButton
              icon={<Icon as={FiChevronDown} />}
              size="sm"
              variant="ghost"
              isDisabled={isLast}
              onClick={() => onMoveDown(item.id)}
              aria-label="Move down"
            />
            <IconButton
              icon={<Icon as={item.isActive ? FiEyeOff : FiEye} />}
              size="sm"
              variant="ghost"
              colorScheme={item.isActive ? 'orange' : 'green'}
              onClick={() => onToggle(item.id)}
              aria-label="Toggle"
            />
          </HStack>
          <HStack spacing={1}>
            <IconButton
              icon={<Icon as={FiEdit2} />}
              size="sm"
              colorScheme="brand"
              variant="ghost"
              onClick={() => onEdit(item)}
              aria-label="Edit"
            />
            <IconButton
              icon={<Icon as={FiTrash2} />}
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={() => onDelete(item)}
              aria-label="Delete"
            />
          </HStack>
        </Flex>
      </CardBody>
    </Card>
  );
};

const TestimonialsManagement = () => {
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState(EMPTY_ITEM);
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const fileInputRef = useRef(null);

  const formModal = useDisclosure();
  const deleteModal = useDisclosure();
  const toast = useToast();

  const titleColor = useColorModeValue('#08362E', '#e8f8f5');
  const borderColor = useColorModeValue('#d4ede8', '#0d3d34');
  const mutedColor = useColorModeValue('#4a9085', '#7ab8ae');
  const cardBg = useColorModeValue('#ffffff', '#0a2e27');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE}/testimonials`),
        fetch(`${API_BASE}/testimonials/settings`),
      ]);
      const itemsJson = await itemsRes.json();
      const settingsJson = await settingsRes.json();
      if (itemsJson.success) setItems(itemsJson.data);
      else setError(itemsJson.message || 'Failed to fetch testimonials');
      if (settingsJson.success) {
        setSettings({
          sectionSubtitle: settingsJson.data.sectionSubtitle || '',
          sectionTitlePrefix: settingsJson.data.sectionTitlePrefix || '',
          sectionTitleHighlight: settingsJson.data.sectionTitleHighlight || '',
          sectionTitleSuffix: settingsJson.data.sectionTitleSuffix || '',
        });
      }
    } catch {
      setError('Cannot connect to backend server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.role.toLowerCase().includes(q) ||
      item.quote.toLowerCase().includes(q);
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && item.isActive) ||
      (filterStatus === 'inactive' && !item.isActive);
    return matchSearch && matchStatus;
  });

  const openCreateModal = () => {
    setForm({ ...EMPTY_ITEM, order: items.length });
    setEditingId(null);
    setFormErrors({});
    formModal.onOpen();
  };

  const openEditModal = (item) => {
    setForm({
      name: item.name || '',
      role: item.role || '',
      image: item.image || '',
      quote: item.quote || '',
      rating: item.rating ?? 5,
      highlight: Boolean(item.highlight),
      order: item.order ?? 0,
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setEditingId(item.id);
    setFormErrors({});
    formModal.onOpen();
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.quote.trim()) errors.quote = 'Quote is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadImage(file, 'testimonials');
      setForm((f) => ({ ...f, image: data.url }));
      toast({ title: 'Photo uploaded', status: 'success', duration: 2000, isClosable: true, position: 'top-right' });
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, status: 'error', duration: 3000, isClosable: true });
    } finally {
      setUploading(false);
    }
    e.target.value = '';
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const url = editingId
        ? `${API_BASE}/testimonials/${editingId}`
        : `${API_BASE}/testimonials`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          rating: Number(form.rating),
          order: Number(form.order),
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: editingId ? 'Updated' : 'Created',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right',
        });
        fetchAll();
        formModal.onClose();
      } else {
        toast({ title: 'Error', description: json.message, status: 'error', duration: 4000, isClosable: true });
      }
    } catch {
      toast({ title: 'Connection Error', status: 'error', duration: 4000, isClosable: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch(`${API_BASE}/testimonials/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: 'Section headings saved', status: 'success', duration: 2500, isClosable: true, position: 'top-right' });
      } else {
        toast({ title: 'Error', description: json.message, status: 'error', duration: 3000, isClosable: true });
      }
    } catch {
      toast({ title: 'Connection Error', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/testimonials/${id}/toggle`, { method: 'PATCH' });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => prev.map((t) => (t.id === id ? json.data : t)));
      }
    } catch {
      toast({ title: 'Failed to toggle', status: 'error', duration: 2500, isClosable: true });
    }
  };

  const reorderItems = async (orderedIds) => {
    try {
      const res = await fetch(`${API_BASE}/testimonials/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });
      const json = await res.json();
      if (json.success) setItems(json.data);
    } catch {
      toast({ title: 'Reorder failed', status: 'error', duration: 2500, isClosable: true });
    }
  };

  const handleMoveUp = (id) => {
    const idx = items.findIndex((t) => t.id === id);
    if (idx <= 0) return;
    const ids = items.map((t) => t.id);
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    reorderItems(ids);
  };

  const handleMoveDown = (id) => {
    const idx = items.findIndex((t) => t.id === id);
    if (idx < 0 || idx >= items.length - 1) return;
    const ids = items.map((t) => t.id);
    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    reorderItems(ids);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`${API_BASE}/testimonials/${itemToDelete.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast({ title: 'Deleted', status: 'success', duration: 2500, isClosable: true });
        fetchAll();
        deleteModal.onClose();
        setItemToDelete(null);
      }
    } catch {
      toast({ title: 'Delete failed', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const activeCount = items.filter((t) => t.isActive).length;

  return (
    <VStack spacing={{ base: 5, md: 7 }} align="stretch" w="full">
      <Box
        p={{ base: 5, md: 7 }}
        borderRadius="2xl"
        bgGradient="linear(135deg, #f5b400 0%, #c49200 100%)"
        color="#111827"
        boxShadow="0 4px 24px rgba(245,180,0,0.35)"
      >
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ md: 'center' }} gap={4}>
          <Box>
            <HStack spacing={2} mb={1}>
              <Icon as={FiMessageSquare} color="#1a5c38" fontSize="14" />
              <Text fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="widest" color="#1a5c38">
                Website Content
              </Text>
            </HStack>
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontFamily="'Outfit', sans-serif" fontWeight="800" mb={1}>
              प्रतिक्रिया और समीक्षा — Testimonials
            </Text>
            <Text fontSize="sm" opacity={0.85} maxW="lg">
              Manage donor and supporter feedback cards on homepage and about page.
            </Text>
          </Box>
          <Button
            leftIcon={<Icon as={FiPlus} />}
            bg="#1a5c38"
            color="white"
            _hover={{ bg: '#0d3a22' }}
            borderRadius="xl"
            fontWeight="700"
            onClick={openCreateModal}
            flexShrink={0}
          >
            Add Testimonial
          </Button>
        </Flex>
      </Box>

      <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl">
        <CardBody p={5}>
          <Text fontWeight="800" color={titleColor} mb={4} fontSize="md">
            <Icon as={FiType} mr={2} />
            Section Headings
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">Subtitle</FormLabel>
              <Input
                variant="filled"
                borderRadius="xl"
                value={settings.sectionSubtitle}
                onChange={(e) => setSettings((s) => ({ ...s, sectionSubtitle: e.target.value }))}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">Title — highlighted word (gold)</FormLabel>
              <Input
                variant="filled"
                borderRadius="xl"
                value={settings.sectionTitleHighlight}
                onChange={(e) => setSettings((s) => ({ ...s, sectionTitleHighlight: e.target.value }))}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">Title — before highlight</FormLabel>
              <Input
                variant="filled"
                borderRadius="xl"
                value={settings.sectionTitlePrefix}
                onChange={(e) => setSettings((s) => ({ ...s, sectionTitlePrefix: e.target.value }))}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">Title — after highlight</FormLabel>
              <Input
                variant="filled"
                borderRadius="xl"
                value={settings.sectionTitleSuffix}
                onChange={(e) => setSettings((s) => ({ ...s, sectionTitleSuffix: e.target.value }))}
              />
            </FormControl>
          </SimpleGrid>
          <Box p={3} bg={useColorModeValue('#f7faf9', 'rgba(0,0,0,0.2)')} borderRadius="xl" mb={4}>
            <Text fontSize="xs" color={mutedColor} mb={1}>
              Preview:
            </Text>
            <Text fontSize="sm" fontWeight="700" color={titleColor}>
              {settings.sectionTitlePrefix}
              <Text as="span" color="#f5b400">
                {settings.sectionTitleHighlight}
              </Text>
              {settings.sectionTitleSuffix}
            </Text>
          </Box>
          <Button
            size="sm"
            bg="#1a5c38"
            color="white"
            borderRadius="xl"
            onClick={handleSaveSettings}
            isLoading={savingSettings}
          >
            Save Section Headings
          </Button>
        </CardBody>
      </Card>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        {[
          { label: 'Total', value: items.length },
          { label: 'Visible', value: activeCount },
          { label: 'Featured', value: items.filter((t) => t.highlight).length },
        ].map((stat, i) => (
          <Card key={i} bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl">
            <CardBody p={4}>
              <Text fontSize="22px" fontWeight="800" color={titleColor}>
                {stat.value}
              </Text>
              <Text fontSize="11px" color={mutedColor} fontWeight="600">
                {stat.label}
              </Text>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Flex gap={3} direction={{ base: 'column', sm: 'row' }}>
        <InputGroup flex={1}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color={mutedColor} />
          </InputLeftElement>
          <Input
            placeholder="Search name, role, quote..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="filled"
            borderRadius="xl"
            fontSize="sm"
          />
        </InputGroup>
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          variant="filled"
          borderRadius="xl"
          fontSize="sm"
          w={{ base: 'full', sm: '160px' }}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Hidden</option>
        </Select>
        <IconButton
          icon={<Icon as={FiRefreshCw} />}
          onClick={fetchAll}
          variant="ghost"
          colorScheme="brand"
          borderRadius="xl"
          isLoading={loading}
          aria-label="Refresh"
        />
      </Flex>

      {loading ? (
        <Flex justify="center" py={16}>
          <Spinner size="xl" color="#f5b400" />
        </Flex>
      ) : error ? (
        <Alert status="error" borderRadius="2xl">
          <AlertIcon />
          <Box>
            <AlertTitle>Backend Not Connected</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
        </Alert>
      ) : filteredItems.length === 0 ? (
        <Text textAlign="center" color={mutedColor} py={12}>
          No testimonials yet. Click &quot;Add Testimonial&quot; to start.
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
          {filteredItems.map((item) => (
            <TestimonialCard
              key={item.id}
              item={item}
              onEdit={openEditModal}
              onDelete={(t) => {
                setItemToDelete(t);
                deleteModal.onOpen();
              }}
              onToggle={handleToggle}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isFirst={items.findIndex((t) => t.id === item.id) === 0}
              isLast={items.findIndex((t) => t.id === item.id) === items.length - 1}
            />
          ))}
        </SimpleGrid>
      )}

      <Modal isOpen={formModal.isOpen} onClose={formModal.onClose} size="2xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" bg={cardBg}>
          <ModalHeader fontWeight="800" color={titleColor}>
            {editingId ? 'Edit Testimonial' : 'Add Testimonial'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired isInvalid={!!formErrors.name}>
                <FormLabel fontSize="sm" fontWeight="600">
                  <Icon as={FiUser} mr={1} /> Name (नाम)
                </FormLabel>
                <Input
                  variant="filled"
                  borderRadius="xl"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                {formErrors.name && (
                  <Text color="red.400" fontSize="xs" mt={1}>
                    {formErrors.name}
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">Role / Designation (पद)</FormLabel>
                <Input
                  variant="filled"
                  borderRadius="xl"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  placeholder="दानदाता, समाजसेवी..."
                />
              </FormControl>

              <FormControl isRequired isInvalid={!!formErrors.quote}>
                <FormLabel fontSize="sm" fontWeight="600">
                  <Icon as={FiMessageSquare} mr={1} /> Quote (प्रतिक्रिया)
                </FormLabel>
                <Textarea
                  variant="filled"
                  borderRadius="xl"
                  rows={4}
                  value={form.quote}
                  onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                  placeholder="उनका संदेश यहाँ लिखें..."
                />
                {formErrors.quote && (
                  <Text color="red.400" fontSize="xs" mt={1}>
                    {formErrors.quote}
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">
                  <Icon as={FiImage} mr={1} /> Photo
                </FormLabel>
                <HStack spacing={3}>
                  <Input
                    flex={1}
                    variant="filled"
                    borderRadius="xl"
                    value={form.image}
                    onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                    placeholder="/uploads/testimonials/..."
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  <Button
                    leftIcon={<Icon as={FiUpload} />}
                    variant="outline"
                    borderRadius="xl"
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={uploading}
                    flexShrink={0}
                  >
                    Upload
                  </Button>
                </HStack>
                {form.image && (
                  <Box
                    as="img"
                    src={resolveImageUrl(form.image)}
                    alt="preview"
                    mt={3}
                    w="64px"
                    h="64px"
                    borderRadius="full"
                    objectFit="cover"
                  />
                )}
              </FormControl>

              <HStack spacing={4} align="flex-start">
                <FormControl flex={1}>
                  <FormLabel fontSize="sm" fontWeight="600">
                    <Icon as={FiStar} mr={1} /> Rating (1–5)
                  </FormLabel>
                  <NumberInput
                    min={1}
                    max={5}
                    value={form.rating}
                    onChange={(_, val) => setForm((f) => ({ ...f, rating: isNaN(val) ? 5 : val }))}
                  >
                    <NumberInputField variant="filled" borderRadius="xl" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl flex={1}>
                  <FormLabel fontSize="sm" fontWeight="600">Display Order</FormLabel>
                  <NumberInput
                    min={0}
                    value={form.order}
                    onChange={(_, val) => setForm((f) => ({ ...f, order: isNaN(val) ? 0 : val }))}
                  >
                    <NumberInputField variant="filled" borderRadius="xl" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>

              <FormControl>
                <HStack justify="space-between">
                  <Box>
                    <FormLabel fontSize="sm" fontWeight="600" mb={0}>
                      Featured card (gold border)
                    </FormLabel>
                    <Text fontSize="xs" color={mutedColor}>
                      Only one featured card shown at a time on the website.
                    </Text>
                  </Box>
                  <Switch
                    isChecked={form.highlight}
                    onChange={(e) => setForm((f) => ({ ...f, highlight: e.target.checked }))}
                    colorScheme="yellow"
                  />
                </HStack>
              </FormControl>

              <FormControl>
                <HStack>
                  <Switch
                    isChecked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    colorScheme="green"
                  />
                  <FormLabel fontSize="sm" fontWeight="600" mb={0}>
                    Show on Website
                  </FormLabel>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={formModal.onClose} borderRadius="xl">
              Cancel
            </Button>
            <Button
              bg="#1a5c38"
              color="white"
              borderRadius="xl"
              onClick={handleSubmit}
              isLoading={submitting}
            >
              {editingId ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} size="sm" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader color="red.500">Delete Testimonial</ModalHeader>
          <ModalBody>
            <Text fontSize="sm">
              Delete <strong>{itemToDelete?.name}</strong>? This cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={deleteModal.onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default TestimonialsManagement;
