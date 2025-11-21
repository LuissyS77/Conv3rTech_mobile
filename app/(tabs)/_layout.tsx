import React from 'react';
import { Platform } from 'react-native';
import AndroidLayout from './_layout.android';
import IOSLayout from './_layout.ios';

export default function TabLayout() {
  return Platform.OS === 'ios' ? <IOSLayout /> : <AndroidLayout />;
}