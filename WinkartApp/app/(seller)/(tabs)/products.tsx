import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  isActive: boolean;
  image: string;
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'P001',
    name: 'Samsung 236L Double Door Refrigerator',
    sku: 'REF-SAM-236',
    category: 'Electronics',
    price: 26990,
    originalPrice: 32990,
    stock: 12,
    isActive: true,
    image: 'https://images.unsplash.com/photo-1571175432267-efb92b4d6f92?w=100&auto=format&fit=crop',
  },
  {
    id: 'P002',
    name: 'LG 7kg Fully Automatic Washing Machine',
    sku: 'WM-LG-70F',
    category: 'Electronics',
    price: 24490,
    originalPrice: 28990,
    stock: 8,
    isActive: true,
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=100&auto=format&fit=crop',
  },
  {
    id: 'P003',
    name: 'Sony WH-1000XM4 Noise Cancelling Headphones',
    sku: 'AUD-SON-XM4',
    category: 'Electronics',
    price: 19990,
    originalPrice: 24990,
    stock: 0,
    isActive: false,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format&fit=crop',
  },
  {
    id: 'P004',
    name: 'Wooden Luxury 3-Seater Sofa',
    sku: 'FUR-SOF-3S',
    category: 'Furniture',
    price: 15490,
    originalPrice: 18990,
    stock: 5,
    isActive: true,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&auto=format&fit=crop',
  },
];

export default function ProductManagementScreen() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Inactive' | 'Out'>('All');

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formPrice, setFormPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formStock, setFormStock] = useState('');

  // Handle open modal for new/edit
  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormName(product.name);
      setFormSku(product.sku);
      setFormCategory(product.category);
      setFormPrice(product.price.toString());
      setFormOriginalPrice(product.originalPrice.toString());
      setFormStock(product.stock.toString());
    } else {
      setEditingProduct(null);
      setFormName('');
      setFormSku('');
      setFormCategory('Electronics');
      setFormPrice('');
      setFormOriginalPrice('');
      setFormStock('');
    }
    setModalVisible(true);
  };

  const handleSaveProduct = () => {
    if (!formName || !formSku || !formPrice || !formStock) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const priceNum = parseFloat(formPrice);
    const origPriceNum = parseFloat(formOriginalPrice) || priceNum;
    const stockNum = parseInt(formStock);

    if (editingProduct) {
      // Edit mode
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formName,
                sku: formSku,
                category: formCategory,
                price: priceNum,
                originalPrice: origPriceNum,
                stock: stockNum,
                isActive: stockNum > 0 ? p.isActive : false,
              }
            : p
        )
      );
    } else {
      // Add mode
      const newProduct: Product = {
        id: 'P' + (products.length + 1).toString().padStart(3, '0'),
        name: formName,
        sku: formSku,
        category: formCategory,
        price: priceNum,
        originalPrice: origPriceNum,
        stock: stockNum,
        isActive: stockNum > 0,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop',
      };
      setProducts([...products, newProduct]);
    }
    setModalVisible(false);
  };

  const toggleProductStatus = (id: string) => {
    setProducts(
      products.map((p) => {
        if (p.id === id) {
          if (p.stock === 0 && !p.isActive) {
            Alert.alert('Out of Stock', 'Cannot activate a product with 0 stock.');
            return p;
          }
          return { ...p, isActive: !p.isActive };
        }
        return p;
      })
    );
  };

  const handleDeleteProduct = (id: string) => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setProducts(products.filter((p) => p.id !== id)),
      },
    ]);
  };

  // Filtered list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'Active') return p.isActive && p.stock > 0;
    if (activeTab === 'Inactive') return !p.isActive && p.stock > 0;
    if (activeTab === 'Out') return p.stock === 0;

    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Products</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name/SKU..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {['All', 'Active', 'Inactive', 'Out'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Product List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={60} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        ) : (
          filteredProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <Image source={{ uri: product.image }} style={styles.productImage} />
              <View style={styles.productDetails}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.productSku}>{product.sku}</Text>
                <Text style={styles.productCategory}>{product.category}</Text>

                <View style={styles.priceRow}>
                  <Text style={styles.productPrice}>₹{product.price.toLocaleString()}</Text>
                  {product.originalPrice > product.price && (
                    <Text style={styles.productOriginalPrice}>
                      ₹{product.originalPrice.toLocaleString()}
                    </Text>
                  )}
                </View>

                <View style={styles.stockRow}>
                  <Text style={[styles.stockText, product.stock === 0 && styles.stockOut]}>
                    Stock: {product.stock} {product.stock === 0 && '(Out of stock)'}
                  </Text>
                </View>
              </View>

              <View style={styles.actionColumn}>
                <TouchableOpacity
                  style={[
                    styles.statusToggle,
                    product.isActive ? styles.statusToggleActive : styles.statusToggleInactive,
                  ]}
                  onPress={() => toggleProductStatus(product.id)}
                >
                  <View
                    style={[
                      styles.toggleDot,
                      product.isActive ? styles.toggleDotActive : styles.toggleDotInactive,
                    ]}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => openModal(product)}>
                  <Ionicons name="pencil" size={18} color={Colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteProduct(product.id)}>
                  <Ionicons name="trash-outline" size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Product Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
              {/* Product Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Product Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Samsung 236L Refrigerator"
                  placeholderTextColor={Colors.textMuted}
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              {/* SKU */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>SKU Code *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. REF-SAM-236"
                  placeholderTextColor={Colors.textMuted}
                  value={formSku}
                  onChangeText={setFormSku}
                />
              </View>

              {/* Category */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category</Text>
                <View style={styles.categoryPickerRow}>
                  {['Electronics', 'Furniture', 'Electrical', 'Tiles'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.pickerBadge,
                        formCategory === cat && styles.pickerBadgeActive,
                      ]}
                      onPress={() => setFormCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.pickerBadgeText,
                          formCategory === cat && styles.pickerBadgeTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Price & Original Price */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Price (₹) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="26990"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    value={formPrice}
                    onChangeText={setFormPrice}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>M.R.P. (₹)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="32990"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    value={formOriginalPrice}
                    onChangeText={setFormOriginalPrice}
                  />
                </View>
              </View>

              {/* Stock */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Stock Quantity *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="10"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={formStock}
                  onChangeText={setFormStock}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProduct}>
                <Text style={styles.saveButtonText}>
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </Text>
              </TouchableOpacity>
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
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5EAF5',
    height: 46,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: Colors.primaryLight,
  },
  tabLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
  },
  tabLabelActive: {
    color: Colors.primary,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    lineHeight: 18,
    marginBottom: 3,
  },
  productSku: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  productOriginalPrice: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.success,
  },
  stockOut: {
    color: Colors.error,
  },
  actionColumn: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 44,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  statusToggle: {
    width: 36,
    height: 20,
    borderRadius: 10,
    padding: 2,
    justifyContent: 'center',
  },
  statusToggleActive: {
    backgroundColor: Colors.success,
    alignItems: 'flex-end',
  },
  statusToggleInactive: {
    backgroundColor: Colors.textMuted,
    alignItems: 'flex-start',
  },
  toggleDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFF',
    elevation: 2,
  },
  toggleDotActive: {},
  toggleDotInactive: {},
  actionBtn: {
    padding: 6,
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
    maxHeight: '85%',
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
  modalForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5EAF5',
    height: 48,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.textPrimary,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E5EAF5',
  },
  pickerBadgeActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  pickerBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  pickerBadgeTextActive: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
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
});
