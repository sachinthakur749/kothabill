// src/navigation/TenantTabs.tsx
// Bottom tab navigator for the Tenant role

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONT_SIZE } from '@/constants';
import { TenantTabParamList } from '@/types';

// Placeholder screens — will be built in Phase 2
import TenantHomeScreen    from '@/screens/tenant/TenantHomeScreen';
import BillHistoryScreen   from '@/screens/tenant/BillHistoryScreen';
import OwnerInfoScreen     from '@/screens/tenant/OwnerInfoScreen';
import TenantProfileScreen from '@/screens/tenant/TenantProfileScreen';

const Tab = createBottomTabNavigator<TenantTabParamList>();

export default function TenantTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   COLORS.tenant,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor:  COLORS.border,
          borderTopWidth:  1,
          paddingBottom:   6,
          paddingTop:      6,
          height:          60,
        },
        tabBarLabelStyle: {
          fontSize:   FONT_SIZE.xs,
          fontWeight: '500',
        },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, { outline: string; filled: string }> = {
            Home:        { outline: 'home-outline',          filled: 'home' },
            BillHistory: { outline: 'time-outline',          filled: 'time' },
            OwnerInfo:   { outline: 'person-circle-outline', filled: 'person-circle' },
            Profile:     { outline: 'settings-outline',      filled: 'settings' },
          };
          const icon = icons[route.name];
          const name = focused ? icon.filled : icon.outline;
          return <Ionicons name={name as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"        component={TenantHomeScreen}    options={{ tabBarLabel: 'My Bills' }} />
      <Tab.Screen name="BillHistory" component={BillHistoryScreen}   options={{ tabBarLabel: 'History' }} />
      <Tab.Screen name="OwnerInfo"   component={OwnerInfoScreen}     options={{ tabBarLabel: 'Owner' }} />
      <Tab.Screen name="Profile"     component={TenantProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
