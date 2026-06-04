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
import { FiHome, FiSettings, FiMenu, FiHeart, FiLogOut, FiUsers, FiMessageSquare, FiFileText, FiInbox, FiMail, FiDollarSign, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const LeafIcon = ({ flip = false }) => (
  <Box
    as="svg"
    viewBox="0 0 24 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    w="3"
    h="2.5"
    display="inline-block"
    transform={flip ? 'scaleX(-1)' : 'none'}
    verticalAlign="middle"
    flexShrink={0}
  >
    <path
      d="M2 14C7 13 13 9 17 4"
      stroke="#821905"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M17 4C14 5 11 8 9 11C11 10 14 8 17 4Z"
      fill="#821905"
    />
    <path
      d="M11 9C8 8 5 10 3 12C5 11 8 10 11 9Z"
      fill="#821905"
    />
    <path
      d="M13 8C10 7 7 8 5 9C7 9 9 9 13 8Z"
      fill="#821905"
    />
  </Box>
);

const SidebarContent = ({ onClose, isCollapsed, ...rest }) => {
  const { colorMode } = useColorMode();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isDark = colorMode === 'dark';
  const { isOpen, onOpen, onClose: onLogoutClose } = useDisclosure();
  const cancelRef = useRef();
 
  const bg = useColorModeValue('#ffffff', '#2a0c06');
  const borderColor = useColorModeValue('#f0c4bb', '#4a1208');
  const hoverBg = useColorModeValue('rgba(130,25,5,0.07)', 'rgba(232,144,122,0.12)');
  const activeBg = useColorModeValue('rgba(130,25,5,0.10)', 'rgba(232,144,122,0.18)');
  const activeColor = useColorModeValue('#821905', '#e8907a');
  const textColor = useColorModeValue('#5c1204', '#f0d8d4');
  const sectionTitleColor = useColorModeValue('#b08070', '#a06050');
  const logoBg = useColorModeValue('transparent', 'rgba(255,255,255,0.92)');
  const logoBorderRadius = useColorModeValue('none', 'lg');
  const logoPadding = useColorModeValue(0, 2);
  const scrollbarColor = useColorModeValue('rgba(130,25,5,0.15)', 'rgba(255,255,255,0.1)');
 
  const menuItems = [
    { name: 'Dashboard', icon: FiHome, path: '/dashboard' },
    { name: 'Registrations', icon: FiCreditCard, path: '/registrations' },
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
    <Flex
      direction="column"
      w="full"
      h="full"
      bg={bg}
      borderRight="1px solid"
      borderColor={borderColor}
      boxShadow={isDark ? '2px 0 16px rgba(0,0,0,0.3)' : '2px 0 12px rgba(130,25,5,0.07)'}
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
        flexShrink={0}
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
            <HStack spacing={1.5} align="center">
              <Box
                as="img"
                src="/logo.png"
                h="12"
                w="12"
                objectFit="contain"
                flexShrink={0}
              />
              <VStack align="flex-start" spacing={0.5} lineHeight="1" flexShrink={0}>
                <Text
                  fontSize="7.5px"
                  fontWeight="800"
                  color="#821905"
                  letterSpacing="0.02em"
                  whiteSpace="nowrap"
                  fontFamily="'Outfit', sans-serif"
                >
                  "मानव सेवा ही सच्ची साधना है"
                </Text>
                <Text
                  fontSize="16px"
                  fontWeight="900"
                  color="#821905"
                  letterSpacing="0.5px"
                  lineHeight="1"
                  fontFamily="'Outfit', sans-serif"
                  textShadow="0.5px 0.5px 0 #FDED95, -0.5px -0.5px 0 #FDED95, 0.5px -0.5px 0 #FDED95, -0.5px 0.5px 0 #FDED95"
                >
                  साधु लक्ष्मी
                </Text>
                <HStack spacing={1} align="center" w="full" lineHeight="1">
                  <LeafIcon />
                  <Text
                    fontSize="9.5px"
                    fontWeight="800"
                    color="#821905"
                    letterSpacing="0.2px"
                    fontFamily="'Outfit', sans-serif"
                  >
                    जनकल्याण ट्रस्ट
                  </Text>
                  <LeafIcon flip />
                </HStack>
              </VStack>
            </HStack>
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
            bg={isDark ? 'rgba(232,144,122,0.15)' : 'rgba(130,25,5,0.08)'}
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
      <VStack
        spacing={5}
        align="flex-start"
        px={3}
        mt={4}
        w="full"
        flex="0 1 auto"
        overflowY="auto"
        overflowX="hidden"
        css={{
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: scrollbarColor, borderRadius: '4px' },
        }}
      >
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

      {/* Logout Button (Always visible, sits directly below Settings) */}
      <Box w="full" px={3} py={3} borderTop="1px solid" borderColor={borderColor} flexShrink={0}>
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
    </Flex>
  );
};

export default SidebarContent;
