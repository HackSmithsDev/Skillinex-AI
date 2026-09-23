import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet 
} from 'react-native';
import { 
  User, Mail, Lock, Rocket, 
  ChevronRight, ChevronLeft, CheckCircle2 
} from 'lucide-react-native';
import api from '../../api/axios';

export default function Signup({ navigation }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    interests: [],
    level: 'Beginner'
  });

  const availableInterests = ["React", "Python", "AI/ML", "Django", "FastAPI", "UI/UX", "Data Science"];

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSignup = async () => {
    if (!formData.email || !formData.password || !formData.full_name) {
      setError("Please complete all identity fields.");
      setStep(1);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email.toLowerCase().trim(), // Ensure clean data
        password: formData.password,
        tech_stack: {
          interests: formData.interests,
          level: formData.level
        }
      };
      await api.post('/auth/signup', payload);
      navigation.navigate('Login');
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? `${detail[0].msg}` : "Deployment Failed: Check Connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      {/* SYSTEM PROGRESS BAR */}
      <View className="flex-row h-2 bg-slate-100 mt-12 mx-8 border border-slate-900">
        {[1, 2, 3].map((s) => (
          <View 
            key={s} 
            className={`flex-1 ${step >= s ? 'bg-primary' : 'bg-transparent'} ${s < 3 ? 'border-r border-slate-900' : ''}`} 
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-8">
        
        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <View key="step1">
            <Text className="text-5xl font-black uppercase italic tracking-tighter text-slate-900 leading-[0.85]">
              IDENTITY{'\n'}<Text className="text-primary">INIT</Text>
            </Text>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Phase_01: Credential_Setup</Text>
            
            <View className="mt-10">
              <CustomInput 
                label="FULL NAME"
                icon={<User size={18} color="#94A3B8" />} 
                placeholder="Enter your name" 
                onChangeText={(val) => setFormData({...formData, full_name: val})}
                value={formData.full_name}
              />
              <CustomInput 
                label="EMAIL ADDRESS"
                icon={<Mail size={18} color="#94A3B8" />} 
                placeholder="email@example.com" 
                keyboardType="email-address"
                autoCapitalize="none" // CRITICAL FOR RELIABILITY
                onChangeText={(val) => setFormData({...formData, email: val})}
                value={formData.email}
              />
              <CustomInput 
                label="PASSWORD"
                icon={<Lock size={18} color="#94A3B8" />} 
                placeholder="Min. 8 characters" 
                secureTextEntry
                autoCapitalize="none" // CRITICAL FOR RELIABILITY
                onChangeText={(val) => setFormData({...formData, password: val})}
                value={formData.password}
              />
            </View>

            <TouchableOpacity 
              onPress={() => setStep(2)}
              className="bg-slate-900 h-16 mt-8 flex-row items-center justify-center border-b-8 border-primary"
            >
              <Text className="text-white font-black uppercase tracking-widest mr-2">Next_Phase</Text>
              <ChevronRight size={18} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              className="mt-8 py-4 border-2 border-slate-900"
            >
              <Text className="text-slate-900 font-black uppercase text-center text-[10px] tracking-widest">
                Return to <Text className="text-primary">Login_Node</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: SKILL MATRIX */}
        {step === 2 && (
          <View key="step2">
            <Text className="text-5xl font-black uppercase italic tracking-tighter text-slate-900">
              SKILL{'\n'}<Text className="text-slate-200">MATRIX</Text>
            </Text>
            
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 mb-4">Select_Tech_Interests</Text>
            <View className="flex-row flex-wrap gap-2 mb-8">
              {availableInterests.map(interest => (
                <TouchableOpacity 
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  className={`px-4 py-3 border-2 ${formData.interests.includes(interest) ? 'bg-primary border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white border-slate-200'}`}
                >
                  <Text className={`text-[10px] font-black uppercase ${formData.interests.includes(interest) ? 'text-slate-900' : 'text-slate-400'}`}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="mb-10">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Experience_Level</Text>
              <View className="flex-row gap-3">
                {['Beginner', 'Intermediate', 'Pro'].map(lvl => (
                  <TouchableOpacity
                    key={lvl}
                    className={`flex-1 py-4 border-2 items-center ${formData.level === lvl ? 'bg-slate-900 border-slate-900' : 'bg-slate-50 border-slate-100'}`}
                    onPress={() => setFormData({...formData, level: lvl})}
                  >
                    <Text className={`text-[10px] font-black uppercase ${formData.level === lvl ? 'text-white' : 'text-slate-400'}`}>{lvl}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity 
                onPress={() => setStep(1)} 
                className="flex-1 h-16 border-2 border-slate-900 items-center justify-center bg-white"
              >
                <ChevronLeft size={20} color="#0F172A" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => setStep(3)} 
                className="flex-[3] h-16 bg-slate-900 items-center justify-center border-b-8 border-primary"
              >
                <Text className="text-white font-black uppercase tracking-widest">Verify_Deployment</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 3: DEPLOY */}
        {step === 3 && (
          <View key="step3">
            <View className="bg-slate-50 border-4 border-slate-900 p-8 mb-8">
              <View className="h-16 w-16 bg-primary items-center justify-center mb-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Rocket size={32} color="#FFF" />
              </View>
              <Text className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">READY_FOR{'\n'}LAUNCH</Text>
              
              <View className="mt-8 pt-6 border-t-2 border-slate-200">
                <Text className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-4">Final_Payload_Review</Text>
                <Text className="font-black text-xl text-slate-900 uppercase italic mb-1">{formData.full_name || 'Anonymous_Node'}</Text>
                <Text className="text-xs text-slate-400 mb-4 font-bold">{formData.email}</Text>
                
                <View className="flex-row items-center bg-white border-2 border-slate-900 p-3 mb-4">
                  <CheckCircle2 size={14} color="#0F172A" />
                  <Text className="ml-2 text-[10px] font-black uppercase tracking-widest text-slate-900">Level: {formData.level}</Text>
                </View>
              </View>
            </View>

            {error ? (
              <View className="bg-red-50 border-2 border-red-500 p-4 mb-6">
                <Text className="text-red-600 font-black text-[10px] uppercase text-center">{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity 
              onPress={handleSignup}
              disabled={loading}
              className="w-full h-20 bg-primary items-center justify-center border-b-8 border-slate-400"
            >
              {loading ? <ActivityIndicator color="#FFF" /> : (
                <Text className="text-white font-black uppercase tracking-[4px] italic">Initialize_Sync</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setStep(2)} 
              className="mt-6 py-2 self-center"
            >
              <Text className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Modify_Parameters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const CustomInput = ({ label, icon, ...props }) => (
  <View className="mb-6">
    <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{label}</Text>
    <View className="relative">
      <View className="absolute left-4 top-4 z-10">{icon}</View>
      <TextInput
        style={{ fontSize: 14, fontWeight: '700' }}
        className="bg-white border-2 border-slate-900 h-14 pl-12 pr-4 text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
        placeholderTextColor="#CBD5E1"
        {...props}
      />
    </View>
  </View>
);