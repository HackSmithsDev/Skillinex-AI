import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator 
} from 'react-native';

import { Lock, Mail, Eye, EyeOff, ChevronRight } from 'lucide-react-native';
import authService from '../../api/authService';
import { AuthContext } from '../../context/AuthContext';

export default function Login({ navigation }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useContext(AuthContext);

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setError("Credentials Required");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { access_token } = await authService.login(formData.email, formData.password);
      await login(access_token);
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
      className="flex-1 bg-card"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-20">
        
        {/* BRANDING HEADER - Keeps the Brutalist uppercase aesthetic */}
        <View className="mb-12">
          <Text className="text-5xl font-black uppercase italic tracking-[-2px] text-foreground leading-[0.9]">
            System{'\n'}<Text className="text-primary">Access</Text>
          </Text>
          <Text className="text-[10px] font-black uppercase tracking-[3px] text-subtle mt-4">
            Initialize_Secure_Session_v2.4
          </Text>
        </View>

        {/* ERROR BOX */}
        {error ? (
          <View className="bg-danger-subtle p-4 border-2 border-danger mb-6">
            <Text className="text-danger font-black uppercase text-[10px] text-center italic">
              Error: {error}
            </Text>
          </View>
        ) : null}

        {/* FORM FIELDS */}
        <View>
          
          {/* Email Input */}
          <View className="relative mb-6">
            <View className="absolute left-4 top-5 z-10">
              <Mail size={18} className="text-subtle" />
            </View>
            <TextInput
              placeholder="Email Address"
              placeholderClassName="text-subtle"
              // Removed 'uppercase' class so user sees exactly what they type
              className="bg-surface border-2 border-primary h-16 pl-12 pr-4 font-black text-foreground italic text-xs shadow-[4px_4px_0px_0px_rgb(var(--primary))]"
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
              <Lock size={18} className="text-subtle" />
            </View>
            <TextInput
              placeholder="User Password"
              placeholderClassName="text-subtle"
              secureTextEntry={!showPassword}
              // Removed 'uppercase' class
              className="bg-surface border-2 border-primary h-16 pl-12 pr-12 font-black text-foreground italic text-xs shadow-[4px_4px_0px_0px_rgb(var(--primary))]"
              autoCapitalize="none"
              onChangeText={(val) => setFormData({...formData, password: val})}
              value={formData.password}
              editable={!loading}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-5 z-10"
            >
              {showPassword ? <EyeOff size={18} className="text-subtle" /> : <Eye size={18} className="text-subtle" />}
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
            className={`h-16 bg-primary flex-row items-center justify-center border-b-4 border-r-4 border-soft 
              ${loading ? 'opacity-70' : 'opacity-100'}`}
          >
            {loading ? (
              <ActivityIndicator className="text-primary-foreground" />
            ) : (
              <>
                <Text className="text-primary-foreground font-black uppercase italic text-lg tracking-[-1px] mr-2">
                  Execute Login
                </Text>
                <ChevronRight size={20} className="text-primary-foreground" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View className="mt-12 mb-10 items-center">
          <Text className="text-[10px] font-black uppercase text-subtle">
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