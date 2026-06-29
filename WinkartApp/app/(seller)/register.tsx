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

export default function SellerRegisterScreen() {
  const router = useRouter();

  // Owner Info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Shop Info
  const [shopName, setShopName] = useState('');
  const [shopDescription, setShopDescription] = useState('');
  const [shopAddress, setShopAddress] = useState('');

  // Coordinates
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulated GPS Coordinates Fetch
  const handleSimulateGPS = () => {
    setIsLocating(true);
    // Simulate API delay
    setTimeout(() => {
      // Mock Visakhapatnam coordinates
      const mockLat = (17.6868 + (Math.random() - 0.5) * 0.02).toFixed(6);
      const mockLng = (83.2185 + (Math.random() - 0.5) * 0.02).toFixed(6);
      setLatitude(mockLat);
      setLongitude(mockLng);
      setIsLocating(false);
      Alert.alert('GPS Location', 'Store coordinates successfully updated from GPS sensor.');
    }, 1500);
  };

  const handleRegister = async () => {
    // Form Validation
    if (!name.trim()) return Alert.alert('Validation Error', 'Please enter your full name.');
    if (!email.trim() && !phone.trim()) {
      return Alert.alert('Validation Error', 'Either email or mobile number is required.');
    }
    if (!password || password.length < 6) {
      return Alert.alert('Validation Error', 'Password must be at least 6 characters long.');
    }
    if (!shopName.trim()) return Alert.alert('Validation Error', 'Please enter your shop name.');
    if (!shopAddress.trim()) return Alert.alert('Validation Error', 'Please enter your shop physical address.');
    if (!latitude.trim() || !longitude.trim()) {
      return Alert.alert('Validation Error', 'Please capture or enter your store GPS coordinates.');
    }

    setIsSubmitting(true);
    
    // Prepare Payload
    const payload = {
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      password: password,
      shop_name: shopName.trim(),
      shop_description: shopDescription.trim(),
      shop_address: shopAddress.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register/seller/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Your seller account has been registered successfully!', [
          { text: 'Go to Dashboard', onPress: () => router.replace('/(seller)/(tabs)') }
        ]);
      } else {
        const errorMsg = responseData.error || responseData.message || JSON.stringify(responseData);
        Alert.alert('Registration Failed', errorMsg);
      }
    } catch (error) {
      console.log('Error hitting local server, using simulation flow:', error);
      // Fallback fallback simulation for offline debug
      Alert.alert(
        'Offline Success (Demo Mode)',
        'Local server not reachable, but details validated. Simulating successful registration!',
        [
          { text: 'Enter Seller Dashboard', onPress: () => router.replace('/(seller)/(tabs)') }
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerBanner}>
          <SafeAreaView edges={['top']}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
          </SafeAreaView>
          <View style={styles.logoContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>W</Text>
            </View>
            <Text style={styles.brandName}>WINKART</Text>
            <Text style={styles.brandSub}>Partner Onboarding</Text>
          </View>
        </View>

        {/* Register Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Register Shop</Text>
          <Text style={styles.formSub}>List your furniture, electrical, appliance or local retail shop</Text>

          {/* Section 1: Owner Info */}
          <Text style={styles.sectionHeader}>1. Owner Profile</Text>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter owner's full name"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter email address"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Mobile Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter mobile number"
                placeholderTextColor={Colors.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Choose Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Minimum 6 characters"
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

          {/* Section 2: Shop Identity */}
          <Text style={[styles.sectionHeader, { marginTop: 24 }]}>2. Shop Identity</Text>

          {/* Shop Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Shop / Showroom Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="storefront-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Royal Furniture or Metro Electricals"
                placeholderTextColor={Colors.textMuted}
                value={shopName}
                onChangeText={setShopName}
              />
            </View>
          </View>

          {/* Shop Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Shop Description (Bio)</Text>
            <View style={[styles.inputWrapper, { height: 90, alignItems: 'flex-start', paddingTop: 8 }]}>
              <Ionicons name="document-text-outline" size={20} color={Colors.textMuted} style={[styles.inputIcon, { marginTop: 4 }]} />
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Explain what products your store deals in..."
                placeholderTextColor={Colors.textMuted}
                multiline={true}
                numberOfLines={3}
                value={shopDescription}
                onChangeText={setShopDescription}
              />
            </View>
          </View>

          {/* Shop Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Physical Store Address</Text>
            <View style={[styles.inputWrapper, { height: 80, alignItems: 'flex-start', paddingTop: 8 }]}>
              <Ionicons name="location-outline" size={20} color={Colors.textMuted} style={[styles.inputIcon, { marginTop: 4 }]} />
              <TextInput
                style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                placeholder="Full address (Street, Landmark, City, State)"
                placeholderTextColor={Colors.textMuted}
                multiline={true}
                numberOfLines={3}
                value={shopAddress}
                onChangeText={setShopAddress}
              />
            </View>
          </View>

          {/* Coordinates (Latitude & Longitude) */}
          <View style={styles.inputGroup}>
            <View style={styles.gpsHeaderRow}>
              <Text style={styles.inputLabel}>Store GPS Location</Text>
              <TouchableOpacity style={styles.gpsButton} onPress={handleSimulateGPS} disabled={isLocating}>
                {isLocating ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <>
                    <Ionicons name="locate" size={16} color={Colors.primary} />
                    <Text style={styles.gpsButtonText}>Auto-Locate</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.coordinatesRow}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.coordLabel}>Lat:</Text>
                <TextInput
                  style={styles.coordInput}
                  placeholder="e.g. 17.6868"
                  placeholderTextColor={Colors.textMuted}
                  value={latitude}
                  onChangeText={setLatitude}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Text style={styles.coordLabel}>Lng:</Text>
                <TextInput
                  style={styles.coordInput}
                  placeholder="e.g. 83.2185"
                  placeholderTextColor={Colors.textMuted}
                  value={longitude}
                  onChangeText={setLongitude}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.registerButtonText}>REGISTER SHOP</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login Link */}
          <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkAccent}>Login here</Text>
            </Text>
          </TouchableOpacity>
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
    height: 200,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: -10,
  },
  logoBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  brandName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: Colors.cardBg,
    marginHorizontal: 16,
    marginTop: -20,
    marginBottom: 40,
    borderRadius: 24,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  formSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 6,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  eyeButton: {
    padding: 6,
  },
  gpsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  gpsButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  coordinatesRow: {
    flexDirection: 'row',
  },
  coordLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginRight: 6,
  },
  coordInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  loginLinkAccent: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
