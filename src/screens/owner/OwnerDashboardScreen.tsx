import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share, Alert, Dimensions } from 'react-native';
import { Text, Card, Button, Avatar, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc, getDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppColors } from '@/hooks/useAppColors';

import { db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import { SPACING, FONT_SIZE, RADIUS, COLLECTIONS, SHADOW } from '@/constants';
import { generateRoomCode } from '@/utils/roomCode';
import { getCurrentNepaliMonthYear, getLast6MonthsBS } from '@/utils/nepaliDate';
import { ExpenseTrendChart } from '@/components/common/BillCharts';

export default function OwnerDashboardScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const COLORS = useAppColors();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [tenantCount, setTenantCount] = useState(0);
  const [thisMonthTotal, setThisMonthTotal] = useState(0);
  const [chartData, setChartData] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.roomCode) return;

    // 1. Listen for tenants in this room
    const qTenants = query(
      collection(db, COLLECTIONS.USERS),
      where('roomCode', '==', user.roomCode),
      where('role', '==', 'tenant')
    );

    const unsubscribeTenants = onSnapshot(qTenants, (snapshot) => {
      setTenantCount(snapshot.size);
    });

    // 2. Listen for bills to calculate stats and chart
    const qBills = query(
      collection(db, COLLECTIONS.BILLS),
      where('ownerId', '==', user.uid)
    );

    const last6 = getLast6MonthsBS();
    setChartLabels(last6.map(m => m.labelEn));

    const unsubscribeBills = onSnapshot(qBills, (snapshot) => {
      const allBills = snapshot.docs.map(doc => doc.data());
      const currentMonthYear = getCurrentNepaliMonthYear().formatted;
      
      // Calculate this month's total
      const currentMonthBills = allBills.filter(b => b.month === currentMonthYear);
      const total = currentMonthBills.reduce((sum, b) => sum + (b.total || 0), 0);
      setThisMonthTotal(total);

      // Calculate last 6 months revenue for chart
      const revenueData = last6.map(m => {
        const monthBills = allBills.filter(b => b.month === m.formatted);
        return monthBills.reduce((sum, b) => sum + (b.total || 0), 0);
      });
      setChartData(revenueData);
    });

    return () => {
      unsubscribeTenants();
      unsubscribeBills();
    };
  }, [user?.roomCode, user?.uid]);

  const handleCreateRoom = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const roomCode = generateRoomCode();
      const userRef = doc(db, COLLECTIONS.USERS, user.uid);
      await updateDoc(userRef, { roomCode });
      setUser({ ...user, roomCode });
      Alert.alert(t('common.success'), `Room created! Code: ${roomCode}`);
    } catch (error) {
      console.error('Error creating room:', error);
      Alert.alert(t('common.error'), 'Failed to create room.');
    } finally {
      setLoading(false);
    }
  };

  const handleShareCode = async () => {
    if (!user?.roomCode) return;
    try {
      await Share.share({
        message: `Join my property on KothaBill! Room Code: ${user.roomCode}`,
      });
    } catch (error) {
      console.error('Error sharing code:', error);
    }
  };

  const styles = createStyles(COLORS);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('common.welcome')},</Text>
            <Text style={styles.ownerName}>{user?.name}</Text>
          </View>
          <Avatar.Icon size={48} icon="home-city" color="#FFFFFF" style={{ backgroundColor: COLORS.primary }} />
        </View>

        {!user?.roomCode ? (
          <Card style={styles.setupCard}>
            <Card.Content style={styles.setupContent}>
              <Ionicons name="home-outline" size={64} color={COLORS.primary} />
              <Text style={styles.setupTitle}>Setup Your Property</Text>
              <Text style={styles.setupDesc}>Generate a room code to start adding tenants and bills.</Text>
              <Button 
                mode="contained" 
                onPress={handleCreateRoom} 
                loading={loading}
                style={styles.setupBtn}
              >
                Create Room Code
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <>
            {/* Stats Overview */}
            <View style={styles.statsRow}>
              <Card style={[styles.statCard, { backgroundColor: COLORS.primaryLight }]}>
                <Card.Content style={styles.statContent}>
                  <Text style={[styles.statLabel, { color: COLORS.primaryDark }]}>{t('owner.tenants')}</Text>
                  <Text style={[styles.statValue, { color: COLORS.primary }]}>{tenantCount}</Text>
                </Card.Content>
              </Card>
              <Card style={[styles.statCard, { backgroundColor: COLORS.tenantLight }]}>
                <Card.Content style={styles.statContent}>
                  <Text style={[styles.statLabel, { color: COLORS.tenantDark }]}>{t('owner.thisMonth')}</Text>
                  <Text style={[styles.statValue, { color: COLORS.tenant }]}>Rs. {thisMonthTotal.toLocaleString()}</Text>
                </Card.Content>
              </Card>
            </View>

            {/* Room Code Card */}
            <Card style={styles.codeCard}>
              <Card.Content style={styles.codeContent}>
                <View>
                  <Text style={styles.codeLabel}>{t('owner.roomCode')}</Text>
                  <Text style={styles.codeValue}>{user.roomCode}</Text>
                </View>
                <TouchableOpacity style={styles.shareBtn} onPress={handleShareCode}>
                  <Ionicons name="share-social-outline" size={24} color={COLORS.primary} />
                  <Text style={styles.shareText}>Share</Text>
                </TouchableOpacity>
              </Card.Content>
            </Card>

            {/* Revenue Analytics */}
            <Card style={styles.analyticsCard}>
              <Card.Content style={{ paddingRight: SPACING.xl }}>
                <ExpenseTrendChart 
                  data={chartData} 
                  labels={chartLabels}
                  title="Revenue Insights"
                />
              </Card.Content>
            </Card>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>{t('owner.recentActivity')}</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity 
                style={styles.actionItem} 
                onPress={() => navigation.navigate('AddBill')}
              >
                <View style={[styles.iconBox, { backgroundColor: COLORS.primaryLight }]}>
                  <Ionicons name="add-circle-outline" size={32} color={COLORS.primary} />
                </View>
                <Text style={styles.actionLabel}>{t('owner.addBill')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('History')}>
                <View style={[styles.iconBox, { backgroundColor: '#FFF9E6' }]}>
                  <Ionicons name="time-outline" size={32} color="#FFB000" />
                </View>
                <Text style={styles.actionLabel}>{t('owner.history')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Tenants')}>
                <View style={[styles.iconBox, { backgroundColor: COLORS.tenantLight }]}>
                  <Ionicons name="people-outline" size={32} color={COLORS.tenant} />
                </View>
                <Text style={styles.actionLabel}>{t('owner.tenants')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.md },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: SPACING.lg 
  },
  greeting: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
  ownerName: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: COLORS.textPrimary },
  
  setupCard: { marginTop: SPACING.xl, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, ...SHADOW.md },
  setupContent: { alignItems: 'center', padding: SPACING.xl },
  setupTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', marginTop: SPACING.md, color: COLORS.textPrimary },
  setupDesc: { textAlign: 'center', color: COLORS.textSecondary, marginTop: SPACING.sm, marginBottom: SPACING.xl },
  setupBtn: { width: '100%', borderRadius: RADIUS.md },

  statsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.md },
  statCard: { flex: 1, borderRadius: RADIUS.lg, elevation: 0 },
  statContent: { padding: SPACING.sm },
  statLabel: { fontSize: FONT_SIZE.xs, fontWeight: '600' },
  statValue: { fontSize: FONT_SIZE.lg, fontWeight: '800', marginTop: 4 },

  codeCard: { borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, ...SHADOW.sm, marginBottom: SPACING.lg },
  codeContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codeLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, fontWeight: '600' },
  codeValue: { fontSize: FONT_SIZE.xl, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: 2 },
  shareBtn: { alignItems: 'center' },
  shareText: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },

  analyticsCard: { borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, ...SHADOW.sm, marginBottom: SPACING.lg },

  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  actionItem: { alignItems: 'center', width: '30%' },
  iconBox: { width: 64, height: 64, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.textSecondary },
});
