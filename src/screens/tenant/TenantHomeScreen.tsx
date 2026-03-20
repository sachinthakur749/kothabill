import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, TextInput, Button, ActivityIndicator, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, doc, updateDoc, limit, orderBy, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import { COLORS, SPACING, FONT_SIZE, RADIUS, COLLECTIONS, SHADOW, BILL_COLORS, BILL_LABELS } from '@/constants';
import { Bill } from '@/types';

export default function TenantHomeScreen() {
  const navigation = useNavigation<any>();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [latestBill, setLatestBill] = useState<Bill | null>(null);
  const [fetchingBill, setFetchingBill] = useState(false);

  // Listen for the latest bill if linked
  useEffect(() => {
    if (user?.roomCode) {
      setFetchingBill(true);
      const q = query(
        collection(db, COLLECTIONS.BILLS),
        where('tenantUid', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map(d => d.data() as Bill);
          // Sort by createdAt descending
          docs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setLatestBill(docs[0]);
        } else {
          setLatestBill(null);
        }
        setFetchingBill(false);
      }, (error) => {
        console.error('Error fetching bill:', error);
        setFetchingBill(false);
      });

      return unsubscribe;
    }
  }, [user?.roomCode]);

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) return Alert.alert('Error', 'Please enter a Room Code');
    
    setJoining(true);
    try {
      // 1. Check if room exists
      const q = query(collection(db, COLLECTIONS.ROOMS), where('roomCode', '==', roomCode.trim().toUpperCase()));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setJoining(false);
        return Alert.alert('Invalid Code', 'No property found with this code. Please check and try again.');
      }

      // 2. Link tenant to room in users collection
      const userRef = doc(db, COLLECTIONS.USERS, user!.uid);
      await updateDoc(userRef, { roomCode: roomCode.trim().toUpperCase() });

      // 3. Update local store
      setUser({ ...user!, roomCode: roomCode.trim().toUpperCase() });
      Alert.alert('Success', 'You have successfully joined the room!');
    } catch (error) {
      console.error('Error joining room:', error);
      Alert.alert('Error', 'Failed to join room. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const renderJoinRoom = () => (
    <View style={styles.center}>
      <View style={styles.welcomeHero}>
        <Avatar.Icon size={100} icon="home-variant-outline" color={COLORS.tenant} style={{ backgroundColor: COLORS.tenantLight }} />
        <Text style={styles.welcomeTitle}>Welcome to KothaBill</Text>
        <Text style={styles.welcomeSub}>You are not linked to any property yet.</Text>
      </View>

      <Card style={styles.joinCard}>
        <Card.Content>
          <Text style={styles.label}>Enter Room Code</Text>
          <TextInput
            placeholder="KB-XXXX"
            value={roomCode}
            onChangeText={setRoomCode}
            autoCapitalize="characters"
            mode="outlined"
            style={styles.input}
            activeOutlineColor={COLORS.tenant}
          />
          <Button 
            mode="contained" 
            onPress={handleJoinRoom}
            loading={joining}
            disabled={joining || !roomCode}
            style={styles.joinBtn}
          >
            Join Property
          </Button>
          <Text style={styles.hintText}>Ask your owner for the unique Room Code.</Text>
        </Card.Content>
      </Card>
    </View>
  );

  const renderDashboard = () => (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Namaste,</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <Avatar.Icon size={48} icon="account" color={COLORS.tenant} style={{ backgroundColor: COLORS.tenantLight }} />
      </View>

      <Text style={styles.sectionTitle}>Latest Bill</Text>
      
      {fetchingBill ? (
        <ActivityIndicator color={COLORS.tenant} style={{ marginTop: SPACING.xl }} />
      ) : latestBill ? (
        <Card style={styles.billCard}>
          <View style={styles.billHeader}>
            <Text style={styles.monthText}>{latestBill.month}</Text>
            <View style={styles.totalBadge}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>Rs. {latestBill.total}</Text>
            </View>
          </View>
          <Card.Content>
            <View style={styles.billRow}>
              <View style={[styles.dot, { backgroundColor: BILL_COLORS.rent }]} />
              <Text style={styles.catLabel}>{BILL_LABELS.rent.en}</Text>
              <Text style={styles.catValue}>Rs. {latestBill.rent}</Text>
            </View>
            <View style={styles.billRow}>
              <View style={[styles.dot, { backgroundColor: BILL_COLORS.electricity }]} />
              <Text style={styles.catLabel}>{BILL_LABELS.electricity.en}</Text>
              <Text style={styles.catValue}>Rs. {latestBill.electricity}</Text>
            </View>
            <View style={styles.billRow}>
              <View style={[styles.dot, { backgroundColor: BILL_COLORS.water }]} />
              <Text style={styles.catLabel}>{BILL_LABELS.water.en}</Text>
              <Text style={styles.catValue}>Rs. {latestBill.water}</Text>
            </View>
            <View style={styles.billRow}>
              <View style={[styles.dot, { backgroundColor: BILL_COLORS.dustbin }]} />
              <Text style={styles.catLabel}>{BILL_LABELS.dustbin.en}</Text>
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
      ) : (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No bills found for this property.</Text>
          </Card.Content>
        </Card>
      )}

      {/* Quick Links */}
      <View style={styles.quickLinks}>
        <TouchableOpacity style={styles.linkCard} onPress={() => navigation.navigate('History')}>
          <Ionicons name="receipt-outline" size={28} color={COLORS.tenant} />
          <Text style={styles.linkText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkCard} onPress={() => navigation.navigate('OwnerInfo')}>
          <Ionicons name="person-outline" size={28} color={COLORS.tenant} />
          <Text style={styles.linkText}>Owner Info</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {!user?.roomCode ? renderJoinRoom() : renderDashboard()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll:    { padding: SPACING.md },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.lg },
  
  // Join Room Styles
  welcomeHero: { alignItems: 'center', marginBottom: SPACING.xxl },
  welcomeTitle: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.tenant, marginTop: SPACING.md },
  welcomeSub: { fontSize: FONT_SIZE.md, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xs },
  joinCard: { width: '100%', borderRadius: RADIUS.lg, backgroundColor: COLORS.white, ...SHADOW.md },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.xs },
  input: { backgroundColor: COLORS.surface, marginBottom: SPACING.md },
  joinBtn: { backgroundColor: COLORS.tenant, borderRadius: RADIUS.md, paddingVertical: 4 },
  hintText: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.md },

  // Dashboard Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  greeting: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
  name: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.textPrimary },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.md },
  billCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOW.md },
  billHeader: {
    backgroundColor: COLORS.tenantLight,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthText: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.tenant },
  totalBadge: { alignItems: 'flex-end' },
  totalLabel: { fontSize: 10, fontWeight: '700', color: COLORS.tenant, opacity: 0.7 },
  totalValue: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.tenant },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
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
  noteText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontStyle: 'italic', flex: 1 },
  emptyCard: { borderRadius: RADIUS.lg, paddingVertical: SPACING.xl },
  emptyContent: { alignItems: 'center' },
  emptyText: { marginTop: SPACING.md, color: COLORS.textMuted },
  quickLinks: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  linkCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  linkText: { marginTop: SPACING.xs, fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.textSecondary },
});
