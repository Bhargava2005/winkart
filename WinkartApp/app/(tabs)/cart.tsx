import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

const CART_ITEMS = [
  {
    id: '1',
    name: 'Samsung 236L Frost Free Double Door Refrigerator',
    variant: '236 L | Black',
    price: '₹26,990',
    mrp: '₹32,990',
    discount: '18% OFF',
    qty: 1,
  },
  {
    id: '2',
    name: 'LG 7 Kg 5 Star Front Load Washing Machine',
    variant: '7 kg | Inverter | Silver',
    price: '₹24,490',
    mrp: '₹28,990',
    discount: '15% OFF',
    qty: 1,
  },
  {
    id: '3',
    name: 'Sony Bravia 43 inch 4K Ultra HD Smart LED TV',
    variant: '43 inch | 4K UHD | Black',
    price: '₹32,990',
    mrp: '₹45,990',
    discount: '28% OFF',
    qty: 1,
  },
];

const TRUSTED_STORES = [
  { id: '1', name: 'Croma', rating: 4.6, orders: '25K+' },
  { id: '2', name: 'Reliance\nDigital', rating: 4.5, orders: '18K+' },
  { id: '3', name: 'Vijay\nSales', rating: 4.4, orders: '12K+' },
  { id: '4', name: 'Flipkart', rating: 4.6, orders: '20K+' },
  { id: '5', name: 'Amazon', rating: 4.5, orders: '35K+' },
];

export default function CartScreen() {
  const router = useRouter();
  const [qtys, setQtys] = useState<Record<string, number>>({ '1': 1, '2': 1, '3': 1 });

  const updateQty = (id: string, delta: number) => {
    setQtys(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }));
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>My Cart</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="search" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="share-social" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cart count */}
        <View style={styles.cartCountRow}>
          <View style={styles.cartIcon}>
            <Ionicons name="bag-handle" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.cartCountText}>{CART_ITEMS.length} Items in your cart</Text>
        </View>

        {/* Cart Items */}
        {CART_ITEMS.map((item) => (
          <View key={item.id} style={styles.cartCard}>
            <View style={styles.cartItemRow}>
              <View style={styles.productImg}>
                <Ionicons name="cube" size={36} color={Colors.textMuted} />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productVariant}>{item.variant}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{item.price}</Text>
                  <Text style={styles.mrp}>{item.mrp}</Text>
                </View>
                <View style={styles.badgeRow}>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{item.discount}</Text>
                  </View>
                  <TouchableOpacity style={styles.wishlistBtn}>
                    <Text style={styles.wishlistText}>Move to wishlist</Text>
                    <Ionicons name="heart-outline" size={14} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.cartItemActions}>
              <View style={styles.qtyControl}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, -1)}>
                  <Ionicons name="remove" size={16} color={Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{qtys[item.id]}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, 1)}>
                  <Ionicons name="add" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity>
                <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Savings */}
        <TouchableOpacity style={styles.savingsRow}>
          <Ionicons name="pricetag" size={18} color={Colors.primary} />
          <Text style={styles.savingsText}> You saved ₹13,500 on this order</Text>
          <Ionicons name="chevron-down" size={18} color={Colors.primary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Trusted Stores */}
        <View style={styles.trustedSection}>
          <View style={styles.trustedHeader}>
            <Text style={styles.trustedTitle}>Shop from trusted stores</Text>
            <TouchableOpacity><Text style={styles.viewAllText}>View all</Text></TouchableOpacity>
          </View>
          <FlatList
            data={TRUSTED_STORES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 14, paddingVertical: 8 }}
            renderItem={({ item }) => (
              <View style={styles.storeCard}>
                <View style={styles.storeLogo}>
                  <Text style={styles.storeLogoText}>{item.name[0]}</Text>
                </View>
                <Text style={styles.storeName}>{item.name}</Text>
                <Text style={styles.storeRating}>{item.rating} ⭐</Text>
                <Text style={styles.storeOrders}>{item.orders} orders</Text>
              </View>
            )}
          />
        </View>

        {/* Trust Badges */}
        <View style={styles.trustBadges}>
          {[
            { icon: 'shield-checkmark', label: '100% Original\nProducts' },
            { icon: 'lock-closed', label: 'Secure\nPayments' },
            { icon: 'refresh-circle', label: 'Easy Returns\nwithin 7 days' },
            { icon: 'ribbon', label: 'Top Brands\nYou Trust' },
          ].map((badge, idx) => (
            <View key={idx} style={styles.trustBadge}>
              <Ionicons name={badge.icon as any} size={20} color={Colors.primary} />
              <Text style={styles.trustBadgeText}>{badge.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomCount}>{CART_ITEMS.length} Items</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.bottomTotal}>₹84,470</Text>
            <Text style={styles.bottomMrp}>₹97,470</Text>
          </View>
          <Text style={styles.bottomSaved}>You saved ₹13,500</Text>
        </View>
        <TouchableOpacity style={styles.proceedBtn}>
          <Text style={styles.proceedBtnText}>Proceed to next step</Text>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 12, paddingTop: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  title: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 20, color: Colors.textPrimary },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  cartCountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 14, padding: 14, gap: 10, elevation: 1 },
  cartIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  cartCountText: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.textPrimary },
  cartCard: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 10, borderRadius: 14, padding: 14, elevation: 1 },
  cartItemRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  productImg: { width: 90, height: 90, borderRadius: 10, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  productInfo: { flex: 1 },
  productName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.textPrimary, lineHeight: 18, marginBottom: 3 },
  productVariant: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  price: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Colors.textPrimary },
  mrp: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textMuted, textDecorationLine: 'line-through' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  discountBadge: { backgroundColor: Colors.primaryLight, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  discountText: { color: Colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  wishlistBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  wishlistText: { color: Colors.primary, fontFamily: 'Inter_400Regular', fontSize: 11 },
  cartItemActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyControl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 10, overflow: 'hidden' },
  qtyBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  qtyText: { paddingHorizontal: 16, fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.textPrimary },
  savingsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5FF', marginHorizontal: 16, marginTop: 10, borderRadius: 12, padding: 12 },
  savingsText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: Colors.primary, flex: 1 },
  trustedSection: { backgroundColor: '#fff', margin: 16, borderRadius: 14, padding: 14, elevation: 1 },
  trustedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  trustedTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, color: Colors.textPrimary },
  viewAllText: { color: Colors.primary, fontFamily: 'Inter_500Medium', fontSize: 13 },
  storeCard: { alignItems: 'center', width: 72 },
  storeLogo: { width: 50, height: 50, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  storeLogoText: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.primary },
  storeName: { fontFamily: 'Inter_500Medium', fontSize: 11, color: Colors.textPrimary, textAlign: 'center', marginBottom: 2 },
  storeRating: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.textSecondary },
  storeOrders: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.textMuted },
  trustBadges: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 14, padding: 14, elevation: 1 },
  trustBadge: { alignItems: 'center', width: 72 },
  trustBadgeText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, elevation: 8 },
  bottomCount: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textSecondary },
  bottomTotal: { fontFamily: 'Inter_700Bold', fontSize: 20, color: Colors.textPrimary },
  bottomMrp: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textMuted, textDecorationLine: 'line-through' },
  bottomSaved: { fontFamily: 'Inter_500Medium', fontSize: 12, color: Colors.primary },
  proceedBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 14, gap: 6 },
  proceedBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
