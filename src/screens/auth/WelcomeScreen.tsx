// src/screens/auth/WelcomeScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, SPACING, FONT_SIZE, RADIUS, APP_NAME, APP_TAGLINE } from '@/constants';
import { useAppColors } from '@/hooks/useAppColors';
import { RootStackParamList } from '@/types';

type Nav = StackNavigationProp<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<Nav>();
  const COLORS = useAppColors();
  const styles = createStyles(COLORS);

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo area */}
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🏠</Text>
        </View>
        <Text style={styles.appName}>{APP_NAME}</Text>
        <Text style={styles.tagline}>{APP_TAGLINE}</Text>
        <Text style={styles.description}>
          Track room rent, electricity, water and dustbin bills — all in one place.
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnSecondaryText}>I already have an account</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Made for Nepal 🇳🇵</Text>
    </SafeAreaView>
  );
}

const createStyles = (COLORS: any) => StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    justifyContent:  'space-between',
    paddingVertical: SPACING.xl,
  },
  hero: {
    flex:       1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  logoCircle: {
    width:           100,
    height:          100,
    borderRadius:    50,
    backgroundColor: COLORS.primaryLight,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    SPACING.sm,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    fontSize:   FONT_SIZE.h1,
    fontWeight: '700',
    color:      COLORS.primary,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize:  FONT_SIZE.lg,
    color:     COLORS.textSecondary,
    fontWeight: '500',
  },
  description: {
    fontSize:  FONT_SIZE.md,
    color:     COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  actions: {
    gap: SPACING.md,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius:    RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems:      'center',
  },
  btnPrimaryText: {
    color:      '#FFFFFF',
    fontSize:   FONT_SIZE.lg,
    fontWeight: '600',
  },
  btnSecondary: {
    borderWidth:  1.5,
    borderColor:  COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems:   'center',
  },
  btnSecondaryText: {
    color:      COLORS.primary,
    fontSize:   FONT_SIZE.md,
    fontWeight: '500',
  },
  footer: {
    textAlign:  'center',
    color:      COLORS.textMuted,
    fontSize:   FONT_SIZE.sm,
    marginTop:  SPACING.md,
  },
});
