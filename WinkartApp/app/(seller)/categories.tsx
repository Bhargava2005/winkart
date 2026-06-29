import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

interface SubCategory {
  name: string;
  count: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  subs: SubCategory[];
  isExpanded?: boolean;
}

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'C1',
    name: 'Electronics',
    icon: 'tv-outline',
    count: 342,
    subs: [
      { name: 'Televisions', count: 45 },
      { name: 'Washing Machines', count: 38 },
      { name: 'Refrigerators', count: 52 },
      { name: 'Headphones', count: 28 },
    ],
    isExpanded: true,
  },
  {
    id: 'C2',
    name: 'Furniture',
    icon: 'bed-outline',
    count: 245,
    subs: [
      { name: 'Sofas & Couches', count: 12 },
      { name: 'Beds', count: 15 },
      { name: 'Dining Tables', count: 8 },
    ],
    isExpanded: false,
  },
  {
    id: 'C3',
    name: 'Electrical',
    icon: 'flash-outline',
    count: 198,
    subs: [
      { name: 'LED Bulbs', count: 56 },
      { name: 'Ceiling Fans', count: 22 },
    ],
    isExpanded: false,
  },
  {
    id: 'C4',
    name: 'Tiles',
    icon: 'grid-outline',
    count: 187,
    subs: [
      { name: 'Ceramic Tiles', count: 84 },
      { name: 'Marble Tiles', count: 32 },
    ],
    isExpanded: false,
  },
];

