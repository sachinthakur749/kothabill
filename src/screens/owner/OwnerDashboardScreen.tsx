import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { Text, Card, Button, Avatar, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc, getDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

import { db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import { COLORS, SPACING, FONT_SIZE, RADIUS, COLLECTIONS, SHADOW } from '@/constants';
import { generateRoomCode } from '@/utils/roomCode';
import { getCurrentNepaliMonthYear } from '@/utils/nepaliDate';

export default function OwnerDashboardScreen() {
  const navigation = useNavigation<any>();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [tenantCount, setTenantCount] = useState(0);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [fetchingData, setFetchingData] = useState(true);

  // Generate Room Code if owner doesn't have one
  useEffect(() => {
    const checkRoomCode = async () => {
      if (user?.role === 'owner' && !user.roomCode) {
        setLoading(true);
        try {
          const newCode = generateRoomCode();
          const userRef = doc(db, COLLECTIONS.USERS, user.uid);
          
          await updateDoc(userRef, { roomCode: newCode });
          
          // Also create a entry in rooms collection
          const roomRef = doc(db, COLLECTIONS.ROOMS, newCode);
          await setDoc(roomRef, {
            roomId: newCode,
            ownerId: user.uid,
            roomCode: newCode,
            createdAt: Date.now(),
            address: user.address || '',
          });

          // Update local state
          setUser({ ...user, roomCode: newCode });
        } catch (error) {
          console.error('Error generating room code:', error);
          Alert.alert('Error', 'Failed to generate room code. Please check your connection.');
        } finally {
          setLoading(false);
        }
      }
    };

    checkRoomCode();
  }, [user]);

  // Fetch Summary Data
  useEffect(() => {
    if (!user?.roomCode) {
      setFetchingData(false);
      return;
    }

    const currentMonthBS = getCurrentNepaliMonthYear().formatted;
    const currentMonthAD = new Date().toISOString().slice(0, 7);

    // 1. Listen for tenants
    const tenantsQuery = query(
      collection(db, COLLECTIONS.USERS),
      where('roomCode', '==', user.roomCode)
    );

    const unsubscribeTenants = onSnapshot(tenantsQuery, (snapshot) => {
      const tenants = snapshot.docs.filter(d => d.data().role === 'tenant');
      setTenantCount(tenants.length);
    });

    // 2. Listen for this month's bills (using the BS month name as stored in doc)
    const billsQuery = query(
      collection(db, COLLECTIONS.BILLS),
      where('ownerId', '==', user.uid),
      where('month', '==', currentMonthBS)
    );

    const unsubscribeBills = onSnapshot(billsQuery, (snapshot) => {
      let total = 0;
      snapshot.docs.forEach(d => {
        total += (d.data().total || 0);
      });
      setMonthlyTotal(total);
      setFetchingData(false);
    });

    return () => {
      unsubscribeTenants();
      unsubscribeBills();
    };
  }, [user?.roomCode, user?.uid]);

  const handleShareCode = async () => {
    if (!user?.roomCode) return;
    try {
      await Share.share({
        message: `Join my property on KothaBill! Use my Room Code: ${user.roomCode}`,
      });
    } catch (error) {
      console.error('Error sharing code:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.loadingText}>Setting up your property...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Namaste,</Text>
            <Text style={styles.name}>{user?.name}</Text>
          </View>
          <Avatar.Icon size={48} icon="account" color={COLORS.primary} style={{ backgroundColor: COLORS.primaryLight }} />
        </View>

        {/* Room Code Card */}
        <Card style={styles.codeCard}>
          <Card.Content>
            <Text style={styles.codeLabel}>Your Room Code</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeText}>{user?.roomCode || '---'}</Text>
              <TouchableOpacity onPress={handleShareCode} style={styles.shareBtn}>
                <Ionicons name="share-social" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.codeHint}>Share this code with your tenants to link them.</Text>
          </Card.Content>
        </Card>

        {/* Summary Board */}
        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, { backgroundColor: COLORS.primaryLight }]}>
            <Card.Content style={styles.summaryContent}>
              <Text style={styles.summaryValue}>{fetchingData ? '...' : tenantCount}</Text>
              <Text style={styles.summaryLabel}>Tenants</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.summaryCard, { backgroundColor: COLORS.amberLight }]}>
            <Card.Content style={styles.summaryContent}>
              <Text style={styles.summaryValue}>Rs. {fetchingData ? '...' : monthlyTotal}</Text>
              <Text style={styles.summaryLabel}>{getCurrentNepaliMonthYear().monthNameEn}</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Card style={styles.activityCard}>
          <Card.Content style={styles.emptyActivity}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No bills added yet.</Text>
            <Button 
              mode="contained" 
              style={styles.addBtn}
              onPress={() => navigation.navigate('AddBill')}
            >
              Add First Bill
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll:    { padding: SPACING.md },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  loadingText: { marginTop: SPACING.md, color: COLORS.textSecondary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  greeting: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
  name: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.textPrimary },
  codeCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    ...SHADOW.md,
  },
  codeLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, marginBottom: SPACING.xs },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  shareBtn: {
    padding: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
  },
  codeHint: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: SPACING.sm },
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryCard: { flex: 1, borderRadius: RADIUS.md },
  summaryContent: { alignItems: 'center', paddingVertical: SPACING.sm },
  summaryValue: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.textPrimary },
  summaryLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  activityCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    minHeight: 200,
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  emptyActivity: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    marginVertical: SPACING.md,
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
  },
  addBtn: { borderRadius: RADIUS.md },
});
