import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, ActivityIndicator, Avatar, Searchbar, Badge } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppColors } from '@/hooks/useAppColors';

import { db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import { SPACING, FONT_SIZE, RADIUS, COLLECTIONS, SHADOW, BILL_COLORS } from '@/constants';
import { Bill } from '@/types';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const COLORS = useAppColors();
  const { user } = useAuthStore();
  const [bills, setBills] = useState<any[]>([]);
  const [filteredBills, setFilteredBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, COLLECTIONS.BILLS),
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const billData = snapshot.docs.map(doc => ({
        ...doc.data(),
        billId: doc.id
      })) as any[];

      // If any bills are missing tenantName, fetch them from users
      const missingNames = billData.filter(b => !b.tenantName);
      if (missingNames.length > 0) {
        const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
        const userMap: Record<string, string> = {};
        usersSnap.forEach(doc => {
          userMap[doc.id] = doc.data().name;
        });
        
        billData.forEach(bill => {
          if (!bill.tenantName && bill.tenantUid) {
            bill.tenantName = userMap[bill.tenantUid] || 'Unknown';
          }
        });
      }
      
      // Sort by createdAt descending
      billData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      
      setBills(billData);
      setFilteredBills(billData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching owner history:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const markAsPaid = async (billId: string) => {
    try {
      const billRef = doc(db, COLLECTIONS.BILLS, billId);
      await updateDoc(billRef, { status: 'paid' });
      Alert.alert(t('common.success'), t('alerts.billUpdated'));
    } catch (error) {
      console.error('Error marking as paid:', error);
      Alert.alert(t('common.error'), t('alerts.updateFailed'));
    }
  };

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredBills(bills);
    } else {
      const filtered = bills.filter(bill => 
        bill.tenantName?.toLowerCase().includes(query.toLowerCase()) ||
        bill.month?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredBills(filtered);
    }
  };

  const styles = createStyles(COLORS);

  const renderBillItem = ({ item }: { item: any }) => (
    <Card style={styles.billCard}>
      <Card.Content>
        <View style={styles.billHeader}>
          <View style={styles.tenantInfo}>
            <Avatar.Text size={32} label={item.tenantName?.substring(0, 1) || '?'} style={styles.avatar} color={COLORS.white} />
            <View>
              <Text style={styles.tenantName}>{item.tenantName || 'Unknown Tenant'}</Text>
              <View style={styles.monthRow}>
                <Text style={styles.monthText}>{item.month}</Text>
                <Badge style={[styles.statusBadge, { backgroundColor: item.status === 'paid' ? COLORS.success : COLORS.error }]}>
                  {item.status === 'paid' ? t('common.paid') : t('common.due')}
                </Badge>
              </View>
            </View>
          </View>
          <Text style={styles.totalText}>Rs. {item.total}</Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>{t('common.added') || 'Added'}: {new Date(item.createdAt).toLocaleDateString()}</Text>
          <View style={styles.actions}>
            {item.status !== 'paid' && (
              <TouchableOpacity style={styles.payBtn} onPress={() => markAsPaid(item.billId)}>
                <Text style={styles.payBtnText}>{t('common.markPaid')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.viewBtn}
              onPress={() => Alert.alert(
                t('common.details'),
                `${t('common.month')}: ${item.month}\n${t('bills.rent')}: Rs. ${item.rent}\n${t('bills.electricity')}: Rs. ${item.electricity}\n${t('bills.water')}: Rs. ${item.water}\n${t('bills.dustbin')}: Rs. ${item.dustbin}\n\n${t('common.total')}: Rs. ${item.total}\n${t('common.note')}: ${item.note || 'None'}`
              )}
            >
              <Text style={styles.viewBtnText}>{t('common.details')}</Text>
              <Ionicons name="chevron-forward" size={12} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('owner.history')}</Text>
        <Ionicons name="filter-outline" size={24} color={COLORS.primary} />
      </View>

      <Searchbar
        placeholder={t('history.searchPlaceholder') || "Search tenant or month..."}
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
        elevation={0}
        placeholderTextColor={COLORS.textMuted}
        iconColor={COLORS.textSecondary}
      />

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : filteredBills.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>{t('common.noBills') || 'No bills found.'}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBills}
          keyExtractor={(item) => item.billId}
          renderItem={renderBillItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.textPrimary },
  searchBar: {
    margin: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    height: 44,
  },
  loader: { flex: 1, justifyContent: 'center' },
  list: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  billCard: {
    marginBottom: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 0,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tenantInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  avatar: { backgroundColor: COLORS.primary },
  tenantName: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.textPrimary },
  monthRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  monthText: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  statusBadge: { fontSize: 8, height: 16, lineHeight: 14 },
  totalText: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.primary },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  detailText: { fontSize: 10, color: COLORS.textMuted },
  actions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  payBtn: { backgroundColor: COLORS.success + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  payBtnText: { fontSize: 10, color: COLORS.success, fontWeight: '700' },
  viewBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewBtnText: { fontSize: 10, fontWeight: '600', color: COLORS.primary },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
  emptyText: { marginTop: SPACING.md, color: COLORS.textMuted },
});
