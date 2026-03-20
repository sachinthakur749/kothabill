import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Avatar, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { auth } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '@/constants';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await auth.signOut();
              logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <Avatar.Icon 
          size={80} 
          icon="account" 
          color={COLORS.primary} 
          style={{ backgroundColor: COLORS.primaryLight }}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{user?.name || 'Owner'}</Text>
          <Text style={styles.role}>Room Owner</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.menuItem}>
          <Ionicons name="mail-outline" size={24} color={COLORS.textSecondary} />
          <View style={styles.menuText}>
            <Text style={styles.menuLabel}>Email Address</Text>
            <Text style={styles.menuValue}>{user?.email || 'N/A'}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.menuItem}>
          <Ionicons name="phone-portrait-outline" size={24} color={COLORS.textSecondary} />
          <View style={styles.menuText}>
            <Text style={styles.menuLabel}>Phone Number</Text>
            <Text style={styles.menuValue}>{user?.phone || 'Not set'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          mode="outlined" 
          onPress={handleLogout}
          textColor={COLORS.error}
          style={styles.logoutBtn}
          icon="logout"
        >
          Logout
        </Button>
        <Text style={styles.version}>KothaBill v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header:    { padding: SPACING.lg },
  title:     { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.textPrimary },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOW.sm,
  },
  info: { marginLeft: SPACING.md },
  name: { fontSize: FONT_SIZE.xl, fontWeight: '600', color: COLORS.textPrimary },
  role: { fontSize: FONT_SIZE.md, color: COLORS.textMuted },
  section: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  menuText: { marginLeft: SPACING.md },
  menuLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  menuValue: { fontSize: FONT_SIZE.md, color: COLORS.textPrimary, fontWeight: '500' },
  divider: { marginVertical: SPACING.xs },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: SPACING.xl,
    alignItems: 'center',
  },
  logoutBtn: {
    width: '100%',
    borderColor: COLORS.error,
    borderRadius: RADIUS.md,
  },
  version: {
    marginTop: SPACING.md,
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.xs,
  },
});
