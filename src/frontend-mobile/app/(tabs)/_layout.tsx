import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { useAuth } from '@/contexts/AuthContext';

const ACTIVE_COLOR = '#40557B';
const INACTIVE_COLOR = '#9CA3AF';

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const isAdmin = user?.profile === 'Administrador';

  const visibleRoutes = state.routes.filter((r) => {
    if (r.name === 'explore' && !isAdmin) return false;
    return ['index', 'explore', 'deliveries', 'occurrences', 'reservations', 'notifications'].includes(r.name);
  });

  const profileRouteIndex = state.routes.findIndex((r) => r.name === 'profile');
  const isProfileFocused = profileRouteIndex !== -1 && state.index === profileRouteIndex;

  function onProfilePress() {
    const profileRoute = state.routes.find((r) => r.name === 'profile');
    if (!profileRoute) return;
    const event = navigation.emit({ type: 'tabPress', target: profileRoute.key, canPreventDefault: true });
    if (!isProfileFocused && !event.defaultPrevented) {
      navigation.navigate('profile');
    }
  }

  return (
    <View
      style={[
        styles.tabBar,
        { paddingBottom: insets.bottom + 8, height: 60 + insets.bottom },
      ]}
    >
      {visibleRoutes.map((route) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === state.routes.indexOf(route);
        const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;
        const label = typeof options.tabBarLabel === 'string'
          ? options.tabBarLabel
          : options.title ?? route.name;

        function onPress() {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            {options.tabBarIcon?.({ focused: isFocused, color, size: 24 })}
            <Text style={[styles.tabLabel, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.tabItem} onPress={onProfilePress} activeOpacity={0.7}>
        <Ionicons
          name={isProfileFocused ? 'person-circle' : 'person-circle-outline'}
          size={24}
          color={isProfileFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
        />
        <Text style={[styles.tabLabel, { color: isProfileFocused ? ACTIVE_COLOR : INACTIVE_COLOR }]}>
          Perfil
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Residentes',
          tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={24} color={color} />,
          tabBarLabel: 'Residentes',
        }}
      />
      <Tabs.Screen
        name="deliveries"
        options={{
          title: 'Entregas',
          tabBarIcon: ({ color }) => <Ionicons name="cube-outline" size={24} color={color} />,
          tabBarLabel: 'Entregas',
        }}
      />
      <Tabs.Screen
        name="occurrences"
        options={{
          title: 'Ocorrências',
          tabBarIcon: ({ color }) => <Ionicons name="alert-circle-outline" size={24} color={color} />,
          tabBarLabel: 'Ocorrências',
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: 'Reservas',
          tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} />,
          tabBarLabel: 'Reservas',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notificações',
          tabBarIcon: ({ color }) => <Ionicons name="notifications-outline" size={24} color={color} />,
          tabBarLabel: 'Avisos',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    alignItems: 'flex-start',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
