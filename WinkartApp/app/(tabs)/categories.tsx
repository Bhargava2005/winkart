import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

const ALL_CATEGORIES = [
  { id: '1', name: 'Furniture', icon: 'sofa', count: 245, sub: ['Sofas', 'Beds', 'Wardrobes', 'Dining', 'Chairs'] },
  { id: '2', name: 'Electronics', icon: 'monitor', count: 342, sub: ['TVs', 'Laptops', 'Phones', 'Tablets', 'Cameras'] },
  { id: '3', name: 'Electrical', icon: 'lightning-bolt', count: 198, sub: ['Fans', 'Lights', 'Switches', 'Wiring', 'MCBs'] },
  { id: '4', name: 'Tiles', icon: 'view-grid', count: 187, sub: ['Floor Tiles', 'Wall Tiles', 'Bathroom Tiles', 'Outdoor'] },
  { id: '5', name: 'Plumbing', icon: 'pipe', count: 156, sub: ['Taps', 'Pipes', 'Fittings', 'Sanitary Ware'] },
  { id: '6', name: 'Home Appliances', icon: 'washing-machine', count: 289, sub: ['Washing Machines', 'Refrigerators', 'Microwaves', 'AC'] },
  { id: '7', name: 'Lighting', icon: 'lamp', count: 134, sub: ['LED Bulbs', 'Tube Lights', 'Ceiling Lights', 'Decorative'] },
  { id: '8', name: 'Paints', icon: 'palette', count: 98, sub: ['Interior Paints', 'Exterior Paints', 'Primers', 'Tools'] },
  { id: '9', name: 'Hardware', icon: 'tools', count: 210, sub: ['Screws', 'Nuts & Bolts', 'Power Tools', 'Hand Tools'] },
  { id: '10', name: 'Sanitary', icon: 'water', count: 112, sub: ['Wash Basins', 'Toilets', 'Bath Accessories', 'Shower'] },
];

const CAT_COLORS = ['#EDE9FE', '#E0F7FA', '#FFF8E1', '#E8F5E9', '#FCE4EC', '#E3F2FD', '#FFF3E0', '#E8EAF6', '#F3E5F5', '#E0F2F1'];

export default function CategoriesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>('1');

  const filtered = ALL_CATEGORIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <Text style={styles.title}>Categories</Text>
      </SafeAreaView>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {filtered.map((cat, idx) => (
          <View key={cat.id} style={styles.catBlock}>
            <TouchableOpacity
              style={styles.catRow}
              onPress={() => setExpanded(expanded === cat.id ? null : cat.id)}
            >
              <View style={[styles.catIcon, { backgroundColor: CAT_COLORS[idx % CAT_COLORS.length] }]}>
                <MaterialCommunityIcons name={cat.icon as any} size={22} color={Colors.primary} />
              </View>
              <Text style={styles.catName}>{cat.name}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{cat.count}</Text>
              </View>
              <Ionicons
                name={expanded === cat.id ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            {expanded === cat.id && (
              <View style={styles.subList}>
                {cat.sub.map((sub, si) => (
                  <TouchableOpacity key={si} style={styles.subRow} onPress={() => router.push('/search')}>
                    <View style={styles.subDot} />
                    <Text style={styles.subText}>{sub}</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: '#fff', paddingHorizontal: 20, paddingBottom: 14, paddingTop: 8 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 22, color: Colors.textPrimary },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, borderRadius: 12, paddingHorizontal: 14, height: 46, gap: 10, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.textPrimary },
  catBlock: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 10, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  catRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  catIcon: { width: 42, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  catName: { flex: 1, fontFamily: 'Inter_600SemiBold', fontSize: 15, color: Colors.textPrimary },
  countBadge: { backgroundColor: Colors.primaryLight, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6 },
  countText: { color: Colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  subList: { borderTopWidth: 1, borderTopColor: Colors.border, paddingVertical: 4 },
  subRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 10 },
  subDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  subText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: Colors.textSecondary },
});
