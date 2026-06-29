import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Entry screen for the seller section.
 * Checks AsyncStorage for a saved token and redirects accordingly:
 *   - token found  → Seller Dashboard (already logged in)
 *   - no token     → Seller Login
 */
export default function SellerIndexScreen() {
  const [authState, setAuthState] = useState<'loading' | 'loggedIn' | 'loggedOut'>('loading');

  useEffect(() => {
    AsyncStorage.getItem('seller_token')
      .then((token) => setAuthState(token ? 'loggedIn' : 'loggedOut'))
      .catch(() => setAuthState('loggedOut'));
  }, []);

  if (authState === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4FF' }}>
        <ActivityIndicator size="large" color="#3D5AFE" />
      </View>
    );
  }

  if (authState === 'loggedIn') {
    return <Redirect href="/(seller)/(tabs)" />;
  }

  return <Redirect href="/(seller)/login" />;
}
