import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import { RootStackParamList } from './types';
import LaunchesListScreen from '../screens/LaunchesListScreen';
import LaunchDetailsScreen from '../screens/LaunchDetailsScreen';
import { Colors } from '../constants/colors';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="LaunchesList"
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.surface,
            shadowColor: Colors.shadow,
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          },
          headerTintColor: Colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="LaunchesList"
          component={LaunchesListScreen}
          options={{
            title: 'SpaceX Launches',
          }}
        />
        <Stack.Screen
          name="LaunchDetails"
          component={LaunchDetailsScreen}
          options={({ route }: StackScreenProps<RootStackParamList, 'LaunchDetails'>) => ({
            title: route.params.launch.name,
            headerBackTitle: 'Launches',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}