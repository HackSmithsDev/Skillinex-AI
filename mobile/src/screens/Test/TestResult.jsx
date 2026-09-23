import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Trophy, RotateCcw, BookOpen, Zap, Target, ShieldCheck } from "lucide-react-native";

export default function TestResult({ navigation, route }) {
  // Pulling score from params or defaulting to 80
  const syncScore = route.params?.score || 80;
  const xpGained = route.params?.xp || 150;
  const hits = route.params?.hits || "8/10";
  
  const isHighSync = syncScore >= 75;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-10 py-16">
        
        <View className="items-center justify-center flex-1">
          {/* 1. THE ARCHITECTURAL BADGE */}
          <View 
            className={`${isHighSync ? 'bg-primary' : 'bg-slate-900'} p-10 mb-12 border-b-[16px] border-r-[16px] border-slate-900 shadow-2xl`}
          >
            <Trophy size={80} color={isHighSync ? "#0F172A" : "#FFF"} strokeWidth={2.5} />
          </View>

          {/* 2. THE DATA READOUT */}
          <View className="items-center mb-16">
            <View className="flex-row items-center justify-center bg-slate-900 px-3 py-1 mb-4 border-l-4 border-primary">
              <ShieldCheck size={12} color="#0F172A" strokeWidth={3} />
              <Text className="ml-2 text-[10px] font-black text-white uppercase tracking-[0.3em]">Neural_Sync_Stable</Text>
            </View>
            
            <Text className="text-8xl font-black uppercase italic tracking-tighter text-slate-900 leading-[0.8]">
              {syncScore}%
            </Text>
            <Text className="text-4xl font-black uppercase italic tracking-tighter text-slate-200 leading-[0.8] mt-2">
              SYNC_LVL
            </Text>
            
            <View className="h-2 bg-slate-900 w-24 mt-8" />
          </View>

          {/* 3. NEURAL STATS GRID */}
          <View className="flex-row w-full gap-4 mb-16">
            <View className="flex-1 bg-slate-50 p-6 border-l-8 border-primary shadow-sm">
              <View className="flex-row items-center mb-2">
                <Zap size={14} color="#0F172A" fill="#10B981" />
                <Text className="ml-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Potential</Text>
              </View>
              <Text className="text-2xl font-black text-slate-900 italic">+{xpGained}_XP</Text>
            </View>
            
            <View className="flex-1 bg-slate-50 p-6 border-l-8 border-slate-900 shadow-sm">
              <View className="flex-row items-center mb-2">
                <Target size={14} color="#94A3B8" />
                <Text className="ml-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Precision</Text>
              </View>
              <Text className="text-2xl font-black text-slate-900 italic">{hits}_HITS</Text>
            </View>
          </View>

          {/* 4. TACTICAL ACTIONS */}
          <View className="w-full space-y-6">
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Tutorials')} // Navigates back to curriculum
              className="bg-slate-900 h-20 items-center justify-center flex-row border-b-8 border-primary shadow-xl"
            >
              <BookOpen size={20} color="#FFF" />
              <Text className="ml-4 text-white font-black uppercase tracking-[0.2em] italic text-sm">Return_to_Matrix</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('UserHome')}
              activeOpacity={0.7}
              className="border-4 border-slate-900 h-16 items-center justify-center flex-row shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
            >
              <RotateCcw size={18} color="#0F172A" />
              <Text className="ml-3 text-slate-900 font-black uppercase tracking-[0.2em] italic text-xs">Re-initialize_Terminal</Text>
            </TouchableOpacity>
          </View>

          {/* DECORATIVE TERMINAL FOOTER */}
          <View className="mt-16 opacity-30">
             <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.4em] text-center">
               System_ID: {route.params?.courseId || "SKILL-AI-2026"} // NODE: DURG_CG_IN
             </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}