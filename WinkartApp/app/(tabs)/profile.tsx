import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

const MENU_ITEMS = [
  { icon: 'location-outline', title: 'Manage Location', sub: 'Add or edit delivery locations' },
  { icon: 'settings-outline', title: 'Settings', sub: 'Manage app settings' },
  { icon: 'share-social-outline', title: 'Share the App', sub: 'Invite your friends' },
  { icon: 'information-circle-outline', title: 'About Us', sub: 'Learn more about Winkart' },
  { icon: 'storefront-outline', title: 'Register as Seller', sub: 'Become a seller on Winkart' },
  { icon: 'lock-closed-outline', title: 'Account Privacy', sub: 'Manage your privacy settings' },
  { icon: 'notifications-outline', title: 'Notification Preferences', sub: 'Manage your notification settings' },
];

export default function ProfileScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <Text style={styles.title}>My Profile</Text>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {/* User Card */}
        <TouchableOpacity style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={28} color={Colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Harshitha R</Text>
            <Text style={styles.userPhone}>+91 98765 43210</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* My Orders */}
        <Text style={styles.sectionLabel}>My Orders</Text>
        <View style={styles.ordersCard}>
          {[
            { icon: 'cube-outline', label: 'Orders', sub: 'View your orders' },
            { icon: 'return-up-back-outline', label: 'Returns', sub: 'View returns' },
            { icon: 'shield-checkmark-outline', label: 'Warranty', sub: 'Check status' },
            { icon: 'document-text-outline', label: 'My Bills', sub: 'View invoices' },
          ].map((item, idx) => (
            <View key={idx} style={[styles.orderItem, idx < 3 && styles.orderItemBorder]}>
              <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
              <Text style={styles.orderLabel}>{item.label}</Text>
              <Text style={styles.orderSub}>{item.sub}</Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.menuRow, idx < MENU_ITEMS.length - 1 && styles.menuRowBorder]}
              onPress={() => {
                if (item.title === 'Register as Seller') {
                  router.push('/(seller)/login');
                } else if (item.title === 'Manage Location') {
                  router.push('/location');
                }
              }}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={22} color={Colors.primary} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}

          {/* Logout */}
          <TouchableOpacity style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="log-out-outline" size={22} color={Colors.error} />
            </View>
            <View style={styles.menuText}>
              <Text style={[styles.menuTitle, { color: Colors.error }]}>Logout</Text>
              <Text style={styles.menuSub}>Sign out from your account</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 22, color: Colors.textPrimary },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 14, marginBottom: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  userAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  userInfo: { flex: 1 },
  userName: { fontFamily: 'Inter_700Bold', fontSize: 17, color: Colors.textPrimary, marginBottom: 3 },
  userPhone: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textSecondary },
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 14, color: Colors.textPrimary, marginBottom: 10 },
  ordersCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, marginBottom: 14, elevation: 1, overflow: 'hidden' },
  orderItem: { flex: 1, alignItems: 'center', paddingVertical: 16, paddingHorizontal: 4 },
  orderItemBorder: { borderRightWidth: 1, borderRightColor: Colors.border },
  orderLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.textPrimary, marginTop: 6, textAlign: 'center' },
  orderSub: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.textSecondary, textAlign: 'center', marginTop: 2 },
  menuCard: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', elevation: 1 },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1 },
  menuTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.textPrimary, marginBottom: 2 },
  menuSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textSecondary },
});
