import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Text, Card, Button, Avatar, ActivityIndicator, Badge, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, doc, updateDoc, limit, onSnapshot, addDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppColors } from '@/hooks/useAppColors';
import { LineChart } from 'react-native-chart-kit';

import { db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import { SPACING, FONT_SIZE, RADIUS, COLLECTIONS, SHADOW, BILL_COLORS, BILL_LABELS } from '@/constants';
import { Bill } from '@/types';

export default function TenantHomeScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const COLORS = useAppColors();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [latestBill, setLatestBill] = useState<Bill | null>(null);
  const [fetchingBill, setFetchingBill] = useState(false);

  useEffect(() => {
    if (!user?.roomCode) return;

    setFetchingBill(true);
    const q = query(
      collection(db, COLLECTIONS.BILLS),
      where('tenantUid', '==', user.uid),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const billData = {
          ...snapshot.docs[0].data(),
          billId: snapshot.docs[0].id,
        } as Bill;
        setLatestBill(billData);
      } else {
        setLatestBill(null);
      }
      setFetchingBill(false);
    });

    return unsubscribe;
  }, [user?.roomCode]);

  const handleJoinRoom = async () => {
    if (!roomCode.trim() || !user) return;
    setJoining(true);
    try {
      const q = query(collection(db, COLLECTIONS.USERS), where('roomCode', '==', roomCode.trim()), where('role', '==', 'owner'));
      const ownerSnap = await getDocs(q);

      if (ownerSnap.empty) {
        return Alert.alert('Error', 'Invalid Room Code. No owner found with this code.');
      }

      const userRef = doc(db, COLLECTIONS.USERS, user.uid);
      await updateDoc(userRef, { roomCode: roomCode.trim() });
      setUser({ ...user, roomCode: roomCode.trim() });

    } catch (error) {
      console.error('Error joining room:', error);
      Alert.alert('Error', 'Failed to join room.');
    } finally {
      setJoining(false);
    }
  };

  const styles = createStyles(COLORS);

  if (!user?.roomCode) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.joinContent}>
          <Avatar.Icon size={80} icon="home-import" color={COLORS.tenant} style={{ backgroundColor: COLORS.tenantLight }} />
          <Text style={styles.joinTitle}>Welcome to KothaBill</Text>
          <Text style={styles.joinDesc}>Enter the room code provided by your home owner to get started.</Text>
          
          <TextInput
            placeholder="Enter Room Code (e.g. KB-1234)"
            value={roomCode}
            onChangeText={setRoomCode}
            mode="outlined"
            style={styles.joinInput}
            outlineColor={COLORS.tenant}
            activeOutlineColor={COLORS.tenant}
          />

          <Button 
            mode="contained" 
            onPress={handleJoinRoom} 
            loading={joining}
            style={styles.joinBtn}
            buttonColor={COLORS.tenant}
          >
            Join Property
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('common.welcome')},</Text>
            <Text style={styles.name}>{user?.name}</Text>
          </View>
          <Avatar.Icon size={48} icon="account" color={COLORS.tenant} style={{ backgroundColor: COLORS.tenantLight }} />
        </View>

        <Text style={styles.sectionTitle}>{t('tenant.latestBill')}</Text>
        
        {fetchingBill ? (
          <ActivityIndicator color={COLORS.tenant} style={{ marginTop: SPACING.xl }} />
        ) : latestBill ? (
          <>
            <Card style={styles.billCard}>
                <View style={styles.billHeader}>
                  <View>
                    <Text style={styles.billMonth}>{latestBill.month}</Text>
                    <Text style={styles.billDate}>{t('common.month')}: {latestBill.month}</Text>
                  </View>
                  <View style={styles.headerRight}>
                    <Text style={styles.billTotal}>Rs. {latestBill.total}</Text>
                    <Badge style={[styles.statusBadge, { backgroundColor: latestBill.status === 'paid' ? COLORS.success : COLORS.error }]}>
                      {latestBill.status === 'paid' ? t('common.paid') : t('common.due')}
                    </Badge>
                  </View>
                </View>
              <Card.Content>
                <View style={styles.billRow}>
                  <View style={[styles.dot, { backgroundColor: BILL_COLORS.rent }]} />
                  <Text style={styles.catLabel}>{t('bills.rent')}</Text>
                  <Text style={styles.catValue}>Rs. {latestBill.rent}</Text>
                </View>
                <View style={styles.billRow}>
                  <View style={[styles.dot, { backgroundColor: BILL_COLORS.electricity }]} />
                  <Text style={styles.catLabel}>{t('bills.electricity')}</Text>
                  <Text style={styles.catValue}>Rs. {latestBill.electricity}</Text>
                </View>
                <View style={styles.billRow}>
                  <View style={[styles.dot, { backgroundColor: BILL_COLORS.water }]} />
                  <Text style={styles.catLabel}>{t('bills.water')}</Text>
                  <Text style={styles.catValue}>Rs. {latestBill.water}</Text>
                </View>
                <View style={styles.billRow}>
                  <View style={[styles.dot, { backgroundColor: BILL_COLORS.dustbin }]} />
                  <Text style={styles.catLabel}>{t('bills.dustbin')}</Text>
                  <Text style={styles.catValue}>Rs. {latestBill.dustbin}</Text>
                </View>

                {latestBill.note && (
                  <View style={styles.noteBox}>
                    <Ionicons name="information-circle-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.noteText}>{latestBill.note}</Text>
                  </View>
                )}
              </Card.Content>
            </Card>

            <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Usage Trend</Text>
            <LineChart
              data={{
                labels: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
                datasets: [{ data: [20, 45, 28, 80, 99, 43] }]
              }}
              width={Dimensions.get('window').width - 32}
              height={180}
              chartConfig={{
                backgroundColor: COLORS.surface,
                backgroundGradientFrom: COLORS.surface,
                backgroundGradientTo: COLORS.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => COLORS.tenant,
                labelColor: (opacity = 1) => COLORS.textSecondary,
                style: { borderRadius: 16 },
                propsForDots: { r: "4", strokeWidth: "2", stroke: COLORS.tenant }
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>{t('tenant.noBills')}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          <TouchableOpacity style={styles.linkCard} onPress={() => navigation.navigate('BillHistory')}>
            <Ionicons name="receipt-outline" size={28} color={COLORS.tenant} />
            <Text style={styles.linkText}>{t('tenant.history')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkCard} onPress={() => navigation.navigate('OwnerInfo')}>
            <Ionicons name="person-outline" size={28} color={COLORS.tenant} />
            <Text style={styles.linkText}>{t('tenant.ownerInfo')}</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  greeting: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
  name: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: COLORS.textPrimary },
  
  joinContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  joinTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', marginTop: SPACING.lg, color: COLORS.textPrimary },
  joinDesc: { textAlign: 'center', color: COLORS.textSecondary, marginTop: SPACING.sm, marginBottom: SPACING.xl },
  joinInput: { width: '100%', marginBottom: SPACING.md, backgroundColor: COLORS.surface },
  joinBtn: { width: '100%', borderRadius: RADIUS.md },

  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  billCard: { 
    borderRadius: RADIUS.lg, 
    backgroundColor: COLORS.white, 
    ...SHADOW.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  billMonth: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.tenant },
  billDate: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  headerRight: { alignItems: 'flex-end' },
  billTotal: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.textPrimary },
  statusBadge: { marginTop: 4 },

  billRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: SPACING.sm },
  catLabel: { flex: 1, fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
  catValue: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.textPrimary },
  
  noteBox: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  noteText: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontStyle: 'italic' },

  quickLinks: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xl },
  linkCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOW.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  linkText: { marginTop: SPACING.xs, fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.textSecondary },

  emptyCard: { borderRadius: RADIUS.lg, backgroundColor: COLORS.white, ...SHADOW.sm },
  emptyContent: { alignItems: 'center', padding: SPACING.xl },
  emptyText: { marginTop: SPACING.md, color: COLORS.textMuted, textAlign: 'center' },
});
