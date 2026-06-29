import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';

const SAVED_ADDRESSES = [
  { id: '1', label: 'Home', isDefault: true, address: '4th Floor, MVP Colony,\nVisakhapatnam, Andhra Pradesh 530017', color: Colors.primary, icon: 'home' as const },
  { id: '2', label: 'Work', isDefault: false, address: 'Winkart Office, Siripuram Junction,\nVisakhapatnam, Andhra Pradesh 530003', color: Colors.success, icon: 'briefcase' as const },
];

export default function LocationScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'map' | 'manual'>('map');
  const [search, setSearch] = useState('');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Select Location</Text>
        <Text style={styles.sub}>Find the perfect place for you</Text>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Mode Toggle */}
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeCard, mode === 'map' && styles.modeCardActive]}
            onPress={() => setMode('map')}
          >
            {mode === 'map' && (
              <View style={styles.modeCheck}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
              </View>
            )}
            <View style={styles.modeIconBg}>
              <Ionicons name="map" size={24} color={mode === 'map' ? Colors.primary : Colors.textMuted} />
            </View>
            <Text style={[styles.modeTitle, mode === 'map' && styles.modeTitleActive]}>Select on Map</Text>
            <Text style={styles.modeSub}>Use map to pick precise location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeCard, mode === 'manual' && styles.modeCardActive]}
            onPress={() => setMode('manual')}
          >
            {mode === 'manual' && (
              <View style={styles.modeCheck}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
              </View>
            )}
            <View style={[styles.modeIconBg, { backgroundColor: '#E0F7FA' }]}>
              <Ionicons name="search" size={24} color={mode === 'manual' ? '#00897B' : Colors.textMuted} />
            </View>
            <Text style={[styles.modeTitle, mode === 'manual' && styles.modeTitleActive]}>Search Manually</Text>
            <Text style={styles.modeSub}>Search area, street or landmark</Text>
          </TouchableOpacity>
        </View>

        {/* Map Preview */}
        <View style={styles.mapPreview}>
          <View style={styles.mapArea}>
            <View style={styles.mapBg}>
              <View style={styles.mapGrid}>
                {['SIRIPURAM', 'MVP COLONY', 'PANDURANGAPURAM', 'SEETHAMMADHARA'].map((label, i) => (
                  <Text key={i} style={[styles.mapLabel, {
                    top: [10, 90, 40, 160][i],
                    left: [120, 30, 200, 20][i],
                  }]}>{label}</Text>
                ))}
              </View>
              <View style={styles.mapPin}>
                <View style={styles.mapPinPulse} />
                <Ionicons name="location" size={32} color={Colors.primary} />
              </View>
            </View>
            <TouchableOpacity style={styles.locateMeBtn}>
              <Ionicons name="locate" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search area, street name or landmark"
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <Ionicons name="options" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Options */}
        {[
          { icon: 'locate', label: 'Use Current Location', sub: 'Detect my current location', bg: Colors.primaryLight },
          { icon: 'add-circle', label: 'Add New Address', sub: 'Manually enter a new address', bg: '#E0FAF4' },
          { icon: 'share-social', label: 'Share Location', sub: 'Share your location from other apps', bg: '#FFF3E0' },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.optionRow}>
            <View style={[styles.optionIcon, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{item.label}</Text>
              <Text style={styles.optionSub}>{item.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}

        {/* Saved Addresses */}
        <View style={styles.savedHeader}>
          <Text style={styles.savedTitle}>Saved Addresses</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {SAVED_ADDRESSES.map((addr) => (
          <TouchableOpacity key={addr.id} style={styles.savedCard}>
            <View style={[styles.savedIcon, { backgroundColor: addr.color }]}>
              <Ionicons name={addr.icon} size={20} color="#fff" />
            </View>
            <View style={styles.savedText}>
              <View style={styles.savedLabelRow}>
                <Text style={styles.savedLabel}>{addr.label}</Text>
                {addr.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={styles.savedAddress}>{addr.address}</Text>
            </View>
            <Ionicons name="ellipsis-vertical" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ))}

        {/* Footer Banner */}
        <View style={styles.footerBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.footerTitle}>Save your favourite locations</Text>
            <Text style={styles.footerSub}>Easily access your saved locations anytime you need.</Text>
          </View>
          <Ionicons name="location" size={48} color="rgba(61,90,254,0.3)" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingBottom: 14, paddingTop: 6 },
  closeBtn: { position: 'absolute', top: 16, right: 20, zIndex: 1, width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'Inter_700Bold', fontSize: 22, color: Colors.textPrimary, marginTop: 6 },
  sub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  modeRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 14 },
  modeCard: { flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14, padding: 12, position: 'relative' },
  modeCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  modeCheck: { position: 'absolute', top: 8, right: 8 },
  modeIconBg: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  modeTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.textPrimary, marginBottom: 2 },
  modeTitleActive: { color: Colors.primary },
  modeSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textSecondary },
  mapPreview: { marginHorizontal: 16, borderRadius: 14, overflow: 'hidden', marginBottom: 14, height: 180, elevation: 2 },
  mapArea: { flex: 1, position: 'relative' },
  mapBg: { flex: 1, backgroundColor: '#E8F4E8', alignItems: 'center', justifyContent: 'center' },
  mapGrid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  mapLabel: { position: 'absolute', fontFamily: 'Inter_400Regular', fontSize: 9, color: '#666', backgroundColor: 'rgba(255,255,255,0.6)', paddingHorizontal: 3, borderRadius: 2 },
  mapPin: { alignItems: 'center', justifyContent: 'center' },
  mapPinPulse: { position: 'absolute', width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(61,90,254,0.2)', top: -9 },
  locateMeBtn: { position: 'absolute', bottom: 12, right: 12, width: 36, height: 36, backgroundColor: '#fff', borderRadius: 18, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 14, height: 46, gap: 10, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.textPrimary },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  optionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  optionText: { flex: 1 },
  optionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.textPrimary, marginBottom: 2 },
  optionSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textSecondary },
  savedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  savedTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, color: Colors.textPrimary },
  viewAll: { color: Colors.primary, fontFamily: 'Inter_500Medium', fontSize: 13 },
  savedCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  savedIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  savedText: { flex: 1 },
  savedLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  savedLabel: { fontFamily: 'Inter_700Bold', fontSize: 14, color: Colors.textPrimary },
  defaultBadge: { backgroundColor: Colors.primaryLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  defaultBadgeText: { color: Colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  savedAddress: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textSecondary },
  footerBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryLight, margin: 16, borderRadius: 14, padding: 16 },
  footerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.textPrimary, marginBottom: 4 },
  footerSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textSecondary },
});
