import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
}

const PRODUCTS_POOL: Product[] = [
  {
    id: 'P001',
    name: 'Samsung 236L Refrigerator',
    price: 26990,
    image: 'https://images.unsplash.com/photo-1571175432267-efb92b4d6f92?w=100&auto=format&fit=crop',
  },
  {
    id: 'P002',
    name: 'LG 7kg Washing Machine',
    price: 24490,
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=100&auto=format&fit=crop',
  },
  {
    id: 'P003',
    name: 'Sony WH-1000XM4 Headphones',
    price: 19990,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop',
  },
  {
    id: 'P004',
    name: 'Wooden Luxury Sofa',
    price: 15490,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&auto=format&fit=crop',
  },
];

export default function UpsellScreen() {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState<'upsell' | 'cross-sell'>('upsell');

  // Configuration state
  const [selectedSourceProduct, setSelectedSourceProduct] = useState<Product | null>(PRODUCTS_POOL[0]);
  const [linkedProducts, setLinkedProducts] = useState<Product[]>([PRODUCTS_POOL[1], PRODUCTS_POOL[2]]);

  // Selector Modal state
  const [searchSourceQuery, setSearchSourceQuery] = useState('');
  const [searchLinkQuery, setSearchLinkQuery] = useState('');
  const [isSelectingSource, setIsSelectingSource] = useState(false);
  const [isAddingLinks, setIsAddingLinks] = useState(false);

  const handleRemoveLink = (id: string) => {
    setLinkedProducts(linkedProducts.filter((p) => p.id !== id));
  };

  const handleAddLinkProduct = (product: Product) => {
    if (linkedProducts.some((p) => p.id === product.id)) {
      Alert.alert('Duplicate', 'Product is already linked.');
      return;
    }
    if (selectedSourceProduct?.id === product.id) {
      Alert.alert('Invalid', 'Cannot link a product to itself.');
      return;
    }
    setLinkedProducts([...linkedProducts, product]);
    setIsAddingLinks(false);
  };

  const handleSelectSourceProduct = (product: Product) => {
    setSelectedSourceProduct(product);
    // remove it from link list if it is there
    setLinkedProducts(linkedProducts.filter((p) => p.id !== product.id));
    setIsSelectingSource(false);
  };

  const handleSaveConfiguration = () => {
    if (!selectedSourceProduct) {
      Alert.alert('Error', 'Please select a base source product.');
      return;
    }
    Alert.alert(
      'Configuration Saved',
      `Successfully linked ${linkedProducts.length} items to "${selectedSourceProduct.name}" for ${
        activeMode === 'upsell' ? 'Upselling' : 'Cross-selling'
      }.`
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upsell & Cross-sell</Text>
          <View style={{ width: 28 }} />
        </View>
      </SafeAreaView>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeMode === 'upsell' && styles.tabButtonActive]}
          onPress={() => setActiveMode('upsell')}
        >
          <Text style={[styles.tabLabel, activeMode === 'upsell' && styles.tabLabelActive]}>
            Upsell Products
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeMode === 'cross-sell' && styles.tabButtonActive]}
          onPress={() => setActiveMode('cross-sell')}
        >
          <Text style={[styles.tabLabel, activeMode === 'cross-sell' && styles.tabLabelActive]}>
            Cross-sell Products
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Source Base Product Selection */}
        <Text style={styles.sectionHeading}>Base Source Product</Text>
        {selectedSourceProduct ? (
          <View style={styles.selectedSourceCard}>
            <Image source={{ uri: selectedSourceProduct.image }} style={styles.sourceImage} />
            <View style={styles.sourceDetails}>
              <Text style={styles.sourceName} numberOfLines={1}>
                {selectedSourceProduct.name}
              </Text>
              <Text style={styles.sourcePrice}>₹{selectedSourceProduct.price.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.changeBtn} onPress={() => setIsSelectingSource(true)}>
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.emptySelectorCard} onPress={() => setIsSelectingSource(true)}>
            <Ionicons name="search-outline" size={24} color={Colors.primary} />
            <Text style={styles.emptySelectorText}>Search & Select Base Product</Text>
          </TouchableOpacity>
        )}

        {/* Linked Target Products list */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>
            Linked Products ({linkedProducts.length})
          </Text>
          <TouchableOpacity style={styles.addProductsLinkBtn} onPress={() => setIsAddingLinks(true)}>
            <Ionicons name="add-circle-outline" size={16} color={Colors.primary} />
            <Text style={styles.addProductsLinkText}>Add Product</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.linkedContainer}>
          {linkedProducts.length === 0 ? (
            <View style={styles.emptyLinksBox}>
              <Ionicons name="pricetags-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyLinksText}>No products linked yet</Text>
            </View>
          ) : (
            linkedProducts.map((product) => (
              <View key={product.id} style={styles.linkedRow}>
                <Image source={{ uri: product.image }} style={styles.linkedImage} />
                <View style={styles.linkedDetails}>
                  <Text style={styles.linkedName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.linkedPrice}>₹{product.price.toLocaleString()}</Text>
                </View>
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveLink(product.id)}>
                  <Ionicons name="close-circle" size={22} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveConfiguration}>
          <Text style={styles.saveButtonText}>Save Configuration</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Base Product Selector Modal */}
      <Modal visible={isSelectingSource} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Base Product</Text>
              <TouchableOpacity onPress={() => setIsSelectingSource(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <View style={styles.searchWrapper}>
                <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Search products..."
                  placeholderTextColor={Colors.textMuted}
                  value={searchSourceQuery}
                  onChangeText={setSearchSourceQuery}
                />
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {PRODUCTS_POOL.filter((p) =>
                p.name.toLowerCase().includes(searchSourceQuery.toLowerCase())
              ).map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.modalProductRow}
                  onPress={() => handleSelectSourceProduct(p)}
                >
                  <Image source={{ uri: p.image }} style={styles.modalProductImage} />
                  <View style={styles.modalProductMeta}>
                    <Text style={styles.modalProductName}>{p.name}</Text>
                    <Text style={styles.modalProductPrice}>₹{p.price.toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Link Product Selector Modal */}
      <Modal visible={isAddingLinks} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Link Recommendation Product</Text>
              <TouchableOpacity onPress={() => setIsAddingLinks(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <View style={styles.searchWrapper}>
                <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Search products..."
                  placeholderTextColor={Colors.textMuted}
                  value={searchLinkQuery}
                  onChangeText={setSearchLinkQuery}
                />
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              {PRODUCTS_POOL.filter(
                (p) =>
                  p.id !== selectedSourceProduct?.id &&
                  p.name.toLowerCase().includes(searchLinkQuery.toLowerCase())
              ).map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.modalProductRow}
                  onPress={() => handleAddLinkProduct(p)}
                >
                  <Image source={{ uri: p.image }} style={styles.modalProductImage} />
                  <View style={styles.modalProductMeta}>
                    <Text style={styles.modalProductName}>{p.name}</Text>
                    <Text style={styles.modalProductPrice}>₹{p.price.toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingVertical: 14,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E5EAF5',
  },
  tabButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
  },
  tabLabelActive: {
    color: Colors.primary,
  },
  scrollContent: {
    padding: 16,
  },
  sectionHeading: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  selectedSourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 20,
  },
  sourceImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
  },
  sourceDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  sourceName: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  sourcePrice: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
    marginTop: 4,
  },
  changeBtn: {
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  changeBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
  },
  emptySelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 16,
    height: 84,
    gap: 8,
    marginBottom: 20,
  },
  emptySelectorText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addProductsLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addProductsLinkText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  linkedContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 1,
  },
  emptyLinksBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyLinksText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
  },
  linkedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  linkedImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
  },
  linkedDetails: {
    flex: 1,
    marginLeft: 12,
  },
  linkedName: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
  },
  linkedPrice: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  removeBtn: {
    padding: 4,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 25, 49, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '75%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  modalSearchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    height: 40,
    paddingHorizontal: 12,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary,
  },
  modalScroll: {
    padding: 16,
    gap: 12,
  },
  modalProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  modalProductImage: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#F5F7FA',
  },
  modalProductMeta: {
    flex: 1,
    marginLeft: 12,
  },
  modalProductName: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
  },
  modalProductPrice: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.primary,
    marginTop: 2,
  },
});
