import { Stack } from 'expo-router';
import { SessionPersistenceProvider } from '../components/SessionPersistenceProvider';
import { AuthProvider } from '../lib/contexts/AuthContext';
import { LanguageProvider } from '../lib/contexts/LanguageContext';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SessionPersistenceProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="initial-splash" options={{ headerShown: false }} />
            <Stack.Screen name="splash" options={{ headerShown: false }} />
            <Stack.Screen name="select-location" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="login-callback" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen name="wallet" options={{ headerShown: false }} />
            <Stack.Screen name="payment" options={{ headerShown: false }} />
            <Stack.Screen name="map" options={{ headerShown: false }} />
            <Stack.Screen name="reservations" options={{ headerShown: false }} />
          </Stack>
        </SessionPersistenceProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
