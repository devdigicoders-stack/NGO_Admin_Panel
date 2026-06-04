import React, { useState } from 'react';
import {
  Box,
  Drawer,
  DrawerContent,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react';
import SidebarContent from './Sidebar.jsx';
import Header from './Header.jsx';

const Layout = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const bgValue = useColorModeValue('#fdf4f2', '#1a0804');
  const mainWidth = isCollapsed ? '76px' : '240px';

  return (
    <Box minH="100vh" bg={bgValue} transition="background-color 0.2s ease">
      {/* Mobile Drawer Navigation */}
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="xs"
      >
        <DrawerContent p={0} bg="transparent">
          <SidebarContent
            onClose={onClose}
            isCollapsed={false}
          />
        </DrawerContent>
      </Drawer>

      {/* Desktop Sidebar Navigation */}
      <SidebarContent
        onClose={() => {}}
        isCollapsed={isCollapsed}
        display={{ base: 'none', md: 'block' }}
        position="fixed"
        left="0"
        top="0"
        h="full"
        w={mainWidth}
        transition="width 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      />

      {/* Header and Content Area */}
      <Box
        ml={{ base: 0, md: mainWidth }}
        transition="margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
        minH="100vh"
        display="flex"
        flexDirection="column"
      >
        <Header
          onOpenSidebar={onOpen}
          onToggleCollapse={toggleCollapse}
          isCollapsed={isCollapsed}
        />
        
        {/* Main Child View Container */}
        <Box
          p={{ base: 4, sm: 6, md: 8 }}
          flex="1"
          overflowY="auto"
          maxWidth="1600px"
          w="full"
          mx="auto"
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
