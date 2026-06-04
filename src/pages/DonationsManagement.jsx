import React, { useState, useEffect, useCallback } from 'react';
import {
  VStack, HStack, Box, Text, Button, Icon, useColorModeValue, Card, CardBody, Badge,
  Spinner, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, FormControl, FormLabel, Input, Textarea, useDisclosure, useToast,
  SimpleGrid, Flex, Select, IconButton, InputGroup, InputLeftElement, Table,
  Thead, Tbody, Tr, Th, Td, Tooltip, Tabs, TabList, Tab, TabPanels, TabPanel,
  Image,
} from '@chakra-ui/react';
import {
  FiRefreshCw, FiSearch, FiHeart, FiTrash2, FiEye, FiCheckCircle, FiClock,
  FiXCircle, FiSave, FiSettings, FiList, FiEdit2, FiLock, FiUser, FiMail, FiPhone,
  FiCalendar, FiCopy, FiExternalLink, FiTag, FiDollarSign, FiFileText,
} from 'react-icons/fi';
import DonationLetterModal from '../components/DonationLetterModal';
import { resolveImageUrl } from '../utils/imageUrl';

const API_BASE = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_BASE;

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'orange' },
  { value: 'confirmed', label: 'Confirmed', color: 'brand' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const formatAmount = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const DetailField = ({ label, value, icon, href, onCopy, mutedColor, titleColor, borderColor, fieldBg }) => (
  <Box p={3} borderRadius="xl" border="1px solid" borderColor={borderColor} bg={fieldBg}>
    <HStack spacing={1.5} mb={1.5}>
      {icon && <Icon as={icon} fontSize="12" color="#821905" />}
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
          color="#821905"
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

const EMPTY_SETTINGS = {
  heroSubtitle: '',
  heroTitle: '',
  upiId: '',
  upiPayeeName: '',
  presetAmounts: [],
  causes: [],
  trustBadges: [],
  impactItems: [],
  taxExemptTitle: '',
  taxExemptDescription: '',
  paymentSteps: [],
  formStepBadge: '',
  formStepTitle: '',
  trustPanelTitle: '',
  impactPanelTitle: '',
};

const DonationsManagement = () => {
  const toast = useToast();
  const detailModal = useDisclosure();
  const deleteModal = useDisclosure();
  const letterModal = useDisclosure();
  const [letterDonation, setLetterDonation] = useState(null);

  const openLetter = (item) => {
    setLetterDonation(item);
    letterModal.onOpen();
  };

  const [tabIndex, setTabIndex] = useState(0);
  const [settingsEditMode, setSettingsEditMode] = useState(false);
  const [settingsSnapshot, setSettingsSnapshot] = useState(null);
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [presetText, setPresetText] = useState('');
  const [paymentStepsText, setPaymentStepsText] = useState('');
  const [causesJson, setCausesJson] = useState('[]');
  const [trustJson, setTrustJson] = useState('[]');
  const [impactJson, setImpactJson] = useState('[]');
  const [savingSettings, setSavingSettings] = useState(false);

  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, cancelled: 0, confirmedAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({ status: 'pending', adminNotes: '' });
  const [saving, setSaving] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const cardBg = useColorModeValue('#ffffff', '#2a0c06');
  const borderColor = useColorModeValue('#f0c4bb', '#4a1208');
  const titleColor = useColorModeValue('#2e0d09', '#f5e0dc');
  const mutedColor = useColorModeValue('#6b7280', '#c08070');
  const thColor = useColorModeValue('#821905', '#e8907a');
  const thBg = useColorModeValue('rgba(130,25,5,0.04)', 'rgba(232,144,122,0.06)');
  const rowHover = useColorModeValue('rgba(130,25,5,0.03)', 'rgba(232,144,122,0.05)');
  const tdBorder = useColorModeValue('#faeae7', 'rgba(255,255,255,0.06)');
  const inputBg = useColorModeValue('#fdf4f2', 'rgba(255,255,255,0.1)');
  const pendingRowBg = useColorModeValue('rgba(245,180,0,0.04)', 'rgba(245,180,0,0.06)');
  const sectionBg = useColorModeValue('rgba(130,25,5,0.04)', 'rgba(232,144,122,0.06)');
  const fieldBg = useColorModeValue('#f8fcfb', 'rgba(255,255,255,0.04)');
  const lockedHeaderBg = useColorModeValue('#f8faf9', 'rgba(0,0,0,0.15)');
  const lockOverlayBg = useColorModeValue('rgba(255,255,255,0.55)', 'rgba(10,46,39,0.65)');

  const buildSnapshotFromData = (data) => ({
    settings: { ...EMPTY_SETTINGS, ...data },
    presetText: (data.presetAmounts || []).join(', '),
    paymentStepsText: (data.paymentSteps || []).join('\n'),
    causesJson: JSON.stringify(data.causes || [], null, 2),
    trustJson: JSON.stringify(data.trustBadges || [], null, 2),
    impactJson: JSON.stringify(data.impactItems || [], null, 2),
  });

  const applySettingsToForm = (data) => {
    setSettings({ ...EMPTY_SETTINGS, ...data });
    setPresetText((data.presetAmounts || []).join(', '));
    setPaymentStepsText((data.paymentSteps || []).join('\n'));
    setCausesJson(JSON.stringify(data.causes || [], null, 2));
    setTrustJson(JSON.stringify(data.trustBadges || [], null, 2));
    setImpactJson(JSON.stringify(data.impactItems || [], null, 2));
    return buildSnapshotFromData(data);
  };

  const restoreSettingsSnapshot = (snap) => {
    if (!snap) return;
    setSettings(snap.settings);
    setPresetText(snap.presetText);
    setPaymentStepsText(snap.paymentStepsText);
    setCausesJson(snap.causesJson);
    setTrustJson(snap.trustJson);
    setImpactJson(snap.impactJson);
  };

  const lockSettings = () => {
    setSettingsEditMode(false);
  };

  const handleStartEditSettings = () => {
    setSettingsSnapshot({
      settings: { ...settings },
      presetText,
      paymentStepsText,
      causesJson,
      trustJson,
      impactJson,
    });
    setSettingsEditMode(true);
  };

  const handleCancelSettings = () => {
    restoreSettingsSnapshot(settingsSnapshot);
    lockSettings();
  };

  const handleTabChange = (index) => {
    if (tabIndex === 1 && settingsEditMode && index !== 1) {
      restoreSettingsSnapshot(settingsSnapshot);
      lockSettings();
    }
    setTabIndex(index);
  };

  const fetchSettings = useCallback(async () => {
    const res = await fetch(`${API_BASE}/donations/settings`);
    const json = await res.json();
    if (json.success) {
      const snap = applySettingsToForm(json.data);
      setSettingsSnapshot(snap);
    }
  }, []);

  const fetchDonations = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (search.trim()) params.set('search', search.trim());
    const [listRes, statsRes] = await Promise.all([
      fetch(`${API_BASE}/donations?${params}`, { credentials: 'include' }),
      fetch(`${API_BASE}/donations/stats`, { credentials: 'include' }),
    ]);
    const listJson = await listRes.json();
    const statsJson = await statsRes.json();
    if (listJson.success) setDonations(listJson.data || []);
    if (statsJson.success) setStats(statsJson.data || {});
  }, [statusFilter, search]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchSettings(), fetchDonations()]);
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to load data', status: 'error' });
    } finally {
      setLoading(false);
    }
  }, [fetchSettings, fetchDonations, toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaveSettings = async () => {
    let causes; let trustBadges; let impactItems;
    try {
      causes = JSON.parse(causesJson);
      trustBadges = JSON.parse(trustJson);
      impactItems = JSON.parse(impactJson);
    } catch {
      toast({ title: 'Invalid JSON in causes, trust badges, or impact items', status: 'error' });
      return;
    }

    const presetAmounts = presetText.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => n > 0);
    const paymentSteps = paymentStepsText.split('\n').map((s) => s.trim()).filter(Boolean);

    setSavingSettings(true);
    try {
      const res = await fetch(`${API_BASE}/donations/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...settings,
          presetAmounts,
          paymentSteps,
          causes,
          trustBadges,
          impactItems,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      const snap = applySettingsToForm(json.data);
      setSettingsSnapshot(snap);
      lockSettings();
      toast({ title: 'Donate page settings saved', status: 'success' });
    } catch (err) {
      toast({ title: err.message || 'Save failed', status: 'error' });
    } finally {
      setSavingSettings(false);
    }
  };

  const openDetail = (item) => {
    setSelected(item);
    setEditForm({ status: item.status || 'pending', adminNotes: item.adminNotes || '' });
    detailModal.onOpen();
  };

  const handleSaveDonation = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/donations/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      toast({ title: 'Donation updated', status: 'success' });
      detailModal.onClose();
      fetchDonations();
    } catch (err) {
      toast({ title: err.message || 'Update failed', status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`${API_BASE}/donations/${itemToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      toast({ title: 'Donation deleted', status: 'success' });
      deleteModal.onClose();
      setItemToDelete(null);
      fetchDonations();
    } catch (err) {
      toast({ title: err.message || 'Delete failed', status: 'error' });
    }
  };

  const statusBadge = (status) => {
    const opt = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
    return <Badge colorScheme={opt.color} borderRadius="full" px={3} py={0.5} fontSize="xs">{opt.label}</Badge>;
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
            <Icon as={FiHeart} color="#821905" />
            <Text fontSize="xl" fontWeight="800" color={titleColor} fontFamily="'Outfit', sans-serif">
              Donations Management
            </Text>
          </HStack>
          <Text fontSize="sm" color={mutedColor}>
            Manage donate page content, UPI settings, and donor records
          </Text>
        </Box>
        <Button leftIcon={<FiRefreshCw />} onClick={fetchAll} variant="outline" borderRadius="xl" borderColor={borderColor}>
          Refresh
        </Button>
      </Flex>

      <Tabs index={tabIndex} onChange={handleTabChange} variant="soft-rounded" colorScheme="brand">
        <TabList mb={4} gap={2}>
          <Tab borderRadius="xl" fontWeight="700" fontSize="sm"><Icon as={FiList} mr={2} />Donation Records</Tab>
          <Tab borderRadius="xl" fontWeight="700" fontSize="sm"><Icon as={FiSettings} mr={2} />Page Settings</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4} mb={4}>
              {[
                { label: 'Total', value: stats.total, icon: FiHeart, color: '#821905' },
                { label: 'Pending', value: stats.pending, icon: FiClock, color: '#d97706' },
                { label: 'Confirmed', value: stats.confirmed, icon: FiCheckCircle, color: '#16a34a' },
                { label: 'Cancelled', value: stats.cancelled, icon: FiXCircle, color: '#dc2626' },
                { label: 'Confirmed ₹', value: formatAmount(stats.confirmedAmount), icon: FiHeart, color: '#821905' },
              ].map((s) => (
                <Card key={s.label} bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl">
                  <CardBody py={4}>
                    <Text fontSize="xs" color={mutedColor} fontWeight="600" textTransform="uppercase">{s.label}</Text>
                    <Text fontSize="xl" fontWeight="800" color={titleColor}>{s.value ?? 0}</Text>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>

            <Box bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" overflow="hidden">
              <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
                <Flex gap={3} flexWrap="wrap" align="center">
                  <Select maxW="180px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} borderRadius="xl" size="sm">
                    <option value="all">All statuses</option>
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </Select>
                  <InputGroup maxW="300px">
                    <InputLeftElement><Icon as={FiSearch} color={mutedColor} /></InputLeftElement>
                    <Input placeholder="Search donor..." value={search} onChange={(e) => setSearch(e.target.value)} borderRadius="xl" size="sm" />
                  </InputGroup>
                  <Text fontSize="xs" color={mutedColor}>{donations.length} records</Text>
                </Flex>
              </Box>

              {loading ? (
                <Flex justify="center" py={12}><Spinner color="#821905" /></Flex>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr bg={thBg}>
                        {['#', 'Status', 'Amount', 'Donor', 'Cause', 'Date', 'Actions'].map((h) => (
                          <Th key={h} color={thColor} borderColor={tdBorder} fontSize="11px" fontWeight="700" textTransform="uppercase" py={3}>{h}</Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {donations.length === 0 ? (
                        <Tr><Td colSpan={7} textAlign="center" py={10} color={mutedColor}>No donations found.</Td></Tr>
                      ) : donations.map((d, i) => (
                        <Tr key={d.id} _hover={{ bg: rowHover }} cursor="pointer" onClick={() => openDetail(d)} bg={d.status === 'pending' ? pendingRowBg : undefined}>
                          <Td borderColor={tdBorder}>{i + 1}</Td>
                          <Td borderColor={tdBorder}>{statusBadge(d.status)}</Td>
                          <Td borderColor={tdBorder} fontWeight="700" color={titleColor}>{formatAmount(d.amount)}</Td>
                          <Td borderColor={tdBorder}>
                            <Text fontSize="sm" fontWeight="600">{d.name}</Text>
                            <Text fontSize="xs" color={mutedColor}>{d.email}</Text>
                          </Td>
                          <Td borderColor={tdBorder} fontSize="sm">{d.causeLabel || d.causeId}</Td>
                          <Td borderColor={tdBorder} fontSize="xs" color={mutedColor} whiteSpace="nowrap">{formatDate(d.createdAt)}</Td>
                          <Td borderColor={tdBorder} onClick={(e) => e.stopPropagation()}>
                            <HStack>
                              <IconButton aria-label="View" icon={<FiEye />} size="sm" variant="ghost" color="#821905" onClick={() => openDetail(d)} />
                              <Tooltip label="View Letter" hasArrow>
                                <IconButton aria-label="View Letter" icon={<FiFileText />} size="sm" variant="ghost" color="#821905" onClick={() => openLetter(d)} />
                              </Tooltip>
                              <IconButton aria-label="Delete" icon={<FiTrash2 />} size="sm" variant="ghost" colorScheme="red" onClick={() => { setItemToDelete(d); deleteModal.onOpen(); }} />
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </Box>
          </TabPanel>

          <TabPanel px={0}>
            {loading ? (
              <Flex justify="center" py={12}><Spinner color="#821905" /></Flex>
            ) : (
              <Card bg={cardBg} border="1px solid" borderColor={borderColor} borderRadius="2xl" overflow="hidden">
                <Flex
                  px={6}
                  py={4}
                  align="center"
                  justify="space-between"
                  flexWrap="wrap"
                  gap={3}
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  bg={settingsEditMode ? sectionBg : lockedHeaderBg}
                >
                  <HStack spacing={2}>
                    {settingsEditMode ? (
                      <Icon as={FiEdit2} color="#821905" />
                    ) : (
                      <Icon as={FiLock} color={mutedColor} />
                    )}
                    <Box>
                      <Text fontWeight="700" color={titleColor} fontSize="sm">
                        {settingsEditMode ? 'Editing page settings' : 'Page settings locked'}
                      </Text>
                      <Text fontSize="xs" color={mutedColor}>
                        {settingsEditMode
                          ? 'Save or cancel when done'
                          : 'Click Edit to change donate page content'}
                      </Text>
                    </Box>
                  </HStack>
                  <HStack spacing={2}>
                    {settingsEditMode ? (
                      <>
                        <Button size="sm" variant="ghost" borderRadius="xl" onClick={handleCancelSettings}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          leftIcon={<FiSave />}
                          bg="#821905"
                          color="white"
                          _hover={{ bg: '#6e1504' }}
                          borderRadius="xl"
                          onClick={handleSaveSettings}
                          isLoading={savingSettings}
                        >
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        leftIcon={<FiEdit2 />}
                        bg="#821905"
                        color="white"
                        _hover={{ bg: '#6e1504' }}
                        borderRadius="xl"
                        onClick={handleStartEditSettings}
                      >
                        Edit
                      </Button>
                    )}
                  </HStack>
                </Flex>

                <CardBody p={6} position="relative">
                  {!settingsEditMode && (
                    <Box
                      position="absolute"
                      inset={0}
                      zIndex={2}
                      bg={lockOverlayBg}
                      cursor="not-allowed"
                      borderRadius="0 0 2xl 2xl"
                    />
                  )}

                  <Box position="relative" zIndex={1} pointerEvents={settingsEditMode ? 'auto' : 'none'} opacity={settingsEditMode ? 1 : 0.92}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                      <FormControl>
                        <FormLabel fontSize="sm">Hero Subtitle</FormLabel>
                        <Input value={settings.heroSubtitle} onChange={(e) => setSettings((s) => ({ ...s, heroSubtitle: e.target.value }))} borderRadius="xl" isReadOnly={!settingsEditMode} bg={inputBg} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Hero Title</FormLabel>
                        <Input value={settings.heroTitle} onChange={(e) => setSettings((s) => ({ ...s, heroTitle: e.target.value }))} borderRadius="xl" isReadOnly={!settingsEditMode} bg={inputBg} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">UPI ID</FormLabel>
                        <Input value={settings.upiId} onChange={(e) => setSettings((s) => ({ ...s, upiId: e.target.value }))} borderRadius="xl" isReadOnly={!settingsEditMode} bg={inputBg} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">UPI Payee Name</FormLabel>
                        <Input value={settings.upiPayeeName} onChange={(e) => setSettings((s) => ({ ...s, upiPayeeName: e.target.value }))} borderRadius="xl" isReadOnly={!settingsEditMode} bg={inputBg} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Form Badge Text</FormLabel>
                        <Input value={settings.formStepBadge} onChange={(e) => setSettings((s) => ({ ...s, formStepBadge: e.target.value }))} borderRadius="xl" isReadOnly={!settingsEditMode} bg={inputBg} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Form Title</FormLabel>
                        <Input value={settings.formStepTitle} onChange={(e) => setSettings((s) => ({ ...s, formStepTitle: e.target.value }))} borderRadius="xl" isReadOnly={!settingsEditMode} bg={inputBg} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Trust Panel Title</FormLabel>
                        <Input value={settings.trustPanelTitle} onChange={(e) => setSettings((s) => ({ ...s, trustPanelTitle: e.target.value }))} borderRadius="xl" isReadOnly={!settingsEditMode} bg={inputBg} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Impact Panel Title</FormLabel>
                        <Input value={settings.impactPanelTitle} onChange={(e) => setSettings((s) => ({ ...s, impactPanelTitle: e.target.value }))} borderRadius="xl" isReadOnly={!settingsEditMode} bg={inputBg} />
                      </FormControl>
                    </SimpleGrid>

                    <FormControl mb={4}>
                      <FormLabel fontSize="sm">Preset Amounts (comma separated)</FormLabel>
                      <Input value={presetText} onChange={(e) => setPresetText(e.target.value)} placeholder="100, 500, 1000, 2500" borderRadius="xl" isReadOnly={!settingsEditMode} bg={inputBg} />
                    </FormControl>

                    <FormControl mb={4}>
                      <FormLabel fontSize="sm">Payment Steps (one per line)</FormLabel>
                      <Textarea value={paymentStepsText} onChange={(e) => setPaymentStepsText(e.target.value)} rows={4} borderRadius="xl" fontFamily="mono" fontSize="sm" isReadOnly={!settingsEditMode} bg={inputBg} />
                    </FormControl>

                    <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={4} mb={4}>
                      <FormControl>
                        <FormLabel fontSize="sm">Causes (JSON)</FormLabel>
                        <Textarea value={causesJson} onChange={(e) => setCausesJson(e.target.value)} rows={8} borderRadius="xl" fontFamily="mono" fontSize="xs" isReadOnly={!settingsEditMode} bg={inputBg} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Trust Badges (JSON)</FormLabel>
                        <Textarea value={trustJson} onChange={(e) => setTrustJson(e.target.value)} rows={8} borderRadius="xl" fontFamily="mono" fontSize="xs" isReadOnly={!settingsEditMode} bg={inputBg} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Impact Items (JSON)</FormLabel>
                        <Textarea value={impactJson} onChange={(e) => setImpactJson(e.target.value)} rows={8} borderRadius="xl" fontFamily="mono" fontSize="xs" isReadOnly={!settingsEditMode} bg={inputBg} />
                      </FormControl>
                    </SimpleGrid>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm">80G Title</FormLabel>
                        <Input value={settings.taxExemptTitle} onChange={(e) => setSettings((s) => ({ ...s, taxExemptTitle: e.target.value }))} borderRadius="xl" isReadOnly={!settingsEditMode} bg={inputBg} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">80G Description</FormLabel>
                        <Textarea value={settings.taxExemptDescription} onChange={(e) => setSettings((s) => ({ ...s, taxExemptDescription: e.target.value }))} rows={3} borderRadius="xl" isReadOnly={!settingsEditMode} bg={inputBg} />
                      </FormControl>
                    </SimpleGrid>
                  </Box>
                </CardBody>
              </Card>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal
        isOpen={detailModal.isOpen}
        onClose={detailModal.onClose}
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
                bg="linear-gradient(135deg, #821905 0%, #2e0d09 100%)"
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
                    <Icon as={FiHeart} fontSize="22" color="white" />
                  </Flex>
                  <Box flex={1} minW={0}>
                    <Text
                      fontSize="lg"
                      fontWeight="800"
                      color="white"
                      fontFamily="'Outfit', sans-serif"
                      mb={1}
                    >
                      Donation Details
                    </Text>
                    <HStack spacing={2} flexWrap="wrap" align="center">
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
                      <Badge
                        bg="rgba(255,193,8,0.25)"
                        color="#FFC108"
                        borderRadius="md"
                        fontSize="sm"
                        fontWeight="800"
                        px={3}
                        py={1}
                      >
                        {formatAmount(selected.amount)}
                      </Badge>
                    </HStack>
                  </Box>
                </HStack>
              </Box>

              <ModalBody py={5} px={6}>
                <VStack align="stretch" spacing={5}>
                  <HStack spacing={2} color={mutedColor} flexWrap="wrap">
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
                      Donor Information
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
                      <DetailField
                        label="Payment Method"
                        value={(selected.paymentMethod || 'upi').toUpperCase()}
                        icon={FiDollarSign}
                        mutedColor={mutedColor}
                        titleColor={titleColor}
                        borderColor={borderColor}
                        fieldBg={fieldBg}
                      />
                    </SimpleGrid>
                  </Box>

                  <Box>
                    <Text
                      fontSize="11px"
                      fontWeight="700"
                      textTransform="uppercase"
                      letterSpacing="wider"
                      color={thColor}
                      mb={3}
                    >
                      Donation Information
                    </Text>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                      <DetailField
                        label="Amount"
                        value={formatAmount(selected.amount)}
                        icon={FiDollarSign}
                        mutedColor={mutedColor}
                        titleColor={titleColor}
                        borderColor={borderColor}
                        fieldBg={fieldBg}
                      />
                      <DetailField
                        label="Cause"
                        value={selected.causeLabel || selected.causeId || 'General'}
                        icon={FiTag}
                        mutedColor={mutedColor}
                        titleColor={titleColor}
                        borderColor={borderColor}
                        fieldBg={fieldBg}
                      />
                    </SimpleGrid>
                  </Box>

                  {selected.screenshotUrl && (
                    <Box>
                      <Text
                        fontSize="11px"
                        fontWeight="700"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        color={thColor}
                        mb={3}
                      >
                        Payment Screenshot / भुगतान स्क्रीनशॉट
                      </Text>
                      <Box
                        borderRadius="xl"
                        border="1px solid"
                        borderColor={borderColor}
                        bg={fieldBg}
                        p={3}
                        overflow="hidden"
                        textAlign="center"
                      >
                        <Image
                          src={resolveImageUrl(selected.screenshotUrl)}
                          alt="Payment Screenshot"
                          maxH="280px"
                          objectFit="contain"
                          borderRadius="lg"
                          mx="auto"
                          cursor="pointer"
                          onClick={() => window.open(resolveImageUrl(selected.screenshotUrl), '_blank')}
                          fallbackSrc="https://via.placeholder.com/280?text=Error+Loading+Image"
                        />
                        <Text fontSize="11px" color={mutedColor} mt={2}>
                          Click on the image to open in full size / फुल साइज़ में देखने के लिए फोटो पर क्लिक करें
                        </Text>
                      </Box>
                    </Box>
                  )}

                  <Box
                    p={4}
                    borderRadius="xl"
                    bg={sectionBg}
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <HStack justify="space-between" mb={4} flexWrap="wrap" gap={2}>
                      <Text
                        fontSize="11px"
                        fontWeight="700"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        color={thColor}
                      >
                        Admin Management
                      </Text>
                      <HStack spacing={2}>
                        <Button
                          size="xs"
                          leftIcon={<FiFileText />}
                          bg="#821905"
                          color="white"
                          _hover={{ bg: '#6e1504' }}
                          borderRadius="lg"
                          onClick={() => { detailModal.onClose(); setTimeout(() => openLetter(selected), 200); }}
                        >
                          View Letter
                        </Button>
                        <Button
                          as="a"
                          href={`mailto:${selected.email}?subject=${encodeURIComponent(`Thank you for your donation of ${formatAmount(selected.amount)}`)}`}
                          size="xs"
                          leftIcon={<FiExternalLink />}
                          variant="outline"
                          borderRadius="lg"
                          borderColor={borderColor}
                          color="#821905"
                          _hover={{ bg: sectionBg }}
                        >
                          Email Donor
                        </Button>
                      </HStack>
                    </HStack>
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
                                bg={isActive ? '#821905' : 'transparent'}
                                color={isActive ? 'white' : titleColor}
                                borderColor={isActive ? '#821905' : borderColor}
                                _hover={{
                                  bg: isActive ? '#6e1504' : sectionBg,
                                  borderColor: '#821905',
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
                          placeholder="Payment reference, UTR, receipt sent, follow-up notes..."
                          rows={4}
                          borderRadius="xl"
                          borderColor={borderColor}
                          bg={cardBg}
                          fontSize="sm"
                          _focus={{ borderColor: '#821905', boxShadow: '0 0 0 1px #821905' }}
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
                  onClick={detailModal.onClose}
                  borderRadius="xl"
                  w={{ base: 'full', sm: 'auto' }}
                  color={mutedColor}
                >
                  Close
                </Button>
                <Button
                  flex={1}
                  bg="#821905"
                  color="white"
                  _hover={{ bg: '#6e1504' }}
                  onClick={handleSaveDonation}
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

      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Delete Donation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Delete donation from <strong>{itemToDelete?.name}</strong> ({formatAmount(itemToDelete?.amount)})?
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={deleteModal.onClose}>Cancel</Button>
            <Button colorScheme="red" onClick={handleDelete}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <DonationLetterModal
        isOpen={letterModal.isOpen}
        onClose={letterModal.onClose}
        donation={letterDonation}
      />
    </VStack>
  );
};

export default DonationsManagement;
