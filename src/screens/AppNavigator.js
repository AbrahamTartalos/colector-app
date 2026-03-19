// src/navigation/AppNavigator.js
import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MapScreen from '../screens/MapScreen';
import ScheduleScreen from '../screens/ScheduleScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#22C55E',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
            paddingBottom: 8,
            paddingTop: 8,
            height: 64,
            elevation: 0,
            shadowOpacity: 0
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4
          },
          tabBarIconStyle: {
            marginTop: 4
          }
        }}
      >
        <Tab.Screen
          name="Mapa"
          component={MapScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="🗺️" focused={focused} />
            )
          }}
        />
        <Tab.Screen
          name="Horarios"
          component={ScheduleScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="📅" focused={focused} />
            )
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Componente para iconos del tab bar
function TabIcon({ icon, focused }) {
  return (
    <Text style={{ 
      fontSize: 24, 
      opacity: focused ? 1 : 0.5 
    }}>
      {icon}
    </Text>
  );
}