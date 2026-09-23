import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator 
} from 'react-native';

import { Lock, Mail, Eye, EyeOff, ChevronRight } from 'lucide-react-native';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

export default function Login({ navigation }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, fetchUser } = useContext(AuthContext);

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setError("Credentials Required");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/token', {
        email: formData.email,
        password: formData.password
      });
      
      const { access_token, user: userData } = res.data;

      // 1. Fire and forget the storage write
      await login(access_token, userData); 
      
      // 2. IMMEDIATE SYNC: Pass the token directly to the fetcher 
      // to avoid the 401 Unauthorized race condition.
      await fetchUser(access_token); 
      
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail[0]?.msg : detail || 'Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-20">
        
        {/* BRANDING HEADER - Keeps the Brutalist uppercase aesthetic */}
        <View className="mb-12">
          <Text className="text-5xl font-black uppercase italic tracking-[-2px] text-slate-900 leading-[0.9]">
            System{'\n'}<Text className="text-primary">Access</Text>
          </Text>
          <Text className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mt-4">
            Initialize_Secure_Session_v2.4
          </Text>
        </View>

        {/* ERROR BOX */}
        {error ? (
          <View className="bg-red-50 p-4 border-2 border-red-500 mb-6">
            <Text className="text-red-600 font-black uppercase text-[10px] text-center italic">
              Error: {error}
            </Text>
          </View>
        ) : null}

        {/* FORM FIELDS */}
        <View>
          
          {/* Email Input */}
          <View className="relative mb-6">
            <View className="absolute left-4 top-5 z-10">
              <Mail size={18} color="#94A3B8" />
            </View>
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#94A3B8"
              // Removed 'uppercase' class so user sees exactly what they type
              className="bg-slate-50 border-2 border-slate-900 h-16 pl-12 pr-4 font-black text-slate-900 italic text-xs shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
              keyboardType="email-address"
              autoCapitalize="none" // Prevents auto-cap of first letter
              autoCorrect={false}
              onChangeText={(val) => setFormData({...formData, email: val})}
              value={formData.email}
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <View className="relative mb-4">
            <View className="absolute left-4 top-5 z-10">
              <Lock size={18} color="#94A3B8" />
            </View>
            <TextInput
              placeholder="User Password"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!showPassword}
              // Removed 'uppercase' class
              className="bg-slate-50 border-2 border-slate-900 h-16 pl-12 pr-12 font-black text-slate-900 italic text-xs shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
              autoCapitalize="none"
              onChangeText={(val) => setFormData({...formData, password: val})}
              value={formData.password}
              editable={!loading}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-5 z-10"
            >
              {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={() => navigation.navigate('ForgotPassword')}
            className="self-end mb-8"
          >
            <Text className="text-[10px] font-black uppercase text-primary italic">Forgot_Password?</Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
            className={`h-16 bg-slate-900 flex-row items-center justify-center border-b-4 border-r-4 border-slate-700 
              ${loading ? 'opacity-70' : 'opacity-100'}`}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text className="text-white font-black uppercase italic text-lg tracking-[-1px] mr-2">
                  Execute Login
                </Text>
                <ChevronRight size={20} color="#FFF" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View className="mt-12 mb-10 items-center">
          <Text className="text-[10px] font-black uppercase text-slate-400">
            No Authorization Node?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')} className="mt-2">
            <Text className="text-xs font-black uppercase text-primary italic">
              Initialize_New_Account
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}