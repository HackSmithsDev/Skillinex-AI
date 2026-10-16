import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { 
  User, Mail, Lock, Briefcase, Sparkles, Camera, FileText,
  ChevronRight, ChevronLeft 
} from 'lucide-react-native';
import authService from '../../api/authService';
import { errorMessage } from '../../api/axios';
import useThemeColors from '../../theme/useThemeColors';

const LEVELS = ['Beginner', 'Intermediate', 'Pro'];
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];

export default function Signup({ navigation }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const colors = useThemeColors();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    age: '',
    gender: '',
    bio: '',
    experience: '',
    photo: null,
    tech_stack: {},
  });

  const update = (patch) => setFormData((prev) => ({ ...prev, ...patch }));

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission required', 'Allow photo access to choose a profile picture.');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (res.canceled || !res.assets?.length) return;
    const a = res.assets[0];
    const type = a.mimeType || 'image/jpeg';
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(type)) {
      return Alert.alert('Unsupported format', 'Only JPEG, JPG, and PNG formats are accepted.');
    }
    update({ photo: { uri: a.uri, name: a.fileName || 'avatar.jpg', type } });
  };

  const goToDetails = async () => {
    const email = formData.email.toLowerCase().trim();
    if (!email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.checkEmail(email);
      if (res?.exists) {
        setError(res.message || "Email already registered.");
        return;
      }
      setError('');
      setStep(2);
    } catch (e) {
      setError(errorMessage(e, "Connection error. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    setSuggesting(true);
    setError('');
    try {
      const data = await authService.suggestInterests(formData.experience.trim(), parseInt(formData.age, 10) || null);
      setSuggestions(data.interests || []);
      update({ tech_stack: {} });
    } catch (e) {
      setError(errorMessage(e, "Could not generate suggestions."));
    } finally {
      setSuggesting(false);
    }
  };

  const goToInterests = () => {
    const age = parseInt(formData.age, 10);
    if (!formData.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (isNaN(age) || age < 10 || age > 100 || !formData.gender) {
      setError("Valid age (10-100) and gender are required.");
      return;
    }
    if (formData.experience.trim().length < 10) {
      setError("Tell us a bit about your experience (10+ characters).");
      return;
    }
    setError('');
    setStep(3);
    if (suggestions.length === 0) fetchSuggestions();
  };

  const cycleLevel = ({ name, level }) => {
    setFormData((prev) => {
      const stack = { ...prev.tech_stack };
      const current = stack[name];
      if (!current) stack[name] = LEVELS.includes(level) ? level : 'Beginner';
      else if (current === 'Beginner') stack[name] = 'Intermediate';
      else if (current === 'Intermediate') stack[name] = 'Pro';
      else delete stack[name];
      return { ...prev, tech_stack: stack };
    });
  };

  const handleSignup = async () => {
    if (Object.keys(formData.tech_stack).length === 0) {
      setError("Select at least one interest.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.signup({
        full_name: formData.full_name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        age: formData.age,
        gender: formData.gender,
        bio: formData.bio.trim(),
        experience: formData.experience.trim(),
        photo: formData.photo,
        tech_stack: formData.tech_stack,
      });
      navigation.navigate('Login');
    } catch (err) {
      setError(errorMessage(err, "Signup failed. Check your connection."));
    } finally {
      setLoading(false);
    }
  };

  const ErrorBox = () => error ? (
    <View className="bg-danger-subtle border-2 border-danger p-4 mb-6">
      <Text className="text-danger font-black text-compact uppercase text-center">{error}</Text>
    </View>
  ) : null;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-card"
    >
      <View className="flex-row h-2 bg-muted mt-12 mx-8 border border-primary">
        {[1, 2, 3].map((s) => (
          <View 
            key={s} 
            className={`flex-1 ${step >= s ? 'bg-primary' : 'bg-transparent'} ${s < 3 ? 'border-r border-primary' : ''}`} 
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} className="px-8 pt-8" keyboardShouldPersistTaps="handled">

        {/* STEP 1: CREDENTIALS */}
        {step === 1 && (
          <View key="step1">
            <Text className="text-5xl font-black uppercase italic tracking-tighter text-foreground leading-heading">
              IDENTITY{'\n'}<Text className="text-primary">INIT</Text>
            </Text>
            <Text className="text-compact font-bold text-subtle uppercase tracking-widest mt-4">Phase_01: Credential_Setup</Text>

            <View className="mt-10">
              <CustomInput 
                label="EMAIL ADDRESS"
                icon={<Mail size={18} className="text-subtle" />} 
                placeholder="email@example.com" 
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(val) => update({ email: val })}
                value={formData.email}
              />
              <CustomInput 
                label="PASSWORD"
                icon={<Lock size={18} className="text-subtle" />} 
                placeholder="Min. 8 characters" 
                secureTextEntry
                autoCapitalize="none"
                onChangeText={(val) => update({ password: val })}
                value={formData.password}
              />
              <CustomInput 
                label="CONFIRM PASSWORD"
                icon={<Lock size={18} className="text-subtle" />} 
                placeholder="Re-enter password" 
                secureTextEntry
                autoCapitalize="none"
                onChangeText={(val) => update({ confirmPassword: val })}
                value={formData.confirmPassword}
              />
            </View>

            <ErrorBox />

            <TouchableOpacity 
              onPress={goToDetails}
              disabled={loading}
              className="bg-primary h-16 mt-2 flex-row items-center justify-center border-b-8 border-primary"
            >
              {loading ? (
                <ActivityIndicator color={colors['primary-foreground']} />
              ) : (
                <>
                  <Text className="text-primary-foreground font-black uppercase tracking-widest mr-2">Next_Phase</Text>
                  <ChevronRight size={18} className="text-primary-foreground" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              className="mt-8 py-4 border-2 border-primary"
            >
              <Text className="text-foreground font-black uppercase text-center text-compact tracking-widest">
                Return to <Text className="text-primary">Login_Node</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: PERSONAL DETAILS */}
        {step === 2 && (
          <View key="step2">
            <Text className="text-5xl font-black uppercase italic tracking-tighter text-foreground leading-heading">
              PROFILE{'\n'}<Text className="text-primary">DATA</Text>
            </Text>
            <Text className="text-compact font-bold text-subtle uppercase tracking-widest mt-4">Phase_02: Personal_Details</Text>

            <View className="mt-10">
              <View className="items-center mb-8">
                <TouchableOpacity onPress={pickPhoto} className="w-24 h-24 border-2 border-primary bg-card items-center justify-center overflow-hidden">
                  {formData.photo ? (
                    <Image source={{ uri: formData.photo.uri }} className="w-full h-full" />
                  ) : (
                    <Camera size={28} className="text-subtle" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={pickPhoto} className="bg-primary px-4 py-2 mt-3">
                  <Text className="text-primary-foreground font-black uppercase text-compact tracking-widest">Choose Profile Pic</Text>
                </TouchableOpacity>
                <Text className="text-caption text-subtle font-bold mt-2">PNG, JPG OR JPEG</Text>
              </View>
              <CustomInput 
                label="FULL NAME"
                icon={<User size={18} className="text-subtle" />} 
                placeholder="Enter your name" 
                onChangeText={(val) => update({ full_name: val })}
                value={formData.full_name}
              />
              <CustomInput 
                label="AGE"
                icon={<User size={18} className="text-subtle" />} 
                placeholder="10 - 100" 
                keyboardType="number-pad"
                onChangeText={(val) => update({ age: val })}
                value={formData.age}
              />
              <Text className="text-caption font-black text-subtle uppercase tracking-widest mb-2 ml-1">GENDER</Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {GENDERS.map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => update({ gender: g })}
                    className={`px-4 py-3 border-2 border-primary ${formData.gender === g ? 'bg-primary' : 'bg-card'}`}
                  >
                    <Text className={`text-compact font-black uppercase ${formData.gender === g ? 'text-primary-foreground' : 'text-foreground'}`}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <CustomInput 
                label="SHORT BIOGRAPHY / OBJECTIVES (OPTIONAL)"
                icon={<FileText size={18} className="text-subtle" />} 
                placeholder="What are you aiming for?" 
                onChangeText={(val) => update({ bio: val })}
                value={formData.bio}
              />
              <CustomInput 
                label="YOUR EXPERIENCE"
                icon={<Briefcase size={18} className="text-subtle" />} 
                placeholder="e.g. 2 years of Excel analytics, learning Python..." 
                multiline
                textAlignVertical="top"
                className="bg-card border-2 border-primary h-28 pt-4 pl-12 pr-4 text-foreground shadow-offset-primary"
                onChangeText={(val) => update({ experience: val })}
                value={formData.experience}
              />
            </View>

            <ErrorBox />

            <View className="flex-row gap-4">
              <TouchableOpacity 
                onPress={() => { setError(''); setStep(1); }} 
                className="flex-1 h-16 border-2 border-primary items-center justify-center bg-card"
              >
                <ChevronLeft size={20} className="text-primary" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={goToInterests} 
                className="flex-three h-16 bg-primary items-center justify-center border-b-8 border-primary"
              >
                <Text className="text-primary-foreground font-black uppercase tracking-widest">Next_Phase</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 3: AI-SUGGESTED INTERESTS */}
        {step === 3 && (
          <View key="step3">
            <Text className="text-5xl font-black uppercase italic tracking-tighter text-foreground leading-heading">
              SKILL{'\n'}<Text className="text-primary">MATRIX</Text>
            </Text>
            <Text className="text-compact font-bold text-subtle uppercase tracking-widest mt-4">
              Phase_03: AI_Suggested_Interests (tap to select / change level)
            </Text>

            {suggesting ? (
              <View className="py-12 items-center">
                <Sparkles size={24} className="text-primary" />
                <Text className="text-compact font-black uppercase tracking-widest text-subtle mt-3">Generating suggestions...</Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-2 mt-8 mb-6">
                {suggestions.map((s) => {
                  const lvl = formData.tech_stack[s.name];
                  return (
                    <TouchableOpacity 
                      key={s.name}
                      onPress={() => cycleLevel(s)}
                      className={`px-4 py-3 border-2 ${lvl ? 'bg-primary border-primary' : 'bg-card border-border'}`}
                    >
                      {/* FIXED: unselected uses text-foreground for sharp contrast on white card */}
                      <Text className={`text-compact font-black uppercase ${lvl ? 'text-primary-foreground' : 'text-foreground'}`}>
                        {s.name}{lvl ? ` · ${lvl}` : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <TouchableOpacity onPress={fetchSuggestions} disabled={suggesting || loading} className="mb-8 self-start">
              <Text className="text-primary font-black uppercase text-compact tracking-widest">Regenerate_Suggestions</Text>
            </TouchableOpacity>

            <ErrorBox />

            <View className="flex-row gap-4">
              <TouchableOpacity 
                onPress={() => { setError(''); setStep(2); }} 
                disabled={loading}
                className="flex-1 h-16 border-2 border-primary items-center justify-center bg-card"
              >
                <ChevronLeft size={20} className="text-primary" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSignup}
                disabled={loading || suggesting}
                className="flex-three h-16 bg-primary items-center justify-center border-b-8 border-primary"
              >
                {loading ? (
                  <ActivityIndicator color={colors['primary-foreground']} />
                ) : (
                  <Text className="text-primary-foreground font-black uppercase tracking-widest">Complete_Setup</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const CustomInput = ({ label, icon, ...props }) => (
  <View className="mb-6">
    <Text className="text-caption font-black text-subtle uppercase tracking-widest mb-2 ml-1">{label}</Text>
    <View className="relative">
      <View className="absolute left-4 top-4 z-10">{icon}</View>
      <TextInput
        className="bg-card border-2 border-primary h-14 pl-12 pr-4 text-sm font-bold text-foreground shadow-offset-primary"
        placeholderClassName="text-line-strong"
        {...props}
      />
    </View>
  </View>
);