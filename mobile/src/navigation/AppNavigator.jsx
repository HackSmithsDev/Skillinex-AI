import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainStack from './MainStack';

export default function AppNavigator() {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    // You can return a Splash/Loading screen here
    return null; 
  }

  return (
    <NavigationContainer>
      {userToken !== null ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}