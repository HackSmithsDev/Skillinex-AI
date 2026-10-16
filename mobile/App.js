import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  Home, BookOpen, Zap, FlaskConical, 
  Trophy, User as UserIcon, Bot
} from 'lucide-react-native';

// System Context
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { nativeTheme, useThemeColors } from './src/theme/useThemeColors';

// Screen Imports
import Landing from './src/screens/Home/Landing';
import Login from './src/screens/Auth/Login';
import Signup from './src/screens/Auth/Signup';
import ForgotPassword from './src/screens/Auth/ForgotPassword';
import ResetPassword from './src/screens/Auth/ResetPassword';

import UserHome from './src/screens/Home/UserHome';
import LearningVault from './src/screens/Tutorials/LearningVault';
import Tutorials from './src/screens/Tutorials/Tutorials';
import Lecture from './src/screens/Tutorials/Lecture';
import Practice from './src/screens/Practice/Practice';
import TestDashboard from './src/screens/Test/TestDashboard';
import QuizSession from './src/screens/Test/QuizSession';
import TestResult from './src/screens/Test/TestResult';
import Achievements from './src/screens/Dashboard/Achievements';
import Profile from './src/screens/Dashboard/Profile';
import AIMentor from './src/screens/AI/AIMentor';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const SkillinexHeader = ({ navigation }) => (
  <SafeAreaView edges={['top']} className="bg-card border-b-4 border-primary">
    <View className="px-6 py-4 flex-row justify-between items-center">
      <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'HOME' })}>
        <Text className="text-2xl font-black italic tracking-tighter text-foreground">
          SKILLINEX<Text className="text-primary">.SYS</Text>
        </Text>
      </TouchableOpacity>
      
      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => navigation.navigate('AIMentor')}
          accessibilityRole="button"
          accessibilityLabel="Open AI mentor"
          className="h-10 w-10 bg-card border-2 border-primary justify-center items-center shadow-offset-primary-compact"
        >
          <Bot size={20} strokeWidth={2.5} className="text-primary" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          className="h-10 w-10 bg-card border-2 border-primary justify-center items-center shadow-offset-primary-compact"
        >
          <UserIcon size={20} strokeWidth={2.5} className="text-primary" />
        </TouchableOpacity>
      </View>
    </View>
  </SafeAreaView>
);

function MainTabs({ navigation }) {
  const colors = useThemeColors();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => <SkillinexHeader navigation={navigation} />,
        tabBarStyle: {
          ...nativeTheme.navigation.tabBar,
          borderTopColor: colors.primary,
          backgroundColor: colors.card,
        },
        tabBarActiveTintColor: colors.success,
        tabBarInactiveTintColor: colors.subtle,
        tabBarLabelStyle: nativeTheme.navigation.tabBarLabel,
      })}
    >
      <Tab.Screen 
        name="HOME" 
        component={UserHome} 
        options={{ tabBarIcon: ({color}) => <Home color={color} size={22} strokeWidth={2.5} /> }} 
      />
      <Tab.Screen 
        name="VAULT" 
        component={LearningVault} 
        options={{ tabBarIcon: ({color}) => <BookOpen color={color} size={22} strokeWidth={2.5} /> }} 
      />
      <Tab.Screen 
        name="LAB"
        component={Practice} 
        options={{ tabBarIcon: ({color}) => <Zap color={color} size={22} strokeWidth={2.5} /> }} 
      />
      <Tab.Screen 
        name="TESTS"
        component={TestDashboard} 
        options={{ tabBarIcon: ({color}) => <FlaskConical color={color} size={22} strokeWidth={2.5} /> }} 
      />
      <Tab.Screen 
        name="LOG" 
        component={Achievements} 
        options={{ tabBarIcon: ({color}) => <Trophy color={color} size={22} strokeWidth={2.5} /> }} 
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useContext(AuthContext);
  const colors = useThemeColors();

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Tutorials" component={Tutorials} />
          <Stack.Screen name="Lecture" component={Lecture} />
          <Stack.Screen name="QuizSession" component={QuizSession} />
          <Stack.Screen name="TestResult" component={TestResult} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="AIMentor" component={AIMentor} />
        </>
      ) : (
        <>
          <Stack.Screen name="Landing" component={Landing} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView className="flex-1 bg-background">
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}