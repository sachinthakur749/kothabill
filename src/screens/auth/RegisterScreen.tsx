// src/screens/auth/RegisterScreen.tsx
// Full implementation comes in Phase 1 - Bullet 2 (Auth screens)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZE } from '@/constants';

export default function RegisterScreen() {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.center}>
        <Text style={styles.title}>Register</Text>
        <Text style={styles.subtitle}>Coming in Phase 1 — Auth screens</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  back:      { marginBottom: SPACING.lg },
  backText:  { color: COLORS.primary, fontSize: FONT_SIZE.md },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title:     { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.textPrimary },
  subtitle:  { fontSize: FONT_SIZE.md, color: COLORS.textMuted, marginTop: SPACING.sm },
});
