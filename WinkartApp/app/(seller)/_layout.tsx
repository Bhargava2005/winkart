import React from 'react';
import { Stack } from 'expo-router';

export default function SellerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* index.tsx handles auth check and redirects */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="categories" options={{ presentation: 'modal' }} />
      <Stack.Screen name="upsell" options={{ presentation: 'modal' }} />
      <Stack.Screen name="import-export" options={{ presentation: 'modal' }} />
      <Stack.Screen name="catalog-setup" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
