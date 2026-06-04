import React, { useState, useEffect, useCallback, useRef } from 'react';
import { uploadImage } from '../utils/uploadImage';
import { resolveImageUrl } from '../utils/imageUrl';
import {
  VStack, HStack, Box, Text, Button, Icon, useColorModeValue, Card, CardBody, Badge,
  Spinner, Alert, AlertIcon, AlertTitle, AlertDescription, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Input,
  Textarea, useDisclosure, useToast, SimpleGrid, Flex, Switch, Divider, Tooltip, IconButton,
  InputGroup, InputLeftElement, NumberInput, NumberInputField, NumberInputStepper,
  NumberIncrementStepper, NumberDecrementStepper, Select,
} from '@chakra-ui/react';
import {
  FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiEye, FiEyeOff, FiSearch, FiFileText,
  FiImage, FiUpload, FiChevronUp, FiChevronDown, FiType, FiStar, FiHome,
} from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_BASE;

const CATEGORIES = [
  'शिक्षा', 'स्वास्थ्य', 'महिला सशक्तिकरण', 'दान',
  'आगामी कार्यक्रम', 'स्वयंसेवा', 'पोषण',
];

const TAGS = ['ताज़ा', 'महत्वपूर्ण', 'नया', 'बड़ी खबर', 'आगामी', 'उत्साहजनक'];

const EMPTY_ARTICLE = {
  title: '',
  excerpt: '',
  content: '',
  category: 'शिक्षा',
  categoryEn: '',
  image: '',
  tag: 'ताज़ा',
  dateLabel: '',
  author: 'सहायता फाउंडेशन',
  commentCount: 0,
  featured: false,
  showOnHome: false,
  order: 0,
  isActive: true,
};

const EMPTY_SETTINGS = {
  blogSectionSubtitle: '',
  blogSectionTitlePrefix: '',
  blogSectionTitleHighlight: '',
  blogSectionTitleSuffix: '',
  blogSectionCtaText: '',
  homeDisplayLimit: 3,
  newsPageHeroTitle: '',
  newsPageHeroSubtitle: '',
};

