import React from 'react';
import { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Trophy, RotateCcw, BookOpen, Zap, Target, ShieldCheck } from "lucide-react-native";
import quizService from '../../api/quizService';
import { errorMessage } from '../../api/axios';

export default function TestResult({ navigation, route }) {
  const syncScore = route.params?.score ?? 0;
  const xpGained = route.params?.xp ?? 0;
  const hits = route.params?.hits ?? "0/0";
  const [reinitializing, setReinitializing] = useState(false);
  const handleReinitialize = async () => {
    const { courseId, depth, questions } = route.params || {};
    if (!courseId || !questions?.length || reinitializing) {
      navigation.navigate('MainTabs', { screen: 'TESTS' });
      return;
    }

    setReinitializing(true);
    try {
      const data = await quizService.generate({
        node: courseId,
        depth: depth || 'Intermediate',
        units: questions.length,
        scope: 'Node Only',
      });
      navigation.replace('QuizSession', { testData: { ...data, depth: depth || 'Intermediate' } });
    } catch (error) {
      Alert.alert('Could not restart assessment', errorMessage(error));
    } finally {
      setReinitializing(false);
    }
  };
  
  const isHighSync = syncScore >= 75;

  return (
    <SafeAreaView className="flex-1 bg-card">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-10 py-16">
        
        <View className="items-center justify-center flex-1">
          {/* 1. THE ARCHITECTURAL BADGE */}
          {/* FIXED: Trophy uses text-highlight (gold) or text-primary-foreground on dark container */}
          <View 
            className="bg-primary p-10 mb-12 border-b-4 border-r-4 border-primary shadow-2xl"
          >
            <Trophy 
              size={80} 
              strokeWidth={2.5} 
              className={isHighSync ? "text-highlight" : "text-primary-foreground"} 
            />
          </View>

          {/* 2. THE DATA READOUT */}
          <View className="items-center mb-16">
            {/* FIXED: ShieldCheck icon text-primary -> text-primary-foreground */}
            <View className="flex-row items-center justify-center bg-primary px-3 py-1 mb-4 border-l-4 border-primary">
              <ShieldCheck size={12} strokeWidth={3} className="text-primary-foreground" />
              <Text className="ml-2 text-compact font-black text-primary-foreground uppercase tracking-wide-em">Neural_Sync_Stable</Text>
            </View>
            
            <Text className="text-8xl font-black uppercase italic tracking-tighter text-foreground leading-display">
              {syncScore}%
            </Text>
            <Text className="text-4xl font-black uppercase italic tracking-tighter text-border leading-display mt-2">
              SYNC_LVL
            </Text>
            
            <View className="h-2 bg-primary w-24 mt-8" />
          </View>

          {/* 3. NEURAL STATS GRID */}
          <View className="flex-row w-full gap-4 mb-16">
            <View className="flex-1 bg-surface p-6 border-l-8 border-primary shadow-sm">
              <View className="flex-row items-center mb-2">
                <Zap size={14} fill="currentColor" className="text-success" />
                <Text className="ml-2 text-compact font-black text-subtle uppercase tracking-widest">Potential</Text>
              </View>
              <Text className="text-2xl font-black text-foreground italic">+{xpGained}_XP</Text>
            </View>
            
            <View className="flex-1 bg-surface p-6 border-l-8 border-primary shadow-sm">
              <View className="flex-row items-center mb-2">
                <Target size={14} className="text-subtle" />
                <Text className="ml-2 text-compact font-black text-subtle uppercase tracking-widest">Precision</Text>
              </View>
              <Text className="text-2xl font-black text-foreground italic">{hits}_HITS</Text>
            </View>
          </View>

          {/* 4. TACTICAL ACTIONS */}
          <View className="w-full space-y-6">
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={() => navigation.navigate('MainTabs', { screen: 'VAULT' })}
              className="bg-primary h-20 items-center justify-center flex-row border-b-8 border-primary shadow-xl"
            >
              <BookOpen size={20} className="text-primary-foreground" />
              <Text className="ml-4 text-primary-foreground font-black uppercase tracking-editorial italic text-sm">Return_to_Vault</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleReinitialize}
              disabled={reinitializing}
              activeOpacity={0.7}
              className="border-4 border-primary h-16 items-center justify-center flex-row shadow-offset-primary bg-card opacity-100"
            >
              {reinitializing ? (
                <ActivityIndicator />
              ) : (
                <>
                  <RotateCcw size={18} className="text-primary" />
                  <Text className="ml-3 text-foreground font-black uppercase tracking-editorial italic text-xs">Re-initialize_Terminal</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* DECORATIVE TERMINAL FOOTER */}
          <View className="mt-16 opacity-30">
             <Text className="text-caption font-bold text-subtle uppercase tracking-expanded-em text-center">
               System_ID: {route.params?.courseId || "SKILL-AI-2026"} // NODE: DURG_CG_IN
             </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}