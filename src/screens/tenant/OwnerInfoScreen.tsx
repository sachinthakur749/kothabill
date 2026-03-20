import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Text, Avatar, Card, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

import { db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import { COLORS, SPACING, FONT_SIZE, RADIUS, COLLECTIONS, SHADOW } from '@/constants';
import { KothaBillUser } from '@/types';

export default function OwnerInfoScreen() {
  const { user } = useAuthStore();
  const [owner, setOwner] = useState<KothaBillUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwner = async () => {
      if (!user?.roomCode) {
        setLoading(false);
        return;
      }

      try {
        // 1. Find the room to get ownerId
        const q = query(collection(db, COLLECTIONS.ROOMS), where('roomCode', '==', user.roomCode));
        const roomSnap = await getDocs(q);
        
        if (!roomSnap.empty) {
          const ownerId = roomSnap.docs[0].data().ownerId;
          // 2. Fetch owner profile
          const ownerDoc = await getDoc(doc(db, COLLECTIONS.USERS, ownerId));
          if (ownerDoc.exists()) {
            setOwner(ownerDoc.data() as KothaBillUser);
          }
        }
      } catch (error) {
        console.error('Error fetching owner info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwner();
  }, [user?.roomCode]);

  const handleCall = () => {
    if (owner?.phone) {
       Linking.openURL(`tel:${owner.phone}`);
    } else {
      Alert.alert('Error', 'Owner phone number not available.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.tenant} />
      </View>
    );
  }

  if (!user?.roomCode) {
    return (
      <View style={styles.center}>
        <Ionicons name="home-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>Join a property to see owner information.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Owner Information</Text>

        <View style={styles.profileSection}>
          <Avatar.Icon size={100} icon="account" color={COLORS.tenant} style={{ backgroundColor: COLORS.tenantLight }} />
          <Text style={styles.ownerName}>{owner?.name || 'Loading...'}</Text>
          <Text style={styles.idBadge}>ID: {user.roomCode}</Text>
        </View>

        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={24} color={COLORS.tenant} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{owner?.phone || 'Not available'}</Text>
              </View>
              <TouchableOpacity onPress={handleCall} style={styles.actionBtn}>
                <Ionicons name="call" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={24} color={COLORS.tenant} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{owner?.email || 'N/A'}</Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={24} color={COLORS.tenant} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Property Address</Text>
                <Text style={styles.infoValue}>{owner?.address || 'Kathmandu, Nepal'}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>Need help?</Text>
          <Text style={styles.helpDesc}>
            If you have issues with your bills or need to update your room details, please contact your owner directly using the details above.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll:    { padding: SPACING.lg },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  title:     { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xl },
  profileSection: { alignItems: 'center', marginBottom: SPACING.xxl },
  ownerName: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.textPrimary, marginTop: SPACING.md },
  idBadge: { 
    fontSize: FONT_SIZE.sm, 
    color: COLORS.tenant, 
    fontWeight: '600', 
    backgroundColor: COLORS.tenantLight, 
    paddingHorizontal: SPACING.md, 
    paddingVertical: 2, 
    borderRadius: RADIUS.full,
    marginTop: SPACING.xs
  },
  infoCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, ...SHADOW.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md },
  infoText: { flex: 1, marginLeft: SPACING.md },
  infoLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  infoValue: { fontSize: FONT_SIZE.md, color: COLORS.textPrimary, fontWeight: '500' },
  divider: { backgroundColor: COLORS.divider },
  actionBtn: { 
    backgroundColor: COLORS.tenant, 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  emptyText: { marginTop: SPACING.md, color: COLORS.textMuted, textAlign: 'center' },
  helpBox: { marginTop: SPACING.xxl, padding: SPACING.md, backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.divider },
  helpTitle: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  helpDesc: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, lineHeight: 20 },
});
