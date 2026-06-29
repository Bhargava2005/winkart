import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';

const PRODUCTS = [
  { id: '1', name: 'Samsung 236L Frost Free Double Door Refrigerator', variant: '236 L | Black', price: '₹26,990', qty: 1 },
  { id: '2', name: 'LG 7 Kg 5 Star Front Load Washing Machine', variant: '7 kg | Inverter | Silver', price: '₹24,490', qty: 1 },
  { id: '3', name: 'Sony Bravia 43 inch 4K Ultra HD Smart LED TV', variant: '43 inch | 4K UHD | Black', price: '₹32,990', qty: 1 },
];

export default function BillDetailScreen() {
  const router = useRouter();
  const [productsExpanded, setProductsExpanded] = useState(true);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Invoice Details</Text>
          <TouchableOpacity style={styles.downloadBtn}>
            <Ionicons name="cloud-download-outline" size={16} color={Colors.primary} />
            <Text style={styles.downloadBtnText}>Download Invoice</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {/* Store Card */}
        <View style={styles.storeCard}>
          <View style={styles.storeTop}>
            <View style={styles.storeIcon}>
              <Ionicons name="storefront" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.storeName}>Croma</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
          </View>
          <View style={styles.storeMeta}>
            <View style={styles.storeMetaItem}>
              <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
              <View>
                <Text style={styles.storeMetaLabel}>Invoice Date</Text>
                <Text style={styles.storeMetaValue}>12 May, 2025</Text>
              </View>
            </View>
            <View style={styles.storeMetaDivider} />
            <View style={styles.storeMetaItem}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
              <View>
                <Text style={styles.storeMetaLabel}>Invoice Time</Text>
                <Text style={styles.storeMetaValue}>10:30 AM</Text>
              </View>
            </View>
            <View style={styles.storeMetaDivider} />
            <View style={styles.storeMetaItem}>
              <Ionicons name="logo-usd" size={16} color={Colors.primary} />
              <View>
                <Text style={styles.storeMetaLabel}>Total Amount</Text>
                <Text style={styles.storeMetaValue}>₹70,970</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Invoice ID */}
        <TouchableOpacity style={styles.invoiceCard}>
          <View style={styles.invoiceIcon}>
            <Ionicons name="document-text-outline" size={22} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.invoiceLabel}>Invoice ID</Text>
            <Text style={styles.invoiceId}>#INV1234567890</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Delivery Address */}
        <View style={styles.addressCard}>
          <View style={styles.addressTop}>
            <View style={styles.addressIcon}>
              <Ionicons name="location-outline" size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLabel}>Delivery Address</Text>
              <Text style={styles.addressName}>Harshitha R</Text>
              <Text style={styles.addressText}>4th Floor, Buchhamma Flats,{'\n'}Bobbas Lakshmi Road, Moghalrajpuram,{'\n'}Vijayawada, Andhra Pradesh - 520010</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewDetailsText}>View Details </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Products */}
        <View style={styles.productsCard}>
          <TouchableOpacity style={styles.productsHeader} onPress={() => setProductsExpanded(!productsExpanded)}>
            <Text style={styles.productsTitle}>Products ({PRODUCTS.length})</Text>
            <Ionicons name={productsExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.primary} />
          </TouchableOpacity>
          {productsExpanded && PRODUCTS.map((product, idx) => (
            <View key={product.id} style={[styles.productRow, idx < PRODUCTS.length - 1 && styles.productBorder]}>
              <View style={styles.productImg}>
                <Ionicons name="cube" size={28} color={Colors.textMuted} />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productVariant}>{product.variant}</Text>
                <Text style={styles.productQty}>Qty: {product.qty}</Text>
              </View>
              <Text style={styles.productPrice}>{product.price}</Text>
            </View>
          ))}
        </View>

        {/* Price Breakdown */}
        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price (3 Items)</Text>
            <Text style={styles.priceValue}>₹84,470</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Charges</Text>
            <Text style={styles.priceValue}>₹0</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: Colors.success }]}>Coupon Discount</Text>
            <Text style={[styles.priceValue, { color: Colors.success }]}>-₹13,500</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹70,970</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Paid via UPI</Text>
            <Text style={styles.priceValue}>₹70,970</Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 12, paddingTop: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.textPrimary },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, gap: 4 },
  downloadBtnText: { color: Colors.primary, fontFamily: 'Inter_500Medium', fontSize: 12 },
  storeCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 1 },
  storeTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  storeIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  storeName: { fontFamily: 'Inter_700Bold', fontSize: 18, color: Colors.primary },
  storeMeta: { flexDirection: 'row', justifyContent: 'space-around' },
  storeMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  storeMetaDivider: { width: 1, backgroundColor: Colors.border, height: '100%' },
  storeMetaLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textMuted },
  storeMetaValue: { fontFamily: 'Inter_700Bold', fontSize: 14, color: Colors.textPrimary },
  invoiceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, gap: 12, elevation: 1 },
  invoiceIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  invoiceLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textMuted },
  invoiceId: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Colors.textPrimary },
  addressCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 1 },
  addressTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  addressIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  addressLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textMuted, marginBottom: 3 },
  addressName: { fontFamily: 'Inter_700Bold', fontSize: 15, color: Colors.textPrimary, marginBottom: 3 },
  addressText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  viewDetailsText: { color: Colors.primary, fontFamily: 'Inter_500Medium', fontSize: 13 },
  productsCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 1 },
  productsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  productsTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, color: Colors.textPrimary },
  productRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, gap: 10 },
  productBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  productImg: { width: 70, height: 70, backgroundColor: Colors.background, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  productInfo: { flex: 1 },
  productName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.textPrimary, lineHeight: 18, marginBottom: 3 },
  productVariant: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textMuted, marginBottom: 3 },
  productQty: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textSecondary },
  productPrice: { fontFamily: 'Inter_700Bold', fontSize: 14, color: Colors.textPrimary },
  priceCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, elevation: 1 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  priceLabel: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.textSecondary },
  priceValue: { fontFamily: 'Inter_500Medium', fontSize: 14, color: Colors.textPrimary },
  priceDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  totalLabel: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Colors.textPrimary },
  totalValue: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Colors.textPrimary },
});
