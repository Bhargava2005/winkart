import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image, FlatList, Dimensions, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', name: 'All', icon: 'apps' as const },
  { id: '2', name: 'Furniture', icon: 'sofa' as const },
  { id: '3', name: 'Electrical', icon: 'lightning-bolt' as const },
  { id: '4', name: 'Tiles', icon: 'view-grid' as const },
  { id: '5', name: 'Plumbing', icon: 'pipe' as const },
  { id: '6', name: 'Electronics', icon: 'monitor' as const },
  { id: '7', name: 'Home\nAppliances', icon: 'washing-machine' as const },
  { id: '8', name: 'More', icon: 'dots-grid' as const },
];

const TOP_SHOPS = [
  { id: '1', name: 'Furniture Hub', initials: 'FM', rating: 4.7, reviews: 512, open: true },
  { id: '2', name: 'Electro World', initials: 'EL', rating: 4.6, reviews: 384, open: true },
  { id: '3', name: 'Tiles Corner', initials: 'TS', rating: 4.7, reviews: 298, open: true },
];

const TRENDING = [
  { id: '1', title: 'Top Furniture\nShops', sub: 'Stylish & Durable\nFurniture for Every\nHome', color: '#EDE9FE' },
  { id: '2', title: 'Best Electronics\nShops', sub: 'Latest Gadgets &\nElectronics at\nBest Prices', color: '#E0F7FA' },
  { id: '3', title: 'Premium Tiles\nShops', sub: 'Top Quality Tiles\nfor Beautiful\nSpaces', color: '#FFF8E1' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('1');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.locationRow} onPress={() => setLocationModalVisible(true)}>
            <View style={styles.locationIcon}>
              <Ionicons name="location" size={20} color="#fff" />
            </View>
            <View style={styles.locationText}>
              <View style={styles.locationNameRow}>
                <Text style={styles.locationName}>Harshitha • Home </Text>
                <Ionicons name="chevron-down" size={14} color="#fff" />
              </View>
              <Text style={styles.locationAddress}>4th Floor, MVP Colony, Visakhapatnam</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatar}>
            <Ionicons name="person-circle" size={42} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/search')}>
          <Ionicons name="search" size={20} color={Colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Search for shops, products and more...</Text>
          <Ionicons name="mic" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.section}>
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.categoryItem, selectedCategory === item.id && styles.categoryItemActive]}
                onPress={() => setSelectedCategory(item.id)}
              >
                <View style={[styles.categoryIcon, selectedCategory === item.id && styles.categoryIconActive]}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={26}
                    color={selectedCategory === item.id ? Colors.primary : Colors.textSecondary}
                  />
                </View>
                <Text style={[styles.categoryName, selectedCategory === item.id && styles.categoryNameActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroBannerContent}>
            <Text style={styles.heroBannerSmall}>WELCOME TO</Text>
            <Text style={styles.heroBannerTitle}>
              <Text style={{ color: '#fff' }}>WINK</Text>
              <Text style={{ color: Colors.amber }}>ART</Text>
            </Text>
            <Text style={styles.heroBannerSub}>Your one-stop shop{'\n'}for everything you need</Text>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadge}>
                <Ionicons name="cube-outline" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroBadgeText}>Wide{'\n'}Range</Text>
              </View>
              <View style={styles.heroBadge}>
                <Ionicons name="pricetag-outline" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroBadgeText}>Best{'\n'}Prices</Text>
              </View>
              <View style={styles.heroBadge}>
                <Ionicons name="shield-checkmark-outline" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.heroBadgeText}>Secure{'\n'}Shopping</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/shop/1')}>
              <Text style={styles.exploreBtnText}>Explore Shops</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.heroBannerDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Top Shops Near You */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Shops Near You</Text>
          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View all</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={TOP_SHOPS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.shopList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.shopCard} onPress={() => router.push(`/shop/${item.id}`)}>
              {item.open && (
                <View style={styles.openBadge}>
                  <Text style={styles.openBadgeText}>Open</Text>
                </View>
              )}
              <View style={styles.shopCardBg} />
              <View style={styles.shopAvatar}>
                <Text style={styles.shopAvatarText}>{item.initials}</Text>
              </View>
              <Text style={styles.shopName}>{item.name}</Text>
              <View style={styles.shopRatingRow}>
                <Ionicons name="star" size={12} color={Colors.amber} />
                <Text style={styles.shopRating}> {item.rating} ({item.reviews})</Text>
                <TouchableOpacity style={styles.shopChevron}>
                  <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Trending Shops */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Shops Near You</Text>
          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View all</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={TRENDING}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.shopList}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.trendCard, { backgroundColor: item.color }]}>
              <Text style={styles.trendTitle}>{item.title}</Text>
              <Text style={styles.trendSub}>{item.sub}</Text>
              <TouchableOpacity style={styles.exploreSmallBtn}>
                <Text style={styles.exploreSmallBtnText}>Explore</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />

        {/* Deals Banner */}
        <View style={styles.dealsBanner}>
          <View style={styles.dealsLeft}>
            <View style={styles.dealsIcon}>
              <MaterialCommunityIcons name="tag-multiple" size={22} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.dealsTitle}>Amazing Deals from Trusted Shops!</Text>
              <Text style={styles.dealsSub}>Great prices, top quality & happy shopping</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.dealsBtn}>
            <Text style={styles.dealsBtnText}>Explore All Offers</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Location Modal */}
      <Modal
        visible={locationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setLocationModalVisible(false)} />
          <View style={styles.locationModal}>
            <View style={styles.modalHandle} />
            <View style={styles.modalIconContainer}>
              <View style={styles.mapPinBig}>
                <Ionicons name="location" size={48} color={Colors.primary} />
              </View>
            </View>
            <Text style={styles.modalTitle}>Let's find your location</Text>
            <Text style={styles.modalSub}>Enable your location for a seamless experience</Text>

            <TouchableOpacity style={styles.locationOption} onPress={() => setLocationModalVisible(false)}>
              <View style={styles.locationOptionIcon}>
                <Ionicons name="locate" size={22} color={Colors.primary} />
              </View>
              <View style={styles.locationOptionText}>
                <Text style={styles.locationOptionTitle}>Use My Current Location</Text>
                <Text style={styles.locationOptionSub}>Enable location to find your current location on map</Text>
              </View>
              <View style={styles.locationOptionChevron}>
                <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.locationOption} onPress={() => { setLocationModalVisible(false); router.push('/location'); }}>
              <View style={[styles.locationOptionIcon, { backgroundColor: '#E0F7FA' }]}>
                <Ionicons name="search" size={22} color="#00897B" />
              </View>
              <View style={styles.locationOptionText}>
                <Text style={styles.locationOptionTitle}>Enter Location Manually</Text>
                <Text style={styles.locationOptionSub}>Search area, street name or landmark</Text>
              </View>
              <View style={styles.locationOptionChevron}>
                <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
              </View>
            </TouchableOpacity>

            <View style={styles.privacyNote}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.success} />
              <Text style={styles.privacyText}> We respect your privacy. Your location is safe with us.</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingBottom: 14 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, marginTop: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  locationIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  locationText: { flex: 1 },
  locationNameRow: { flexDirection: 'row', alignItems: 'center' },
  locationName: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  locationAddress: { color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 1 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, height: 48, gap: 10 },
  searchPlaceholder: { flex: 1, color: Colors.textMuted, fontFamily: 'Inter_400Regular', fontSize: 14 },
  section: { backgroundColor: '#fff', paddingVertical: 10 },
  categoryList: { paddingHorizontal: 8, gap: 4 },
  categoryItem: { alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12, minWidth: 72 },
  categoryItemActive: {},
  categoryIcon: { width: 58, height: 58, borderRadius: 14, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  categoryIconActive: { backgroundColor: Colors.primaryLight },
  categoryName: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, textAlign: 'center' },
  categoryNameActive: { color: Colors.primary, fontFamily: 'Inter_600SemiBold' },
  heroBanner: { margin: 14, backgroundColor: Colors.bannerBg, borderRadius: 18, padding: 20, minHeight: 200, overflow: 'hidden' },
  heroBannerContent: {},
  heroBannerSmall: { color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 1, marginBottom: 2 },
  heroBannerTitle: { fontFamily: 'Inter_700Bold', fontSize: 32, marginBottom: 6 },
  heroBannerSub: { color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter_400Regular', fontSize: 14, marginBottom: 14 },
  heroBadgeRow: { flexDirection: 'row', gap: 16, marginBottom: 18 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroBadgeText: { color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter_400Regular', fontSize: 10 },
  exploreBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 18, paddingVertical: 10, alignSelf: 'flex-start', gap: 6 },
  exploreBtnText: { color: Colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  heroBannerDots: { flexDirection: 'row', gap: 6, marginTop: 14, justifyContent: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { backgroundColor: '#fff', width: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Colors.textPrimary },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewAllText: { color: Colors.primary, fontFamily: 'Inter_500Medium', fontSize: 13 },
  shopList: { paddingHorizontal: 12, gap: 12, paddingBottom: 8 },
  shopCard: { width: 170, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', padding: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  openBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: Colors.success, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, zIndex: 1 },
  openBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  shopCardBg: { height: 90, backgroundColor: '#F5F5F5', borderRadius: 10, marginBottom: 10 },
  shopAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.textPrimary, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  shopAvatarText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 14 },
  shopName: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.textPrimary, marginBottom: 4 },
  shopRatingRow: { flexDirection: 'row', alignItems: 'center' },
  shopRating: { color: Colors.textSecondary, fontSize: 11, fontFamily: 'Inter_400Regular', flex: 1 },
  shopChevron: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  trendCard: { width: 170, borderRadius: 16, padding: 14, minHeight: 140 },
  trendTitle: { fontFamily: 'Inter_700Bold', fontSize: 14, color: Colors.textPrimary, marginBottom: 6 },
  trendSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textSecondary, marginBottom: 12, lineHeight: 16 },
  exploreSmallBtn: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start' },
  exploreSmallBtnText: { color: Colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  dealsBanner: { marginHorizontal: 14, backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'column', gap: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  dealsLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dealsIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  dealsTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: Colors.textPrimary },
  dealsSub: { fontFamily: 'Inter_400Regular', fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  dealsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center', gap: 6 },
  dealsBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  locationModal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalIconContainer: { alignItems: 'center', marginBottom: 16 },
  mapPinBig: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 22, color: Colors.textPrimary, textAlign: 'center', marginBottom: 6 },
  modalSub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  locationOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 14, padding: 16, marginBottom: 12, gap: 12 },
  locationOptionIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  locationOptionText: { flex: 1 },
  locationOptionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.primary, marginBottom: 3 },
  locationOptionSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textSecondary, lineHeight: 16 },
  locationOptionChevron: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  privacyNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  privacyText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: Colors.textSecondary },
});
