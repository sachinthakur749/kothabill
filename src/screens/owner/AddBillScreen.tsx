import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Modal } from 'react-native';
import { Text, TextInput, Button, Card, Divider, ActivityIndicator, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

import { db } from '@/config/firebase';
import { useAuthStore } from '@/store/authStore';
import { COLORS, SPACING, FONT_SIZE, RADIUS, COLLECTIONS, BILL_LABELS, SHADOW } from '@/constants';
import { OwnerTabParamList, KothaBillUser } from '@/types';
import { getCurrentNepaliMonthYear, getNepaliMonthsList, getNepaliYearsList, getNepaliMonth } from '@/utils/nepaliDate';

type AddBillRouteProp = RouteProp<OwnerTabParamList, 'AddBill'>;

export default function AddBillScreen() {
  const navigation = useNavigation();
  const route = useRoute<AddBillRouteProp>();
  const { user } = useAuthStore();
  const initialNepaliDate = getCurrentNepaliMonthYear();

  // --- State ---
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<KothaBillUser[]>([]);
  const [fetchingTenants, setFetchingTenants] = useState(true);
  
  // Form fields
  const [selectedTenantUid, setSelectedTenantUid] = useState(route.params?.tenantUid || '');
  const [month, setMonth] = useState(initialNepaliDate.formatted);
  const [rent, setRent] = useState('');
  const [electricity, setElectricity] = useState('');
  const [water, setWater] = useState('');
  const [dustbin, setDustbin] = useState('');
  const [note, setNote] = useState('');

  // Picker State
  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(initialNepaliDate.year);
  const [pickerMonthIndex, setPickerMonthIndex] = useState(initialNepaliDate.month);

  const years = getNepaliYearsList();
  const months = getNepaliMonthsList();

  // Fetch tenants for selection if not pre-selected
  useEffect(() => {
    const fetchTenants = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, COLLECTIONS.USERS),
          where('roomCode', '==', user.roomCode)
        );
        const snapshot = await getDocs(q);
        const tenantData = snapshot.docs
          .map(doc => doc.data() as KothaBillUser)
          .filter(u => u.role === 'tenant');
        setTenants(tenantData);
        if (tenantData.length > 0 && !selectedTenantUid) {
          setSelectedTenantUid(tenantData[0].uid);
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
      } finally {
        setFetchingTenants(false);
      }
    };

    fetchTenants();
  }, [user]);

  const calculateTotal = () => {
    return (Number(rent) || 0) + (Number(electricity) || 0) + (Number(water) || 0) + (Number(dustbin) || 0);
  };

  const handleConfirmPicker = () => {
    const monthInfo = getNepaliMonth(pickerMonthIndex);
    setMonth(`${monthInfo.en} ${pickerYear}`);
    setShowPicker(false);
  };

  const handleSubmit = async () => {
    if (!selectedTenantUid) return Alert.alert('Error', 'Please select a tenant');
    if (!rent && !electricity && !water && !dustbin) return Alert.alert('Error', 'Please enter at least one amount');

    setLoading(true);
    try {
      const selectedTenant = tenants.find(t => t.uid === selectedTenantUid);
      const total = calculateTotal();
      const billData = {
        ownerId: user?.uid,
        tenantUid: selectedTenantUid,
        tenantName: selectedTenant?.name || 'Unknown',
        roomId: user?.roomCode,
        month,
        rent: Number(rent) || 0,
        electricity: Number(electricity) || 0,
        water: Number(water) || 0,
        dustbin: Number(dustbin) || 0,
        note,
        status: 'due',
        total,
        createdAt: Date.now(),
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.BILLS), billData);
      
      // Add notification for tenant
      await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
        toUserId: selectedTenantUid,
        billId: docRef.id,
        message: `New bill added for ${month}. Total: Rs. ${total}`,
        isRead: false,
        createdAt: Date.now(),
      });
      
      Alert.alert('Success', 'Bill added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error adding bill:', error);
      Alert.alert('Error', 'Failed to save bill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingTenants) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Add New Bill</Text>
          
          <Card style={styles.formCard}>
            <Card.Content>
              <Text style={styles.label}>Select Tenant</Text>
              {tenants.length === 0 ? (
                <Text style={styles.noTenants}>No tenants found for your property.</Text>
              ) : (
                <View style={styles.tenantSelector}>
                  {tenants.map((t: KothaBillUser) => (
                    <TouchableOpacity 
                      key={t.uid} 
                      onPress={() => setSelectedTenantUid(t.uid)}
                      style={[
                        styles.tenantChip,
                        selectedTenantUid === t.uid && styles.activeChip
                      ]}
                    >
                      <Text style={[
                        styles.chipText,
                        selectedTenantUid === t.uid && styles.activeChipText
                      ]}>{t.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={[styles.label, { marginTop: SPACING.md }]}>Bill Month (Nepali BS)</Text>
              <TouchableOpacity 
                style={styles.pickerTrigger} 
                onPress={() => setShowPicker(true)}
              >
                <Text style={styles.pickerTriggerText}>{month}</Text>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>

              <Divider style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>{BILL_LABELS.rent.en}</Text>
                  <TextInput
                    value={rent}
                    onChangeText={setRent}
                    keyboardType="numeric"
                    mode="outlined"
                    placeholder="Rs. 0"
                    style={styles.input}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>{BILL_LABELS.electricity.en}</Text>
                  <TextInput
                    value={electricity}
                    onChangeText={setElectricity}
                    keyboardType="numeric"
                    mode="outlined"
                    placeholder="Rs. 0"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.label}>{BILL_LABELS.water.en}</Text>
                  <TextInput
                    value={water}
                    onChangeText={setWater}
                    keyboardType="numeric"
                    mode="outlined"
                    placeholder="Rs. 0"
                    style={styles.input}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.label}>{BILL_LABELS.dustbin.en}</Text>
                  <TextInput
                    value={dustbin}
                    onChangeText={setDustbin}
                    keyboardType="numeric"
                    mode="outlined"
                    placeholder="Rs. 0"
                    style={styles.input}
                  />
                </View>
              </View>

              <Text style={[styles.label, { marginTop: SPACING.md }]}>Optional Note</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="e.g. Electricity units: 45"
                mode="outlined"
                multiline
                numberOfLines={2}
                style={styles.input}
              />

              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>Rs. {calculateTotal()}</Text>
              </View>

              <Button 
                mode="contained" 
                onPress={handleSubmit}
                loading={loading}
                disabled={loading || tenants.length === 0}
                style={styles.submitBtn}
              >
                Submit Bill
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Nepali Date Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Nepali Month</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              {/* Year Column */}
              <View style={styles.pickerCol}>
                <Text style={styles.pickerColLabel}>Year</Text>
                <ScrollView contentContainerStyle={styles.pickerScroll}>
                  {years.map(y => (
                    <TouchableOpacity 
                      key={y} 
                      style={[styles.pickerItem, pickerYear === y && styles.activePickerItem]}
                      onPress={() => setPickerYear(y)}
                    >
                      <Text style={[styles.pickerItemText, pickerYear === y && styles.activePickerItemText]}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month Column */}
              <View style={styles.pickerCol}>
                <Text style={styles.pickerColLabel}>Month</Text>
                <ScrollView contentContainerStyle={styles.pickerScroll}>
                  {months.map(m => (
                    <TouchableOpacity 
                      key={m.index} 
                      style={[styles.pickerItem, pickerMonthIndex === m.index && styles.activePickerItem]}
                      onPress={() => setPickerMonthIndex(m.index)}
                    >
                      <Text style={[styles.pickerItemText, pickerMonthIndex === m.index && styles.activePickerItemText]}>
                        {m.labelNe} ({m.labelEn})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <Button 
              mode="contained" 
              onPress={handleConfirmPicker}
              style={styles.confirmBtn}
            >
              Confirm Selection
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll:    { padding: SPACING.md },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title:     { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.lg },
  formCard:  { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, ...SHADOW.sm },
  label:     { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: SPACING.xs },
  input:     { backgroundColor: COLORS.surface, marginBottom: SPACING.sm },
  divider:   { marginVertical: SPACING.lg },
  row:       { flexDirection: 'row', gap: SPACING.md },
  col:       { flex: 1 },
  tenantSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  tenantChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  activeChipText: { color: COLORS.white, fontWeight: '600' },
  noTenants: { color: COLORS.error, fontSize: FONT_SIZE.sm, fontStyle: 'italic', marginBottom: SPACING.md },
  pickerTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  pickerTriggerText: { fontSize: FONT_SIZE.md, color: COLORS.textPrimary, fontWeight: '500' },
  totalBox: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.primaryDark },
  totalValue: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.primary },
  submitBtn: { marginTop: SPACING.xl, borderRadius: RADIUS.md, paddingVertical: 4 },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.textPrimary },
  pickerContainer: {
    flexDirection: 'row',
    gap: SPACING.lg,
    height: 300,
  },
  pickerCol: { flex: 1 },
  pickerColLabel: { 
    fontSize: FONT_SIZE.xs, 
    color: COLORS.textMuted, 
    fontWeight: '700', 
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  pickerScroll: { paddingBottom: SPACING.xxl },
  pickerItem: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  activePickerItem: { backgroundColor: COLORS.primaryLight },
  pickerItemText: { fontSize: FONT_SIZE.md, color: COLORS.textPrimary },
  activePickerItemText: { color: COLORS.primary, fontWeight: '600' },
  confirmBtn: { marginTop: SPACING.lg, borderRadius: RADIUS.md },
});
