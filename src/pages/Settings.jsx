import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Text, VStack, HStack, Input, Textarea, Button, FormControl, FormLabel,
  Switch, Tabs, TabList, TabPanels, Tab, TabPanel, Avatar, Card, CardBody,
  useColorModeValue, useToast, Divider, SimpleGrid, Select, Icon, Flex,
} from '@chakra-ui/react';
import { FiUser, FiSliders, FiBell, FiShield, FiUploadCloud } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { resolveImageUrl } from '../utils/imageUrl';

const Settings = () => {
  const toast = useToast();
  const { admin, updateProfile, updatePrefs, uploadAvatar } = useAuth();
  const avatarInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    phone: admin?.phone || '',
    location: admin?.location || '',
    bio: admin?.bio || '',
    avatar: admin?.avatar || '',
  });

  useEffect(() => {
    if (!admin) return;
    setProfile({
      name: admin.name || '',
      email: admin.email || '',
      phone: admin.phone || '',
      location: admin.location || '',
      bio: admin.bio || '',
      avatar: admin.avatar || '',
    });
  }, [admin]);

  const [prefs, setPrefs] = useState({
    memberAlerts: admin?.prefs?.memberAlerts || false,
    weeklyDigest: admin?.prefs?.weeklyDigest || false,
    serverAlerts: admin?.prefs?.serverAlerts || false,
    twoFactor: admin?.prefs?.twoFactor || false,
    layout: admin?.prefs?.layout || 'fluid',
  });

  const cardBg = useColorModeValue('#ffffff', '#2a0c06');
  const borderCol = useColorModeValue('#f0c4bb', '#4a1208');
  const titleColor = useColorModeValue('#2e0d09', '#f5e0dc');
  const labelColor = useColorModeValue('#5c1204', '#f0d8d4');
  const descColor = useColorModeValue('#a05040', '#c08070');
  const inputBg = useColorModeValue('#fdf4f2', 'rgba(255,255,255,0.08)');
  const inputFocusBg = useColorModeValue('#ffffff', '#2a0c06');
  const sectionBg = useColorModeValue('#f7faf9', 'rgba(232,144,122,0.04)');
  const tabColor = useColorModeValue('#a05040', '#c08070');

  const sharedInput = {
    variant: 'filled',
    bg: inputBg,
    borderRadius: 'xl',
    border: '1px solid',
    borderColor: borderCol,
    fontSize: 'sm',
    color: titleColor,
    _placeholder: { color: descColor },
    _focus: { bg: inputFocusBg, borderColor: '#821905' },
    _hover: { bg: useColorModeValue('#f9e8e4', 'rgba(255,255,255,0.12)') },
  };

  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum size is 5MB.', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    setAvatarUploading(true);
    const res = await uploadAvatar(file);
    setAvatarUploading(false);
    e.target.value = '';
    if (res.success) {
      setProfile((p) => ({ ...p, avatar: res.data.avatar }));
      toast({ title: 'Photo Updated', description: 'Your profile picture has been saved.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
    } else {
      toast({ title: 'Upload Failed', description: res.message, status: 'error', duration: 3000, isClosable: true, position: 'top-right' });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const res = await updateProfile(profile);
    setIsUpdating(false);
    if (res.success) {
      toast({ title: 'Profile Updated.', description: 'Your profile details have been saved.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
    } else {
      toast({ title: 'Update Failed.', description: res.message, status: 'error', duration: 3000, isClosable: true, position: 'top-right' });
    }
  };
  
  const handlePrefsSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const res = await updatePrefs(prefs);
    setIsUpdating(false);
    if (res.success) {
      toast({ title: 'Preferences Updated.', description: 'Display and notification settings updated.', status: 'success', duration: 3000, isClosable: true, position: 'top-right' });
    } else {
      toast({ title: 'Update Failed.', description: res.message, status: 'error', duration: 3000, isClosable: true, position: 'top-right' });
    }
  };

  return (
    <VStack spacing={5} align="stretch" w="full">
      <Box>
        <Text fontSize="2xl" fontFamily="'Outfit', sans-serif" fontWeight="800" color={titleColor}>System Settings</Text>
        <Text fontSize="xs" color={descColor}>Manage your profile and platform default configurations.</Text>
      </Box>

      <Card bg={cardBg} border="1px solid" borderColor={borderCol} borderRadius="2xl" shadow="sm" overflow="hidden">
        <CardBody p={0}>
          <Tabs variant="line" isLazy>
            <TabList borderBottom="1px solid" borderColor={borderCol} px={5} pt={1} bg={sectionBg}>
              <Tab py={4} fontWeight="700" fontSize="sm" gap={2} color={tabColor} _selected={{ color: useColorModeValue('#821905', '#e8907a'), borderColor: useColorModeValue('#821905', '#e8907a') }}>
                <Icon as={FiUser} />Profile Settings
              </Tab>
              <Tab py={4} fontWeight="700" fontSize="sm" gap={2} color={tabColor} _selected={{ color: useColorModeValue('#821905', '#e8907a'), borderColor: useColorModeValue('#821905', '#e8907a') }}>
                <Icon as={FiSliders} />Preferences & Security
              </Tab>
            </TabList>

            <TabPanels p={5}>
              {/* Profile Tab */}
              <TabPanel p={0}>
                <Box as="form" onSubmit={handleProfileSubmit}>
                  <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
                    {/* Avatar */}
                    <VStack align="center" spacing={3} minW={{ base: 'full', md: '180px' }} p={5} border="1px solid" borderColor={borderCol} borderRadius="2xl" bg={sectionBg}>
                      <Avatar size="2xl" name={profile.name} src={resolveImageUrl(profile.avatar)} border="3px solid #821905" />
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        style={{ display: 'none' }}
                        onChange={handleAvatarChange}
                      />
                      <Button
                        leftIcon={<FiUploadCloud />}
                        size="xs"
                        variant="outline"
                        borderColor={borderCol}
                        color={descColor}
                        _hover={{ bg: 'rgba(130,25,5,0.08)', color: useColorModeValue('#821905', '#e8907a'), borderColor: '#821905' }}
                        borderRadius="xl"
                        onClick={() => avatarInputRef.current?.click()}
                        isLoading={avatarUploading}
                      >
                        Change Photo
                      </Button>
                      <Text fontSize="10px" color={descColor} textAlign="center">JPG, PNG or GIF. Max 2MB.</Text>
                    </VStack>

                    {/* Fields */}
                    <VStack spacing={4} flex={1} align="stretch">
                      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                        <FormControl id="name" isRequired>
                          <FormLabel fontSize="11px" fontWeight="700" color={labelColor} textTransform="uppercase" letterSpacing="wider">Full Name</FormLabel>
                          <Input {...sharedInput} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                        </FormControl>
                        <FormControl id="email" isRequired>
                          <FormLabel fontSize="11px" fontWeight="700" color={labelColor} textTransform="uppercase" letterSpacing="wider">Email Address</FormLabel>
                          <Input type="email" {...sharedInput} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                        </FormControl>
                        <FormControl id="phone">
                          <FormLabel fontSize="11px" fontWeight="700" color={labelColor} textTransform="uppercase" letterSpacing="wider">Phone Number</FormLabel>
                          <Input {...sharedInput} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                        </FormControl>
                        <FormControl id="location">
                          <FormLabel fontSize="11px" fontWeight="700" color={labelColor} textTransform="uppercase" letterSpacing="wider">Location</FormLabel>
                          <Input {...sharedInput} value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
                        </FormControl>
                      </SimpleGrid>
                      <FormControl id="bio">
                        <FormLabel fontSize="11px" fontWeight="700" color={labelColor} textTransform="uppercase" letterSpacing="wider">Biography</FormLabel>
                        <Textarea rows={4} {...sharedInput} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} resize="vertical" />
                      </FormControl>
                      <Divider borderColor={borderCol} />
                      <Box alignSelf="flex-end">
                        <Button isLoading={isUpdating} type="submit" bg="#821905" color="white" borderRadius="xl" size="md" _hover={{ bg: '#6e1504' }}>Save Profile</Button>
                      </Box>
                    </VStack>
                  </Flex>
                </Box>
              </TabPanel>

              {/* Preferences Tab */}
              <TabPanel p={0}>
                <Box as="form" onSubmit={handlePrefsSubmit}>
                  <VStack spacing={5} align="stretch">
                    {/* Display */}
                    <Box>
                      <HStack spacing={1.5} color={descColor} mb={3}>
                        <Icon as={FiSliders} fontSize="14" />
                        <Text fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="wider">Display Settings</Text>
                      </HStack>
                      <Box p={4} bg={sectionBg} borderRadius="xl" border="1px solid" borderColor={borderCol}>
                        <FormControl id="layout">
                          <FormLabel fontSize="xs" fontWeight="600" color={titleColor}>Dashboard Layout</FormLabel>
                          <Select variant="filled" bg={inputBg} borderRadius="xl" fontSize="sm" color={titleColor} border="1px solid" borderColor={borderCol} value={prefs.layout} onChange={(e) => setPrefs({ ...prefs, layout: e.target.value })}>
                            <option value="fluid">Fluid Layout (Full Width)</option>
                            <option value="boxed">Boxed Layout (Constrained)</option>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>

                    <Divider borderColor={borderCol} />

                    {/* Notifications */}
                    <Box>
                      <HStack spacing={1.5} color={descColor} mb={3}>
                        <Icon as={FiBell} fontSize="14" />
                        <Text fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="wider">Email Notifications</Text>
                      </HStack>
                      <VStack align="stretch" spacing={3}>
                        {[
                          { key: 'memberAlerts', label: 'New User Registration', desc: 'Get notified when a new user registers.' },
                          { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Receive weekly summary of platform activity.' },
                          { key: 'serverAlerts', label: 'Server Alerts', desc: 'Alert when server load exceeds 80% capacity.' },
                        ].map((item) => (
                          <Flex key={item.key} justify="space-between" align="center" p={4} bg={sectionBg} borderRadius="xl" border="1px solid" borderColor={borderCol}>
                            <Box>
                              <Text fontSize="sm" fontWeight="700" color={titleColor}>{item.label}</Text>
                              <Text fontSize="xs" color={descColor}>{item.desc}</Text>
                            </Box>
                            <Switch
                              isChecked={prefs[item.key]}
                              onChange={(e) => setPrefs({ ...prefs, [item.key]: e.target.checked })}
                              sx={{ '& .chakra-switch__track[data-checked]': { bg: '#821905' } }}
                            />
                          </Flex>
                        ))}
                      </VStack>
                    </Box>

                    <Divider borderColor={borderCol} />

                    {/* Security */}
                    <Box>
                      <HStack spacing={1.5} color={descColor} mb={3}>
                        <Icon as={FiShield} fontSize="14" />
                        <Text fontSize="11px" fontWeight="700" textTransform="uppercase" letterSpacing="wider">Security</Text>
                      </HStack>
                      <Flex justify="space-between" align="center" p={4} bg={sectionBg} borderRadius="xl" border="1px solid" borderColor={borderCol}>
                        <Box>
                          <Text fontSize="sm" fontWeight="700" color={titleColor}>Two-Factor Authentication (2FA)</Text>
                          <Text fontSize="xs" color={descColor}>Require an auth token on every login.</Text>
                        </Box>
                        <Switch
                          isChecked={prefs.twoFactor}
                          onChange={(e) => setPrefs({ ...prefs, twoFactor: e.target.checked })}
                          sx={{ '& .chakra-switch__track[data-checked]': { bg: '#821905' } }}
                        />
                      </Flex>
                    </Box>

                    <Divider borderColor={borderCol} />
                    <Box alignSelf="flex-end">
                      <Button isLoading={isUpdating} type="submit" bg="#821905" color="white" borderRadius="xl" size="md" _hover={{ bg: '#6e1504' }}>Update Preferences</Button>
                    </Box>
                  </VStack>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default Settings;
