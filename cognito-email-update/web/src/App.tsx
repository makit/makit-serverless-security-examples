import { Amplify } from 'aws-amplify';
import { get } from 'aws-amplify/api';
import '@aws-amplify/ui-react/styles.css';
import config from './amplifyconfiguration.json';
import './App.css'
import { Box, Button, ChakraProvider, Container, Heading, Spinner, VStack, Text } from '@chakra-ui/react';
import { Authenticator } from '@aws-amplify/ui-react';
import { useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

Amplify.configure(config);

interface Profile {
  email: string;
  name: string;
  bloodType: string;
  deepSecret: string;
}

function UserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const getProfile = async () => {
    const session = await fetchAuthSession();
    const { tokens } = session;
    if (!tokens || !tokens.idToken) {
      throw new Error('Not Authenticated');
    }
    const restOperation = get({
      apiName: 'profile-api',
      path: 'userprofile',
      options: {
        headers: {
          Authorization: tokens.idToken.toString(),
        },
      },
    });
    const response = await restOperation.response;
    const responseBody = (await response.body.json()) as unknown as Profile;
    setProfile(responseBody);
  }

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <Box>
      <Heading size="lg">Your Personal User Profile</Heading>
      {profile ? (
         <Container mt={5} centerContent>
          <VStack>
            <Heading as="h6" size="xs">Email Address</Heading>
            <Text mb={4}>{profile?.email}</Text>
            <Heading as="h6" size="xs">Name</Heading>
            <Text mb={4}>{profile?.name}</Text>
            <Heading as="h6" size="xs">Blood Type</Heading>
            <Text mb={4}>{profile?.bloodType}</Text>
            <Heading as="h6" size="xs">Deepest Darkest Secret</Heading>
            <Text mb={4}>{profile?.deepSecret}</Text>
          </VStack>
        </Container>) : (
        <Spinner mt={5} />
      )}
    </Box>
  );
}

function App() {
  return (
    <ChakraProvider>
      <Authenticator>
        {({ signOut }) => (
          <Box>
            <Button onClick={signOut} mb={4}>Sign out</Button>
            <UserProfile />
          </Box>
        )}
      </Authenticator>
    </ChakraProvider>
  )
}

export default App
