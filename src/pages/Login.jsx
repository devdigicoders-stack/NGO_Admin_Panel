import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  Image,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Icon,
  Alert,
  AlertIcon,
  useToast,
} from '@chakra-ui/react';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ─── Colors matching the Admin Panel Theme ───
  const bgGradient = useColorModeValue(
    'linear(to-br, #f0f7f5, #e6f4f1)',
    'linear(to-br, #05160e, #0c351e)'
  );
  const cardBg = useColorModeValue('#ffffff', '#0a2e27');
  const borderColor = useColorModeValue('#d4ede8', '#0d3d34');
  const titleColor = useColorModeValue('#08362E', '#e8f8f5');
  const mutedColor = useColorModeValue('#4a9085', '#7ab8ae');
  const inputBg = useColorModeValue('#f8fbfb', 'rgba(255,255,255,0.06)');
  const inputHoverBg = useColorModeValue('#f0f7f5', 'rgba(255,255,255,0.1)');
  const primaryBrand = '#03735F';
  const primaryBrandHover = '#025a4a';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    if (res.success) {
      toast({
        title: 'Login Successful',
        description: 'Welcome back to the admin portal.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      navigate('/dashboard', { replace: true });
    } else {
      setError(res.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" bgGradient={bgGradient} align="center" justify="center" p={4} position="relative" overflow="hidden">
      {/* Decorative Blobs */}
      <Box position="absolute" top="-10%" left="-5%" w="400px" h="400px" bg={`${primaryBrand}15`} borderRadius="full" filter="blur(80px)" pointerEvents="none" />
      <Box position="absolute" bottom="-10%" right="-5%" w="300px" h="300px" bg={`${primaryBrand}10`} borderRadius="full" filter="blur(60px)" pointerEvents="none" />

      {/* Login Card */}
      <Box
        w="full"
        maxW="420px"
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="3xl"
        boxShadow={useColorModeValue('0 20px 40px rgba(3,115,95,0.08)', '0 20px 40px rgba(0,0,0,0.4)')}
        p={{ base: 8, md: 10 }}
        position="relative"
        zIndex={1}
      >
        <VStack spacing={6} align="stretch">
          
          {/* Logo & Header */}
          <VStack spacing={3} mb={4}>
            <Flex
              w="80px"
              h="80px"
              bg="white"
              borderRadius="2xl"
              align="center"
              justify="center"
              boxShadow="0 4px 14px rgba(0,0,0,0.1)"
              mb={2}
            >
              <Image 
                src="/images/logo.png" 
                alt="NGO Logo" 
                fallback={<Icon as={FiLogIn} fontSize="32px" color={primaryBrand} />}
                w="56px" 
                h="56px" 
                objectFit="contain" 
              />
            </Flex>
            <Heading as="h2" size="lg" color={titleColor} fontFamily="'Outfit', sans-serif" fontWeight="800" textAlign="center">
              Admin Portal
            </Heading>
            <Text color={mutedColor} fontSize="sm" textAlign="center">
              Please sign in to access the control panel
            </Text>
          </VStack>

          {/* Error Message */}
          {error && (
            <Alert status="error" borderRadius="xl" fontSize="sm">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box as="form" onSubmit={handleLogin}>
            <VStack spacing={5}>
              
              <FormControl isRequired>
                <FormLabel fontSize="12px" fontWeight="700" color={mutedColor} textTransform="uppercase" letterSpacing="wider">
                  Email Address
                </FormLabel>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiMail} color={mutedColor} />
                  </InputLeftElement>
                  <Input
                    type="email"
                    placeholder="admin@ngo.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg={inputBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="xl"
                    fontSize="sm"
                    color={titleColor}
                    _hover={{ bg: inputHoverBg }}
                    _focus={{ bg: cardBg, borderColor: primaryBrand, boxShadow: `0 0 0 1px ${primaryBrand}` }}
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="12px" fontWeight="700" color={mutedColor} textTransform="uppercase" letterSpacing="wider">
                  Password
                </FormLabel>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiLock} color={mutedColor} />
                  </InputLeftElement>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg={inputBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="xl"
                    fontSize="sm"
                    color={titleColor}
                    _hover={{ bg: inputHoverBg }}
                    _focus={{ bg: cardBg, borderColor: primaryBrand, boxShadow: `0 0 0 1px ${primaryBrand}` }}
                  />
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                size="lg"
                w="full"
                bg={primaryBrand}
                color="white"
                borderRadius="xl"
                fontWeight="700"
                fontSize="md"
                mt={4}
                isLoading={loading}
                loadingText="Signing In..."
                _hover={{ bg: primaryBrandHover, transform: 'translateY(-2px)', boxShadow: `0 8px 20px ${primaryBrand}40` }}
                _active={{ transform: 'translateY(0)' }}
                transition="all 0.2s"
              >
                Sign In
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
}
