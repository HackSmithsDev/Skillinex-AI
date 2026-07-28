import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ShieldAlert, Zap, FlaskConical, Trophy } from 'lucide-react-native';

// Screen Imports
import UserHome from '../screens/Home/UserHome';
import LearningVault from '../screens/Tutorials/LearningVault';
import Practice from '../screens/Practice/Practice';
import TestDashboard from '../screens/Test/TestDashboard';
import Achievements from '../screens/Dashboard/Achievements';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // We use our custom TopBar instead
        tabBarStyle: {
          height: 90,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 4,
          borderTopColor: '#0F172A',
          paddingBottom: 30,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#10B981', // Emerald-500
        tabBarInactiveTintColor: '#94A3B8', // Slate-400
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconSize = focused ? 26 : 22;
          const stroke = focused ? 3 : 2;

          switch (route.name) {
            case 'HOME': return <Home color={color} size={iconSize} strokeWidth={stroke} />;
            case 'VAULT': return <ShieldAlert color={color} size={iconSize} strokeWidth={stroke} />;
            case 'PRACTICE': return <Zap color={color} size={iconSize} strokeWidth={stroke} />;
            case 'LAB': return <FlaskConical color={color} size={iconSize} strokeWidth={stroke} />;
            case 'LOG': return <Trophy color={color} size={iconSize} strokeWidth={stroke} />;
            default: return null;
          }
        },
      })}
    >
      <Tab.Screen name="HOME" component={UserHome} />
      <Tab.Screen name="VAULT" component={LearningVault} />
      <Tab.Screen name="PRACTICE" component={Practice} />
      <Tab.Screen name="LAB" component={TestDashboard} />
      <Tab.Screen name="LOG" component={Achievements} />
    </Tab.Navigator>
  );
};

export default BottomTabs;