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
import { Colors } from '../../../constants/Colors';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Delivered' | 'Cancelled';
  statusColor: string;
}

const INITIAL_ORDERS: Order[] = [
  {
    id: '#ORD001',
    date: '12 May 2026',
    customerName: 'Rahul Kumar',
    customerPhone: '+91 98765 43210',
    customerAddress: 'D.No 4-50, MVP Colony, Visakhapatnam, AP - 530017',
    items: [
      { id: 'I1', name: 'Samsung 236L Refrigerator', quantity: 1, price: 26990 },
      { id: 'I2', name: 'LG 7kg Washing Machine', quantity: 1, price: 24490 },
      { id: 'I3', name: 'Sony WH-1000XM4 Headphones', quantity: 1, price: 19490 },
    ],
    totalAmount: 70970,
    status: 'Delivered',
    statusColor: Colors.success,
  },
  {
    id: '#ORD002',
    date: '11 May 2026',
    customerName: 'Priya Singh',
    customerPhone: '+91 87654 32109',
    customerAddress: 'Flat 302, Sai Residency, Madhapur, Hyderabad, TS - 500081',
    items: [
      { id: 'I1', name: 'Sony WH-1000XM4 Headphones', quantity: 1, price: 19990 },
    ],
    totalAmount: 19990,
    status: 'Pending',
    statusColor: Colors.amber,
  },
  {
    id: '#ORD003',
    date: '10 May 2026',
    customerName: 'Amit Sharma',
    customerPhone: '+91 76543 21098',
    customerAddress: 'D.No 12-3, Gajuwaka, Visakhapatnam, AP - 530026',
    items: [
      { id: 'I2', name: 'LG 7kg Washing Machine', quantity: 1, price: 24490 },
    ],
    totalAmount: 24490,
    status: 'Delivered',
    statusColor: Colors.success,
  },
  {
    id: '#ORD004',
    date: '09 May 2026',
    customerName: 'Sneha Patel',
    customerPhone: '+91 65432 10987',
    customerAddress: 'House 44, Sector 5, Gandhinagar, Gujarat - 382006',
    items: [
      { id: 'I3', name: 'Samsung 236L Refrigerator', quantity: 1, price: 26990 },
    ],
    totalAmount: 26990,
    status: 'Cancelled',
    statusColor: Colors.error,
  },
];

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Delivered' | 'Cancelled'>('All');

  // Detail Modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleUpdateStatus = (status: 'Pending' | 'Delivered' | 'Cancelled') => {
    if (!selectedOrder) return;

    let color = Colors.amber;
    if (status === 'Delivered') color = Colors.success;
    if (status === 'Cancelled') color = Colors.error;

    const updatedOrders = orders.map((o) =>
      o.id === selectedOrder.id ? { ...o, status, statusColor: color } : o
    );

    setOrders(updatedOrders);
    const updatedSelected = updatedOrders.find((o) => o.id === selectedOrder.id) || null;
    setSelectedOrder(updatedSelected);
    Alert.alert('Status Updated', `Order ${selectedOrder.id} status changed to ${status}.`);
  };

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (activeTab === 'Pending') return order.status === 'Pending';
    if (activeTab === 'Delivered') return order.status === 'Delivered';
    if (activeTab === 'Cancelled') return order.status === 'Cancelled';

    return true;
  });

  const getStatusLabelText = (status: string) => {
    if (status === 'Pending') return 'Processing';
    return status;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Orders & Bills</Text>
        </View>
      </SafeAreaView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by order ID, name, or phone..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {['All', 'Pending', 'Delivered', 'Cancelled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab === 'Pending' ? 'Processing' : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Order List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const itemCount = order.items.reduce((acc, curr) => acc + curr.quantity, 0);
            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderCardHeader}>
                  <View>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.orderDate}>{order.date}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: order.statusColor + '15' }]}>
                    <Text style={[styles.statusBadgeText, { color: order.statusColor }]}>
                      {getStatusLabelText(order.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderCardBody}>
                  <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={16} color={Colors.textMuted} />
                    <Text style={styles.infoText}>{order.customerName}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={16} color={Colors.textMuted} />
                    <Text style={styles.infoText}>{order.customerPhone}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="cube-outline" size={16} color={Colors.textMuted} />
                    <Text style={styles.infoText}>
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderCardFooter}>
                  <Text style={styles.totalLabel}>Total Bill Amount</Text>
                  <View style={styles.footerRight}>
                    <Text style={styles.totalAmount}>₹{order.totalAmount.toLocaleString()}</Text>
                    <TouchableOpacity
                      style={styles.viewDetailsBtn}
                      onPress={() => {
                        setSelectedOrder(order);
                        setModalVisible(true);
                      }}
                    >
                      <Text style={styles.viewDetailsBtnText}>View →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Order Detail Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>Order Details</Text>
                    <Text style={styles.modalSub}>{selectedOrder.id} • {selectedOrder.date}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
                  {/* Status update panel */}
                  <View style={styles.statusUpdateCard}>
                    <Text style={styles.panelSectionTitle}>Update Order Status</Text>
                    <View style={styles.statusBtnRow}>
                      <TouchableOpacity
                        style={[
                          styles.statusActionBtn,
                          { borderColor: Colors.amber },
                          selectedOrder.status === 'Pending' && { backgroundColor: Colors.amber },
                        ]}
                        onPress={() => handleUpdateStatus('Pending')}
                      >
                        <Text
                          style={[
                            styles.statusActionText,
                            { color: selectedOrder.status === 'Pending' ? '#FFF' : Colors.amber },
                          ]}
                        >
                          Processing
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.statusActionBtn,
                          { borderColor: Colors.success },
                          selectedOrder.status === 'Delivered' && { backgroundColor: Colors.success },
                        ]}
                        onPress={() => handleUpdateStatus('Delivered')}
                      >
                        <Text
                          style={[
                            styles.statusActionText,
                            { color: selectedOrder.status === 'Delivered' ? '#FFF' : Colors.success },
                          ]}
                        >
                          Delivered
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.statusActionBtn,
                          { borderColor: Colors.error },
                          selectedOrder.status === 'Cancelled' && { backgroundColor: Colors.error },
                        ]}
                        onPress={() => handleUpdateStatus('Cancelled')}
                      >
                        <Text
                          style={[
                            styles.statusActionText,
                            { color: selectedOrder.status === 'Cancelled' ? '#FFF' : Colors.error },
                          ]}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Customer Information */}
                  <Text style={styles.sectionHeading}>Customer Details</Text>
                  <View style={styles.detailsCard}>
                    <Text style={styles.customerDetailName}>{selectedOrder.customerName}</Text>
                    <Text style={styles.customerDetailPhone}>{selectedOrder.customerPhone}</Text>
                    <View style={styles.addressRow}>
                      <Ionicons name="pin-outline" size={18} color={Colors.textMuted} style={styles.pinIcon} />
                      <Text style={styles.customerDetailAddress}>{selectedOrder.customerAddress}</Text>
                    </View>
                  </View>

                  {/* Items list */}
                  <Text style={styles.sectionHeading}>Items Ordered</Text>
                  <View style={styles.detailsCard}>
                    {selectedOrder.items.map((item, idx) => (
                      <View
                        key={item.id}
                        style={[
                          styles.itemRow,
                          idx < selectedOrder.items.length - 1 && styles.itemRowBorder,
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <Text style={styles.itemPrice}>
                            ₹{item.price.toLocaleString()} x {item.quantity}
                          </Text>
                        </View>
                        <Text style={styles.itemTotal}>
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </Text>
                      </View>
                    ))}
                    <View style={styles.totalBillRow}>
                      <Text style={styles.totalBillLabel}>Subtotal</Text>
                      <Text style={styles.totalBillVal}>
                        ₹{selectedOrder.totalAmount.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
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
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  orderId: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  orderDate: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  orderCardBody: {
    gap: 8,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.textPrimary,
  },
  orderCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  totalAmount: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  viewDetailsBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewDetailsBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
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
  modalSub: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
    marginTop: 2,
  },
  modalBody: {
    padding: 20,
  },
  statusUpdateCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5EAF5',
  },
  panelSectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  statusBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusActionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  statusActionText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  sectionHeading: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    marginBottom: 10,
    marginTop: 6,
  },
  detailsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 20,
  },
  customerDetailName: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  customerDetailPhone: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addressRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 6,
  },
  pinIcon: {
    marginTop: 2,
  },
  customerDetailAddress: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemName: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.textMuted,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  totalBillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 10,
  },
  totalBillLabel: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  totalBillVal: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: Colors.primary,
  },
});
