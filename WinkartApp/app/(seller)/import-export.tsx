import React, { useState } from 'react';
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
import { Colors } from '../../constants/Colors';

interface ImportHistoryItem {
  filename: string;
  date: string;
  status: 'success' | 'warning' | 'error';
  statusText: string;
}

export default function ImportExportScreen() {
  const router = useRouter();
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv'>('excel');
  const [exportCategory, setExportCategory] = useState('All Products');

  const historyList: ImportHistoryItem[] = [
    { filename: 'products_may_2026.xlsx', date: '12 May 2026', status: 'success', statusText: 'Imported 124 products successfully' },
    { filename: 'products_restock_april.xlsx', date: '28 Apr 2026', status: 'warning', statusText: 'Imported with 3 SKU mismatches' },
    { filename: 'bulk_update_error.csv', date: '10 Apr 2026', status: 'error', statusText: 'Column "Price" missing' },
  ];

  const handleUploadFile = () => {
    Alert.alert('File Upload', 'Excel/CSV file selector triggered.');
  };

  const handleDownloadTemplate = () => {
    Alert.alert('Download Template', 'Sample Excel template download started.');
  };

  const handleImportNow = () => {
    Alert.alert('Importing', 'Processing file and updating inventory database...');
  };

  const handleExportNow = () => {
    Alert.alert(
      'Exporting',
      `Exporting database for "${exportCategory}" in ${exportFormat.toUpperCase()} format. Download will start shortly.`
    );
  };

  const getStatusIcon = (status: string) => {
    if (status === 'success') return <Ionicons name="checkmark-circle" size={20} color={Colors.success} />;
    if (status === 'warning') return <Ionicons name="alert-circle" size={20} color={Colors.amber} />;
    return <Ionicons name="close-circle" size={20} color={Colors.error} />;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Import & Export</Text>
          <View style={{ width: 28 }} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* IMPORT SECTION */}
        <Text style={styles.sectionHeading}>Bulk Import Inventory</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.uploadBox} onPress={handleUploadFile}>
            <Ionicons name="document-text-outline" size={36} color={Colors.primary} />
            <Text style={styles.uploadTitle}>Choose Excel / CSV File</Text>
            <Text style={styles.uploadSub}>Drag & drop or click to browse files</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.downloadLink} onPress={handleDownloadTemplate}>
            <Ionicons name="download-outline" size={16} color={Colors.primary} />
            <Text style={styles.downloadLinkText}>Download Sample xlsx Template</Text>
          </TouchableOpacity>

          {/* Column Mapping Preview */}
          <Text style={styles.mappingTitle}>Excel Column Headers Mapping</Text>
          <View style={styles.mappingTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.headerCell}>Excel Column</Text>
              <Text style={styles.headerCell}>Mapped Database Field</Text>
            </View>
            {[
              { col: 'product_name', db: 'Product Name' },
              { col: 'sku_code', db: 'SKU (Stock Keeping Unit)' },
              { col: 'retail_price', db: 'Sale Price (₹)' },
              { col: 'stock_qty', db: 'Inventory Quantity' },
            ].map((row, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.cell}>{row.col}</Text>
                <Text style={[styles.cell, styles.cellMapped]}>🟢 {row.db}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleImportNow}>
            <Text style={styles.primaryBtnText}>Import Inventory Now</Text>
          </TouchableOpacity>
        </View>

        {/* EXPORT SECTION */}
        <Text style={styles.sectionHeading}>Export Catalog Data</Text>
        <View style={styles.card}>
          <Text style={styles.inputLabel}>Filter Inventory Category</Text>
          <View style={styles.pickerRow}>
            {['All Products', 'Electronics Only', 'Furniture Only'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.pickerOption,
                  exportCategory === cat && styles.pickerOptionActive,
                ]}
                onPress={() => setExportCategory(cat)}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    exportCategory === cat && styles.pickerOptionTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Export File Format</Text>
          <View style={styles.formatRow}>
            <TouchableOpacity
              style={[styles.formatBtn, exportFormat === 'excel' && styles.formatBtnActive]}
              onPress={() => setExportFormat('excel')}
            >
              <Ionicons name="stats-chart-outline" size={16} color={exportFormat === 'excel' ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.formatText, exportFormat === 'excel' && styles.formatTextActive]}>Excel (.xlsx)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.formatBtn, exportFormat === 'csv' && styles.formatBtnActive]}
              onPress={() => setExportFormat('csv')}
            >
              <Ionicons name="code-working-outline" size={16} color={exportFormat === 'csv' ? Colors.primary : Colors.textSecondary} />
              <Text style={[styles.formatText, exportFormat === 'csv' && styles.formatTextActive]}>CSV (.csv)</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleExportNow}>
            <Text style={styles.primaryBtnText}>Export Catalog Now</Text>
          </TouchableOpacity>
        </View>

        {/* IMPORT HISTORY */}
        <Text style={styles.sectionHeading}>Bulk Action History</Text>
        <View style={styles.historyCard}>
          {historyList.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.historyRow,
                idx < historyList.length - 1 && styles.historyRowBorder,
              ]}
            >
              <View style={styles.historyIconBg}>{getStatusIcon(item.status)}</View>
              <View style={styles.historyMeta}>
                <View style={styles.historyRowHeader}>
                  <Text style={styles.historyFilename} numberOfLines={1}>
                    {item.filename}
                  </Text>
                  <Text style={styles.historyDate}>{item.date}</Text>
                </View>
                <Text style={styles.historyStatusText}>{item.statusText}</Text>
              </View>
            </View>
          ))}
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
  scrollContent: {
    padding: 16,
  },
  sectionHeading: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
  },
  uploadBox: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5EAF5',
    borderStyle: 'dashed',
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
  },
  uploadSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  downloadLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  downloadLinkText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  mappingTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  mappingTable: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F7FA',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerCell: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: Colors.textSecondary,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cell: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Inter_450Regular',
    color: Colors.textPrimary,
  },
  cellMapped: {
    fontFamily: 'Inter_600SemiBold',
    color: Colors.success,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  pickerOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  pickerOptionActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  pickerOptionText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  pickerOptionTextActive: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  formatRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  formatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
  },
  formatBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  formatText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  formatTextActive: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  historyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    elevation: 1,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  historyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyMeta: {
    flex: 1,
    marginLeft: 12,
  },
  historyRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyFilename: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  historyDate: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
  },
  historyStatusText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
});
