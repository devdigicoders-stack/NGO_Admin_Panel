import React, { useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  useColorMode,
  CloseButton,
  Flex,
  Tooltip,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiSettings, FiMenu, FiHeart, FiLogOut, FiUsers, FiMessageSquare, FiFileText, FiInbox, FiMail, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const SidebarContent = ({ onClose, isCollapsed, ...rest }) => {
  const { colorMode } = useColorMode();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isDark = colorMode === 'dark';
  const { isOpen, onOpen, onClose: onLogoutClose } = useDisclosure();
  const cancelRef = useRef();
 
  const bg = useColorModeValue('#ffffff', '#0a2e27');
  const borderColor = useColorModeValue('#d4ede8', '#0d3d34');
  const hoverBg = useColorModeValue('rgba(3,115,95,0.08)', 'rgba(3,200,150,0.12)');
  const activeBg = useColorModeValue('rgba(3,115,95,0.12)', 'rgba(3,200,150,0.18)');
  const activeColor = useColorModeValue('#03735F', '#5ddbbb');
  const textColor = useColorModeValue('#1a5045', '#a8d8cf');
  const sectionTitleColor = useColorModeValue('#7ab8ae', '#5a9e95');
  // Logo gets a light pill background in dark mode so it's always visible
  const logoBg = useColorModeValue('transparent', 'rgba(255,255,255,0.92)');
  const logoBorderRadius = useColorModeValue('none', 'lg');
  const logoPadding = useColorModeValue(0, 2);
 
  const menuItems = [
    { name: 'Dashboard', icon: FiHome, path: '/dashboard' },
    { name: 'Programs Management', icon: FiHeart, path: '/programs' },
    { name: 'Team Management', icon: FiUsers, path: '/team' },
    { name: 'Testimonials', icon: FiMessageSquare, path: '/testimonials' },
    { name: 'News Management', icon: FiFileText, path: '/news' },
    { name: 'Donation Queries', icon: FiInbox, path: '/queries' },
    { name: 'Contact Enquiries', icon: FiMail, path: '/enquiries' },
    { name: 'Donations', icon: FiDollarSign, path: '/donations' },
    { name: 'Settings', icon: FiSettings, path: '/settings' },
  ];
 
  const handleNavClick = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  const renderNavItems = (items) => {
    return items.map((item) => {
      const isActive = location.pathname === item.path;
      return (
        <Tooltip
          key={item.name}
          label={isCollapsed ? item.name : ''}
          placement="right"
          hasArrow
        >
          <HStack
            w="full"
            px={isCollapsed ? 3 : 4}
            py={2.5}
            spacing={isCollapsed ? 0 : 3}
            justifyContent={isCollapsed ? 'center' : 'flex-start'}
            borderRadius="xl"
            cursor="pointer"
            bg={isActive ? activeBg : 'transparent'}
            color={isActive ? activeColor : textColor}
            fontWeight={isActive ? '700' : '500'}
            fontSize="sm"
            transition="all 0.2s ease-in-out"
            _hover={{
              bg: hoverBg,
              color: activeColor,
              transform: isCollapsed ? 'scale(1.12)' : 'translateX(4px)',
            }}
            onClick={() => handleNavClick(item.path)}
            position="relative"
          >
            {isActive && (
              <Box
                position="absolute"
                left="0"
                top="20%"
                h="60%"
                w="3px"
                bg={activeColor}
                borderRadius="full"
              />
            )}
            <Icon as={item.icon} fontSize="18" flexShrink={0} />
            {!isCollapsed && <Text>{item.name}</Text>}
          </HStack>
        </Tooltip>
      );
    });
  };

  return (
    <Box
      w="full"
      h="full"
      bg={bg}
      position="relative"
      borderRight="1px solid"
      borderColor={borderColor}
      boxShadow={isDark ? '2px 0 16px rgba(0,0,0,0.3)' : '2px 0 12px rgba(3,115,95,0.06)'}
      {...rest}
    >
      {/* Logo Section */}
      <Flex
        h="20"
        alignItems="center"
        mx={isCollapsed ? 'auto' : '5'}
        justifyContent={isCollapsed ? 'center' : 'space-between'}
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        {!isCollapsed && (
          <Box
            bg={logoBg}
            px={logoPadding}
            py={logoPadding}
            borderRadius={logoBorderRadius}
            display="inline-flex"
            alignItems="center"
          >
            <Box
              as="img"
              src="/logo.png"
              h="10"
              maxW="160px"
              objectFit="contain"
            />
          </Box>
        )}
        {isCollapsed && (
          <Flex
            w={9}
            h={9}
            mx="auto"
            alignItems="center"
            justifyContent="center"
            borderRadius="xl"
            bg={isDark ? 'rgba(93,219,187,0.15)' : 'rgba(3,115,95,0.1)'}
            color={activeColor}
            cursor="pointer"
          >
            <Icon as={FiMenu} fontSize="18" />
          </Flex>
        )}
        <CloseButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onClose}
          color={textColor}
        />
      </Flex>

      {/* Navigation */}
      <VStack spacing={5} align="flex-start" px={3} mt={4} w="full">
        <Box w="full">
          {!isCollapsed && (
            <Text
              fontSize="10px"
              fontWeight="700"
              textTransform="uppercase"
              color={sectionTitleColor}
              mb={2}
              px={2}
              letterSpacing="wider"
            >
              Main Menu
            </Text>
          )}
          <VStack spacing={1} align="flex-start" w="full">
            {renderNavItems(menuItems)}
          </VStack>
        </Box>
      </VStack>

      {/* Logout Button at bottom */}
      <Box position="absolute" bottom="6" w="full" px={3}>
        <Tooltip
          label={isCollapsed ? 'Logout' : ''}
          placement="right"
          hasArrow
        >
          <HStack
            w="full"
            px={isCollapsed ? 3 : 4}
            py={2.5}
            spacing={isCollapsed ? 0 : 3}
            justifyContent={isCollapsed ? 'center' : 'flex-start'}
            borderRadius="xl"
            cursor="pointer"
            bg="transparent"
            color="red.500"
            fontWeight="500"
            fontSize="sm"
            transition="all 0.2s ease-in-out"
            _hover={{
              bg: 'red.50',
              color: 'red.600',
              transform: isCollapsed ? 'scale(1.12)' : 'translateX(4px)',
            }}
            onClick={onOpen}
          >
            <Icon as={FiLogOut} fontSize="18" flexShrink={0} />
            {!isCollapsed && <Text>Logout</Text>}
          </HStack>
        </Tooltip>
      </Box>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onLogoutClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={bg} borderColor={borderColor} borderWidth="1px" boxShadow="xl" borderRadius="2xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color={textColor}>
              Confirm Sign Out
            </AlertDialogHeader>

            <AlertDialogBody color={textColor}>
              Are you sure you want to sign out of the Admin Portal?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onLogoutClose} variant="ghost" borderRadius="xl">
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={() => {
                  logout();
                  onLogoutClose();
                }} 
                ml={3}
                borderRadius="xl"
              >
                Sign Out
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default SidebarContent;
