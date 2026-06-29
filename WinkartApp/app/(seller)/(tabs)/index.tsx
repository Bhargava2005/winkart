import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SellerDashboardScreen() {
  const router = useRouter();
  // TODO: fetch from API — true means catalog has been configured
  const [catalogSetup, setCatalogSetup] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [shopId, setShopId] = useState<string>('1');

  useEffect(() => {
    AsyncStorage.getItem('seller_shop_id').then((id) => {
      if (id) setShopId(id);
    });
  }, []);

  const handlePreviewShop = () => {
    router.push(`/shop/${shopId}` as any);
  };

  const metrics = [
    { title: 'Orders Today', value: '48', icon: 'cart-outline', color: Colors.primary },
    { title: 'Revenue Today', value: '₹1.24L', icon: 'cash-outline', color: Colors.success },
    { title: 'Pending Orders', value: '12', icon: 'time-outline', color: Colors.amber },
    { title: 'Total Products', value: '342', icon: 'cube-outline', color: Colors.purple },
  ];

  const recentOrders = [
    { id: '#ORD001', customer: 'Rahul Kumar', amount: '₹5,490', status: 'Delivered', statusColor: Colors.success },
    { id: '#ORD002', customer: 'Priya Singh', amount: '₹2,199', status: 'Processing', statusColor: Colors.amber },
    { id: '#ORD003', customer: 'Amit Sharma', amount: '₹14,990', status: 'Delivered', statusColor: Colors.success },
    { id: '#ORD004', customer: 'Sneha Patel', amount: '₹850', status: 'Cancelled', statusColor: Colors.error },
  ];

  // Custom Chart Data representation (height percentage)
  const weeklyData = [
    { day: 'Mon', value: 40 },
    { day: 'Tue', value: 75 },
    { day: 'Wed', value: 50 },
    { day: 'Thu', value: 90 },
    { day: 'Fri', value: 65 },
    { day: 'Sat', value: 85 },
    { day: 'Sun', value: 55 },
  ];

  const monthlyData = [
    { day: 'W1', value: 60 },
    { day: 'W2', value: 85 },
    { day: 'W3', value: 70 },
    { day: 'W4', value: 95 },
  ];

  const activeChartData = chartPeriod === 'weekly' ? weeklyData : monthlyData;

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.shopInfo}>
            <View style={styles.shopIconBg}>
              <Ionicons name="storefront" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.shopName}>Electro World</Text>
              <Text style={styles.shopStatus}>🟢 Active Seller</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, styles.previewButton]}
              onPress={handlePreviewShop}
            >
              <Ionicons name="eye-outline" size={18} color={Colors.primary} />
              <Text style={styles.previewButtonText}>Customer View</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => Alert.alert('Notifications', 'No new notifications.')}>
              <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/(seller)/(tabs)/profile')}>
              <Ionicons name="person-outline" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Metric Grid */}
        <View style={styles.metricsGrid}>
          {metrics.map((item, idx) => (
            <View key={idx} style={styles.metricCard}>
              <View style={[styles.metricIconBg, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.metricValue}>{item.value}</Text>
              <Text style={styles.metricTitle}>{item.title}</Text>
            </View>
          ))}
        </View>

        {/* Catalog Setup Banner */}
        {!catalogSetup && (
          <TouchableOpacity
            style={styles.catalogBanner}
            onPress={() => router.push('/(seller)/catalog-setup' as any)}
            activeOpacity={0.85}
          >
            <View style={styles.catalogBannerLeft}>
              <View style={styles.catalogBannerIcon}>
                <Ionicons name="layers-outline" size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.catalogBannerTitle}>Setup your Product Structure</Text>
                <Text style={styles.catalogBannerSub}>
                  Define your categories, sub-levels &amp; product fields to start selling.
                </Text>
              </View>
            </View>
            <Ionicons name="arrow-forward-circle" size={26} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        )}

        {/* Quick Actions / shortcuts */}
        <Text style={styles.sectionLabel}>Quick Tools</Text>
        <View style={styles.quickToolsRow}>
          {[
            { label: 'Catalog', icon: 'layers', route: '/(seller)/catalog-setup' },
            { label: 'Categories', icon: 'grid', route: '/(seller)/categories' },
            { label: 'Upselling', icon: 'pricetags', route: '/(seller)/upsell' },
            { label: 'Import/Export', icon: 'swap-vertical', route: '/(seller)/import-export' },
          ].map((tool, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.toolButton}
              onPress={() => router.push(tool.route as any)}
            >
              <Ionicons name={tool.icon as any} size={22} color={Colors.primary} />
              <Text style={styles.toolLabel}>{tool.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Orders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Recent Orders</Text>
          <TouchableOpacity onPress={() => router.push('/(seller)/(tabs)/orders')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.ordersCard}>
          {recentOrders.map((order, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.orderRow, idx < recentOrders.length - 1 && styles.orderRowBorder]}
              onPress={() => router.push('/(seller)/(tabs)/orders')}
            >
              <View style={styles.orderLeft}>
                <Text style={styles.orderId}>{order.id}</Text>
                <Text style={styles.orderCustomer}>{order.customer}</Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderAmount}>{order.amount}</Text>
                <View style={[styles.statusBadge, { backgroundColor: order.statusColor + '15' }]}>
                  <Text style={[styles.statusBadgeText, { color: order.statusColor }]}>{order.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Revenue Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Revenue Performance</Text>
              <Text style={styles.chartSub}>Sales data overview</Text>
            </View>
            <View style={styles.chartToggleContainer}>
              <TouchableOpacity
                style={[styles.toggleBtn, chartPeriod === 'weekly' && styles.toggleBtnActive]}
                onPress={() => setChartPeriod('weekly')}
              >
                <Text style={[styles.toggleText, chartPeriod === 'weekly' && styles.toggleTextActive]}>W</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, chartPeriod === 'monthly' && styles.toggleBtnActive]}
                onPress={() => setChartPeriod('monthly')}
              >
                <Text style={[styles.toggleText, chartPeriod === 'monthly' && styles.toggleTextActive]}>M</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bar Chart Container */}
          <View style={styles.chartBody}>
            {activeChartData.map((item, idx) => (
              <View key={idx} style={styles.chartBarCol}>
                <View style={styles.chartBarTrack}>
                  <View style={[styles.chartBarFill, { height: `${item.value}%` }]} />
                </View>
                <Text style={styles.chartBarLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

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
    paddingVertical: 12,
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shopIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopName: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  shopStatus: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewButton: {
    width: 'auto',
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 5,
    backgroundColor: Colors.primaryLight,
  },
  previewButtonText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  scrollContent: {
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  metricIconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  sectionLabel: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  quickToolsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  toolButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 1,
  },
  toolLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  ordersCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 1,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  orderRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  orderLeft: {
    gap: 4,
  },
  orderId: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  orderCustomer: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  orderAmount: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  chartSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chartToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  toggleText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.primary,
  },
  chartBody: {
    flexDirection: 'row',
    height: 160,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 10,
  },
  chartBarCol: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarTrack: {
    height: 120,
    width: 14,
    backgroundColor: '#F5F7FA',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 7,
  },
  chartBarLabel: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    marginTop: 8,
  },
  // Catalog Setup Banner
  catalogBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.purple,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.purple,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  catalogBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  catalogBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catalogBannerTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    marginBottom: 2,
  },
  catalogBannerSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 16,
  },
});
