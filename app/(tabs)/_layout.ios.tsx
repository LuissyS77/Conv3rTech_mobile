// app/(tabs)/_layout.ios.tsx

import { FontAwesome } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TabActions } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { AppColors } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom;

  const renderTabBar = (props: BottomTabBarProps) => {
    const { state, descriptors, navigation } = props;
    const currentRoute = state.routes[state.index]?.name;
    if (currentRoute === 'perfil') return null;

    return (
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
      >
        <BlurView
          intensity={50}
          tint="dark"
          style={[
            styles.customBar,
            {
              height: 60 + bottomPadding,
              paddingBottom: bottomPadding,
              paddingTop: 10,
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
                  color={isFocused ? AppColors.active : AppColors.inactive}
                />
                <Text style={[styles.barLabel, { color: isFocused ? AppColors.active : AppColors.inactive }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </BlurView>
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
        headerTransparent: true,
        headerBackground: () => (
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        ),
        headerTintColor: AppColors.textPrimary,
        headerTitleStyle: { fontSize: 22, fontWeight: 'bold' },
        headerTitleAlign: 'center',
      }}
    >
      <Tabs.Screen name="citas" options={{ title: 'Agenda', headerTitle: 'Agenda' }} />
      <Tabs.Screen name="proyectos" options={{ title: 'Proyectos', headerTitle: 'Proyectos' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', headerShown: false }} />
      <Tabs.Screen name="_layout.android" options={{ href: null }} />
      <Tabs.Screen name="_layout.ios" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  customBar: {
    flexDirection: 'row',
    width: '100%', // Full width
    backgroundColor: Platform.select({
      ios: AppColors.tabBarBackground,
      android: AppColors.background,
      default: AppColors.background,
    }),
    borderTopLeftRadius: 24, // Only round top corners
    borderTopRightRadius: 24,
    alignItems: 'center',
    overflow: 'hidden',
    borderTopWidth: 1, // Only top border
    borderColor: AppColors.border,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  barItemActive: {
    // Opcional: un fondo sutil para el item activo
  },
  barLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
});