import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  ScrollView, KeyboardAvoidingView, Platform, StyleSheet 
} from 'react-native';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle, ChevronLeft } from 'lucide-react-native';

export default function ResetPassword({ navigation }) {
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');

  const handleReset = () => {
    if (formData.password !== formData.confirm) {
      setError("MISMATCH: Access Keys Do Not Match");
      return;
    }
    if (formData.password.length < 8) {
      setError("SECURITY_BREACH: Min 8 Characters Required");
      return;
    }
    // API Call Logic here
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-16">
        
        {/* 1. TOP NAVIGATION */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="mb-10 w-12 h-12 border-2 border-slate-900 items-center justify-center bg-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
        >
          <ChevronLeft size={24} color="#0F172A" strokeWidth={3} />
        </TouchableOpacity>

        {/* 2. SYSTEM OVERWRITE HEADER */}
        <View className="bg-slate-900 p-8 mb-10 border-b-8 border-primary shadow-xl">
          <View className="flex-row items-center justify-between">
            <ShieldCheck size={40} color="#0F172A" />
            <View className="bg-primary/10 px-2 py-1 border border-primary/30">
              <Text className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Auth_Level: 04</Text>
            </View>
          </View>
          <Text className="text-5xl font-black uppercase italic tracking-tighter text-white mt-6 leading-[0.85]">
            SECURE{'\n'}RESET
          </Text>
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-emerald-400/60 mt-4">
            Task: Alpha_Key_Overwrite
          </Text>
        </View>

        {/* 3. INPUT CONFIGURATION */}
        <View className="space-y-8">
          {/* New Password */}
          <View className="mb-6">
            <Text className="text-[8px] font-black text-slate-400 uppercase tracking-[2px] mb-2 ml-1">New_Access_Key</Text>
            <View className="relative">
              <View className="absolute left-4 top-5 z-10">
                <Lock size={18} color="#94A3B8" />
              </View>
              <TextInput
                secureTextEntry={!showPass}
                autoCapitalize="none"
                placeholder="Enter new password"
                placeholderTextColor="#CBD5E1"
                className="bg-white border-2 border-slate-900 h-16 pl-12 pr-12 font-bold text-slate-900 text-sm shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
                onChangeText={(val) => setFormData({...formData, password: val})}
              />
              <TouchableOpacity 
                onPress={() => setShowPass(!showPass)}
                className="absolute right-4 top-5 z-10"
              >
                {showPass ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View className="mb-6">
            <Text className="text-[8px] font-black text-slate-400 uppercase tracking-[2px] mb-2 ml-1">Confirm_Overwrite</Text>
            <View className="relative">
              <View className="absolute left-4 top-5 z-10">
                <Lock size={18} color="#94A3B8" />
              </View>
              <TextInput
                secureTextEntry={!showPass}
                autoCapitalize="none"
                placeholder="Verify new password"
                placeholderTextColor="#CBD5E1"
                className="bg-white border-2 border-slate-900 h-16 pl-12 pr-4 font-bold text-slate-900 text-sm shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
                onChangeText={(val) => setFormData({...formData, confirm: val})}
              />
            </View>
          </View>

          {/* Error Matrix */}
          {error && (
            <View className="flex-row items-center bg-red-50 p-4 border-2 border-red-500 mb-4">
              <AlertCircle size={16} color="#EF4444" strokeWidth={3} />
              <Text className="ml-3 text-red-600 font-black text-[10px] uppercase tracking-widest flex-1">{error}</Text>
            </View>
          )}

          <TouchableOpacity 
            onPress={handleReset}
            activeOpacity={0.9}
            className="bg-slate-900 h-20 mt-4 items-center justify-center border-b-8 border-primary shadow-2xl"
          >
            <Text className="text-white font-black uppercase italic tracking-widest text-lg">Update_Protocol</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-12 items-center">
            <Text className="text-[8px] font-black text-slate-300 uppercase tracking-widest">System_Encryption_Active_AES256</Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}