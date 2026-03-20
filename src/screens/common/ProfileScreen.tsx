import React from 'react';
import { View, StyleSheet, Alert, useColorScheme } from 'react-native';
import { Text, List, Avatar, Button, Divider, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { useAppColors } from '@/hooks/useAppColors';
import { useThemeStore } from '@/store/themeStore';

import { auth } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import { SPACING, FONT_SIZE, RADIUS } from '@/constants';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const COLORS = useAppColors();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { user, setUser } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(t('common.error'), 'Failed to logout');
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'np' : 'en';
    i18n.changeLanguage(newLang);
  };

  const styles = createStyles(COLORS);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={user?.name?.substring(0, 1) || 'U'} 
          style={{ backgroundColor: user?.role === 'owner' ? COLORS.primary : COLORS.tenant }} 
          color="#FFF"
        />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
        <Text style={styles.phone}>{user?.phone}</Text>
      </View>

      <List.Section style={styles.section}>
        <List.Subheader style={{ color: COLORS.textMuted }}>{t('common.settings') || 'Settings'}</List.Subheader>
        <List.Item
          title={i18n.language === 'en' ? 'Nepali (नेपाली)' : 'English'}
          titleStyle={{ color: COLORS.textPrimary }}
          left={props => <List.Icon {...props} icon="translate" color={COLORS.textSecondary} />}
          right={() => (
            <Button 
              mode="text" 
              onPress={toggleLanguage}
              textColor={COLORS.primary}
            >
              {i18n.language.toUpperCase()}
            </Button>
          )}
        />
        <Divider style={{ backgroundColor: COLORS.divider }} />
        <List.Item
          title="Dark Mode"
          titleStyle={{ color: COLORS.textPrimary }}
          description={isDarkMode ? "On" : "Off"}
          descriptionStyle={{ color: COLORS.textMuted }}
          left={props => <List.Icon {...props} icon="theme-light-dark" color={COLORS.textSecondary} />}
          right={() => <Switch value={isDarkMode} onValueChange={toggleTheme} color={COLORS.primary} />}
        />
      </List.Section>

      <View style={styles.footer}>
        <Button 
          mode="outlined" 
          onPress={handleLogout} 
          textColor={COLORS.error}
          style={[styles.logoutBtn, { borderColor: COLORS.error }]}
          icon="logout"
        >
          {t('common.logout')}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { alignItems: 'center', padding: SPACING.xl, gap: SPACING.xs },
  name: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.textPrimary, marginTop: SPACING.sm },
  role: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, letterSpacing: 1 },
  phone: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
  section: { marginTop: SPACING.md },
  footer: { padding: SPACING.xl, marginTop: 'auto' },
  logoutBtn: { borderRadius: RADIUS.md },
});
