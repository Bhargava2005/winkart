import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

const BILLS = [
  { id: '1', store: 'Croma', date: '12 May, 2025', time: '10:30 AM', invoiceId: '#BLK123456789', amount: '₹26,990' },
  { id: '2', store: 'Reliance Digital', date: '08 May, 2025', time: '11:15 AM', invoiceId: '#BLK123456788', amount: '₹24,490' },
  { id: '3', store: 'Vijay Sales', date: '03 May, 2025', time: '02:15 PM', invoiceId: '#BLK123456787', amount: '₹32,990' },
  { id: '4', store: 'IFB Appliances', date: '28 Apr, 2025', time: '04:45 PM', invoiceId: '#BLK123456786', amount: '₹6,990' },
  { id: '5', store: 'Croma', date: '18 Apr, 2025', time: '01:30 PM', invoiceId: '#BLK123456785', amount: '₹37,990' },
  { id: '6', store: 'Amazon', date: '10 Apr, 2025', time: '09:20 AM', invoiceId: '#BLK123456784', amount: '₹54,990' },
];

export default function BillsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = BILLS.filter(b =>
    b.store.toLowerCase().includes(search.toLowerCase()) ||
    b.invoiceId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>My Bills</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="search" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="cart-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bills"
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options" size={16} color={Colors.primary} />
          <Text style={styles.filterText}>Filters</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.shopMoreBanner}>
            <View style={styles.shopMoreLeft}>
              <View style={styles.shopMoreIcon}>
                <Ionicons name="bag-check" size={22} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.shopMoreTitle}>Explore more products</Text>
                <Text style={styles.shopMoreSub}>Find the best deals and exclusive offers</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.shopMoreBtn} onPress={() => router.push('/')}>
              <Text style={styles.shopMoreBtnText}>Shop More</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.billCard} onPress={() => router.push(`/bill/${item.id}`)}>
            <View style={styles.billInfo}>
              <Text style={styles.billStore}>{item.store}</Text>
              <View style={styles.billMeta}>
                <Ionicons name="calendar-outline" size={13} color={Colors.primary} />
                <Text style={styles.billMetaText}> {item.date}</Text>
              </View>
              <View style={styles.billMeta}>
                <Ionicons name="time-outline" size={13} color={Colors.primary} />
                <Text style={styles.billMetaText}> {item.time}</Text>
              </View>
              <View style={styles.billMeta}>
                <Ionicons name="document-outline" size={13} color={Colors.primary} />
                <Text style={styles.billMetaText}> Invoice ID: {item.invoiceId}</Text>
              </View>
            </View>
            <View style={styles.billRight}>
              <Text style={styles.billAmount}>{item.amount}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: 'Inter_700Bold', fontSize: 22, color: Colors.textPrimary },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.textPrimary },
  filterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, height: 44, gap: 6, borderWidth: 1, borderColor: Colors.border },
  filterText: { color: Colors.primary, fontFamily: 'Inter_500Medium', fontSize: 14 },
  list: { padding: 16, gap: 12, paddingBottom: 20 },
  billCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  billInfo: { flex: 1 },
  billStore: { fontFamily: 'Inter_700Bold', fontSize: 15, color: Colors.textPrimary, marginBottom: 6 },
  billMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  billMetaText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textSecondary },
  billRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  billAmount: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Colors.textPrimary },
  shopMoreBanner: { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'column', gap: 12, marginTop: 4, elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  shopMoreLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  shopMoreIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  shopMoreTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.primary },
  shopMoreSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  shopMoreBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center', gap: 6 },
  shopMoreBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});
