import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BusinessHour {
  day: string;
  hours: string;
  isOpen: boolean;
}

export default function ShopSettingsScreen() {
  const router = useRouter();

  // Form states
  const [shopName, setShopName] = useState('Electro World');
  const [managerName, setManagerName] = useState('Rajesh Kumar');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('rajesh@email.com');
  const [description, setDescription] = useState('Authorized dealer of premium electronics, smart TVs, home appliances, and accessories.');
  const [address, setAddress] = useState('Siripuram Junction, Opp. Dutt Island, Visakhapatnam, AP - 530003');

  // Business Hours state
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([
    { day: 'Monday', hours: '9:00 AM – 9:00 PM', isOpen: true },
    { day: 'Tuesday', hours: '9:00 AM – 9:00 PM', isOpen: true },
    { day: 'Wednesday', hours: '9:00 AM – 9:00 PM', isOpen: true },
    { day: 'Thursday', hours: '9:00 AM – 9:00 PM', isOpen: true },
    { day: 'Friday', hours: '9:00 AM – 9:00 PM', isOpen: true },
    { day: 'Saturday', hours: '9:00 AM – 6:00 PM', isOpen: true },
    { day: 'Sunday', hours: 'Closed', isOpen: false },
  ]);

  const toggleDayOpen = (index: number) => {
    setBusinessHours(
      businessHours.map((bh, idx) => {
        if (idx === index) {
          const nextOpen = !bh.isOpen;
          return {
            ...bh,
            isOpen: nextOpen,
            hours: nextOpen ? '9:00 AM – 9:00 PM' : 'Closed',
          };
        }
        return bh;
      })
    );
  };

  const handleSaveChanges = () => {
    Alert.alert('Settings Saved', 'Your shop profile and business hours have been updated.');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out from the Seller Panel?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('seller_token');
          await AsyncStorage.removeItem('seller_role');
          await AsyncStorage.removeItem('seller_shop_id');
          router.replace('/(seller)/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Shop Settings</Text>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Shop Metadata Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatarBg}>
            <Ionicons name="storefront" size={32} color={Colors.primary} />
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.metaShopName}>{shopName}</Text>
            <Text style={styles.metaManagerName}>Manager: {managerName}</Text>
            <Text style={styles.metaContact}>{phone}</Text>
            <Text style={styles.metaContact}>{email}</Text>
          </View>
        </View>

        {/* Shop Form Info */}
        <Text style={styles.sectionHeading}>Shop Details</Text>
        <View style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Shop Description</Text>
            <TextInput
              style={[styles.formInput, styles.formInputMultiline]}
              placeholder="Tell customers about your shop..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Store Location Address</Text>
            <TextInput
              style={[styles.formInput, styles.formInputMultiline]}
              placeholder="Physical shop location address..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={2}
              value={address}
              onChangeText={setAddress}
            />
          </View>

          {/* Map Location Preview */}
          <Text style={styles.formLabel}>Map Coordinate Marker</Text>
          <View style={styles.mapContainer}>
            {/* Minimalist vector illustration mimicking a map grid */}
            <View style={styles.mapGridLineH1} />
            <View style={styles.mapGridLineH2} />
            <View style={styles.mapGridLineV1} />
            <View style={styles.mapGridLineV2} />
            <View style={styles.mapGreenArea} />
            <View style={styles.mapPin}>
              <Ionicons name="location" size={24} color={Colors.error} />
              <View style={styles.mapPinShadow} />
            </View>
            <Text style={styles.mapLabel}>Siripuram, Vizag</Text>
          </View>
        </View>

        {/* Business Hours */}
        <Text style={styles.sectionHeading}>Weekly Business Hours</Text>
        <View style={styles.hoursCard}>
          {businessHours.map((bh, idx) => (
            <View
              key={bh.day}
              style={[
                styles.hourRow,
                idx < businessHours.length - 1 && styles.hourRowBorder,
              ]}
            >
              <View style={styles.hourLeft}>
                <Text style={[styles.hourDay, !bh.isOpen && styles.hourDayClosed]}>{bh.day}</Text>
                <Text style={styles.hourDuration}>{bh.hours}</Text>
              </View>
              <Switch
                trackColor={{ false: '#BDC3C7', true: Colors.success + '80' }}
                thumbColor={bh.isOpen ? Colors.success : '#7F8C8D'}
                onValueChange={() => toggleDayOpen(idx)}
                value={bh.isOpen}
              />
            </View>
          ))}
        </View>

        {/* Account links */}
        <View style={styles.linksCard}>
          <TouchableOpacity
            style={[styles.linkRow, styles.linkRowBorder]}
            onPress={() => Alert.alert('Credentials', 'Change password flow is disabled.')}
          >
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.linkText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => Alert.alert('Notifications', 'Notification preferences setting.')}
          >
            <Ionicons name="notifications-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.linkText}>Configure Notifications</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout and Save */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutButtonText}>Log Out from Seller Account</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerSafeArea: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 1,
  },
  profileAvatarBg: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileMeta: {
    flex: 1,
    marginLeft: 16,
  },
  metaShopName: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  metaManagerName: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  metaContact: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  sectionHeading: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5EAF5',
    height: 48,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary,
  },
  formInputMultiline: {
    height: 80,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  mapContainer: {
    height: 140,
    backgroundColor: '#E0F7FA',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B2EBF2',
  },
  mapGridLineH1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 50,
    height: 12,
    backgroundColor: '#FFF',
  },
  mapGridLineH2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 100,
    height: 8,
    backgroundColor: '#FFF',
  },
  mapGridLineV1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 100,
    width: 10,
    backgroundColor: '#FFF',
  },
  mapGridLineV2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 240,
    width: 14,
    backgroundColor: '#FFF',
  },
  mapGreenArea: {
    position: 'absolute',
    right: 20,
    top: 10,
    width: 60,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#C8E6C9',
  },
  mapPin: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  mapPinShadow: {
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: -2,
  },
  mapLabel: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#006064',
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  hoursCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    elevation: 1,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  hourRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  hourLeft: {
    gap: 4,
  },
  hourDay: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
  },
  hourDayClosed: {
    color: Colors.textMuted,
  },
  hourDuration: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  linksCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    elevation: 1,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  linkRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  logoutButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    backgroundColor: '#FFF8F8',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: Colors.error,
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
});
