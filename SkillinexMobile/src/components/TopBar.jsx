import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const TopBar = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="bg-white border-b-4 border-slate-900">
      <View className="px-6 py-4 flex-row justify-between items-center">
        {/* Branding */}
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'HOME' })}>
          <Text className="text-2xl font-black italic tracking-tighter text-slate-900">
            SKILLINEX<Text className="text-primary">.SYS</Text>
          </Text>
        </TouchableOpacity>

        {/* Profile/Matrix Link */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('Profile')}
          className="h-10 w-10 bg-white border-2 border-slate-900 items-center justify-center shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
        >
          <User size={20} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TopBar;