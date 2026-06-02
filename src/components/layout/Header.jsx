import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  IconButton,
  HStack,
  Avatar,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorMode,
  useColorModeValue,
  VStack,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl } from '../../utils/imageUrl';
import {
  FiMenu,
  FiSun,
  FiMoon,
  FiMaximize,
  FiLogOut,
  FiSettings,
  FiUser,
} from 'react-icons/fi';

const Header = ({ onOpenSidebar, onToggleCollapse, isCollapsed }) => {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const headerBg = useColorModeValue('#ffffff', '#0a2e27');
  const borderColor = useColorModeValue('#d4ede8', '#0d3d34');
  const itemHoverBg = useColorModeValue('rgba(3,115,95,0.07)', 'rgba(93,219,187,0.12)');
  const iconColor = useColorModeValue('#1a5045', '#a8d8cf');
  const titleColor = useColorModeValue('#08362E', '#e8f8f5');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  return (
    <Box
      px={6}
      height="20"
      position="sticky"
      top="0"
      zIndex="10"
      bg={headerBg}
      borderBottom="1px"
      borderColor={borderColor}
      boxShadow={colorMode === 'dark' ? '0 2px 12px rgba(0,0,0,0.4)' : '0 1px 8px rgba(3,115,95,0.06)'}
      transition="all 0.2s ease"
    >
      <Flex h="full" alignItems="center" justifyContent="space-between">
        {/* Left Section */}
        <HStack spacing={3} flex="1">
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpenSidebar}
            variant="ghost"
            aria-label="open menu"
            icon={<FiMenu />}
            color={iconColor}
            _hover={{ bg: itemHoverBg }}
            borderRadius="xl"
          />
          <IconButton
            display={{ base: 'none', md: 'flex' }}
            onClick={onToggleCollapse}
            variant="ghost"
            aria-label="toggle collapse"
            icon={<FiMenu />}
            color={iconColor}
            _hover={{ bg: itemHoverBg }}
            borderRadius="xl"
          />
        </HStack>

        {/* Right Section */}
        <HStack spacing={{ base: 1, md: 2 }}>
          <IconButton
            variant="ghost"
            onClick={toggleFullscreen}
            icon={<FiMaximize />}
            aria-label="Fullscreen"
            fontSize="17"
            color={iconColor}
            _hover={{ bg: itemHoverBg }}
            borderRadius="xl"
            display={{ base: 'none', sm: 'flex' }}
          />

          <IconButton
            variant="ghost"
            onClick={toggleColorMode}
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            aria-label="Toggle Color Mode"
            fontSize="17"
            color={iconColor}
            _hover={{ bg: itemHoverBg }}
            borderRadius="xl"
          />

          {/* User Profile Menu */}
          <Menu>
            <MenuButton>
              <HStack spacing={2} cursor="pointer" p={1} borderRadius="xl" _hover={{ bg: itemHoverBg }}>
                <Avatar
                  size="sm"
                  src={resolveImageUrl(admin?.avatar) || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80"}
                  name={admin?.name || "Admin"}
                  border="2px solid #03735F"
                />
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="1px"
                  mr={1}
                >
                  <Text fontSize="sm" fontWeight="600" color={titleColor}>
                    {admin?.name || "Administrator"}
                  </Text>
                  <Text fontSize="10px" color="#4a9085">
                    Administrator
                  </Text>
                </VStack>
              </HStack>
            </MenuButton>
            <MenuList
              bg={headerBg}
              borderColor={borderColor}
              boxShadow="0 8px 32px rgba(3,115,95,0.15)"
              borderRadius="2xl"
              p={1.5}
            >
              <Box px={3} py={2} mb={1}>
                <Text fontSize="xs" color="#4a9085">Signed in as</Text>
                <Text fontWeight="700" fontSize="sm" color={titleColor}>{admin?.email || "admin@ngo.org"}</Text>
              </Box>
              <MenuDivider borderColor={borderColor} />
              <MenuItem
                icon={<FiUser />}
                borderRadius="lg"
                onClick={() => navigate('/settings')}
                _hover={{ bg: itemHoverBg, color: '#03735F' }}
                fontSize="sm"
              >
                My Profile
              </MenuItem>
              <MenuItem
                icon={<FiSettings />}
                borderRadius="lg"
                onClick={() => navigate('/settings')}
                _hover={{ bg: itemHoverBg, color: '#03735F' }}
                fontSize="sm"
              >
                Settings
              </MenuItem>
              <MenuDivider borderColor={borderColor} />
              <MenuItem
                icon={<FiLogOut />}
                borderRadius="lg"
                color="red.400"
                onClick={onOpen}
                _hover={{ bg: 'red.50', color: 'red.600' }}
                fontSize="sm"
              >
                Sign Out
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={headerBg} borderColor={borderColor} borderWidth="1px" boxShadow="xl" borderRadius="2xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color={titleColor}>
              Confirm Sign Out
            </AlertDialogHeader>

            <AlertDialogBody color={iconColor}>
              Are you sure you want to sign out of the Admin Portal?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} variant="ghost" borderRadius="xl">
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={() => {
                  logout();
                  onClose();
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

export default Header;
