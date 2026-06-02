import React, { useState } from 'react';
import {
  Box, Text, VStack, HStack, Input, InputGroup, InputLeftElement,
  Table, Thead, Tbody, Tr, Th, Td, Badge, Avatar,
  Menu, MenuButton, MenuList, MenuItem, IconButton,
  Tabs, TabList, Tab, Button, useColorModeValue,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton,
  useDisclosure, Divider, SimpleGrid, Icon, Flex,
} from '@chakra-ui/react';
import { FiSearch, FiMoreVertical, FiUserPlus, FiEye, FiCheckCircle, FiMinusCircle, FiXCircle, FiLock, FiCalendar } from 'react-icons/fi';

const initialUsers = [
  { id: 1, name: 'Parveen Singh Chauhan', email: 'parveen@ngo.org', role: 'Project Coordinator', status: 'Active', joined: '12 Jan 2024', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80', phone: '+91 98765 43210', location: 'Delhi, India', bio: 'Founding member coordinating regional development initiatives and operations.', permissions: ['Admin Access', 'Billing Control', 'Member Invites'] },
  { id: 2, name: 'Bhupender Singh', email: 'bhupender@ngo.org', role: 'Technical Lead', status: 'Active', joined: '05 Mar 2024', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80', phone: '+91 99999 88888', location: 'Punjab, India', bio: 'Lead infrastructure engineer scaling the NGO portal and digital presence.', permissions: ['System Write', 'Logs Access', 'Deployment Config'] },
  { id: 3, name: 'Pam Beesly', email: 'pam@ngo.org', role: 'Design Architect', status: 'Active', joined: '22 Apr 2025', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80', phone: '+1 555-0199', location: 'Scranton, USA', bio: 'Frontend UI/UX engineer designing the brand look and component interfaces.', permissions: ['System Write', 'Asset Upload'] },
  { id: 4, name: 'Kevin Malone', email: 'kevin@ngo.org', role: 'Financial Auditor', status: 'Pending', joined: '15 May 2026', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80', phone: '+1 555-0144', location: 'Scranton, USA', bio: 'Specialist managing bookkeeping records and transaction audits.', permissions: ['Billing Control', 'Logs Access'] },
  { id: 5, name: 'Jim Halpert', email: 'jim@ngo.org', role: 'Relations Officer', status: 'Suspended', joined: '30 Sep 2024', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80', phone: '+1 555-0182', location: 'Philadelphia, USA', bio: 'Outreach manager engaging international partners and corporate sponsors.', permissions: ['Member Invites'] },
];

const UserManagement = () => {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue('#ffffff', '#0a2e27');
  const borderCol = useColorModeValue('#d4ede8', '#0d3d34');
  const titleColor = useColorModeValue('#08362E', '#e8f8f5');
  const textColor = useColorModeValue('#1a5045', '#c8e8e2');
  const descColor = useColorModeValue('#4a9085', '#7ab8ae');
  const thColor = useColorModeValue('#03735F', '#5ddbbb');
  const thBg = useColorModeValue('rgba(3,115,95,0.04)', 'rgba(93,219,187,0.06)');
  const rowHover = useColorModeValue('rgba(3,115,95,0.03)', 'rgba(93,219,187,0.05)');
  const tdBorder = useColorModeValue('#eaf5f2', 'rgba(255,255,255,0.06)');
  const inputBg = useColorModeValue('#f0f7f5', 'rgba(255,255,255,0.1)');
  const menuListBg = useColorModeValue('#ffffff', '#0a2e27');

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()) || user.role.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'All') return matchesSearch;
    return matchesSearch && user.status === activeTab;
  });

  const handleUpdateStatus = (id, newStatus) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, status: newStatus } : u)));
    if (selectedUser && selectedUser.id === id) setSelectedUser({ ...selectedUser, status: newStatus });
  };
  const handleDeleteUser = (id) => {
    setUsers(users.filter((u) => u.id !== id));
    if (selectedUser && selectedUser.id === id) onClose();
  };
  const getStatusBadge = (status) => {
    const schemes = { Active: 'green', Pending: 'orange', Suspended: 'red' };
    return <Badge colorScheme={schemes[status]} px={2.5} py={0.5} borderRadius="full" fontSize="10px" fontWeight="700">{status}</Badge>;
  };
  const handleRowClick = (user) => { setSelectedUser(user); onOpen(); };

  return (
    <VStack spacing={5} align="stretch" w="full">
      {/* Header */}
      <Flex direction={{ base: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ base: 'flex-start', sm: 'center' }} gap={4}>
        <Box>
          <Text fontSize="2xl" fontFamily="'Outfit', sans-serif" fontWeight="800" color={titleColor}>User Directory</Text>
          <Text fontSize="xs" color={descColor}>Monitor system user roles, access matrices, and status details.</Text>
        </Box>
        <Button leftIcon={<FiUserPlus />} bg="#03735F" color="white" borderRadius="xl" size="md" _hover={{ bg: '#026652' }}>
          Add User
        </Button>
      </Flex>

      {/* Table Container */}
      <Box bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="2xl" shadow="sm" overflow="hidden">
        {/* Filter Bar */}
        <Box p={4} borderBottom="1px solid" borderColor={borderCol}>
          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={3}>
            <Tabs variant="soft-rounded" size="sm" onChange={(index) => { const tabs = ['All', 'Active', 'Pending', 'Suspended']; setActiveTab(tabs[index]); }}>
              <TabList gap={1}>
                {['All', 'Active', 'Pending', 'Suspended'].map((tab) => (
                  <Tab key={tab} borderRadius="xl" fontWeight="600" fontSize="xs" color={descColor} _selected={{ bg: '#03735F', color: 'white' }}>
                    {tab}
                  </Tab>
                ))}
              </TabList>
            </Tabs>
            <InputGroup maxW={{ base: 'full', md: 'xs' }}>
              <InputLeftElement pointerEvents="none"><FiSearch color="#4a9085" /></InputLeftElement>
              <Input placeholder="Search name, role, email..." variant="filled" bg={inputBg} borderRadius="xl" fontSize="sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} border="1px solid" borderColor={borderCol} color={titleColor} _placeholder={{ color: descColor }} _focus={{ bg: cardBg, borderColor: '#03735F' }} />
            </InputGroup>
          </Flex>
        </Box>

        {/* Table */}
        <Box overflowX="auto">
          <Table variant="simple" size="md">
            <Thead>
              <Tr bg={thBg}>
                <Th color={thColor} borderColor={tdBorder} fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="wider" py={3} pl={5}>User Profile</Th>
                <Th color={thColor} borderColor={tdBorder} fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="wider" py={3} display={{ base: 'none', md: 'table-cell' }}>Role</Th>
                <Th color={thColor} borderColor={tdBorder} fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="wider" py={3}>Status</Th>
                <Th color={thColor} borderColor={tdBorder} fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="wider" py={3} display={{ base: 'none', sm: 'table-cell' }}>Joined</Th>
                <Th color={thColor} borderColor={tdBorder} fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="wider" py={3} pr={5} textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.length === 0 ? (
                <Tr><Td colSpan={5} textAlign="center" py={10} color={descColor} borderColor={tdBorder}>No users matching criteria found.</Td></Tr>
              ) : (
                filteredUsers.map((user) => (
                  <Tr key={user.id} _hover={{ bg: rowHover }} cursor="pointer" transition="background-color 0.15s ease" onClick={() => handleRowClick(user)}>
                    <Td borderColor={tdBorder} py={3.5} pl={5}>
                      <HStack spacing={3}>
                        <Avatar size="sm" name={user.name} src={user.avatar} />
                        <Box>
                          <Text fontSize="sm" fontWeight="700" color={titleColor}>{user.name}</Text>
                          <Text fontSize="11px" color={descColor}>{user.email}</Text>
                        </Box>
                      </HStack>
                    </Td>
                    <Td borderColor={tdBorder} display={{ base: 'none', md: 'table-cell' }} py={3.5}>
                      <Text fontSize="xs" fontWeight="600" color={textColor}>{user.role}</Text>
                    </Td>
                    <Td borderColor={tdBorder} py={3.5}>{getStatusBadge(user.status)}</Td>
                    <Td borderColor={tdBorder} display={{ base: 'none', sm: 'table-cell' }} py={3.5}>
                      <Text fontSize="xs" color={descColor} fontWeight="500">{user.joined}</Text>
                    </Td>
                    <Td borderColor={tdBorder} py={3.5} pr={5} textAlign="right" onClick={(e) => e.stopPropagation()}>
                      <Menu>
                        <MenuButton as={IconButton} icon={<FiMoreVertical />} variant="ghost" size="sm" borderRadius="xl" color={descColor} _hover={{ bg: 'rgba(3,115,95,0.08)', color: '#03735F' }} />
                        <MenuList bg={menuListBg} borderColor={borderCol} p={1} borderRadius="xl" boxShadow="0 8px 24px rgba(0,0,0,0.2)">
                          <MenuItem icon={<FiEye />} borderRadius="lg" onClick={() => handleRowClick(user)} _hover={{ bg: 'rgba(3,115,95,0.08)', color: '#03735F' }} fontSize="sm" color={textColor}>View Profile</MenuItem>
                          <Divider my={1} borderColor={borderCol} />
                          <MenuItem icon={<FiCheckCircle />} color="green.400" borderRadius="lg" onClick={() => handleUpdateStatus(user.id, 'Active')} _hover={{ bg: 'rgba(72,187,120,0.1)' }} fontSize="sm">Set Active</MenuItem>
                          <MenuItem icon={<FiMinusCircle />} color="orange.400" borderRadius="lg" onClick={() => handleUpdateStatus(user.id, 'Pending')} _hover={{ bg: 'rgba(237,137,54,0.1)' }} fontSize="sm">Set Pending</MenuItem>
                          <MenuItem icon={<FiXCircle />} color="red.400" borderRadius="lg" onClick={() => handleUpdateStatus(user.id, 'Suspended')} _hover={{ bg: 'rgba(245,101,101,0.1)' }} fontSize="sm">Suspend User</MenuItem>
                          <Divider my={1} borderColor={borderCol} />
                          <MenuItem icon={<FiXCircle />} color="red.500" fontWeight="600" borderRadius="lg" onClick={() => handleDeleteUser(user.id)} _hover={{ bg: 'rgba(245,101,101,0.1)' }} fontSize="sm">Delete User</MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* User Detail Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size={{ base: 'full', sm: 'md' }}>
        <DrawerOverlay backdropFilter="blur(4px)" />
        <DrawerContent bg={cardBg} borderLeft="1px solid" borderColor={borderCol}>
          <DrawerCloseButton color={titleColor} borderRadius="full" m={2} />
          <DrawerHeader borderBottom="1px solid" borderColor={borderCol} py={4} color={titleColor} fontFamily="'Outfit', sans-serif" fontSize="md">
            User Profile Card
          </DrawerHeader>
          {selectedUser && (
            <DrawerBody py={5}>
              <VStack align="center" spacing={3} mb={5} textAlign="center">
                <Avatar size="2xl" name={selectedUser.name} src={selectedUser.avatar} border="3px solid #03735F" />
                <Box>
                  <Text fontSize="lg" fontWeight="800" color={titleColor} mb={0.5}>{selectedUser.name}</Text>
                  <Text fontSize="xs" fontWeight="600" color="#03735F" mb={2}>{selectedUser.role}</Text>
                  {getStatusBadge(selectedUser.status)}
                </Box>
              </VStack>
              <Divider borderColor={borderCol} mb={4} />
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontSize="10px" fontWeight="700" textTransform="uppercase" color={descColor} mb={1} letterSpacing="wider">Bio</Text>
                  <Text fontSize="xs" color={textColor} lineHeight="1.7">{selectedUser.bio}</Text>
                </Box>
                <SimpleGrid columns={2} spacing={4}>
                  {[['Email', selectedUser.email], ['Phone', selectedUser.phone], ['Location', selectedUser.location]].map(([label, val]) => (
                    <Box key={label}>
                      <Text fontSize="10px" fontWeight="700" textTransform="uppercase" color={descColor} mb={0.5} letterSpacing="wider">{label}</Text>
                      <Text fontSize="xs" fontWeight="600" color={titleColor}>{val}</Text>
                    </Box>
                  ))}
                  <Box>
                    <HStack spacing={1} color={descColor} mb={0.5}>
                      <Icon as={FiCalendar} fontSize="10" />
                      <Text fontSize="10px" fontWeight="700" textTransform="uppercase" letterSpacing="wider">Joined</Text>
                    </HStack>
                    <Text fontSize="xs" fontWeight="600" color={titleColor}>{selectedUser.joined}</Text>
                  </Box>
                </SimpleGrid>
                <Divider borderColor={borderCol} />
                <Box>
                  <HStack spacing={1.5} mb={2.5} color={descColor}>
                    <Icon as={FiLock} fontSize="12" />
                    <Text fontSize="10px" fontWeight="700" textTransform="uppercase" letterSpacing="wider">Permissions</Text>
                  </HStack>
                  <HStack spacing={2} flexWrap="wrap">
                    {selectedUser.permissions.map((perm, idx) => (
                      <Badge key={idx} bg={useColorModeValue('rgba(3,115,95,0.1)', 'rgba(93,219,187,0.15)')} color={useColorModeValue('#03735F', '#5ddbbb')} px={2.5} py={1} borderRadius="lg" fontSize="10px" fontWeight="600" mb={1.5}>{perm}</Badge>
                    ))}
                  </HStack>
                </Box>
              </VStack>
            </DrawerBody>
          )}
        </DrawerContent>
      </Drawer>
    </VStack>
  );
};

export default UserManagement;
