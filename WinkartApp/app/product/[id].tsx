import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';

const THUMBNAILS = [1, 2, 3, 4];

const SPECS = [
  { label: 'Wattage', value: '1100 W' },
  { label: 'Capacity', value: '9 ltr' },
  { label: 'Material', value: 'Steel' },
  { label: 'Warranty', value: '1 Year' },
];

const SIMILAR = [
  { id: '1', name: 'Prestige POTG 9 PC Oven Toaster Griller', price: '₹1,899', mrp: '₹2,695' },
  { id: '2', name: 'PHILIPS HD6975 OTG (9 Litre)', price: '₹2,199', mrp: '₹3,295' },
  { id: '3', name: 'AGARO Marvel OTG (9 Litre)', price: '₹1,849', mrp: '₹2,499' },
  { id: '4', name: 'KENT Master OTG (9 Litre)', price: '₹2,299', mrp: '₹3,499' },
];

const BUNDLE = [
  { name: 'Lifelong LLOT09 OTG (9 Litre)', price: '₹1,999' },
  { name: 'Lifelong Oven Tray & Rack', price: '₹299', mrp: '₹399' },
  { name: 'Lifelong Baking Set (7 Pcs)', price: '₹499', mrp: '₹699' },
];

export default function ProductScreen() {
  const router = useRouter();
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [cartCount] = useState(2);
  const [wishlist, setWishlist] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Lifelong LLOT09 OTG (9 Litre)</Text>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setWishlist(!wishlist)}>
            <Ionicons name={wishlist ? 'heart' : 'heart-outline'} size={18} color={wishlist ? Colors.error : Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="share-social-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="search-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerBtn, { position: 'relative' }]}>
            <Ionicons name="cart-outline" size={18} color={Colors.primary} />
            <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.galleryContainer}>
          <View style={styles.thumbColumn}>
            {THUMBNAILS.map((_, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.thumbItem, selectedThumb === i && styles.thumbItemActive]}
                onPress={() => setSelectedThumb(i)}
              >
                <Ionicons name="cube" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.moreThumb}>
              <Text style={styles.moreThumbText}>+3{'\n'}View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mainImage}>
            <Ionicons name="cube" size={80} color={Colors.textMuted} />
          </View>
        </View>

        {/* Image dots */}
        <View style={styles.imageDots}>
          {[...Array(6)].map((_, i) => (
            <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
          ))}
        </View>

        {/* Specs */}
        <View style={styles.specsRow}>
          {SPECS.map((spec, i) => (
            <View key={i} style={[styles.specItem, i < SPECS.length - 1 && styles.specBorder]}>
              <Text style={styles.specLabel}>{spec.label}</Text>
              <Text style={styles.specValue}>{spec.value}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.viewSpecsBtn}>
            <Text style={styles.viewSpecsText}>View all specs</Text>
            <Ionicons name="chevron-forward" size={12} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.infoCard}>
          <TouchableOpacity style={styles.brandRow}>
            <Text style={styles.brand}>Lifelong</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.productName}>Lifelong LLOT09 OTG (9 Litre)</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={Colors.amber} />
            <Text style={styles.rating}> 4.3</Text>
            <Text style={styles.reviews}> (694 ratings)</Text>
            <View style={styles.bestSellerBadge}>
              <Text style={styles.bestSellerText}>#1 Best seller</Text>
            </View>
          </View>

          {/* Delivery Info */}
          <View style={styles.deliveryRow}>
            <View style={styles.deliveryItem}>
              <Ionicons name="time-outline" size={14} color={Colors.primary} />
              <Text style={styles.deliveryText}> 15 mins delivery</Text>
            </View>
            <View style={styles.deliveryItem}>
              <Ionicons name="cube-outline" size={14} color={Colors.primary} />
              <Text style={styles.deliveryText}> 1 unit</Text>
            </View>
            <View style={styles.deliveryItem}>
              <Ionicons name="fast-food-outline" size={14} color={Colors.primary} />
              <Text style={styles.deliveryText}> 10 left</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
                <Text style={styles.price}>₹1,999</Text>
                <Text style={styles.mrp}>MRP ₹3,000</Text>
                <Text style={styles.discount}>33% OFF</Text>
              </View>
            </View>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeTop}>You save</Text>
              <Text style={styles.saveBadgeAmount}>₹1,001</Text>
            </View>
          </View>

          {/* Offers */}
          <Text style={styles.offersTitle}>Offers for you</Text>
          <View style={styles.offerCard}>
            <View style={styles.offerBankIcon}>
              <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#E53935' }}>AXIS{'\n'}BANK</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.offerTitle}>Buy at ₹1,800</Text>
              <Text style={styles.offerSub}>Get extra ₹199 off on Axis Bank Credit Card Transactions</Text>
            </View>
            <TouchableOpacity style={styles.couponBtn}>
              <Text style={styles.couponBtnText}>AXISNEO{'\n'}Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.moreOffers}>+3 more offers{'\n'}View all</Text>
            </TouchableOpacity>
          </View>

          {/* Store Row */}
          <TouchableOpacity style={styles.storeRow}>
            <View style={styles.storeIcon}>
              <Ionicons name="storefront" size={16} color={Colors.error} />
            </View>
            <View>
              <Text style={styles.storeName}>Lifelong</Text>
              <Text style={styles.storeLink}>Visit Lifelong Store</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          {/* Trust Badges */}
          <View style={styles.trustRow}>
            {['7 Days Replacement', '1 Year Warranty', 'Secure Payments', 'Free Delivery on orders above ₹499'].map((b, i) => (
              <View key={i} style={styles.trustItem}>
                <Ionicons name={['refresh-circle', 'shield-checkmark', 'lock-closed', 'car'][i] as any} size={18} color={Colors.primary} />
                <Text style={styles.trustText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Frequently Bought Together */}
        <View style={styles.bundleCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Frequently bought together</Text>
            <TouchableOpacity><Text style={styles.viewAll}>View all</Text></TouchableOpacity>
          </View>
          <View style={styles.bundleRow}>
            {BUNDLE.map((item, i) => (
              <React.Fragment key={i}>
                <View style={styles.bundleItem}>
                  <View style={styles.bundleImg}>
                    <Ionicons name="cube" size={28} color={Colors.textMuted} />
                  </View>
                  <Text style={styles.bundleName}>{item.name}</Text>
                  <Text style={styles.bundlePrice}>{item.price}</Text>
                </View>
                {i < BUNDLE.length - 1 && <Text style={styles.plusSign}>+</Text>}
              </React.Fragment>
            ))}
            <View style={styles.bundleTotal}>
              <Text style={styles.bundleTotalLabel}>Total Price</Text>
              <Text style={styles.bundleTotalPrice}>₹2,797</Text>
              <Text style={styles.bundleSave}>You save ₹300</Text>
              <TouchableOpacity style={styles.addAllBtn}>
                <Text style={styles.addAllBtnText}>Add all to cart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Similar Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Similar products</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View all</Text></TouchableOpacity>
        </View>
        <FlatList
          data={SIMILAR}
          horizontal showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.similarCard}>
              <View style={styles.similarImg}>
                <Ionicons name="cube" size={28} color={Colors.textMuted} />
              </View>
              <Text style={styles.similarName}>{item.name}</Text>
              <Text style={styles.similarPrice}>{item.price}</Text>
              <Text style={styles.similarMrp}>{item.mrp}</Text>
            </TouchableOpacity>
          )}
        />

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomQty}>1 unit</Text>
          <Text style={styles.bottomPrice}>₹1,999 <Text style={styles.bottomMrp}>MRP ₹3,000</Text></Text>
          <Text style={styles.bottomTax}>Inclusive of all taxes</Text>
        </View>
        <TouchableOpacity style={styles.addCartBtn} onPress={() => router.push('/cart')}>
          <Ionicons name="cart" size={18} color="#fff" />
          <Text style={styles.addCartBtnText}>Add to cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: '#fff', paddingHorizontal: 10, paddingBottom: 10, paddingTop: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.textPrimary, marginHorizontal: 4 },
  badge: { position: 'absolute', top: -3, right: -3, backgroundColor: Colors.error, borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 9, fontFamily: 'Inter_700Bold' },
  galleryContainer: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, margin: 12, borderRadius: 16, elevation: 2 },
  thumbColumn: { width: 66, gap: 8, marginRight: 10 },
  thumbItem: { width: 60, height: 60, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  thumbItemActive: { borderColor: Colors.primary, borderWidth: 2 },
  moreThumb: { width: 60, height: 60, borderRadius: 10, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  moreThumbText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
  mainImage: { flex: 1, height: 220, backgroundColor: Colors.background, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  imageDots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary, width: 14 },
  specsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 12, padding: 12, marginBottom: 10, elevation: 1 },
  specItem: { flex: 1, paddingRight: 8 },
  specBorder: { borderRightWidth: 1, borderRightColor: Colors.border, marginRight: 8 },
  specLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.textMuted, marginBottom: 2 },
  specValue: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.textPrimary },
  viewSpecsBtn: { flexDirection: 'row', alignItems: 'center' },
  viewSpecsText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.primary },
  infoCard: { backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  brand: { color: Colors.primary, fontFamily: 'Inter_500Medium', fontSize: 13 },
  productName: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.textPrimary, marginBottom: 8, lineHeight: 24 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  rating: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.textPrimary },
  reviews: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.primary },
  bestSellerBadge: { marginLeft: 'auto', backgroundColor: Colors.offBadge, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  bestSellerText: { color: Colors.offBadgeText, fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  deliveryRow: { flexDirection: 'row', gap: 16, marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  deliveryItem: { flexDirection: 'row', alignItems: 'center' },
  deliveryText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textSecondary },
  priceSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  price: { fontFamily: 'Inter_700Bold', fontSize: 24, color: Colors.textPrimary },
  mrp: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textMuted, textDecorationLine: 'line-through' },
  discount: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.success },
  saveBadge: { backgroundColor: Colors.primaryLight, borderRadius: 8, padding: 8, alignItems: 'center' },
  saveBadgeTop: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.primary },
  saveBadgeAmount: { fontFamily: 'Inter_700Bold', fontSize: 14, color: Colors.primary },
  offersTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: Colors.textPrimary, marginBottom: 8 },
  offerCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 10, gap: 8, marginBottom: 12 },
  offerBankIcon: { width: 36, height: 36, borderRadius: 6, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center' },
  offerTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: Colors.textPrimary },
  offerSub: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.textSecondary, lineHeight: 13 },
  couponBtn: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 6, padding: 6, alignItems: 'center' },
  couponBtnText: { color: Colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 10, textAlign: 'center' },
  moreOffers: { color: Colors.primary, fontFamily: 'Inter_400Regular', fontSize: 10, textAlign: 'center' },
  storeRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, gap: 10, marginBottom: 12 },
  storeIcon: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center' },
  storeName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.textPrimary },
  storeLink: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.primary },
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  trustItem: { width: '45%', flexDirection: 'row', alignItems: 'center', gap: 6 },
  trustText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textSecondary, flex: 1 },
  bundleCard: { backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 12 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, color: Colors.textPrimary },
  viewAll: { color: Colors.primary, fontFamily: 'Inter_500Medium', fontSize: 13 },
  bundleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  bundleItem: { width: 90, alignItems: 'center' },
  bundleImg: { width: 70, height: 70, backgroundColor: Colors.background, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  bundleName: { fontFamily: 'Inter_400Regular', fontSize: 9, color: Colors.textSecondary, textAlign: 'center', lineHeight: 12 },
  bundlePrice: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: Colors.textPrimary, marginTop: 3 },
  plusSign: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.textMuted },
  bundleTotal: { flex: 1, alignItems: 'flex-end' },
  bundleTotalLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textSecondary },
  bundleTotalPrice: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.textPrimary },
  bundleSave: { fontFamily: 'Inter_500Medium', fontSize: 12, color: Colors.success, marginBottom: 8 },
  addAllBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  addAllBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  similarCard: { width: 130, backgroundColor: '#fff', borderRadius: 12, padding: 10, elevation: 1 },
  similarImg: { height: 80, backgroundColor: Colors.background, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  similarName: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textPrimary, lineHeight: 14, marginBottom: 3 },
  similarPrice: { fontFamily: 'Inter_700Bold', fontSize: 13, color: Colors.textPrimary },
  similarMrp: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.textMuted, textDecorationLine: 'line-through' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.border, elevation: 8 },
  bottomQty: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textSecondary },
  bottomPrice: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Colors.textPrimary },
  bottomMrp: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textMuted, textDecorationLine: 'line-through' },
  bottomTax: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.textMuted },
  addCartBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 13, gap: 8 },
  addCartBtnText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 15 },
});
