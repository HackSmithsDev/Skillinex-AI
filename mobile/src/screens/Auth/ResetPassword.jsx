import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle, ChevronLeft } from 'lucide-react-native';

import authService from '../../api/authService';
import { errorMessage } from '../../api/axios';
import useThemeColors from '../../theme/useThemeColors';

export default function ResetPassword({ navigation, route }) {
  const { email, code } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const colors = useThemeColors();

  const handleReset = async () => {
    if (formData.password !== formData.confirm) {
      setError("MISMATCH: Access Keys Do Not Match");
      return;
    }
    if (formData.password.length < 8) {
      setError("SECURITY_BREACH: Min 8 Characters Required");
      return;
    }
    if (!email || !code) {
      setError("SESSION_LOST: Restart Recovery");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(email, code, formData.password);
      navigation.navigate('Login');
    } catch (e) {
      setError(errorMessage(e, "RESET_FAILED"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-card"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-16">
        
        {/* 1. TOP NAVIGATION */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="mb-10 w-12 h-12 border-2 border-primary items-center justify-center bg-card shadow-offset-primary-sm"
        >
          <ChevronLeft size={24} strokeWidth={3} className="text-primary" />
        </TouchableOpacity>

        {/* 2. SYSTEM OVERWRITE HEADER */}
        <View className="bg-primary p-8 mb-10 border-b-8 border-primary shadow-xl">
          <View className="flex-row items-center justify-between">
            {/* FIXED: text-primary -> text-primary-foreground */}
            <ShieldCheck size={40} className="text-primary-foreground" />
            <View className="bg-primary/10 px-2 py-1 border border-primary/30">
              <Text className="text-caption font-black text-success uppercase tracking-widest">Auth_Level: 04</Text>
            </View>
          </View>
          <Text className="text-5xl font-black uppercase italic tracking-tighter text-primary-foreground mt-6 leading-heading">
            SECURE{'\n'}RESET
          </Text>
          <Text className="text-compact font-black uppercase tracking-wide text-success mt-4">
            Task: Alpha_Key_Overwrite
          </Text>
        </View>

        {/* 3. INPUT CONFIGURATION */}
        <View className="space-y-8">
          {/* New Password */}
          <View className="mb-6">
            <Text className="text-caption font-black text-subtle uppercase tracking-wide mb-2 ml-1">New_Access_Key</Text>
            <View className="relative">
              <View className="absolute left-4 top-5 z-10">
                <Lock size={18} className="text-subtle" />
              </View>
              <TextInput
                secureTextEntry={!showPass}
                autoCapitalize="none"
                placeholder="Enter new password"
                placeholderClassName="text-line-strong"
                className="bg-card border-2 border-primary h-16 pl-12 pr-12 font-bold text-foreground text-sm shadow-offset-primary"
                onChangeText={(val) => setFormData({...formData, password: val})}
              />
              <TouchableOpacity 
                onPress={() => setShowPass(!showPass)}
                className="absolute right-4 top-5 z-10"
              >
                {showPass ? <EyeOff size={18} className="text-subtle" /> : <Eye size={18} className="text-subtle" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View className="mb-6">
            <Text className="text-caption font-black text-subtle uppercase tracking-wide mb-2 ml-1">Confirm_Overwrite</Text>
            <View className="relative">
              <View className="absolute left-4 top-5 z-10">
                <Lock size={18} className="text-subtle" />
              </View>
              <TextInput
                secureTextEntry={!showPass}
                autoCapitalize="none"
                placeholder="Verify new password"
                placeholderClassName="text-line-strong"
                className="bg-card border-2 border-primary h-16 pl-12 pr-4 font-bold text-foreground text-sm shadow-offset-primary"
                onChangeText={(val) => setFormData({...formData, confirm: val})}
              />
            </View>
          </View>

          {/* Error Matrix */}
          {error && (
            <View className="flex-row items-center bg-danger-subtle p-4 border-2 border-danger mb-4">
              <AlertCircle size={16} strokeWidth={3} className="text-danger" />
              <Text className="ml-3 text-danger font-black text-compact uppercase tracking-widest flex-1">{error}</Text>
            </View>
          )}

          <TouchableOpacity 
            onPress={handleReset}
            disabled={loading}
            activeOpacity={0.9}
            className="bg-primary h-20 mt-4 items-center justify-center border-b-8 border-primary shadow-2xl"
          >
            {loading ? (
              <ActivityIndicator color={colors['primary-foreground']} />
            ) : (
              <Text className="text-primary-foreground font-black uppercase italic tracking-widest text-lg">
                Update_Protocol
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-12 items-center">
          <Text className="text-caption font-black text-line-strong uppercase tracking-widest">
            System_Encryption_Active_AES256
          </Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}