export default function CategoryManagementScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | SubCategory | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formParentId, setFormParentId] = useState<string>('none'); // 'none' means main category

  const toggleExpand = (id: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, isExpanded: !cat.isExpanded } : cat
      )
    );
  };

  const openModal = (item?: Category | SubCategory, parentId?: string) => {
    if (item) {
      setEditingCategory(item);
      setFormName(item.name);
      setFormParentId(parentId || 'none');
    } else {
      setEditingCategory(null);
      setFormName('');
      setFormParentId('none');
    }
    setModalVisible(true);
  };

  const handleSaveCategory = () => {
    if (!formName) {
      Alert.alert('Error', 'Please enter a name.');
      return;
    }

    if (editingCategory) {
      // Edit
      if (formParentId === 'none') {
        // Edit Main Category
        setCategories(
          categories.map((cat) =>
            cat.name === editingCategory.name ? { ...cat, name: formName } : cat
          )
        );
      } else {
        // Edit Sub Category
        setCategories(
          categories.map((cat) => {
            if (cat.id === formParentId) {
              return {
                ...cat,
                subs: cat.subs.map((s) =>
                  s.name === editingCategory.name ? { ...s, name: formName } : s
                ),
              };
            }
            return cat;
          })
        );
      }
    } else {
      // Add
      if (formParentId === 'none') {
        // Add Main Category
        const newCat: Category = {
          id: 'C' + (categories.length + 1).toString(),
          name: formName,
          icon: 'grid-outline',
          count: 0,
          subs: [],
          isExpanded: false,
        };
        setCategories([...categories, newCat]);
      } else {
        // Add Sub Category
        setCategories(
          categories.map((cat) => {
            if (cat.id === formParentId) {
              return {
                ...cat,
                subs: [...cat.subs, { name: formName, count: 0 }],
                isExpanded: true,
              };
            }
            return cat;
          })
        );
      }
    }
    setModalVisible(false);
  };

  const handleDeleteCategory = (catName: string, parentId?: string) => {
    Alert.alert('Delete Category', `Are you sure you want to delete "${catName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (!parentId) {
            // Delete Main Category
            setCategories(categories.filter((c) => c.name !== catName));
          } else {
            // Delete Sub Category
            setCategories(
              categories.map((cat) => {
                if (cat.id === parentId) {
                  return {
                    ...cat,
                    subs: cat.subs.filter((s) => s.name !== catName),
                  };
                }
                return cat;
              })
            );
          }
        },
      },
    ]);
  };

  // Filter Categories
  const filteredCategories = categories.filter((cat) => {
    const mainMatches = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const subMatches = cat.subs.some((sub) =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return mainMatches || subMatches;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Categories</Text>
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
            placeholder="Search categories & sub-categories..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Hierarchical View */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
        {filteredCategories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="grid-outline" size={60} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No categories match search query</Text>
          </View>
        ) : (
          filteredCategories.map((cat) => (
            <View key={cat.id} style={styles.categoryBlock}>
              {/* Main Category Row */}
              <View style={styles.mainCategoryRow}>
                <TouchableOpacity
                  style={styles.mainCategoryLeft}
                  onPress={() => toggleExpand(cat.id)}
                >
                  <Ionicons
                    name={cat.isExpanded ? 'chevron-down' : 'chevron-forward'}
                    size={20}
                    color={Colors.textPrimary}
                  />
                  <Ionicons name={cat.icon as any} size={20} color={Colors.primary} style={styles.iconIndent} />
                  <Text style={styles.mainCategoryName}>{cat.name}</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{cat.count}</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openModal(cat)}>
                    <Ionicons name="pencil" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteCategory(cat.name)}>
                    <Ionicons name="trash-outline" size={16} color={Colors.error} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.addSubBtn]}
                    onPress={() => openModal(undefined, cat.id)}
                  >
                    <Ionicons name="add-circle-outline" size={16} color={Colors.success} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sub Categories (under branch tree lines) */}
              {cat.isExpanded && (
                <View style={styles.subsContainer}>
                  {cat.subs.map((sub, idx) => {
                    const isLast = idx === cat.subs.length - 1;
                    return (
                      <View key={sub.name} style={styles.subRow}>
                        {/* Tree Branch Vector Lines */}
                        <View style={styles.treeLinesContainer}>
                          <View style={styles.treeLineV} />
                          <View style={[styles.treeLineH, isLast && styles.treeLineHLast]} />
                        </View>

                        <View style={styles.subContent}>
                          <View style={styles.subMeta}>
                            <Text style={styles.subCategoryName}>{sub.name}</Text>
                            <Text style={styles.subCategoryCount}>[{sub.count}]</Text>
                          </View>

                          <View style={styles.subActions}>
                            <TouchableOpacity style={styles.subActionBtn} onPress={() => openModal(sub, cat.id)}>
                              <Ionicons name="pencil-outline" size={14} color={Colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.subActionBtn}
                              onPress={() => handleDeleteCategory(sub.name, cat.id)}
                            >
                              <Ionicons name="trash-outline" size={14} color={Colors.error} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              {/* Category Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category / Sub-category Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Smartwatches"
                  placeholderTextColor={Colors.textMuted}
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              {/* Parent Category picker */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Parent Category</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={[
                      styles.pickerOption,
                      formParentId === 'none' && styles.pickerOptionActive,
                    ]}
                    onPress={() => setFormParentId('none')}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        formParentId === 'none' && styles.pickerOptionTextActive,
                      ]}
                    >
                      [None] Create as Main Category
                    </Text>
                  </TouchableOpacity>

                  {categories.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.pickerOption,
                        formParentId === c.id && styles.pickerOptionActive,
                      ]}
                      onPress={() => setFormParentId(c.id)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          formParentId === c.id && styles.pickerOptionTextActive,
                        ]}
                      >
                        Parent: {c.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveCategory}>
                <Text style={styles.saveButtonText}>Save Category</Text>
              </TouchableOpacity>
            </View>
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
  listContainer: {
    padding: 16,
    gap: 14,
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
  categoryBlock: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  mainCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainCategoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconIndent: {
    marginLeft: 6,
  },
  mainCategoryName: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    marginLeft: 10,
  },
  countBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  countBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSubBtn: {
    borderColor: Colors.success + '40',
  },
  subsContainer: {
    marginTop: 10,
    paddingLeft: 6,
  },
  subRow: {
    flexDirection: 'row',
    height: 44,
  },
  treeLinesContainer: {
    width: 24,
    height: '100%',
    position: 'relative',
  },
  treeLineV: {
    position: 'absolute',
    left: 8,
    top: -10,
    bottom: 0,
    width: 1.5,
    backgroundColor: Colors.textMuted + '60',
  },
  treeLineH: {
    position: 'absolute',
    left: 8,
    top: 22,
    width: 14,
    height: 1.5,
    backgroundColor: Colors.textMuted + '60',
  },
  treeLineHLast: {
    // cut the vertical line for the last element
  },
  subContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 6,
  },
  subMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subCategoryName: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textSecondary,
  },
  subCategoryCount: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  subActions: {
    flexDirection: 'row',
    gap: 6,
  },
  subActionBtn: {
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
    maxHeight: '80%',
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
  pickerContainer: {
    maxHeight: 140,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pickerOption: {
    padding: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerOptionActive: {
    backgroundColor: Colors.primaryLight,
  },
  pickerOptionText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  pickerOptionTextActive: {
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
