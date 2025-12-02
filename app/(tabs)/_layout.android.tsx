// app/(tabs)/_layout.android.tsx

import { FontAwesome, Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  // Remove any extra bottom margin/inset calculation
  // Just use insets.bottom to account for gesture bar if present, otherwise 0
  const bottomPadding = insets.bottom;

  const renderTabBar = (props: BottomTabBarProps) => {
    const { state, descriptors, navigation } = props;
    const currentRoute = state.routes[state.index]?.name;
    if (currentRoute === 'perfil') return null;

    return (
      <View
        style={[
          styles.customBar,
          {
            // Position absolute at bottom 0
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            // Height includes safe area + navbar content height
            height: 60 + bottomPadding,
            // Add paddingBottom equal to safe area
            paddingBottom: bottomPadding,
            paddingTop: 10,
            justifyContent: 'space-between',
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const options = descriptors[route.key]?.options ?? {};
          const label =
            typeof options.tabBarLabel === 'string' ? options.tabBarLabel : options.title ?? route.name;

          const icon: React.ComponentProps<typeof FontAwesome>['name'] =
            route.name === 'citas' ? 'calendar' : route.name === 'proyectos' ? 'folder-open' : 'user';

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              activeOpacity={0.95}
              style={[styles.barItem, isFocused && styles.barItemActive]}
            >
              <FontAwesome
                name={icon}
                size={22}
                color={isFocused ? AppColors.active : AppColors.inactive}
              />
              <Text style={[styles.barLabel, { color: isFocused ? AppColors.active : AppColors.inactive }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Tabs
      initialRouteName="citas"
      tabBar={renderTabBar}
      screenOptions={{
        animation: 'fade',
        sceneStyle: { backgroundColor: AppColors.background },
        headerStyle: { backgroundColor: AppColors.background, elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 },
        headerShadowVisible: false,
        headerBackground: () => <View style={{ flex: 1, backgroundColor: AppColors.background }} />,
        headerTintColor: AppColors.textPrimary,
        headerTitleStyle: { fontSize: 22, fontWeight: 'bold' },
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen name="citas" options={{ title: 'Agenda', headerTitle: 'Agenda' }} />
      <Tabs.Screen name="proyectos" options={{ title: 'Proyectos', headerTitle: 'Proyectos' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', headerShown: false }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  customBar: {
    flexDirection: 'row',
    backgroundColor: AppColors.background,
    borderTopWidth: 1,
    borderColor: AppColors.border,
    alignItems: 'center',
    elevation: 10,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barItemActive: {
    // Opcional: un fondo sutil para el item activo
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});