const NewsCard = ({ item, onEdit, onDelete, onToggle, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const cardBg = useColorModeValue('#ffffff', '#2a0c06');
  const borderColor = useColorModeValue(item.featured ? '#f5b400' : '#f0c4bb', '#4a1208');
  const titleColor = useColorModeValue('#2e0d09', '#f5e0dc');
  const mutedColor = useColorModeValue('#6b7280', '#c08070');

  return (
    <Card bg={cardBg} border="2px solid" borderColor={borderColor} borderRadius="2xl" overflow="hidden" opacity={item.isActive ? 1 : 0.65}>
      <Box h="140px" overflow="hidden">
        <Box as="img" src={resolveImageUrl(item.image)} alt={item.title} w="full" h="full" objectFit="cover" />
      </Box>
      <CardBody p={4}>
        <Flex justify="space-between" mb={2}>
          <Badge colorScheme="brand" fontSize="9px">{item.category}</Badge>
          <HStack spacing={1}>
            {item.featured && <Badge colorScheme="yellow" fontSize="9px">Featured</Badge>}
            {item.showOnHome && <Badge colorScheme="blue" fontSize="9px">Home</Badge>}
          </HStack>
        </Flex>
        <Text fontWeight="800" fontSize="13px" color={titleColor} noOfLines={2} mb={1}>{item.title}</Text>
        <Text fontSize="11px" color={mutedColor} noOfLines={2}>{item.excerpt}</Text>
        <Text fontSize="10px" color={mutedColor} mt={2}>{item.dateLabel} · {item.tag}</Text>
        <Divider my={3} />
        <Flex justify="space-between">
          <HStack spacing={1}>
            <IconButton icon={<Icon as={FiChevronUp} />} size="sm" variant="ghost" isDisabled={isFirst} onClick={() => onMoveUp(item.id)} aria-label="Up" />
            <IconButton icon={<Icon as={FiChevronDown} />} size="sm" variant="ghost" isDisabled={isLast} onClick={() => onMoveDown(item.id)} aria-label="Down" />
            <IconButton icon={<Icon as={item.isActive ? FiEyeOff : FiEye} />} size="sm" variant="ghost" onClick={() => onToggle(item.id)} aria-label="Toggle" />
          </HStack>
          <HStack spacing={1}>
            <IconButton icon={<Icon as={FiEdit2} />} size="sm" variant="ghost" onClick={() => onEdit(item)} aria-label="Edit" />
            <IconButton icon={<Icon as={FiTrash2} />} size="sm" colorScheme="red" variant="ghost" onClick={() => onDelete(item)} aria-label="Delete" />
          </HStack>
        </Flex>
      </CardBody>
    </Card>
  );
};

const NewsManagement = () => {
  const [articles, setArticles] = useState([]);
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState(EMPTY_ARTICLE);
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

  const titleColor = useColorModeValue('#2e0d09', '#f5e0dc');
  const borderColor = useColorModeValue('#f0c4bb', '#4a1208');
  const mutedColor = useColorModeValue('#a05040', '#c08070');
  const cardBg = useColorModeValue('#ffffff', '#2a0c06');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [newsRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE}/news`, { credentials: 'include' }),
        fetch(`${API_BASE}/news/settings`, { credentials: 'include' }),
      ]);
      const newsJson = await newsRes.json();
      const settingsJson = await settingsRes.json();
      if (newsJson.success) setArticles(newsJson.data);
      else setError(newsJson.message);
      if (settingsJson.success) {
        setSettings({
          blogSectionSubtitle: settingsJson.data.blogSectionSubtitle || '',
          blogSectionTitlePrefix: settingsJson.data.blogSectionTitlePrefix || '',
          blogSectionTitleHighlight: settingsJson.data.blogSectionTitleHighlight || '',
          blogSectionTitleSuffix: settingsJson.data.blogSectionTitleSuffix || '',
          blogSectionCtaText: settingsJson.data.blogSectionCtaText || '',
          homeDisplayLimit: settingsJson.data.homeDisplayLimit ?? 3,
          newsPageHeroTitle: settingsJson.data.newsPageHeroTitle || '',
          newsPageHeroSubtitle: settingsJson.data.newsPageHeroSubtitle || '',
        });
      }
    } catch {
      setError('Cannot connect to backend server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = articles.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' && a.isActive) || (filterStatus === 'inactive' && !a.isActive);
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setForm({ ...EMPTY_ARTICLE, order: articles.length, dateLabel: new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' }) });
    setEditingId(null);
    setFormErrors({});
    formModal.onOpen();
  };

  const openEdit = (item) => {
    setForm({
      title: item.title || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      category: item.category || 'शिक्षा',
      categoryEn: item.categoryEn || '',
      image: item.image || '',
      tag: item.tag || 'ताज़ा',
      dateLabel: item.dateLabel || '',
      author: item.author || 'सहायता फाउंडेशन',
      commentCount: item.commentCount ?? 0,
      featured: Boolean(item.featured),
      showOnHome: Boolean(item.showOnHome),
      order: item.order ?? 0,
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setEditingId(item.id);
    setFormErrors({});
    formModal.onOpen();
  };

  const validateForm = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Title required';
    if (!form.category.trim()) errors.category = 'Category required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadImage(file, 'news');
      setForm((f) => ({ ...f, image: data.url }));
      toast({ title: 'Image uploaded', status: 'success', duration: 2000, isClosable: true, position: 'top-right' });
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
      const url = editingId ? `${API_BASE}/news/${editingId}` : `${API_BASE}/news`;
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          commentCount: Number(form.commentCount),
          order: Number(form.order),
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: editingId ? 'Updated' : 'Created', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
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
      const res = await fetch(`${API_BASE}/news/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) toast({ title: 'Settings saved', status: 'success', duration: 2500, isClosable: true, position: 'top-right' });
      else toast({ title: 'Error', description: json.message, status: 'error', duration: 3000, isClosable: true });
    } catch {
      toast({ title: 'Connection Error', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggle = async (id) => {
    const res = await fetch(`${API_BASE}/news/${id}/toggle`, { method: 'PATCH', credentials: 'include' });
    const json = await res.json();
    if (json.success) setArticles((prev) => prev.map((a) => (a.id === id ? json.data : a)));
  };

  const reorder = async (orderedIds) => {
    const res = await fetch(`${API_BASE}/news/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ orderedIds }),
    });
    const json = await res.json();
    if (json.success) setArticles(json.data);
  };

  const handleMoveUp = (id) => {
    const idx = articles.findIndex((a) => a.id === id);
    if (idx <= 0) return;
    const ids = articles.map((a) => a.id);
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    reorder(ids);
  };

  const handleMoveDown = (id) => {
    const idx = articles.findIndex((a) => a.id === id);
    if (idx < 0 || idx >= articles.length - 1) return;
    const ids = articles.map((a) => a.id);
    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    reorder(ids);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const res = await fetch(`${API_BASE}/news/${itemToDelete.id}`, { method: 'DELETE', credentials: 'include' });
    const json = await res.json();
    if (json.success) {
      toast({ title: 'Deleted', status: 'success', duration: 2500, isClosable: true });
      fetchAll();
      deleteModal.onClose();
      setItemToDelete(null);
    }
  };

  return (
    <VStack spacing={{ base: 5, md: 7 }} align="stretch" w="full">
      <Box p={{ base: 5, md: 7 }} borderRadius="2xl" bgGradient="linear(135deg, #821905 0%, #4a0e02 100%)" color="white" boxShadow="0 4px 24px rgba(130,25,5,0.25)">
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ md: 'center' }} gap={4}>
          <Box>
            <HStack spacing={2} mb={1}>
              <Icon as={FiFileText} color="#f0c4bb" fontSize="14" />
              <Text fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="widest" color="#f0c4bb">Website Content</Text>
            </HStack>
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="800" mb={1}>समाचार — News Management</Text>
            <Text fontSize="sm" opacity={0.85}>Homepage blog section and full news page content.</Text>
          </Box>
          <Button leftIcon={<Icon as={FiPlus} />} bg="#821905" color="white" _hover={{ bg: '#5c1204' }} borderRadius="xl" fontWeight="700" onClick={openCreate}>Add News Article</Button>
        </Flex>
      </Box>

      <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl">
        <CardBody p={5}>
          <Text fontWeight="800" color={titleColor} mb={4}><Icon as={FiType} mr={2} />Section Settings</Text>
          <Text fontSize="xs" color={mutedColor} mb={3} fontWeight="700">HOME BLOG SECTION</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <FormControl><FormLabel fontSize="sm">Subtitle</FormLabel><Input variant="filled" borderRadius="xl" value={settings.blogSectionSubtitle} onChange={(e) => setSettings((s) => ({ ...s, blogSectionSubtitle: e.target.value }))} /></FormControl>
            <FormControl><FormLabel fontSize="sm">CTA Button Text</FormLabel><Input variant="filled" borderRadius="xl" value={settings.blogSectionCtaText} onChange={(e) => setSettings((s) => ({ ...s, blogSectionCtaText: e.target.value }))} /></FormControl>
            <FormControl><FormLabel fontSize="sm">Title — before highlight</FormLabel><Input variant="filled" borderRadius="xl" value={settings.blogSectionTitlePrefix} onChange={(e) => setSettings((s) => ({ ...s, blogSectionTitlePrefix: e.target.value }))} /></FormControl>
            <FormControl><FormLabel fontSize="sm">Title — highlight (gold)</FormLabel><Input variant="filled" borderRadius="xl" value={settings.blogSectionTitleHighlight} onChange={(e) => setSettings((s) => ({ ...s, blogSectionTitleHighlight: e.target.value }))} /></FormControl>
            <FormControl><FormLabel fontSize="sm">Title — after highlight</FormLabel><Input variant="filled" borderRadius="xl" value={settings.blogSectionTitleSuffix} onChange={(e) => setSettings((s) => ({ ...s, blogSectionTitleSuffix: e.target.value }))} /></FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Home cards limit</FormLabel>
              <NumberInput min={1} max={12} value={settings.homeDisplayLimit} onChange={(_, v) => setSettings((s) => ({ ...s, homeDisplayLimit: isNaN(v) ? 3 : v }))}>
                <NumberInputField variant="filled" borderRadius="xl" />
              </NumberInput>
            </FormControl>
          </SimpleGrid>
          <Text fontSize="xs" color={mutedColor} mb={3} fontWeight="700">NEWS PAGE HERO</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <FormControl><FormLabel fontSize="sm">Hero Title</FormLabel><Input variant="filled" borderRadius="xl" value={settings.newsPageHeroTitle} onChange={(e) => setSettings((s) => ({ ...s, newsPageHeroTitle: e.target.value }))} /></FormControl>
            <FormControl><FormLabel fontSize="sm">Hero Subtitle</FormLabel><Input variant="filled" borderRadius="xl" value={settings.newsPageHeroSubtitle} onChange={(e) => setSettings((s) => ({ ...s, newsPageHeroSubtitle: e.target.value }))} /></FormControl>
          </SimpleGrid>
          <Button size="sm" bg="#821905" color="white" _hover={{ bg: '#5c1204' }} borderRadius="xl" onClick={handleSaveSettings} isLoading={savingSettings}>Save Settings</Button>
        </CardBody>
      </Card>

      <Flex gap={3} direction={{ base: 'column', sm: 'row' }}>
        <InputGroup flex={1}>
          <InputLeftElement pointerEvents="none"><Icon as={FiSearch} color={mutedColor} /></InputLeftElement>
          <Input placeholder="Search news..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} variant="filled" borderRadius="xl" fontSize="sm" />
        </InputGroup>
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} variant="filled" borderRadius="xl" w={{ sm: '160px' }}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Hidden</option>
        </Select>
        <IconButton icon={<Icon as={FiRefreshCw} />} onClick={fetchAll} variant="ghost" borderRadius="xl" isLoading={loading} aria-label="Refresh" />
      </Flex>

      {loading ? (
        <Flex justify="center" py={16}><Spinner size="xl" color="#821905" /></Flex>
      ) : error ? (
        <Alert status="error" borderRadius="2xl"><AlertIcon /><Box><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Box></Alert>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
          {filtered.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              onEdit={openEdit}
              onDelete={(t) => { setItemToDelete(t); deleteModal.onOpen(); }}
              onToggle={handleToggle}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isFirst={articles.findIndex((a) => a.id === item.id) === 0}
              isLast={articles.findIndex((a) => a.id === item.id) === articles.length - 1}
            />
          ))}
        </SimpleGrid>
      )}

      <Modal isOpen={formModal.isOpen} onClose={formModal.onClose} size="3xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" bg={cardBg}>
          <ModalHeader fontWeight="800" color={titleColor}>{editingId ? 'Edit Article' : 'Add Article'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired isInvalid={!!formErrors.title}>
                <FormLabel fontSize="sm" fontWeight="600">Title (शीर्षक)</FormLabel>
                <Input variant="filled" borderRadius="xl" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">Excerpt (संक्षिप्त विवरण)</FormLabel>
                <Textarea variant="filled" borderRadius="xl" rows={3} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">Full Content (optional)</FormLabel>
                <Textarea variant="filled" borderRadius="xl" rows={4} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
              </FormControl>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired isInvalid={!!formErrors.category}>
                  <FormLabel fontSize="sm" fontWeight="600">Category</FormLabel>
                  <Select variant="filled" borderRadius="xl" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">Tag Badge</FormLabel>
                  <Select variant="filled" borderRadius="xl" value={form.tag} onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}>
                    {TAGS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">Date Label</FormLabel>
                  <Input variant="filled" borderRadius="xl" placeholder="25 मई 2026" value={form.dateLabel} onChange={(e) => setForm((f) => ({ ...f, dateLabel: e.target.value }))} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">Author</FormLabel>
                  <Input variant="filled" borderRadius="xl" value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">Comment Count</FormLabel>
                  <NumberInput min={0} value={form.commentCount} onChange={(_, v) => setForm((f) => ({ ...f, commentCount: isNaN(v) ? 0 : v }))}>
                    <NumberInputField variant="filled" borderRadius="xl" />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">Order</FormLabel>
                  <NumberInput min={0} value={form.order} onChange={(_, v) => setForm((f) => ({ ...f, order: isNaN(v) ? 0 : v }))}>
                    <NumberInputField variant="filled" borderRadius="xl" />
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600"><Icon as={FiImage} mr={1} />Cover Image</FormLabel>
                <HStack spacing={3}>
                  <Input flex={1} variant="filled" borderRadius="xl" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} />
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                  <Button leftIcon={<Icon as={FiUpload} />} variant="outline" borderRadius="xl" onClick={() => fileInputRef.current?.click()} isLoading={uploading}>Upload</Button>
                </HStack>
                {form.image && <Box as="img" src={resolveImageUrl(form.image)} alt="" mt={3} maxH="120px" borderRadius="xl" objectFit="cover" />}
              </FormControl>
              <HStack spacing={6} flexWrap="wrap">
                <FormControl display="flex" alignItems="center" w="auto">
                  <Switch isChecked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} colorScheme="yellow" mr={2} />
                  <FormLabel mb={0} fontSize="sm"><Icon as={FiStar} mr={1} />Featured (main story)</FormLabel>
                </FormControl>
                <FormControl display="flex" alignItems="center" w="auto">
                  <Switch isChecked={form.showOnHome} onChange={(e) => setForm((f) => ({ ...f, showOnHome: e.target.checked }))} colorScheme="blue" mr={2} />
                  <FormLabel mb={0} fontSize="sm"><Icon as={FiHome} mr={1} />Show on Homepage</FormLabel>
                </FormControl>
                <FormControl display="flex" alignItems="center" w="auto">
                  <Switch isChecked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} colorScheme="brand" mr={2} />
                  <FormLabel mb={0} fontSize="sm">Active</FormLabel>
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={formModal.onClose} borderRadius="xl">Cancel</Button>
            <Button bg="#821905" color="white" _hover={{ bg: '#5c1204' }} borderRadius="xl" onClick={handleSubmit} isLoading={submitting}>{editingId ? 'Update' : 'Create'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} size="sm" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader color="red.500">Delete Article</ModalHeader>
          <ModalBody><Text fontSize="sm">Delete <strong>{itemToDelete?.title}</strong>?</Text></ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={deleteModal.onClose}>Cancel</Button>
            <Button colorScheme="red" onClick={handleDelete}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default NewsManagement;
