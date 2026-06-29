import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/Colors';

const PRODUCTS = [
  { id: '1', brand: 'boAt', name: 'Airdopes 141 Pro TWS Earbuds', rating: 4.6, reviews: '12.5K', price: '₹1,299', mrp: '₹1,699', save: '₹400', discount: '23% OFF' },
  { id: '2', brand: 'pTron', name: 'Bassbuds Atom TWS Earbuds', rating: 4.4, reviews: '8.2K', price: '₹699', mrp: '₹849', save: '₹150', discount: '18% OFF' },
  { id: '3', brand: 'realme', name: 'Buds T110 TWS Earbuds', rating: 4.5, reviews: '15.2K', price: '₹1,199', mrp: '₹1,429', save: '₹230', discount: '16% OFF' },
  { id: '4', brand: 'OnePlus', name: 'Nord Buds 2r TWS Earbuds', rating: 4.6, reviews: '9.1K', price: '₹1,799', mrp: '₹2,249', save: '₹450', discount: '20% OFF' },
  { id: '5', brand: 'Noise', name: 'Air Buds Mini TWS Earbuds', rating: 4.3, reviews: '6.7K', price: '₹899', mrp: '₹1,149', save: '₹250', discount: '22% OFF' },
  { id: '6', brand: 'Truke', name: 'Buds S1 Lite TWS Earbuds', rating: 4.2, reviews: '3.9K', price: '₹549', mrp: '₹649', save: '₹100', discount: '15% OFF' },
];

const FILTERS = ['Filters 2', 'Sort', 'Brand', 'Price', 'Features'];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('bluetooth ear buds');
  const [cartCount] = useState(2);

  return (
    <View style={styles.container}>
      {/* Blue Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.shopInfo}>
            <View style={styles.shopAvatar}>
              <Text style={styles.shopAvatarText}>EL</Text>
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.shopName}>Electro World</Text>
                <Ionicons name="checkmark-circle" size={14} color={Colors.amber} />
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={11} color={Colors.amber} />
                <Text style={styles.ratingText}> 4.7</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="search" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={{ position: 'relative' }}>
            <Ionicons name="cart" size={22} color="#fff" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Search input */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.primary} />
          <Text style={styles.searchText}>{query}</Text>
          <TouchableOpacity>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f, i) => (
          <TouchableOpacity key={i} style={[styles.filterChip, i === 0 && styles.filterChipActive]}>
            {i === 0 && <Ionicons name="filter" size={13} color={Colors.primary} />}
            {i === 1 && <Ionicons name="swap-vertical" size={13} color={Colors.textSecondary} />}
            {i === 2 && <Ionicons name="pricetag-outline" size={13} color={Colors.textSecondary} />}
            {i === 3 && <Ionicons name="logo-usd" size={13} color={Colors.textSecondary} />}
            <Text style={[styles.filterText, i === 0 && styles.filterTextActive]}>{f}</Text>
            <Ionicons name="chevron-down" size={12} color={i === 0 ? Colors.primary : Colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Promo Banner */}
      <View style={styles.promoBanner}>
        <View style={styles.promoIcon}>
          <Ionicons name="pricetag" size={18} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.promoTitle}>Extra 5% Off on Prepaid Orders</Text>
          <Text style={styles.promoCode}>Use code: PREPAID5</Text>
        </View>
        <TouchableOpacity style={styles.copyBtn}>
          <Text style={styles.copyBtnText}>Copy</Text>
        </TouchableOpacity>
      </View>

      {/* Result count */}
      <View style={styles.resultRow}>
        <Text style={styles.resultText}>120 results for <Text style={styles.resultQuery}>"bluetooth ear buds"</Text></Text>
        <Text style={styles.showingText}>Showing: All Products ▾</Text>
      </View>

      {/* Product Grid */}
      <FlatList
        data={PRODUCTS}
        numColumns={3}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productCard} onPress={() => router.push('/product/1')}>
            <TouchableOpacity style={styles.heartBtn}>
              <Ionicons name="heart-outline" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.productImg}>
              <Ionicons name="headset" size={32} color={Colors.textMuted} />
            </View>
            <View style={styles.discountTag}>
              <Text style={styles.discountTagText}>{item.discount}</Text>
            </View>
            <Text style={styles.productBrand}>{item.brand}</Text>
            <Text style={styles.productName}>{item.name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={10} color={Colors.amber} />
              <Text style={styles.ratingSmall}> {item.rating} ({item.reviews})</Text>
            </View>
            <Text style={styles.price}>{item.price}</Text>
            <Text style={styles.mrp}>{item.mrp}</Text>
            <Text style={styles.save}>Save {item.save}</Text>
            <TouchableOpacity style={styles.addBtn}>
              <Ionicons name="cart-outline" size={12} color="#fff" />
              <Text style={styles.addBtnText}>Add to cart</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* Bottom Filter Bar */}
      <View style={styles.bottomFilterBar}>
        <View>
          <Text style={styles.filtersApplied}>Filters Applied</Text>
          <Text style={styles.filtersCount}>2 filters</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.clearAll}>Clear All</Text>
        </TouchableOpacity>
        <View style={styles.sortBy}>
          <Ionicons name="swap-vertical" size={14} color={Colors.primary} />
          <Text style={styles.sortByText}>Sort by: Popularity ▾</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingBottom: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  shopInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  shopAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.textPrimary, alignItems: 'center', justifyContent: 'center' },
  shopAvatarText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 12 },
  shopName: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: Colors.error, borderRadius: 9, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 9, fontFamily: 'Inter_700Bold' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, height: 42, gap: 8 },
  searchText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.textPrimary },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff' },
  filterChip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, gap: 4 },
  filterChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  filterText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textSecondary },
  filterTextActive: { color: Colors.primary, fontFamily: 'Inter_600SemiBold' },
  promoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryLight, marginHorizontal: 14, marginVertical: 8, borderRadius: 12, padding: 12, gap: 10 },
  promoIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  promoTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.textPrimary },
  promoCode: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textSecondary },
  copyBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  copyBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, marginBottom: 6 },
  resultText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textSecondary },
  resultQuery: { fontFamily: 'Inter_700Bold', color: Colors.textPrimary },
  showingText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textSecondary },
  grid: { paddingHorizontal: 10, paddingBottom: 80 },
  productCard: { flex: 1, margin: 4, backgroundColor: '#fff', borderRadius: 12, padding: 10, elevation: 1 },
  heartBtn: { position: 'absolute', top: 8, right: 8, zIndex: 1 },
  productImg: { height: 80, backgroundColor: Colors.background, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  discountTag: { alignSelf: 'flex-start', backgroundColor: Colors.offBadge, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, marginBottom: 4 },
  discountTagText: { color: Colors.offBadgeText, fontFamily: 'Inter_700Bold', fontSize: 9 },
  productBrand: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.textMuted, marginBottom: 2 },
  productName: { fontFamily: 'Inter_500Medium', fontSize: 11, color: Colors.textPrimary, lineHeight: 14, marginBottom: 3 },
  ratingSmall: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.textSecondary },
  price: { fontFamily: 'Inter_700Bold', fontSize: 13, color: Colors.textPrimary },
  mrp: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.textMuted, textDecorationLine: 'line-through' },
  save: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.success, marginBottom: 6 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, borderRadius: 6, paddingVertical: 6, gap: 3 },
  addBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  bottomFilterBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.border, elevation: 8 },
  filtersApplied: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.textPrimary },
  filtersCount: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textSecondary },
  clearAll: { color: Colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  sortBy: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortByText: { color: Colors.primary, fontFamily: 'Inter_500Medium', fontSize: 12 },
});
