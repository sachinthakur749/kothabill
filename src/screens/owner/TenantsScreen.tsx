import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, Linking } from 'react-native';
import { Text, Card, Avatar, Searchbar, ActivityIndicator, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppColors } from '@/hooks/useAppColors';

import { db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import { SPACING, FONT_SIZE, RADIUS, COLLECTIONS, SHADOW } from '@/constants';
import { KothaBillUser } from '@/types';

export default function TenantsScreen() {
  const { t } = useTranslation();
  const COLORS = useAppColors();
  const { user } = useAuthStore();
  const [tenants, setTenants] = useState<KothaBillUser[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<KothaBillUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user?.roomCode) return;

    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('roomCode', '==', user.roomCode),
      where('role', '==', 'tenant')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tenantData = snapshot.docs.map(doc => doc.data() as KothaBillUser);
      setTenants(tenantData);
      setFilteredTenants(tenantData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching tenants:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user?.roomCode]);

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = tenants.filter(t => 
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.phone.includes(query)
    );
    setFilteredTenants(filtered);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const styles = createStyles(COLORS);

  const renderTenantItem = ({ item }: { item: KothaBillUser }) => (
    <Card style={styles.tenantCard}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.leftInfo}>
          <Avatar.Text size={48} label={item.name?.substring(0, 1) || '?'} style={styles.avatar} color="#FFF" />
          <View>
            <Text style={styles.tenantName}>{item.name}</Text>
            <Text style={styles.tenantPhone}>{item.phone}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <IconButton
            icon="phone"
            mode="contained"
            containerColor={COLORS.primaryLight}
            iconColor={COLORS.primary}
            size={20}
            onPress={() => handleCall(item.phone)}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('owner.tenants')}</Text>
        <Text style={styles.roomCode}>Room: {user?.roomCode}</Text>
      </View>

      <Searchbar
        placeholder="Search tenants..."
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
        elevation={0}
        placeholderTextColor={COLORS.textMuted}
        iconColor={COLORS.textSecondary}
      />

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : filteredTenants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No tenants joined yet.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTenants}
          keyExtractor={(item) => item.uid}
          renderItem={renderTenantItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.textPrimary },
  roomCode: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, fontWeight: '600' },
  searchBar: {
    margin: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    height: 48,
  },
  loader: { flex: 1, justifyContent: 'center' },
  list: { padding: SPACING.md },
  tenantCard: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  leftInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  avatar: { backgroundColor: COLORS.primary },
  tenantName: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.textPrimary },
  tenantPhone: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  actions: { flexDirection: 'row', alignItems: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
  emptyText: { marginTop: SPACING.md, color: COLORS.textMuted },
});
