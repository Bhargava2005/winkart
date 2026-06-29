import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';

const SHOP_CATEGORIES = [
  { id: '1', name: 'Televisions', icon: 'monitor' },
  { id: '2', name: 'Washing\nMachines', icon: 'washing-machine' },
  { id: '3', name: 'Refrigerators', icon: 'fridge' },
  { id: '4', name: 'Air\nConditioners', icon: 'air-conditioner' },
  { id: '5', name: 'Headphones', icon: 'headphones' },
  { id: '6', name: 'More', icon: 'dots-grid' },
];

const TOP_PRODUCTS = [
  { id: '1', name: "Samsung 55\" 4K Ultra HD Smart TV", rating: 4.6, reviews: 342, price: '₹45,990', mrp: '₹50,990', discount: '10% OFF', save: '₹5,000' },
  { id: '2', name: 'LG 7kg Front Load Washing Machine', rating: 4.7, reviews: 512, price: '₹28,490', mrp: '₹32,500', discount: '12% OFF', save: '₹4,010' },
  { id: '3', name: 'Whirlpool 245L Double Door Fridge', rating: 4.5, reviews: 231, price: '₹22,990', mrp: '₹24,990', discount: '8% OFF', save: '₹2,000' },
  { id: '4', name: 'boAt Rockerz 450 Wireless Headphone', rating: 4.6, reviews: 642, price: '₹1,699', mrp: '₹1,999', discount: '15% OFF', save: '₹300' },
];

const ALSO_LIKE = [
  { id: '1', name: 'OnePlus Nord Buds 2', rating: 4.5, price: '₹2,199', mrp: '₹2,699' },
  { id: '2', name: 'Zebronics 200W Soundbar', rating: 4.4, price: '₹3,299', mrp: '₹3,999' },
  { id: '3', name: 'IFB 20L Solo Microwave Oven', rating: 4.6, price: '₹6,990', mrp: '₹7,990' },
  { id: '4', name: 'HP 15s Intel Core i5 Laptop', rating: 4.7, price: '₹49,990', mrp: '₹54,990' },
];

