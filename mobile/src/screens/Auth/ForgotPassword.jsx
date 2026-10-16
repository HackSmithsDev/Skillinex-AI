import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { KeyRound, ArrowRight, Mail, ChevronLeft, ShieldCheck } from 'lucide-react-native';

import authService from '../../api/authService';
import { errorMessage } from '../../api/axios';
import useThemeColors from '../../theme/useThemeColors';

export default function ForgotPassword({ navigation }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const colors = useThemeColors();

  const requestCode = async () => {
    const target = email.toLowerCase().trim();
    if (!target) { 
      setError('Email required'); 
      return; 
    }
    setLoading(true); 
    setError('');
    try {
      await authService.forgotPassword(target);
      setEmail(target);
      setStep(2);
    } catch (e) {
      setError(errorMessage(e, 'Could not dispatch code'));
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = () => {
    if (code.length !== 6) { 
      setError('Enter the 6-digit code'); 
      return; 
    }
    setError('');
    navigation.navigate('ResetPassword', { email, code });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-card"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-16" keyboardShouldPersistTaps="handled">
        
        {/* 1. TOP NAVIGATION */}
        <TouchableOpacity 
          onPress={() => step === 2 ? setStep(1) : navigation.goBack()}
          activeOpacity={0.7}
          className="mb-10 w-12 h-12 border-2 border-primary items-center justify-center bg-card shadow-offset-primary-sm"
        >
          <ChevronLeft size={24} strokeWidth={3} className="text-primary" />
        </TouchableOpacity>

        {/* 2. HEADER BLOCK */}
        <View className="mb-12">
          <View className="w-16 h-16 bg-primary items-center justify-center mb-6 border-b-4 border-r-4 border-primary">
            {step === 1 ? (
              <KeyRound size={32} className="text-primary-foreground" />
            ) : (
              <ShieldCheck size={32} className="text-primary-foreground" />
            )}
          </View>
          
          <Text className="text-5xl font-black uppercase italic tracking-tighter text-foreground leading-heading">
            {step === 1 ? "RECOVERY\n" : "VERIFY\n"}
            <Text className="text-primary">{step === 1 ? "PROTOCOL" : "NODE"}</Text>
          </Text>
          
          <View className="bg-surface border-l-4 border-primary p-4 mt-6">
            <Text className="text-compact font-bold uppercase tracking-widest text-muted-foreground leading-4">
              {step === 1 
                ? "Identity verification required. Instructions will be dispatched via encrypted link." 
                : `A 6-digit verification code has been transmitted to: ${email.toLowerCase()}`}
            </Text>
          </View>
        </View>

        {/* 3. INPUT CONFIGURATION */}
        <View>
          {error ? (
            <View className="bg-danger-subtle border-2 border-danger p-4 mb-6">
              <Text className="text-danger font-black text-compact uppercase tracking-widest text-center">{error}</Text>
            </View>
          ) : null}

          {step === 1 ? (
            <View>
              <Text className="text-caption font-black text-subtle uppercase tracking-wide mb-2 ml-1">Email_Address</Text>
              <View className="relative">
                <View className="absolute left-4 top-5 z-10">
                  <Mail size={18} className="text-subtle" />
                </View>
                <TextInput
                  placeholder="name@domain.com"
                  placeholderClassName="text-line-strong"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  className="bg-card border-2 border-primary h-16 pl-12 pr-4 font-bold text-foreground text-sm shadow-offset-primary"
                  onChangeText={setEmail}
                  value={email}
                />
              </View>

              <TouchableOpacity 
                onPress={requestCode}
                disabled={loading}
                activeOpacity={0.8}
                className="bg-primary h-16 mt-10 flex-row items-center justify-center border-b-8 border-primary active:bg-primary-hover"
              >
                <Text className="text-primary-foreground font-black uppercase italic tracking-widest mr-2">Request_Link</Text>
                {loading ? (
                  <ActivityIndicator color={colors['primary-foreground']} />
                ) : (
                  <ArrowRight size={18} className="text-primary-foreground" />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text className="text-caption font-black text-subtle uppercase tracking-wide mb-2 ml-1">Secure_OTP_Entry</Text>
              <TextInput
                placeholder="000000"
                placeholderClassName="text-border"
                autoFocus={true}
                className="bg-card border-2 border-primary h-24 text-center font-black text-foreground tracking-display-em text-4xl shadow-offset-primary"
                maxLength={6}
                keyboardType="number-pad"
                onChangeText={setCode}
                value={code}
              />

              <TouchableOpacity 
                onPress={verifyCode}
                activeOpacity={0.8}
                className="bg-primary h-16 mt-10 flex-row items-center justify-center border-b-8 border-primary"
              >
                <Text className="text-primary-foreground font-black uppercase italic tracking-widest">Verify_Identity</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => { setError(''); setStep(1); }}
                activeOpacity={0.7}
                className="mt-6 py-2 self-center"
              >
                <Text className="text-subtle font-black uppercase text-compact tracking-widest text-center">
                  Wrong Email? <Text className="text-foreground">Reconfigure_Target</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}