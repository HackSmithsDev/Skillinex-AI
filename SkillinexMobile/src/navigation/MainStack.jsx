import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LayoutDashboard, BookOpen, Zap, User } from 'lucide-react-native';

// Import Screens
import UserHome from '../screens/Home/UserHome';
import Tutorials from '../screens/Tutorials/Tutorials';
import TestDashboard from '../screens/Test/TestDashboard';
import Profile from '../screens/Dashboard/Profile';
import Lecture from '../screens/Tutorials/Lecture';
import QuizSession from '../screens/Test/QuizSession';
import TestResult from '../screens/Test/TestResult';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0F172A', borderTopWidth: 0, height: 65, paddingBottom: 10 },
        tabBarActiveTintColor: '#FACC15',
        tabBarInactiveTintColor: '#64748B',
      }}
    >
      <Tab.Screen name="Home" component={UserHome} options={{ tabBarIcon: ({color}) => <LayoutDashboard color={color} size={20}/> }} />
      <Tab.Screen name="Vault" component={Tutorials} options={{ tabBarIcon: ({color}) => <BookOpen color={color} size={20}/> }} />
      <Tab.Screen name="Terminal" component={TestDashboard} options={{ tabBarIcon: ({color}) => <Zap color={color} size={20}/> }} />
      <Tab.Screen name="Account" component={Profile} options={{ tabBarIcon: ({color}) => <User color={color} size={20}/> }} />
    </Tab.Navigator>
  );
}

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="LectureView" component={Lecture} />
      <Stack.Screen name="QuizFlow" component={QuizSession} />
      <Stack.Screen name="TestResult" component={TestResult} />
    </Stack.Navigator>
  );
}