export default function ShopScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [cartCount] = useState(2);

  return (
    <View style={styles.container}>
      {/* Purple Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={Colors.textMuted} />
            <TextInput
              placeholder="Search products in Electro World"
              placeholderTextColor={Colors.textMuted}
              style={styles.searchInput}
            />
            <Ionicons name="mic" size={16} color={Colors.primary} />
          </View>
          <TouchableOpacity style={styles.cartBtn}>
            <Ionicons name="cart" size={22} color="#fff" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Shop Info Card */}
        <View style={styles.shopInfoCard}>
          <View style={styles.shopTop}>
            <View style={styles.shopAvatar}>
              <Text style={styles.shopAvatarText}>EL</Text>
            </View>
            <View style={styles.shopDetails}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.shopName}>Electro World</Text>
                <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color={Colors.amber} />
                <Text style={styles.ratingText}> 4.7 (1,248 ratings)</Text>
              </View>
              <Text style={styles.shopType}>Electronics Store</Text>
            </View>
            <TouchableOpacity style={styles.followBtn}>
              <Ionicons name="heart-outline" size={14} color={Colors.primary} />
              <Text style={styles.followBtnText}>Follow</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.shopFeatures}>
            {['1000+ Products', 'Fast Support', 'Trusted Store'].map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <Ionicons name={['pricetag', 'headset', 'shield-checkmark'][i] as any} size={14} color={Colors.primary} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.newArrivalBadge}><Text style={styles.newArrivalText}>New Arrival</Text></View>
          <Text style={styles.bannerTitle}>Upgrade Your Home{'\n'}with Latest Tech!</Text>
          <Text style={styles.bannerSub}>Best brands | Best prices | Easy returns</Text>
          <TouchableOpacity style={styles.shopNowBtn}>
            <Text style={styles.shopNowText}>Shop Now</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </TouchableOpacity>
          <View style={styles.bannerDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} /><View style={styles.dot} /><View style={styles.dot} />
          </View>
        </View>

        {/* Shop By Category */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View all →</Text></TouchableOpacity>
        </View>
        <FlatList
          data={SHOP_CATEGORIES}
          horizontal showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 14, paddingBottom: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.catItem}>
              <View style={styles.catCircle}>
                <MaterialCommunityIcons name={item.icon as any} size={24} color={Colors.textPrimary} />
              </View>
              <Text style={styles.catName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Top Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Products from Electro World</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View all →</Text></TouchableOpacity>
        </View>
        <FlatList
          data={TOP_PRODUCTS}
          horizontal showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.productCard} onPress={() => router.push('/product/1')}>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{item.discount}</Text>
              </View>
              <View style={styles.productImg}>
                <Ionicons name="cube" size={40} color={Colors.textMuted} />
              </View>
              <Text style={styles.productName}>{item.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={11} color={Colors.amber} />
                <Text style={styles.ratingSmall}> {item.rating} ({item.reviews})</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{item.price}</Text>
                <Text style={styles.mrp}> {item.mrp}</Text>
              </View>
              <Text style={styles.save}>Save {item.save}</Text>
              <TouchableOpacity style={styles.addBtn}>
                <Ionicons name="cart-outline" size={14} color="#fff" />
                <Text style={styles.addBtnText}>Add to cart</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />

        {/* Trust Badges */}
        <View style={styles.trustRow}>
          {['100% Original\nProducts', 'Secure\nPayments', '7 Days Easy\nReturns', 'Free Delivery\non orders above ₹499'].map((b, i) => (
            <View key={i} style={styles.trustBadge}>
              <Ionicons name={['shield-checkmark', 'lock-closed', 'refresh-circle', 'car'][i] as any} size={18} color={Colors.primary} />
              <Text style={styles.trustText}>{b}</Text>
            </View>
          ))}
        </View>

        {/* You May Also Like */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>You May Also Like</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View all →</Text></TouchableOpacity>
        </View>
        <FlatList
          data={ALSO_LIKE}
          horizontal showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.alsoCard}>
              <View style={styles.alsoImg}>
                <Ionicons name="cube" size={32} color={Colors.textMuted} />
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={10} color={Colors.amber} />
                <Text style={styles.ratingSmall}> {item.rating}</Text>
              </View>
              <Text style={styles.alsoName}>{item.name}</Text>
              <Text style={styles.price}>{item.price}</Text>
              <Text style={styles.mrp}>{item.mrp}</Text>
            </TouchableOpacity>
          )}
        />

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Cart Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.cartInfo}>
          <Ionicons name="cart" size={22} color="#fff" />
          <View>
            <Text style={styles.cartInfoCount}>{cartCount} Items in cart</Text>
            <Text style={styles.cartInfoTotal}>Total: ₹30,189</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.viewCartBtn} onPress={() => router.push('/cart')}>
          <Text style={styles.viewCartText}>View cart →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, height: 42, gap: 8 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.textPrimary },
  cartBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: Colors.error, borderRadius: 9, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold' },
  shopInfoCard: { backgroundColor: '#fff', margin: 14, borderRadius: 16, padding: 14, elevation: 2 },
  shopTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 10 },
  shopAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.textPrimary, alignItems: 'center', justifyContent: 'center' },
  shopAvatarText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 16 },
  shopDetails: { flex: 1 },
  shopName: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Colors.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  ratingText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textSecondary },
  shopType: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textMuted },
  followBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, gap: 4 },
  followBtnText: { color: Colors.primary, fontFamily: 'Inter_500Medium', fontSize: 13 },
  shopFeatures: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featureText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textSecondary },
  bannerCard: { backgroundColor: Colors.primaryLight, marginHorizontal: 14, borderRadius: 16, padding: 18, marginBottom: 8 },
  newArrivalBadge: { alignSelf: 'flex-start', borderWidth: 1, borderColor: Colors.primary, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 10 },
  newArrivalText: { color: Colors.primary, fontFamily: 'Inter_500Medium', fontSize: 11 },
  bannerTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.primary, marginBottom: 6 },
  bannerSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textSecondary, marginBottom: 14 },
  shopNowBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start', gap: 6 },
  shopNowText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  bannerDots: { flexDirection: 'row', gap: 6, marginTop: 14, justifyContent: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(61,90,254,0.25)' },
  dotActive: { backgroundColor: Colors.primary, width: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10, marginTop: 12 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, color: Colors.textPrimary },
  viewAll: { color: Colors.primary, fontFamily: 'Inter_500Medium', fontSize: 12 },
  catItem: { alignItems: 'center', width: 72 },
  catCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  catName: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  productCard: { width: 160, backgroundColor: '#fff', borderRadius: 14, padding: 12, elevation: 2 },
  discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#E53935', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, zIndex: 1 },
  discountText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 10 },
  productImg: { height: 100, backgroundColor: Colors.background, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  productName: { fontFamily: 'Inter_500Medium', fontSize: 12, color: Colors.textPrimary, lineHeight: 16, marginBottom: 4 },
  ratingSmall: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textSecondary },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  price: { fontFamily: 'Inter_700Bold', fontSize: 14, color: Colors.textPrimary },
  mrp: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textMuted, textDecorationLine: 'line-through' },
  save: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.success, marginBottom: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, borderRadius: 8, paddingVertical: 8, gap: 4 },
  addBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  trustRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', marginHorizontal: 14, borderRadius: 14, padding: 14, marginVertical: 8, elevation: 1 },
  trustBadge: { alignItems: 'center', width: 72 },
  trustText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  alsoCard: { width: 130, backgroundColor: '#fff', borderRadius: 12, padding: 10, elevation: 1 },
  alsoImg: { height: 80, backgroundColor: Colors.background, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  alsoName: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textPrimary, lineHeight: 15, marginVertical: 4 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, elevation: 8 },
  cartInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartInfoCount: { color: '#fff', fontFamily: 'Inter_400Regular', fontSize: 12 },
  cartInfoTotal: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 14 },
  viewCartBtn: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  viewCartText: { color: Colors.primary, fontFamily: 'Inter_700Bold', fontSize: 14 },
});
