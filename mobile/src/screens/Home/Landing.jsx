import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Rocket, Cpu, Code2, Share2, Zap, Sparkles, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function Landing() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <StatusBar barStyle="dark-content" />
      
      {/* Background Decorative Element */}
      <View className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full" />

      <View className="flex-1 px-8 py-10 justify-between">
        
        {/* 1. TOP BRANDING SECTION */}
        <View className="mt-6">
          <View className="flex-row items-center mb-4">
            <View className="h-2 w-12 bg-primary mr-2" />
            <Text className="text-foreground font-black text-[10px] uppercase tracking-[4px]">
              V2.4 Protocol
            </Text>
          </View>

          <Text className="text-6xl font-black text-foreground uppercase italic leading-[0.85] tracking-tighter">
            Technical{'\n'}
            <Text className="text-primary">Mastery.</Text>
          </Text>

          <View className="mt-6 border-l-4 border-primary pl-4">
            <Text className="text-muted-foreground font-bold uppercase text-[11px] tracking-widest leading-4">
              AI-Driven Curriculums.{'\n'}
              <Text className="text-foreground">One prompt. Total dominance.</Text>
            </Text>
          </View>
        </View>

        {/* 2. CENTER PIECE (Visual Anchor) */}
        <View className="items-center justify-center">
          {/* Layered Shadow Effect */}
          <View className="relative">
            <View className="absolute top-2 left-2 h-36 w-36 bg-border border-2 border-primary" />
            <View className="h-36 w-36 items-center justify-center border-4 border-primary bg-card">
               <Sparkles size={56} strokeWidth={2.5} className="text-primary" />
               <View className="absolute -bottom-3 -right-3 bg-primary px-2 py-1">
                  <Text className="text-primary-foreground text-[8px] font-black uppercase">Active_Engine</Text>
               </View>
            </View>
          </View>
        </View>

        {/* 3. ACTION & TECH MATRIX */}
        <View className="w-full">
          {/* CTA Buttons */}
          <View className="mb-10">
            <TouchableOpacity 
              onPress={() => navigation.navigate('Signup')}
              activeOpacity={0.9}
              className="h-20 flex-row items-center justify-between px-8 border-4 border-primary bg-primary mb-6 shadow-[8px_8px_0px_0px_rgb(var(--primary))]"
            >
              <View className="flex-row items-center">
                <Rocket size={24} strokeWidth={2.5} className="text-primary" />
                <Text className="ml-4 text-xl font-black uppercase tracking-tighter italic text-foreground">Initialize</Text>
              </View>
              <ChevronRight size={24} strokeWidth={3} className="text-primary" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
              className="h-16 flex-row items-center justify-center border-2 border-primary bg-transparent"
            >
              <Text className="text-sm font-black uppercase tracking-[2px] text-foreground">Access Dashboard</Text>
            </TouchableOpacity>
          </View>

          {/* Tech Matrix Icons */}
          <View className="flex-row justify-between items-center opacity-40 px-4">
            <Code2 size={20} className="text-primary" />
            <View className="h-1 w-1 bg-primary rounded-full" />
            <Cpu size={20} className="text-primary" />
            <View className="h-1 w-1 bg-primary rounded-full" />
            <Share2 size={20} className="text-primary" />
            <View className="h-1 w-1 bg-primary rounded-full" />
            <Zap size={20} className="text-primary" />
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}