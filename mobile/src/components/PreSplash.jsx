import React from 'react';
import { View, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import preSplashAnimation from '../assets/pre-splash.json';

// Branded animated boot screen shown while auth/session state hydrates.
export default function PreSplash() {
  return (
    <View className="flex-1 justify-center items-center bg-[#0F172A]">
      <LottieView
        source={preSplashAnimation}
        autoPlay
        loop
        style={{ width: 220, height: 220 }}
      />
      <Text className="mt-4 font-black uppercase text-[10px] tracking-widest text-slate-400">
        Initializing System...
      </Text>
    </View>
  );
}
