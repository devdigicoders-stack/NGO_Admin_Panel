import { useState, useEffect, useRef } from 'react';
import {
  Box, Text, VStack, HStack, Input, InputGroup, InputLeftElement,
  Table, Thead, Tbody, Tr, Th, Td, Badge,
  Button, IconButton, Tooltip, useColorModeValue, Icon, Flex, Spinner,
  Tabs, TabList, Tab,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  useDisclosure, Image, Center, useToast
} from '@chakra-ui/react';
import { FiSearch, FiCreditCard, FiDownload, FiUser, FiEdit, FiTrash2, FiFileText } from 'react-icons/fi';
import { apiClient } from '../utils/apiClient';
import { orgs } from '../utils/registrationUtils';
import { resolveImageUrl } from '../utils/imageUrl';
import IDCardGenerator from '../components/IDCardGenerator';
import JoiningLetterGenerator from '../components/JoiningLetterGenerator';

const RegistrationsManagement = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  // State for ID Card modal preview
  const [selectedReg, setSelectedReg] = useState(null);
  const [generatedCardData, setGeneratedCardData] = useState(null);
  const [generatedLetterData, setGeneratedLetterData] = useState(null);
  const [activeDocument, setActiveDocument] = useState('card'); // 'card', 'letter', 'review', or 'edit'
  const [editFormData, setEditFormData] = useState({});
  const [updateRole, setUpdateRole] = useState('सदस्य');
  const [updateValidFrom, setUpdateValidFrom] = useState('');
  const [updateValidUntil, setUpdateValidUntil] = useState('');
  const [updating, setUpdating] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure();
  const cancelRef = useRef();
  const [regToDelete, setRegToDelete] = useState(null);
  const toast = useToast();

  // Chakra UI colors matching theme.js
  const cardBg = useColorModeValue('#ffffff', '#2a0c06');
  const borderCol = useColorModeValue('#f0c4bb', '#4a1208');
  const titleColor = useColorModeValue('#2e0d09', '#f5e0dc');
  const textColor = useColorModeValue('#5c1204', '#f0d8d4');
  const descColor = useColorModeValue('#a05040', '#c08070');
  const thColor = useColorModeValue('#821905', '#e8907a');
  const thBg = useColorModeValue('rgba(130,25,5,0.04)', 'rgba(232,144,122,0.06)');
  const rowHover = useColorModeValue('rgba(130,25,5,0.03)', 'rgba(232,144,122,0.05)');
  const tdBorder = useColorModeValue('#faeae7', 'rgba(255,255,255,0.06)');
  const inputBg = useColorModeValue('#fdf4f2', 'rgba(255,255,255,0.1)');
  const placeholderBg = useColorModeValue('#fdf4f2', 'rgba(255,255,255,0.08)');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient('/registrations');
      if (res.success) {
        setRegistrations(res.data || []);
      } else {
        setError(res.message || 'पंजीकरण डेटा लोड करने में विफल।');
      }
    } catch (err) {
      console.error(err);
      setError('सर्वर से कनेक्ट करने में असमर्थ।');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDocument = (reg, docType) => {
    setSelectedReg(reg);
    setActiveDocument(docType);
    setGeneratedCardData(null);
    setGeneratedLetterData(null);
    onOpen();
  };

  const handleOpenReview = (reg) => {
    setSelectedReg(reg);
    setActiveDocument('review');
    setUpdateRole(reg.role || 'सदस्य');

    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);
    
    setUpdateValidFrom(reg.validFrom || today.toISOString().split('T')[0]);
    setUpdateValidUntil(reg.validUntil || nextYear.toISOString().split('T')[0]);

    onOpen();
  };

  const handleOpenEdit = (reg) => {
    setSelectedReg(reg);
    setEditFormData(reg.formData || {});
    setActiveDocument('edit');
    onOpen();
  };

  const confirmDelete = (reg) => {
    setRegToDelete(reg);
    onAlertOpen();
  };

  const executeDelete = async () => {
    if (!regToDelete) return;
    try {
      const res = await apiClient(`/registrations/${regToDelete.id}`, { method: 'DELETE' });
      if (res.success) {
        setRegistrations(prev => prev.filter(r => r.id !== regToDelete.id));
        toast({ title: 'पंजीकरण हटा दिया गया।', status: 'success', duration: 3000, isClosable: true });
      } else {
        toast({ title: res.message || 'पंजीकरण हटाने में विफल।', status: 'error', duration: 3000, isClosable: true });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'सर्वर एरर।', status: 'error', duration: 3000, isClosable: true });
    } finally {
      onAlertClose();
      setRegToDelete(null);
    }
  };

  const handleSaveEdit = async () => {
    setUpdating(true);
    try {
      const updatedReg = { ...selectedReg, formData: editFormData };
      const res = await apiClient(`/registrations/${selectedReg.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedReg)
      });
      if (res.success) {
        setRegistrations(prev => prev.map(r => r.id === selectedReg.id ? res.data : r));
        toast({ title: 'पंजीकरण डेटा अपडेट हो गया!', status: 'success', duration: 3000, isClosable: true });
        onClose();
      } else {
        toast({ title: res.message || 'डेटा अपडेट करने में विफल।', status: 'error', duration: 3000, isClosable: true });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'सर्वर एरर।', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await apiClient(`/registrations/${selectedReg.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, role: updateRole, validFrom: updateValidFrom, validUntil: updateValidUntil })
      });
      if (res.success) {
        setRegistrations(prev => prev.map(r => r.id === selectedReg.id ? { ...r, status: newStatus, role: updateRole, validFrom: updateValidFrom, validUntil: updateValidUntil } : r));
        setSelectedReg(prev => ({ ...prev, status: newStatus, role: updateRole, validFrom: updateValidFrom, validUntil: updateValidUntil }));
        toast({
          title: newStatus === 'approved' ? "पंजीकरण स्वीकृत (Approved) हो गया!" : "पंजीकरण अस्वीकृत (Rejected) कर दिया गया।",
          status: newStatus === 'approved' ? 'success' : 'error',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
      } else {
        toast({ title: res.message || 'स्टेटस अपडेट करने में विफल।', status: 'error', duration: 3000, isClosable: true });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'सर्वर एरर।', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadCard = () => {
    if (!generatedCardData || !selectedReg) return;
    const link = document.createElement('a');
    const userName = selectedReg.formData?.name || selectedReg.regNumber.replace(/\//g, '_');
    link.download = `${userName}_ID_Card.png`;
    link.href = generatedCardData;
    link.click();
  };

  const handleDownloadCardPDF = () => {
    if (!generatedCardData?.front || !generatedCardData?.back || !selectedReg) return;
    
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const cardW = 85.6;
      const cardH = 54.0;
      const x = (210 - cardW) / 2;
      const yFront = 20;
      const yBack = yFront + cardH + 15;
      
      doc.setFontSize(12);
      doc.setTextColor(130, 25, 5);
      doc.text(`ID Card - ${selectedReg.regNumber}`, 105, 12, { align: 'center' });
      
      doc.addImage(generatedCardData.front, 'PNG', x, yFront, cardW, cardH);
      doc.addImage(generatedCardData.back, 'PNG', x, yBack, cardW, cardH);
      
      const userName = selectedReg.formData?.name || selectedReg.regNumber.replace(/\//g, '_');
      doc.save(`${userName}_ID_Card.pdf`);
    }).catch(err => {
      console.error('Failed to generate PDF:', err);
      toast({ title: 'PDF डाउनलोड करने में त्रुटि हुई।', status: 'error', duration: 3000, isClosable: true });
    });
  };

  // Filter registrations by search term and active samuday tab
  const filteredRegs = registrations.filter((reg) => {
    const fData = reg.formData || {};
    const name = fData.name || '';
    const mobile = fData.mobile || '';
    const aadhar = fData.aadhar || '';
    const regNumber = reg.regNumber || '';

    const matchesSearch = 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mobile.includes(searchTerm) ||
      aadhar.includes(searchTerm) ||
      regNumber.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'All') return matchesSearch;
    return matchesSearch && reg.orgId === activeTab;
  });

  const getOrgShortName = (orgId) => {
    const org = orgs.find(o => o.id === orgId);
    return org ? org.short : 'सामान्य';
  };

  const getOrgColor = (orgId) => {
    const org = orgs.find(o => o.id === orgId);
    return org ? org.color : '#475569';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <VStack spacing={5} align="stretch" w="full">
      {/* Header Title */}
      <Flex direction={{ base: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ base: 'flex-start', sm: 'center' }} gap={4}>
        <Box>
          <Text fontSize="2xl" fontFamily="'Outfit', sans-serif" fontWeight="800" color={titleColor}>
            पंजीकरण प्रबंधन (Registrations)
          </Text>
          <Text fontSize="xs" color={descColor}>
            सभी समुदायों के पंजीकृत सदस्यों की सूची देखें, खोजें और उनके ID Card डाउनलोड करें।
          </Text>
        </Box>
        <Button leftIcon={<FiSearch />} bg="#821905" color="white" borderRadius="xl" size="md" _hover={{ bg: '#6e1504' }} onClick={fetchRegistrations}>
          रिफ्रेश करें
        </Button>
      </Flex>

      {/* Filter and Search Container */}
      <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="2xl" shadow="sm" overflow="hidden">
        {/* Tab & Search Bar */}
        <Box p={4} borderBottom="1px solid" borderColor={borderCol}>
          <Flex direction={{ base: 'column', lg: 'row' }} justify="space-between" align={{ base: 'stretch', lg: 'center' }} gap={4}>
            
            {/* Horizontal Scrollable Tabs */}
            <Box overflowX="auto" maxW="100%" pb={{ base: 2, lg: 0 }}>
              <Tabs 
                variant="soft-rounded" 
                size="sm" 
                index={activeTab === 'All' ? 0 : orgs.findIndex(o => o.id === activeTab) + 1}
                onChange={(index) => {
                  if (index === 0) {
                    setActiveTab('All');
                  } else {
                    setActiveTab(orgs[index - 1].id);
                  }
                }}
              >
                <TabList gap={1} display="flex" flexWrap="nowrap">
                  <Tab borderRadius="xl" fontWeight="600" fontSize="xs" color={descColor} _selected={{ bg: '#821905', color: 'white' }} whiteSpace="nowrap">
                    सभी ({registrations.length})
                  </Tab>
                  {orgs.map((o) => {
                    const count = registrations.filter(r => r.orgId === o.id).length;
                    return (
                      <Tab key={o.id} borderRadius="xl" fontWeight="600" fontSize="xs" color={descColor} _selected={{ bg: o.color, color: 'white' }} whiteSpace="nowrap">
                        {o.icon} {o.short} ({count})
                      </Tab>
                    );
                  })}
                </TabList>
              </Tabs>
            </Box>

            {/* Search Box */}
            <InputGroup maxW={{ base: 'full', lg: 'xs' }} flexShrink={0}>
              <InputLeftElement pointerEvents="none"><FiSearch color="#a05040" /></InputLeftElement>
              <Input 
                placeholder="नाम, मोबाइल, आधार या ID खोजें..." 
                variant="filled" 
                bg={inputBg} 
                borderRadius="xl" 
                fontSize="sm" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                border="1px solid" 
                borderColor={borderCol} 
                color={titleColor} 
                _placeholder={{ color: descColor }} 
                _focus={{ bg: cardBg, borderColor: '#821905' }} 
              />
            </InputGroup>
          </Flex>
        </Box>

        {/* Content Table */}
        {loading ? (
          <Box py={20} textAlign="center">
            <Spinner size="lg" color="#821905" thickness="4px" />
            <Text mt={4} color={descColor} fontSize="sm">सदस्यों की सूची लोड हो रही है...</Text>
          </Box>
        ) : error ? (
          <Box py={20} textAlign="center">
            <Text color="red.500" fontWeight="bold">{error}</Text>
            <Button mt={4} size="sm" onClick={fetchRegistrations} colorScheme="brand">पुनः प्रयास करें</Button>
          </Box>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="md">
              <Thead>
                <Tr bg={thBg}>
                  <Th color={thColor} borderColor={tdBorder} fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="wider" py={3} pl={5}>सदस्य प्रोफाइल</Th>
                  <Th color={thColor} borderColor={tdBorder} fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="wider" py={3}>रजिस्ट्रेशन नंबर</Th>
                  <Th color={thColor} borderColor={tdBorder} fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="wider" py={3}>समुदाय/कोष्ठ</Th>
                  <Th color={thColor} borderColor={tdBorder} fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="wider" py={3}>पिता/पति का नाम</Th>
                  <Th color={thColor} borderColor={tdBorder} fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="wider" py={3}>मोबाइल</Th>
                  <Th color={thColor} borderColor={tdBorder} fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="wider" py={3}>स्टेटस / पद</Th>
                  <Th color={thColor} borderColor={tdBorder} fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="wider" py={3}>पंजीकरण तिथि</Th>
                  <Th color={thColor} borderColor={tdBorder} fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="wider" py={3} pr={5} textAlign="right">एक्शन</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredRegs.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={12} color={descColor} borderColor={tdBorder}>
                      कोई पंजीकरण नहीं मिला।
                    </Td>
                  </Tr>
                ) : (
                  filteredRegs.map((reg) => {
                    const fData = reg.formData || {};
                    return (
                      <Tr key={reg.id} _hover={{ bg: rowHover }} transition="background-color 0.15s ease">
                        {/* Member Profile */}
                        <Td borderColor={tdBorder} py={3} pl={5}>
                          <HStack spacing={3}>
                            {/* Member Photo — native img handles base64 & URL reliably */}
                            {fData.photo ? (
                              <img
                                src={resolveImageUrl(fData.photo)}
                                alt={fData.name || 'photo'}
                                style={{
                                  width: '36px',
                                  height: '44px',
                                  objectFit: 'cover',
                                  borderRadius: '6px',
                                  border: `1px solid ${borderCol}`,
                                  flexShrink: 0,
                                  display: 'block',
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const sibling = e.currentTarget.nextElementSibling;
                                  if (sibling) sibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <Flex
                              w="36px" h="44px"
                              bg={placeholderBg}
                              borderRadius="6px"
                              align="center"
                              justify="center"
                              border="1px solid"
                              borderColor={borderCol}
                              flexShrink={0}
                              display={fData.photo ? 'none' : 'flex'}
                            >
                              <Icon as={FiUser} color={descColor} boxSize={4} />
                            </Flex>
                            <Box>
                              <Text fontSize="sm" fontWeight="700" color={titleColor}>{fData.name || 'N/A'}</Text>
                              <Text fontSize="11px" color={descColor}>आधार: {fData.aadhar || 'N/A'}</Text>
                            </Box>
                          </HStack>
                        </Td>

                        {/* Reg Number */}
                        <Td borderColor={tdBorder} py={3}>
                          <Badge 
                            variant="subtle" 
                            colorScheme="brand" 
                            px={2} 
                            py={0.5} 
                            borderRadius="md" 
                            fontFamily="mono" 
                            fontSize="xs"
                          >
                            {reg.regNumber}
                          </Badge>
                        </Td>

                        {/* Community Wing */}
                        <Td borderColor={tdBorder} py={3}>
                          <Badge 
                            style={{ 
                              background: `${getOrgColor(reg.orgId)}15`,
                              color: getOrgColor(reg.orgId),
                              border: `1px solid ${getOrgColor(reg.orgId)}30`
                            }} 
                            px={2.5} 
                            py={0.5} 
                            borderRadius="full" 
                            fontSize="11px" 
                            fontWeight="700"
                          >
                            {getOrgShortName(reg.orgId)}
                          </Badge>
                        </Td>

                        {/* Father's Name */}
                        <Td borderColor={tdBorder} py={3}>
                          <Text fontSize="xs" fontWeight="600" color={textColor}>{fData.father || 'N/A'}</Text>
                        </Td>

                        {/* Mobile */}
                        <Td borderColor={tdBorder} py={3}>
                          <Text fontSize="xs" fontWeight="600" color={textColor}>{fData.mobile || 'N/A'}</Text>
                        </Td>

                        {/* Status / Role */}
                        <Td borderColor={tdBorder} py={3}>
                          <VStack align="start" spacing={1}>
                            <Badge colorScheme={reg.status === 'approved' ? 'green' : reg.status === 'rejected' ? 'red' : 'orange'} fontSize="10px">
                              {reg.status === 'approved' ? 'Approved' : reg.status === 'rejected' ? 'Rejected' : 'Pending'}
                            </Badge>
                            {reg.status === 'approved' && (
                              <Text fontSize="10px" color={descColor} fontWeight="600">{reg.role || 'सदस्य'}</Text>
                            )}
                          </VStack>
                        </Td>

                        {/* Registration Date */}
                        <Td borderColor={tdBorder} py={3}>
                          <Text fontSize="xs" color={descColor} fontWeight="500">{formatDate(reg.createdAt)}</Text>
                        </Td>

                        {/* Actions */}
                        <Td borderColor={tdBorder} py={3} pr={5} textAlign="right">
                          <HStack spacing={2} justify="flex-end" flexWrap="nowrap">
                            <Tooltip label="एडिट करें" hasArrow placement="top">
                              <IconButton 
                                icon={<FiEdit />} 
                                size="sm" 
                                borderRadius="lg" 
                                colorScheme="teal" 
                                variant="ghost"
                                onClick={() => handleOpenEdit(reg)}
                                aria-label="Edit"
                              />
                            </Tooltip>
                            <Tooltip label="रिव्यू करें" hasArrow placement="top">
                              <IconButton 
                                icon={<FiUser />} 
                                size="sm" 
                                borderRadius="lg" 
                                colorScheme="blue" 
                                variant="ghost"
                                onClick={() => handleOpenReview(reg)}
                                aria-label="Review"
                              />
                            </Tooltip>
                            <Tooltip label="ID Card / Letter देखें" hasArrow placement="top">
                              <IconButton 
                                icon={<FiCreditCard />} 
                                size="sm" 
                                borderRadius="lg" 
                                colorScheme="brand" 
                                variant="ghost"
                                onClick={() => handleOpenDocument(reg, 'card')}
                                aria-label="ID / Letter"
                              />
                            </Tooltip>
                            <Tooltip label="डिलीट करें" hasArrow placement="top">
                              <IconButton 
                                icon={<FiTrash2 />} 
                                size="sm" 
                                borderRadius="lg" 
                                colorScheme="red" 
                                variant="ghost"
                                onClick={() => confirmDelete(reg)}
                                aria-label="Delete"
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      {/* ID Card / Joining Letter Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size={activeDocument === 'card' ? "4xl" : "2xl"} isCentered>
        <ModalOverlay />
        <ModalContent bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="2xl" overflow="hidden">
          <ModalHeader borderBottom="1px solid" borderColor={borderCol} py={4}>
            <HStack spacing={2}>
              <Icon as={activeDocument === 'review' ? FiUser : activeDocument === 'edit' ? FiEdit : (activeDocument === 'card' ? FiCreditCard : FiFileText)} color="#821905" />
              <Text fontSize="md" fontWeight="800" color={titleColor}>
                {activeDocument === 'review' ? 'रजिस्ट्रेशन रिव्यू (Registration Review)' : activeDocument === 'edit' ? 'डेटा एडिट करें (Edit Data)' : (activeDocument === 'card' ? 'सदस्य पहचान पत्र (ID Card Preview)' : 'जॉइनिंग लेटर (Joining Letter Preview)')}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color={titleColor} />
          <ModalBody p={6}>
            {selectedReg && (
              <VStack spacing={6} align="center" w="full">

                {/* ---------- REVIEW REGISTRATION ---------- */}
                {activeDocument === 'review' && (
                  <VStack align="stretch" w="full" spacing={4}>
                    <HStack justify="space-between" align="flex-start">
                      <Box>
                        <Text fontSize="xl" fontWeight="700" color={titleColor}>{selectedReg.formData.name || 'N/A'}</Text>
                        <Text fontSize="sm" color={descColor}>रजिस्ट्रेशन नंबर: {selectedReg.regNumber}</Text>
                        <Badge mt={2} colorScheme={selectedReg.status === 'approved' ? 'green' : selectedReg.status === 'rejected' ? 'red' : 'orange'}>
                          {selectedReg.status === 'approved' ? 'Approved' : selectedReg.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </Badge>
                      </Box>
                      {selectedReg.formData.photo && (
                        <Image src={resolveImageUrl(selectedReg.formData.photo)} w="80px" h="100px" objectFit="cover" borderRadius="md" border={`1px solid ${borderCol}`} />
                      )}
                    </HStack>

                    <Box bg={thBg} p={4} borderRadius="xl" border="1px solid" borderColor={borderCol}>
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between"><Text fontSize="sm" fontWeight="600">समुदाय:</Text><Text fontSize="sm">{getOrgShortName(selectedReg.orgId)}</Text></HStack>
                        <HStack justify="space-between"><Text fontSize="sm" fontWeight="600">पिता/पति का नाम:</Text><Text fontSize="sm">{selectedReg.formData.father}</Text></HStack>
                        <HStack justify="space-between"><Text fontSize="sm" fontWeight="600">जन्म तिथि:</Text><Text fontSize="sm">{selectedReg.formData.dob}</Text></HStack>
                        <HStack justify="space-between"><Text fontSize="sm" fontWeight="600">मोबाइल:</Text><Text fontSize="sm">{selectedReg.formData.mobile}</Text></HStack>
                        <HStack justify="space-between"><Text fontSize="sm" fontWeight="600">ईमेल:</Text><Text fontSize="sm">{selectedReg.formData.email || '-'}</Text></HStack>
                        <HStack justify="space-between"><Text fontSize="sm" fontWeight="600">आधार नंबर:</Text><Text fontSize="sm">{selectedReg.formData.aadhar}</Text></HStack>
                        <HStack justify="space-between"><Text fontSize="sm" fontWeight="600">पता:</Text><Text fontSize="sm" textAlign="right">{selectedReg.formData.address}<br/>पिन: {selectedReg.formData.pincode}</Text></HStack>
                      </VStack>
                    </Box>

                    {selectedReg.screenshotUrl && (
                      <Box pt={4} borderTop="1px solid" borderColor={borderCol}>
                        <Text fontSize="sm" fontWeight="700" color={titleColor} mb={2}>पेमेंट स्क्रीनशॉट (Payment Screenshot):</Text>
                        <Text fontSize="sm" color={descColor} mb={2} fontWeight="600">राशि (Amount): ₹{selectedReg.amount || 0}</Text>
                        <a href={resolveImageUrl(selectedReg.screenshotUrl)} target="_blank" rel="noreferrer">
                          <Image src={resolveImageUrl(selectedReg.screenshotUrl)} alt="Payment Screenshot" borderRadius="md" border={`1px solid ${borderCol}`} maxH="250px" objectFit="contain" cursor="pointer" _hover={{ opacity: 0.9 }} />
                        </a>
                      </Box>
                    )}

                    <Box pt={4} borderTop="1px solid" borderColor={borderCol}>
                      <Text fontSize="sm" fontWeight="700" color={titleColor} mb={2}>पद (Role) असाइन करें:</Text>
                      <Input 
                        value={updateRole} 
                        onChange={(e) => setUpdateRole(e.target.value)} 
                        placeholder="जैसे: सदस्य, जिला अध्यक्ष" 
                        size="md" 
                        borderRadius="lg"
                        bg={inputBg}
                        borderColor={borderCol}
                      />
                    </Box>

                    <Box pt={4} borderTop="1px solid" borderColor={borderCol}>
                      <Text fontSize="sm" fontWeight="700" color={titleColor} mb={2}>वैधता (Validity) सेट करें:</Text>
                      <HStack spacing={4}>
                        <Box w="full">
                          <Text fontSize="xs" color={descColor} mb={1}>कब से (Start Date)</Text>
                          <Input 
                            type="date"
                            value={updateValidFrom} 
                            onChange={(e) => setUpdateValidFrom(e.target.value)} 
                            size="md" 
                            borderRadius="lg"
                            bg={inputBg}
                            borderColor={borderCol}
                          />
                        </Box>
                        <Box w="full">
                          <Text fontSize="xs" color={descColor} mb={1}>कब तक (End Date)</Text>
                          <Input 
                            type="date"
                            value={updateValidUntil} 
                            onChange={(e) => setUpdateValidUntil(e.target.value)} 
                            size="md" 
                            borderRadius="lg"
                            bg={inputBg}
                            borderColor={borderCol}
                          />
                        </Box>
                      </HStack>
                    </Box>

                    <HStack pt={4} justify="flex-end" w="full" spacing={3}>
                      {selectedReg.status !== 'rejected' && (
                        <Button 
                          colorScheme="red" 
                          variant="outline"
                          isLoading={updating}
                          onClick={() => handleUpdateStatus('rejected')}
                        >
                          रिजेक्ट करें (Reject)
                        </Button>
                      )}
                      <Button 
                        colorScheme="green" 
                        isLoading={updating}
                        onClick={() => handleUpdateStatus('approved')}
                      >
                        {selectedReg.status === 'approved' ? 'अपडेट करें (Update)' : 'अप्रूव करें (Approve)'}
                      </Button>
                    </HStack>
                  </VStack>
                )}

                {/* ---------- EDIT REGISTRATION DATA ---------- */}
                {activeDocument === 'edit' && (
                  <VStack align="stretch" w="full" spacing={4}>
                    <Text fontSize="sm" color={descColor} mb={2}>सदस्य का विवरण बदलें। सभी जगह डेटा अपने आप अपडेट हो जाएगा।</Text>
                    
                    <Box bg={thBg} p={4} borderRadius="xl" border="1px solid" borderColor={borderCol}>
                      <VStack align="stretch" spacing={4}>
                        <Box>
                          <Text fontSize="xs" fontWeight="700" color={titleColor} mb={1}>सदस्य की फोटो (Profile Photo)</Text>
                          <HStack spacing={4} align="center">
                            {editFormData.photo && (
                              <Image 
                                src={editFormData.photo.startsWith('data:image') ? editFormData.photo : resolveImageUrl(editFormData.photo)} 
                                boxSize="60px" 
                                objectFit="cover" 
                                borderRadius="md" 
                                border={`1px solid ${borderCol}`} 
                              />
                            )}
                            <Input 
                              type="file" 
                              accept="image/*" 
                              p={1}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setEditFormData({ ...editFormData, photo: reader.result });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} 
                              bg={cardBg} 
                              borderColor={borderCol} 
                            />
                          </HStack>
                        </Box>
                        <Box>
                          <Text fontSize="xs" fontWeight="700" color={titleColor} mb={1}>पूरा नाम (Full Name)</Text>
                          <Input value={editFormData.name || ''} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} bg={cardBg} borderColor={borderCol} />
                        </Box>
                        <Box>
                          <Text fontSize="xs" fontWeight="700" color={titleColor} mb={1}>पिता/पति का नाम (Father/Husband Name)</Text>
                          <Input value={editFormData.father || ''} onChange={(e) => setEditFormData({...editFormData, father: e.target.value})} bg={cardBg} borderColor={borderCol} />
                        </Box>
                        <HStack>
                          <Box w="full">
                            <Text fontSize="xs" fontWeight="700" color={titleColor} mb={1}>जन्म तिथि (DOB)</Text>
                            <Input type="date" value={editFormData.dob || ''} onChange={(e) => setEditFormData({...editFormData, dob: e.target.value})} bg={cardBg} borderColor={borderCol} />
                          </Box>
                          <Box w="full">
                            <Text fontSize="xs" fontWeight="700" color={titleColor} mb={1}>मोबाइल नंबर (Mobile)</Text>
                            <Input value={editFormData.mobile || ''} onChange={(e) => setEditFormData({...editFormData, mobile: e.target.value})} bg={cardBg} borderColor={borderCol} />
                          </Box>
                        </HStack>
                        <HStack>
                          <Box w="full">
                            <Text fontSize="xs" fontWeight="700" color={titleColor} mb={1}>ईमेल (Email)</Text>
                            <Input value={editFormData.email || ''} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} bg={cardBg} borderColor={borderCol} />
                          </Box>
                          <Box w="full">
                            <Text fontSize="xs" fontWeight="700" color={titleColor} mb={1}>आधार नंबर (Aadhar)</Text>
                            <Input value={editFormData.aadhar || ''} onChange={(e) => setEditFormData({...editFormData, aadhar: e.target.value})} bg={cardBg} borderColor={borderCol} />
                          </Box>
                        </HStack>
                        <Box>
                          <Text fontSize="xs" fontWeight="700" color={titleColor} mb={1}>पूरा पता (Address)</Text>
                          <Input value={editFormData.address || ''} onChange={(e) => setEditFormData({...editFormData, address: e.target.value})} bg={cardBg} borderColor={borderCol} />
                        </Box>
                        <Box>
                          <Text fontSize="xs" fontWeight="700" color={titleColor} mb={1}>पिनकोड (Pincode)</Text>
                          <Input value={editFormData.pincode || ''} onChange={(e) => setEditFormData({...editFormData, pincode: e.target.value})} bg={cardBg} borderColor={borderCol} />
                        </Box>
                      </VStack>
                    </Box>

                    <HStack pt={4} justify="flex-end" w="full" spacing={3}>
                      <Button colorScheme="gray" variant="outline" onClick={onClose}>
                        रद्द करें (Cancel)
                      </Button>
                      <Button colorScheme="teal" isLoading={updating} onClick={handleSaveEdit}>
                        सेव करें (Save Changes)
                      </Button>
                    </HStack>
                  </VStack>
                )}
                
                {/* ---------- ID CARD VIEW ---------- */}
                {activeDocument === 'card' && (
                  generatedCardData ? (
                    <VStack spacing={6} w="full">
                      <Flex direction={{ base: 'column', md: 'row' }} gap={6} justify="center" w="full">
                        {/* Front Card Column */}
                        <Box textAlign="center" flex="1" maxW="420px">
                        <Text fontSize="xs" fontWeight="700" color={textColor} mb={2} textTransform="uppercase" letterSpacing="wider">
                          सामने का भाग (Front)
                        </Text>
                        <Image 
                          src={generatedCardData.front} 
                          alt="Front ID Card" 
                          borderRadius="xl"
                          boxShadow="md"
                          maxW="100%"
                          border="1px solid"
                          borderColor={borderCol}
                        />
                      </Box>

                      {/* Back Card Column */}
                      <Box textAlign="center" flex="1" maxW="420px">
                        <Text fontSize="xs" fontWeight="700" color={textColor} mb={2} textTransform="uppercase" letterSpacing="wider">
                          पीछे का भाग (Back)
                        </Text>
                        <Image 
                          src={generatedCardData.back} 
                          alt="Back ID Card" 
                          borderRadius="xl"
                          boxShadow="md"
                          maxW="100%"
                          border="1px solid"
                          borderColor={borderCol}
                        />
                        </Box>
                      </Flex>

                      <Button
                        colorScheme="green"
                        leftIcon={<FiDownload />}
                        size="md"
                        px={8}
                        borderRadius="xl"
                        onClick={handleDownloadCardPDF}
                        boxShadow="md"
                      >
                        ID Card PDF (दोनों साइड) डाउनलोड करें
                      </Button>
                    </VStack>
                  ) : (
                    <Center py={10} w="full" flexDirection="column" gap={3}>
                      <Spinner size="md" color="#821905" />
                      <Text fontSize="xs" color={descColor}>ID Card उत्पन्न हो रहा है...</Text>
                    </Center>
                  )
                )}

                {/* ---------- JOINING LETTER VIEW ---------- */}
                {activeDocument === 'letter' && (
                  generatedLetterData ? (
                    <Box textAlign="center" w="full" maxW="500px" mx="auto">
                      <Image 
                        src={generatedLetterData} 
                        alt="Joining Letter" 
                        borderRadius="xl"
                        boxShadow="md"
                        maxW="100%"
                        border="1px solid"
                        borderColor={borderCol}
                      />
                      <Button
                        colorScheme="teal"
                        leftIcon={<FiDownload />}
                        mt={4}
                        w="full"
                        size="md"
                        borderRadius="xl"
                        onClick={() => {
                          const link = document.createElement('a');
                          const userName = selectedReg.formData?.name || selectedReg.regNumber.replace(/\//g, '_');
                          link.download = `${userName}_Joining_Letter.png`;
                          link.href = generatedLetterData;
                          link.click();
                        }}
                      >
                        जॉइनिंग लेटर डाउनलोड करें
                      </Button>
                    </Box>
                  ) : (
                    <Center py={10} w="full" flexDirection="column" gap={3}>
                      <Spinner size="md" color="teal.500" />
                      <Text fontSize="xs" color={descColor}>जॉइनिंग लेटर उत्पन्न हो रहा है...</Text>
                    </Center>
                  )
                )}

                {/* Generator Components (Hidden Canvas) */}
                <Box display="none">
                  {(activeDocument === 'card' || activeDocument === 'letter') && (
                    <IDCardGenerator
                      orgId={selectedReg.orgId}
                      formData={{ ...selectedReg.formData, role: selectedReg.role, validFrom: selectedReg.validFrom, validUntil: selectedReg.validUntil }}
                      regNumber={selectedReg.regNumber}
                      onGenerated={setGeneratedCardData}
                    />
                  )}
                  {(activeDocument === 'card' || activeDocument === 'letter') && (
                    <JoiningLetterGenerator
                      orgId={selectedReg.orgId}
                      formData={{ ...selectedReg.formData, role: selectedReg.role, validFrom: selectedReg.validFrom, validUntil: selectedReg.validUntil }}
                      regNumber={selectedReg.regNumber}
                      onGenerated={setGeneratedLetterData}
                    />
                  )}
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderCol} py={3}>
            {activeDocument === 'card' && (
              <Button colorScheme="teal" variant="outline" mr={3} size="sm" onClick={() => setActiveDocument('letter')}>
                Letter देखें
              </Button>
            )}
            {activeDocument === 'letter' && (
              <Button colorScheme="brand" variant="outline" mr={3} size="sm" onClick={() => setActiveDocument('card')}>
                ID Card देखें
              </Button>
            )}
            <Button colorScheme="brand" onClick={onClose} borderRadius="xl" size="sm">
              बंद करें
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Alert */}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onAlertClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={cardBg} borderRadius="xl" border="1px solid" borderColor={borderCol}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color={titleColor}>
              पंजीकरण डिलीट करें
            </AlertDialogHeader>

            <AlertDialogBody color={textColor}>
              क्या आप वाकई <b>{regToDelete?.formData?.name || regToDelete?.regNumber}</b> का पंजीकरण डिलीट करना चाहते हैं? यह क्रिया पूर्ववत (undo) नहीं की जा सकती।
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onAlertClose} borderRadius="lg" size="sm">
                रद्द करें (Cancel)
              </Button>
              <Button colorScheme="red" onClick={executeDelete} ml={3} borderRadius="lg" size="sm">
                डिलीट करें (Delete)
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

    </VStack>
  );
};

export default RegistrationsManagement;
