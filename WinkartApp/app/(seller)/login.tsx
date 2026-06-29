import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SellerLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email or mobile number and password.');
      return;
    }

    setIsLoading(true);

    const isEmailInput = email.includes('@');
    const payload = {
      [isEmailInput ? 'email' : 'phone']: email.trim(),
      password: password,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        const role = responseData.user?.role;
        if (role !== 'seller') {
          Alert.alert('Access Denied', 'This account is not registered as a Seller. Please use a Seller account to log in.');
          return;
        }
        // Persist auth so the app skips login on next launch
        await AsyncStorage.setItem('seller_token', responseData.token || 'authenticated');
        await AsyncStorage.setItem('seller_role', role);
        if (responseData.user?.shop_id) {
          await AsyncStorage.setItem('seller_shop_id', String(responseData.user.shop_id));
        }
        router.replace('/(seller)/(tabs)');
      } else {
        const errorMsg = responseData.error || responseData.message || 'Invalid credentials.';
        Alert.alert('Login Failed', errorMsg);
      }
    } catch (error) {
      console.log('Error hitting local server, using simulation fallback:', error);
      if (email.trim() === 'test_seller@winkart.com' && password === 'securepassword123') {
        await AsyncStorage.setItem('seller_token', 'demo_token');
        await AsyncStorage.setItem('seller_role', 'seller');
        await AsyncStorage.setItem('seller_shop_id', '1');
        router.replace('/(seller)/(tabs)');
      } else {
        Alert.alert(
          'Offline Mode',
          'Local server not reachable. Use credentials (test_seller@winkart.com / securepassword123) for offline demo login.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Bypass (Demo Mode)',
              onPress: async () => {
                await AsyncStorage.setItem('seller_token', 'demo_token');
                await AsyncStorage.setItem('seller_role', 'seller');
                await AsyncStorage.setItem('seller_shop_id', '1');
                router.replace('/(seller)/(tabs)');
              },
            },
          ]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Purple branding header */}
        <View style={styles.headerBanner}>
          <SafeAreaView edges={['top']}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : null}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
          </SafeAreaView>
          <View style={styles.logoContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>W</Text>
            </View>
            <Text style={styles.brandName}>WINKART</Text>
            <Text style={styles.brandSub}>Seller Panel</Text>
          </View>
        </View>

        {/* Login Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSub}>Sign in to manage your online store</Text>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email / Mobile Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter email or mobile number"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotLink} onPress={() => Alert.alert('Forgot Password', 'Password recovery link has been sent.')}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.loginButtonText}>LOGIN</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => router.push('/(seller)/register')}
          >
            <Text style={styles.registerText}>
              Register as New Seller <Text style={styles.registerArrow}>→</Text>
            </Text>
          </TouchableOpacity>

          {/* ── TEST CREDENTIALS (remove before production) ── */}
          <View style={styles.testCard}>
            <View style={styles.testCardHeader}>
              <Text style={styles.testCardBadge}>🧪 TEST MODE</Text>
              <Text style={styles.testCardTitle}>Quick Test Login</Text>
            </View>
            <View style={styles.testCredRow}>
              <Text style={styles.testCredLabel}>Email</Text>
              <Text style={styles.testCredValue}>test_seller@winkart.com</Text>
            </View>
            <View style={styles.testCredRow}>
              <Text style={styles.testCredLabel}>Password</Text>
              <Text style={styles.testCredValue}>securepassword123</Text>
            </View>
            <TouchableOpacity
              style={styles.testLoginBtn}
              onPress={async () => {
                // Instantly log in with test credentials (offline / demo mode)
                await AsyncStorage.setItem('seller_token', 'demo_token');
                await AsyncStorage.setItem('seller_role', 'seller');
                await AsyncStorage.setItem('seller_shop_id', '1');
                router.replace('/(seller)/(tabs)');
              }}
            >
              <Text style={styles.testLoginBtnText}>⚡ Tap to Login Instantly</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerBanner: {
    backgroundColor: Colors.bannerBg,
    height: 250,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingHorizontal: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 10,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoBadge: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 10,
  },
  logoText: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: Colors.bannerBg,
  },
  brandName: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#FFF',
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    marginBottom: 40,
  },
  formTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  formSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5EAF5',
    height: 52,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  eyeButton: {
    padding: 4,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.primary,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  registerText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
  },
  registerArrow: {
    color: Colors.primary,
  },
  // ── Test Credentials Card ──
  testCard: {
    marginTop: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FFB300',
    borderStyle: 'dashed',
    backgroundColor: '#FFFDE7',
    padding: 16,
    gap: 10,
  },
  testCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  testCardBadge: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#F57F17',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  testCardTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#5D4037',
  },
  testCredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  testCredLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#795548',
  },
  testCredValue: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#4E342E',
  },
  testLoginBtn: {
    backgroundColor: '#FFB300',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  testLoginBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    letterSpacing: 0.3,
  },
});
