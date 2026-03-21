// src/navigation/OwnerTabs.tsx
// Bottom tab navigator for the Owner role

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAppColors } from '@/hooks/useAppColors';
import { SPACING, FONT_SIZE } from '@/constants';
import { OwnerTabParamList } from '@/types';

// Placeholder screens — will be built in Phase 2
import OwnerDashboardScreen from '@/screens/owner/OwnerDashboardScreen';
import AddBillScreen        from '@/screens/owner/AddBillScreen';
import HistoryScreen from '@/screens/owner/HistoryScreen';
import TenantsScreen from '@/screens/owner/TenantsScreen';
import ProfileScreen from '@/screens/common/ProfileScreen';
import NotificationsScreen from '@/screens/common/NotificationsScreen';

const Tab = createBottomTabNavigator<OwnerTabParamList>();

export default function OwnerTabs() {
  const COLORS = useAppColors();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor:  COLORS.surface,
          borderTopColor:   COLORS.border,
          borderTopWidth:   1,
          paddingBottom:    6,
          paddingTop:       6,
          height:           60,
        },
        tabBarLabelStyle: {
          fontSize:   FONT_SIZE.xs,
          fontWeight: '500',
        },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, { outline: string; filled: string }> = {
            Dashboard: { outline: 'home-outline',    filled: 'home' },
            AddBill:   { outline: 'add-circle-outline', filled: 'add-circle' },
            History:   { outline: 'time-outline',          filled: 'time' },
            Profile:   { outline: 'settings-outline',      filled: 'settings' },
            Notifications: { outline: 'notifications-outline', filled: 'notifications' },
          };
          const icon = icons[route.name];
          const name = focused ? icon.filled : icon.outline;
          return <Ionicons name={name as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={OwnerDashboardScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="AddBill"   component={AddBillScreen}         options={{ tabBarLabel: 'Add Bill' }} />
      <Tab.Screen name="History"   component={HistoryScreen} options={{ tabBarLabel: 'History' }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarLabel: 'Notifs' }} />
      <Tab.Screen name="Profile"   component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
      <Tab.Screen 
        name="Tenants" 
        component={TenantsScreen} 
        options={{ 
          tabBarButton: () => null,
          headerShown: false,
        }} 
      />
    </Tab.Navigator>
  );
}
