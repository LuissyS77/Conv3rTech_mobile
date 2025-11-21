// app/(tabs)/_layout.ios.tsx

import { FontAwesome } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TabActions } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const AppColors = {
  background: '#121212',
  card: 'rgba(255, 255, 255, 0.08)',
  primary: '#dfd7f5ff',
  accent: '#f5f4f8ff',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.70)',
  divider: 'rgba(255, 255, 255, 0.18)',
  active: '#ababb4ff',
  chipFill: '#92929988',
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 4);

  const renderTabBar = (props: BottomTabBarProps) => {
    const { state, descriptors, navigation } = props;
    const currentRoute = state.routes[state.index]?.name;
    if (currentRoute === 'perfil') return null;

    return (
      <SafeAreaView
        pointerEvents="box-none"
        style={[
          styles.customBar,
          {
            position: 'absolute',
            bottom: Math.max(bottomInset, 4),
            height: 48 + bottomInset,
            paddingVertical: 4,
            justifyContent: 'space-around',
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
            if (!isFocused && !event.defaultPrevented) {
              navigation.dispatch(TabActions.jumpTo(route.name));
            }
          };
          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              onLongPress={onLongPress}
              activeOpacity={0.95}
              style={[styles.barItem, isFocused && styles.barItemActive]}
            >
              <FontAwesome
                name={icon}
                size={18}
                color={isFocused ? AppColors.active : AppColors.textSecondary}
              />
              <Text style={[styles.barLabel, { color: isFocused ? AppColors.active : AppColors.textSecondary }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </SafeAreaView>
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
        headerBackground: () => <View style={{ flex: 1, backgroundColor: 'rgba(18, 18, 18, 0.94)' }} />,
        headerTintColor: AppColors.text,
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
    position: 'absolute',
    left: 59,
    right: 59,
    backgroundColor: AppColors.card,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: AppColors.divider,
  },
  barItem: {
    flex: 1,
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    minHeight: 65,
    borderRadius: 22,
    gap: 6,
    marginHorizontal: 4,
  },
  barItemActive: {
    backgroundColor: AppColors.chipFill,
    borderColor: AppColors.active,
    borderWidth: 1,
  },
  barLabel: {
    fontSize: 10,
    lineHeight: 20,
    fontWeight: '600',
  },
});