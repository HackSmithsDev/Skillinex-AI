import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Trophy, RotateCcw, BookOpen, Zap, Target, ShieldCheck } from "lucide-react-native";

export default function TestResult({ navigation, route }) {
  // Pulling score from params or defaulting to 80
  const syncScore = route.params?.score ?? 0;
  const xpGained = route.params?.xp ?? 0;
  const hits = route.params?.hits ?? "0/0";
  
  const isHighSync = syncScore >= 75;

  return (
    <SafeAreaView className="flex-1 bg-card">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-10 py-16">
        
        <View className="items-center justify-center flex-1">
          {/* 1. THE ARCHITECTURAL BADGE */}
          <View 
            className={`${isHighSync ? 'bg-primary' : 'bg-primary'} p-10 mb-12 border-b-[16px] border-r-[16px] border-primary shadow-2xl`}
          >
            <Trophy size={80} strokeWidth={2.5} className={isHighSync ? "text-primary" : "text-primary-foreground"} />
          </View>

          {/* 2. THE DATA READOUT */}
          <View className="items-center mb-16">
            <View className="flex-row items-center justify-center bg-primary px-3 py-1 mb-4 border-l-4 border-primary">
              <ShieldCheck size={12} strokeWidth={3} className="text-primary" />
              <Text className="ml-2 text-[10px] font-black text-primary-foreground uppercase tracking-[0.3em]">Neural_Sync_Stable</Text>
            </View>
            
            <Text className="text-8xl font-black uppercase italic tracking-tighter text-foreground leading-[0.8]">
              {syncScore}%
            </Text>
            <Text className="text-4xl font-black uppercase italic tracking-tighter text-border leading-[0.8] mt-2">
              SYNC_LVL
            </Text>
            
            <View className="h-2 bg-primary w-24 mt-8" />
          </View>

          {/* 3. NEURAL STATS GRID */}
          <View className="flex-row w-full gap-4 mb-16">
            <View className="flex-1 bg-surface p-6 border-l-8 border-primary shadow-sm">
              <View className="flex-row items-center mb-2">
                <Zap size={14} fill="currentColor" className="text-success" />
                <Text className="ml-2 text-[10px] font-black text-subtle uppercase tracking-widest">Potential</Text>
              </View>
              <Text className="text-2xl font-black text-foreground italic">+{xpGained}_XP</Text>
            </View>
            
            <View className="flex-1 bg-surface p-6 border-l-8 border-primary shadow-sm">
              <View className="flex-row items-center mb-2">
                <Target size={14} className="text-subtle" />
                <Text className="ml-2 text-[10px] font-black text-subtle uppercase tracking-widest">Precision</Text>
              </View>
              <Text className="text-2xl font-black text-foreground italic">{hits}_HITS</Text>
            </View>
          </View>

          {/* 4. TACTICAL ACTIONS */}
          <View className="w-full space-y-6">
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Tutorials')} // Navigates back to curriculum
              className="bg-primary h-20 items-center justify-center flex-row border-b-8 border-primary shadow-xl"
            >
              <BookOpen size={20} className="text-primary-foreground" />
              <Text className="ml-4 text-primary-foreground font-black uppercase tracking-[0.2em] italic text-sm">Return_to_Matrix</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('UserHome')}
              activeOpacity={0.7}
              className="border-4 border-primary h-16 items-center justify-center flex-row shadow-[4px_4px_0px_0px_rgb(var(--primary))]"
            >
              <RotateCcw size={18} className="text-primary" />
              <Text className="ml-3 text-foreground font-black uppercase tracking-[0.2em] italic text-xs">Re-initialize_Terminal</Text>
            </TouchableOpacity>
          </View>

          {/* DECORATIVE TERMINAL FOOTER */}
          <View className="mt-16 opacity-30">
             <Text className="text-[8px] font-bold text-subtle uppercase tracking-[0.4em] text-center">
               System_ID: {route.params?.courseId || "SKILL-AI-2026"} // NODE: DURG_CG_IN
             </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}