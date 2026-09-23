import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  ScrollView, KeyboardAvoidingView, Platform, StyleSheet 
} from 'react-native';
import { KeyRound, ArrowRight, Mail, ChevronLeft, ShieldCheck } from 'lucide-react-native';

export default function ForgotPassword({ navigation }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState('');

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-16">
        
        {/* 1. TOP NAVIGATION */}
        <TouchableOpacity 
          onPress={() => step === 2 ? setStep(1) : navigation.goBack()}
          className="mb-10 w-12 h-12 border-2 border-slate-900 items-center justify-center bg-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
        >
          <ChevronLeft size={24} color="#0F172A" strokeWidth={3} />
        </TouchableOpacity>

        {/* 2. HEADER BLOCK */}
        <View className="mb-12">
          <View className="w-16 h-16 bg-slate-900 items-center justify-center mb-6 border-b-4 border-r-4 border-primary">
            {step === 1 ? (
              <KeyRound color="#FFF" size={32} />
            ) : (
              <ShieldCheck color="#FFF" size={32} />
            )}
          </View>
          
          <Text className="text-5xl font-black uppercase italic tracking-tighter text-slate-900 leading-[0.85]">
            {step === 1 ? "RECOVERY\n" : "VERIFY\n"}
            <Text className="text-primary">{step === 1 ? "PROTOCOL" : "NODE"}</Text>
          </Text>
          
          <View className="bg-slate-50 border-l-4 border-slate-900 p-4 mt-6">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-4">
              {step === 1 
                ? "Identity verification required. Instructions will be dispatched via encrypted link." 
                : `A 6-digit verification code has been transmitted to: ${email.toLowerCase()}`}
            </Text>
          </View>
        </View>

        {/* 3. INPUT CONFIGURATION */}
        <View>
          {step === 1 ? (
            <View>
              <Text className="text-[8px] font-black text-slate-400 uppercase tracking-[2px] mb-2 ml-1">Email_Address</Text>
              <View className="relative">
                <View className="absolute left-4 top-5 z-10">
                  <Mail size={18} color="#94A3B8" />
                </View>
                <TextInput
                  placeholder="name@domain.com"
                  placeholderTextColor="#CBD5E1"
                  autoCapitalize="none" // FOR RELIABILITY
                  keyboardType="email-address"
                  className="bg-white border-2 border-slate-900 h-16 pl-12 pr-4 font-bold text-slate-900 text-sm shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
                  onChangeText={setEmail}
                  value={email}
                />
              </View>

              <TouchableOpacity 
                onPress={() => setStep(2)}
                className="bg-slate-900 h-16 mt-10 flex-row items-center justify-center border-b-8 border-primary active:bg-slate-800"
              >
                <Text className="text-white font-black uppercase italic tracking-widest mr-2">Request_Link</Text>
                <ArrowRight size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text className="text-[8px] font-black text-slate-400 uppercase tracking-[2px] mb-2 ml-1">Secure_OTP_Entry</Text>
              <TextInput
                placeholder="000000"
                placeholderTextColor="#E2E8F0"
                className="bg-slate-50 border-2 border-slate-900 h-24 text-center font-black text-slate-900 tracking-[0.5em] text-4xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
                maxLength={6}
                keyboardType="number-pad"
              />

              <TouchableOpacity 
                onPress={() => navigation.navigate('ResetPassword')}
                className="bg-primary h-16 mt-10 flex-row items-center justify-center border-b-8 border-slate-400"
              >
                <Text className="text-white font-black uppercase italic tracking-widest">Verify_Identity</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setStep(1)}
                className="mt-6 py-2 self-center"
              >
                <Text className="text-slate-400 font-black uppercase text-[10px] tracking-widest text-center">
                  Wrong Email? <Text className="text-slate-900">Reconfigure_Target</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}