import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, ActivityIndicator, Avatar, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

import { db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import { COLORS, SPACING, FONT_SIZE, RADIUS, COLLECTIONS, SHADOW } from '@/constants';
import { AppNotification } from '@/types';

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('toUserId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort in-memory to avoid composite index requirement
      notifData.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      
      setNotifications(notifData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      const notifRef = doc(db, COLLECTIONS.NOTIFICATIONS, id);
      await updateDoc(notifRef, { isRead: true });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const renderNotifItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => markAsRead(item.id)}
      style={[styles.notifItem, !item.isRead && styles.unreadItem]}
    >
      <Avatar.Icon 
        size={40} 
        icon={item.billId ? "receipt" : "account-plus"} 
        color={COLORS.white} 
        style={{ backgroundColor: item.billId ? COLORS.primary : COLORS.tenant }} 
      />
      <View style={styles.content}>
        <Text style={[styles.message, !item.isRead && styles.unreadMessage]}>{item.message}</Text>
        <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
      {!item.isRead && <View style={styles.dot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {notifications.some(n => !n.isRead) && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notifications.filter(n => !n.isRead).length}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No notifications yet.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotifItem}
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.textPrimary },
  badge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  loader: { flex: 1, justifyContent: 'center' },
  list: { paddingBottom: SPACING.xxl },
  notifItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    gap: SPACING.md,
  },
  unreadItem: { backgroundColor: COLORS.surface },
  content: { flex: 1 },
  message: { fontSize: FONT_SIZE.md, color: COLORS.textPrimary },
  unreadMessage: { fontWeight: '600' },
  time: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
  emptyText: { marginTop: SPACING.md, color: COLORS.textMuted },
});
