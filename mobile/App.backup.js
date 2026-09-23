import React, { useContext } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  Home, BookOpen, Zap, FlaskConical, 
  Trophy, User as UserIcon 
} from 'lucide-react-native';

// System Context
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// --- SCREEN IMPORTS ---
// Auth Flow
import Landing from './src/screens/Home/Landing';
import Login from './src/screens/Auth/Login';
import Signup from './src/screens/Auth/Signup';
import ForgotPassword from './src/screens/Auth/ForgotPassword';
import ResetPassword from './src/screens/Auth/ResetPassword';

// Dashboard & Core
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

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 1. TOP BAR COMPONENT (The Persistent Identity)
const SkillinexHeader = ({ navigation }) => (
  <SafeAreaView className="bg-white border-b-4 border-slate-900">
    <View className="px-6 py-4 flex-row justify-between items-center">
      <TouchableOpacity onPress={() => navigation.navigate('HOME')}>
        <Text className="text-2xl font-black italic tracking-tighter text-slate-900">
          SKILLINEX<Text className="text-primary">.SYS</Text>
        </Text>
      </TouchableOpacity>
      
      {/* Profile Node Link */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('Profile')}
        className="h-10 w-10 bg-white border-2 border-slate-900 justify-center items-center shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]"
      >
        <UserIcon size={20} color="#0F172A" strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

// 2. MAIN NAVIGATION (The 5-Tab Command Center)
function MainTabs({ navigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => <SkillinexHeader navigation={navigation} />,
        tabBarStyle: {
          height: 90,
          paddingBottom: 30,
          paddingTop: 12,
          borderTopWidth: 4,
          borderTopColor: '#0F172A',
          backgroundColor: '#FFFFFF',
        },
        tabBarActiveTintColor: '#10B981', // Emerald-500
        tabBarInactiveTintColor: '#94A3B8', // Slate-400
        tabBarLabelStyle: { 
          fontSize: 10, 
          fontWeight: '900', 
          textTransform: 'uppercase',
          letterSpacing: 0.5 
        },
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
        name="PRACTICE" 
        component={Practice} 
        options={{ tabBarIcon: ({color}) => <Zap color={color} size={22} strokeWidth={2.5} /> }} 
      />
      <Tab.Screen 
        name="LAB" 
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

// 3. ROOT NAVIGATION (The Logic Switch)
function RootNavigator() {
  const { user, loading } = useContext(AuthContext);

  // System Boot State
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0F172A" />
        <Text className="mt-4 font-black uppercase text-[10px] tracking-widest text-slate-400">
          Initializing System...
        </Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // PROTECTED PROTOCOL (User Authenticated)
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          
          {/* Detailed View Stack (Hides Bottom Tabs for Focus) */}
          <Stack.Screen name="Tutorials" component={Tutorials} />
          <Stack.Screen name="Lecture" component={Lecture} />
          <Stack.Screen name="QuizSession" component={QuizSession} />
          <Stack.Screen name="TestResult" component={TestResult} />
          <Stack.Screen name="Profile" component={Profile} />
        </>
      ) : (
        // PUBLIC PROTOCOL (Authentication Required)
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}