import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, Avatar, Badge } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

import { db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import { COLORS, SPACING, FONT_SIZE, RADIUS, COLLECTIONS, SHADOW, BILL_COLORS } from '@/constants';
import { Bill } from '@/types';

export default function BillHistoryScreen() {
  const { user } = useAuthStore();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, COLLECTIONS.BILLS),
      where('tenantUid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const billData = snapshot.docs.map(doc => ({
        ...doc.data(),
        billId: doc.id
      } as Bill));
      
      // Sort by createdAt descending (most recent first)
      billData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      
      setBills(billData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching bill history:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const renderBillItem = ({ item }: { item: Bill }) => (
    <Card style={styles.billCard}>
      <Card.Content>
        <View style={styles.billHeader}>
          <View>
            <Text style={styles.monthText}>{item.month}</Text>
            <Text style={styles.dateText}>Added on {new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.totalText}>Rs. {item.total}</Text>
            <Badge style={[styles.statusBadge, { backgroundColor: item.status === 'paid' ? COLORS.success : COLORS.error }]}>
              {item.status?.toUpperCase() || 'DUE'}
            </Badge>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <View style={[styles.dot, { backgroundColor: BILL_COLORS.rent }]} />
            <Text style={styles.statLabel}>Rent: {item.rent}</Text>
          </View>
          <View style={styles.stat}>
            <View style={[styles.dot, { backgroundColor: BILL_COLORS.electricity }]} />
            <Text style={styles.statLabel}>Elec: {item.electricity}</Text>
          </View>
          <View style={styles.stat}>
            <View style={[styles.dot, { backgroundColor: BILL_COLORS.water }]} />
            <Text style={styles.statLabel}>Water: {item.water}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bill History</Text>
        <Avatar.Icon size={40} icon="history" color={COLORS.tenant} style={{ backgroundColor: COLORS.tenantLight }} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.tenant} style={styles.loader} />
      ) : bills.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No bills found in your history.</Text>
        </View>
      ) : (
        <FlatList
          data={bills}
          keyExtractor={(item) => item.billId || Math.random().toString()}
          renderItem={renderBillItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.textPrimary },
  loader: { flex: 1, justifyContent: 'center' },
  list: { padding: SPACING.md, paddingBottom: SPACING.xxl },
  billCard: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    ...SHADOW.sm,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerRight: { alignItems: 'flex-end', gap: 2 },
  monthText: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.tenant },
  dateText: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  totalText: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.textPrimary },
  statusBadge: { fontSize: 8, height: 16, lineHeight: 14 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  stat: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
  emptyText: { marginTop: SPACING.md, color: COLORS.textMuted, textAlign: 'center' },
});
