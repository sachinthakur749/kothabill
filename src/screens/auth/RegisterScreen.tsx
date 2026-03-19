// src/screens/auth/RegisterScreen.tsx

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
  SegmentedButtons,
  ActivityIndicator,
  Portal,
  Dialog,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { auth, db } from '@/config/firebase';
import { COLORS, SPACING, FONT_SIZE, RADIUS, COLLECTIONS } from '@/constants';
import { UserRole, KothaBillUser, RootStackParamList } from '@/types';
import { useAuthStore } from '@/store/authStore';

type RegisterNavProp = StackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterNavProp>();
  const { setUser } = useAuthStore();

  // --- State ---
  const [step, setStep] = useState<1 | 2>(1); // 1: Name & Role, 2: Email & Password
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole>('tenant');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- Actions ---
  const handleRegister = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Please enter your name');
    if (!email.trim() || !email.includes('@')) return Alert.alert('Error', 'Invalid email address');
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);

      if (userCredential.user) {
        // Successful Auth -> Create Profile in Firestore
        const newUser: KothaBillUser = {
          uid:       userCredential.user.uid,
          name:      name.trim(),
          email:     email.trim(),
          phone:     '', // No phone set for now
          role:      role,
          createdAt: Date.now(),
        };

        await setDoc(doc(db, COLLECTIONS.USERS, newUser.uid), newUser);
        
        // Update local store (RootNavigator will handle redirection)
        setUser(newUser);
      }
    } catch (error: any) {
      console.error('Registration Error:', error);
      Alert.alert('Registration Failed', error.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  // --- Render Steps ---
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.label}>Select Your Role</Text>
      <SegmentedButtons
        value={role}
        onValueChange={(val) => setRole(val as UserRole)}
        buttons={[
          {
            value: 'owner',
            label: 'Room Owner',
            checkedColor: COLORS.white,
            style: { backgroundColor: role === 'owner' ? COLORS.primary : 'transparent' }
          },
          {
            value: 'tenant',
            label: 'Tenant',
            checkedColor: COLORS.white,
            style: { backgroundColor: role === 'tenant' ? COLORS.tenant : 'transparent' }
          },
        ]}
        style={styles.segmented}
      />
      <Text style={styles.roleDesc}>
        {role === 'owner' 
          ? 'Manage your rooms, track electricity/water, and send bills to tenants.'
          : 'View your monthly bills, pay history, and owner information.'}
      </Text>

      <Text style={[styles.label, { marginTop: SPACING.lg }]}>Full Name</Text>
      <TextInput
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        outlineColor={COLORS.border}
        activeOutlineColor={role === 'owner' ? COLORS.primary : COLORS.tenant}
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={() => setStep(2)}
        style={[styles.btn, { backgroundColor: role === 'owner' ? COLORS.primary : COLORS.tenant }]}
        disabled={!name.trim()}
      >
        Next
      </Button>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.label}>Email Address</Text>
      <TextInput
        placeholder="example@mail.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        mode="outlined"
        outlineColor={COLORS.border}
        activeOutlineColor={role === 'owner' ? COLORS.primary : COLORS.tenant}
        style={styles.input}
      />

      <Text style={[styles.label, { marginTop: SPACING.sm }]}>Password</Text>
      <TextInput
        placeholder="Min. 6 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        outlineColor={COLORS.border}
        activeOutlineColor={role === 'owner' ? COLORS.primary : COLORS.tenant}
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        disabled={loading || !email || password.length < 6}
        style={[styles.btn, { backgroundColor: role === 'owner' ? COLORS.primary : COLORS.tenant }]}
      >
        Register
      </Button>
      
      <TouchableOpacity onPress={() => setStep(1)} style={styles.backLink}>
        <Text style={styles.backLinkText}>Change Name / Role</Text>
      </TouchableOpacity>
    </View>
  );

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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Step {step} of 2</Text>
          </View>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.background },
  scroll:     { padding: SPACING.lg, flexGrow: 1 },
  back:       { marginBottom: SPACING.md },
  backText:   { color: COLORS.textSecondary, fontSize: FONT_SIZE.md },
  header:     { marginBottom: SPACING.xl },
  title:      { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.textPrimary },
  subtitle:   { fontSize: FONT_SIZE.md, color: COLORS.textMuted },
  stepContainer: { gap: SPACING.md },
  label:      { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.textPrimary, marginBottom: -SPACING.xs },
  segmented:  { marginTop: SPACING.sm },
  roleDesc:   { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontStyle: 'italic', marginBottom: SPACING.sm },
  input:      { backgroundColor: COLORS.surface },
  btn:        { marginTop: SPACING.md, paddingVertical: SPACING.xs, borderRadius: RADIUS.md },
  hint:       { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, textAlign: 'center' },
  backLink:   { marginTop: SPACING.lg, alignSelf: 'center' },
  backLinkText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.sm, textDecorationLine: 'underline' },
});
