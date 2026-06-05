import { useState, useEffect } from 'react';
import {
  Box, Text, VStack, HStack, Input, InputGroup, InputLeftElement,
  Table, Thead, Tbody, Tr, Th, Td, Badge,
  Button, useColorModeValue, Icon, Flex, Spinner,
  Tabs, TabList, Tab,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  useDisclosure, Image, Center,
} from '@chakra-ui/react';
import { FiSearch, FiCreditCard, FiDownload, FiUser } from 'react-icons/fi';
import { apiClient } from '../utils/apiClient';
import { orgs } from '../utils/registrationUtils';
import { resolveImageUrl } from '../utils/imageUrl';
import IDCardGenerator from '../components/IDCardGenerator';
import JoiningLetterGenerator from '../components/JoiningLetterGenerator';
import { FiFileText } from 'react-icons/fi';

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
  const [activeDocument, setActiveDocument] = useState('card'); // 'card' or 'letter'
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  const handleDownloadCard = () => {
    if (!generatedCardData || !selectedReg) return;
    const link = document.createElement('a');
    link.download = `ID_Card_${selectedReg.regNumber.replace(/\//g, '_')}.png`;
    link.href = generatedCardData;
    link.click();
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

                        {/* Registration Date */}
                        <Td borderColor={tdBorder} py={3}>
                          <Text fontSize="xs" color={descColor} fontWeight="500">{formatDate(reg.createdAt)}</Text>
                        </Td>

                        {/* Actions */}
                        <Td borderColor={tdBorder} py={3} pr={5} textAlign="right">
                          <HStack spacing={2} justify="flex-end">
                            <Button 
                              leftIcon={<FiCreditCard />} 
                              size="xs" 
                              borderRadius="lg" 
                              colorScheme="brand" 
                              variant="solid"
                              onClick={() => handleOpenDocument(reg, 'card')}
                            >
                              ID Card
                            </Button>
                            <Button 
                              leftIcon={<FiFileText />} 
                              size="xs" 
                              borderRadius="lg" 
                              colorScheme="teal" 
                              variant="outline"
                              onClick={() => handleOpenDocument(reg, 'letter')}
                            >
                              Letter
                            </Button>
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
              <Icon as={activeDocument === 'card' ? FiCreditCard : FiFileText} color="#821905" />
              <Text fontSize="md" fontWeight="800" color={titleColor}>
                {activeDocument === 'card' ? 'सदस्य पहचान पत्र (ID Card Preview)' : 'जॉइनिंग लेटर (Joining Letter Preview)'}
              </Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color={titleColor} />
          <ModalBody p={6}>
            {selectedReg && (
              <VStack spacing={6} align="center" w="full">
                
                {/* ---------- ID CARD VIEW ---------- */}
                {activeDocument === 'card' && (
                  generatedCardData ? (
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
                        <Button
                          colorScheme="brand"
                          leftIcon={<FiDownload />}
                          mt={3}
                          w="full"
                          size="sm"
                          borderRadius="xl"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.download = `ID_Card_Front_${selectedReg.regNumber.replace(/\//g, '_')}.png`;
                            link.href = generatedCardData.front;
                            link.click();
                          }}
                        >
                          सामने का भाग डाउनलोड करें
                        </Button>
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
                        <Button
                          colorScheme="brand"
                          variant="outline"
                          leftIcon={<FiDownload />}
                          mt={3}
                          w="full"
                          size="sm"
                          borderRadius="xl"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.download = `ID_Card_Back_${selectedReg.regNumber.replace(/\//g, '_')}.png`;
                            link.href = generatedCardData.back;
                            link.click();
                          }}
                        >
                          पीछे का भाग डाउनलोड करें
                        </Button>
                      </Box>
                    </Flex>
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
                          link.download = `Joining_Letter_${selectedReg.regNumber.replace(/\//g, '_')}.png`;
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
                  {activeDocument === 'card' && (
                    <IDCardGenerator
                      orgId={selectedReg.orgId}
                      formData={selectedReg.formData}
                      regNumber={selectedReg.regNumber}
                      onGenerated={setGeneratedCardData}
                    />
                  )}
                  {activeDocument === 'letter' && (
                    <JoiningLetterGenerator
                      orgId={selectedReg.orgId}
                      formData={selectedReg.formData}
                      regNumber={selectedReg.regNumber}
                      onGenerated={setGeneratedLetterData}
                    />
                  )}
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={borderCol} py={3}>
            <Button colorScheme="brand" onClick={onClose} borderRadius="xl" size="sm">
              बंद करें
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default RegistrationsManagement;
