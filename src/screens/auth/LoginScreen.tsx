// src/screens/auth/LoginScreen.tsx

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '@/config/firebase';
import { COLORS, SPACING, FONT_SIZE, RADIUS, COLLECTIONS } from '@/constants';
import { useAppColors } from '@/hooks/useAppColors';
import { useAuthStore } from '@/store/authStore';
import { KothaBillUser, RootStackParamList } from '@/types';

type LoginNavProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginNavProp>();
  const { setUser } = useAuthStore();
  const COLORS = useAppColors();

  // --- State ---
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const styles = createStyles(COLORS);

  // --- Actions ---
  const handleLogin = async () => {
    const emailNormalized = email.trim().toLowerCase();
    if (!emailNormalized || !emailNormalized.includes('@')) return Alert.alert('Error', 'Invalid email address');
    if (password.length < 6) return Alert.alert('Error', 'Invalid password');

    setLoading(true);
    try {
      console.log('Attempting login for:', emailNormalized);
      const userCredential = await signInWithEmailAndPassword(auth, emailNormalized, password);

      if (userCredential.user) {
        // Check if user has a profile
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid));

        if (userDoc.exists()) {
          setUser(userDoc.data() as KothaBillUser);
        } else {
          // No profile found - sign out and tell them to register
          await auth.signOut();
          Alert.alert(
            'Account Not Found',
            'No KothaBill profile is linked to this account. Please register first.',
            [{ text: 'Go Back', onPress: () => navigation.navigate('Welcome') }]
          );
        }
      }
    } catch (error: any) {
      console.error('Login Error:', error.code, error.message);

      let errorMessage = 'Invalid email or password.';
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is badly formatted.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Firestore is unavailable. You might be offline or your connection is blocked.';
      }

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login with your email</Text>
          </View>

          <View style={styles.stepContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              placeholder="example@mail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
              style={styles.input}
              textColor={COLORS.textPrimary}
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={[styles.label, { marginTop: SPACING.sm }]}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
              style={styles.input}
              textColor={COLORS.textPrimary}
              placeholderTextColor={COLORS.textMuted}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading || !email || !password}
              style={styles.btn}
            >
              Login
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.lg, flexGrow: 1 },
  back: { marginBottom: SPACING.md },
  backText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.md },
  header: { marginBottom: SPACING.xl },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: FONT_SIZE.md, color: COLORS.textMuted },
  stepContainer: { gap: SPACING.md },
  label: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.textPrimary, marginBottom: -SPACING.xs },
  input: { backgroundColor: COLORS.surface },
  btn: { marginTop: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.md },
  hint: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, textAlign: 'center' },
  backLink: { marginTop: SPACING.lg, alignSelf: 'center' },
  backLinkText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, textDecorationLine: 'underline' },
});
