import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZE } from '@/constants';
export default function OwnerInfoScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Tenant Screen</Text>
        <Text style={styles.sub}>Phase 2</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title:     { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.tenant },
  sub:       { fontSize: FONT_SIZE.md, color: COLORS.textMuted, marginTop: SPACING.sm },
});
