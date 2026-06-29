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

interface Banner {
  id: string;
  title: string;
  type: 'image' | 'video';
  imageUrl: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Scheduled' | 'Expired';
  statusColor: string;
  targetLink: string;
}

const INITIAL_BANNERS: Banner[] = [
  {
    id: 'B001',
    title: 'Super Summer Electronics Sale',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop',
    startDate: '12 May 2026',
    endDate: '30 May 2026',
    status: 'Active',
    statusColor: Colors.success,
    targetLink: 'Category: Electronics',
  },
  {
    id: 'B002',
    title: 'Monsoon Furniture Fest',
    type: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&auto=format&fit=crop',
    startDate: '01 Jun 2026',
    endDate: '15 Jun 2026',
    status: 'Scheduled',
    statusColor: Colors.amber,
    targetLink: 'Category: Furniture',
  },
  {
    id: 'B003',
    title: 'LG OLED Smart TV Showcase',
    type: 'video',
    imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&auto=format&fit=crop',
    startDate: '15 May 2026',
    endDate: '25 May 2026',
    status: 'Active',
    statusColor: Colors.success,
    targetLink: 'Product: LG 7kg WM',
  },
];

export default function BannersScreen() {
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [activeType, setActiveType] = useState<'image' | 'video'>('image');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formTarget, setFormTarget] = useState('Category: Electronics');

  const openModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormTitle(banner.title);
      setFormStartDate(banner.startDate);
      setFormEndDate(banner.endDate);
      setFormTarget(banner.targetLink);
    } else {
      setEditingBanner(null);
      setFormTitle('');
      setFormStartDate('');
      setFormEndDate('');
      setFormTarget('Category: Electronics');
    }
    setModalVisible(true);
  };

  const handleSaveBanner = () => {
    if (!formTitle || !formStartDate || !formEndDate) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (editingBanner) {
      setBanners(
        banners.map((b) =>
          b.id === editingBanner.id
            ? {
                ...b,
                title: formTitle,
                startDate: formStartDate,
                endDate: formEndDate,
                targetLink: formTarget,
              }
            : b
        )
      );
    } else {
      const newBanner: Banner = {
        id: 'B' + (banners.length + 1).toString().padStart(3, '0'),
        title: formTitle,
        type: activeType,
        imageUrl:
          activeType === 'image'
            ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop'
            : 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&auto=format&fit=crop',
        startDate: formStartDate,
        endDate: formEndDate,
        status: 'Scheduled',
        statusColor: Colors.amber,
        targetLink: formTarget,
      };
      setBanners([...banners, newBanner]);
    }
    setModalVisible(false);
  };

  const handleDeleteBanner = (id: string) => {
    Alert.alert('Delete Banner', 'Are you sure you want to delete this promotional banner?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setBanners(banners.filter((b) => b.id !== id)),
      },
    ]);
  };

  const filteredBanners = banners.filter((b) => b.type === activeType);

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Banners & Videos</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeType === 'image' && styles.tabButtonActive]}
          onPress={() => setActiveType('image')}
        >
          <Ionicons
            name="image-outline"
            size={18}
            color={activeType === 'image' ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.tabLabel, activeType === 'image' && styles.tabLabelActive]}>
            Image Banners
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeType === 'video' && styles.tabButtonActive]}
          onPress={() => setActiveType('video')}
        >
          <Ionicons
            name="videocam-outline"
            size={18}
            color={activeType === 'video' ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.tabLabel, activeType === 'video' && styles.tabLabelActive]}>
            Video Banners
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
        {filteredBanners.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={60} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No banners configured</Text>
          </View>
        ) : (
          filteredBanners.map((banner) => (
            <View key={banner.id} style={styles.bannerCard}>
              <View style={styles.previewContainer}>
                <Image source={{ uri: banner.imageUrl }} style={styles.bannerImage} />
                {banner.type === 'video' && (
                  <View style={styles.playOverlay}>
                    <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.85)" />
                  </View>
                )}
                <View style={[styles.statusBadge, { backgroundColor: banner.statusColor }]}>
                  <Text style={styles.statusText}>{banner.status}</Text>
                </View>
              </View>

              <View style={styles.bannerDetails}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <Text style={styles.bannerDates}>
                  📅 {banner.startDate} – {banner.endDate}
                </Text>
                <Text style={styles.bannerTarget}>
                  🔗 Route: <Text style={styles.targetHighlight}>{banner.targetLink}</Text>
                </Text>

                <View style={styles.divider} />

                <View style={styles.cardActions}>
                  <Text style={styles.bannerId}>{banner.id}</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => openModal(banner)}>
                      <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
                      <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => handleDeleteBanner(banner.id)}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.error} />
                      <Text style={[styles.actionBtnText, styles.deleteBtnText]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add / Edit Banner Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBanner ? 'Edit Banner Settings' : 'Create Banner Advertising'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalForm}>
              {/* Image Upload simulation */}
              <TouchableOpacity
                style={styles.uploadPlaceholder}
                onPress={() => Alert.alert('Media Upload', 'Media file selection is mock in this sandbox.')}
              >
                <Ionicons name="cloud-upload-outline" size={32} color={Colors.primary} />
                <Text style={styles.uploadTitle}>Upload Banner Artwork</Text>
                <Text style={styles.uploadSub}>Recommended size: 1200 x 600 px (PNG, JPG)</Text>
              </TouchableOpacity>

              {/* Title */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Banner Title *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Clearance Festive Sale"
                  placeholderTextColor={Colors.textMuted}
                  value={formTitle}
                  onChangeText={setFormTitle}
                />
              </View>

              {/* Start Date & End Date */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Start Date *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="DD Mon YYYY (e.g., 12 May 2026)"
                    placeholderTextColor={Colors.textMuted}
                    value={formStartDate}
                    onChangeText={setFormStartDate}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>End Date *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="DD Mon YYYY (e.g., 30 May 2026)"
                    placeholderTextColor={Colors.textMuted}
                    value={formEndDate}
                    onChangeText={setFormEndDate}
                  />
                </View>
              </View>

              {/* Target Redirection dropdown mock */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Target Route Destination</Text>
                <View style={styles.targetOptions}>
                  {['Category: Electronics', 'Category: Furniture', 'Custom Link'].map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.targetBadge,
                        formTarget === opt && styles.targetBadgeActive,
                      ]}
                      onPress={() => setFormTarget(opt)}
                    >
                      <Text
                        style={[
                          styles.targetBadgeText,
                          formTarget === opt && styles.targetBadgeTextActive,
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Save */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveBanner}>
                <Text style={styles.saveButtonText}>
                  {editingBanner ? 'Save Campaign' : 'Launch Campaign'}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
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
  listContainer: {
    padding: 16,
    gap: 16,
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
  bannerCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  previewContainer: {
    height: 160,
    backgroundColor: '#ECEFF1',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  bannerDetails: {
    padding: 16,
  },
  bannerTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  bannerDates: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  bannerTarget: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
  },
  targetHighlight: {
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerId: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textMuted,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtnText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  deleteBtn: {
    borderColor: '#FFEBEE',
  },
  deleteBtnText: {
    color: Colors.error,
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
  uploadPlaceholder: {
    height: 120,
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5EAF5',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  uploadSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
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
  targetOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  targetBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E5EAF5',
  },
  targetBadgeActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  targetBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  targetBadgeTextActive: {
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
