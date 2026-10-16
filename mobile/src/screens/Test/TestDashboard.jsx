import React, { useState, useContext, useEffect, useCallback } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  Dimensions, StyleSheet, Platform, ActivityIndicator, Alert 
} from 'react-native';
import { BarChart3, Activity, Rocket, Zap } from "lucide-react-native";
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import useThemeColors from '../../theme/useThemeColors';
import quizService from '../../api/quizService';
import tutorialService from '../../api/tutorialService';
import { errorMessage } from '../../api/axios';

const { width } = Dimensions.get('window');

export default function TestTerminal({ navigation }) {
  const { user } = useContext(AuthContext);
  const colors = useThemeColors();
  const [level, setLevel] = useState("Intermediate");
  const [units, setUnits] = useState(15);
  const [courses, setCourses] = useState([]);
  const [targetNode, setTargetNode] = useState('');
  const [history, setHistory] = useState([]);
  const [initializing, setInitializing] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    (async () => {
      try {
        const vault = await tutorialService.getLearningVault();
        const ready = vault.filter((c) => c.is_ready);
        const past = await quizService.history();
        if (!active) return;
        setCourses(ready);
        setTargetNode((prev) => prev || ready[0]?.title || '');
        setHistory(past);
      } catch (e) {
        console.log('Terminal sync failed', e?.message);
      }
    })();
    return () => { active = false; };
  }, []));

  const handleInitialize = async () => {
    if (!targetNode || initializing) return;
    setInitializing(true);
    try {
      const data = await quizService.generate({ node: targetNode, depth: level, units, scope: 'Node Only' });
      navigation.navigate('QuizSession', { testData: { ...data, depth: level } });
    } catch (e) {
      Alert.alert('Initialization failed', errorMessage(e));
    } finally {
      setInitializing(false);
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-card" 
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. BRUTALIST HEADER */}
      <View className="px-8 pt-20 pb-10">
        <View className="flex-row items-center mb-4">
          <View className="h-2 w-2 bg-primary mr-3 animate-pulse" />
          <Text className="text-[10px] font-black uppercase tracking-[4px] text-subtle">
            Skillinex_Systems // {user?.full_name?.split(' ')[0] || 'Node_Active'}
          </Text>
        </View>
        <Text className="text-7xl font-black tracking-tighter leading-[0.8] uppercase italic text-foreground">
          SKILL{'\n'}
          <Text className="text-border">TERMINAL</Text>
        </Text>
      </View>

      {/* 2. ANALYTICS PREVIEW */}
      <View className="px-8 mb-12">
        <View className="flex-row items-center mb-6">
          <BarChart3 size={16} strokeWidth={3} className="text-primary" />
          <Text className="ml-3 text-[10px] font-black uppercase tracking-[3px] text-foreground">Neural_Growth</Text>
        </View>
        <View className="h-40 bg-surface border-2 border-primary items-center justify-center shadow-[4px_4px_0px_0px_rgb(var(--primary))]">
          <Text className="text-[10px] font-black text-line-strong uppercase tracking-[6px]">Stream_Idle</Text>
        </View>
      </View>

      {/* 3. SYNC TABLE */}
      <View className="px-8 mb-12">
        <View className="flex-row items-center border-b-4 border-primary pb-3 mb-6">
          <Activity size={16} strokeWidth={3} className="text-primary" />
          <Text className="ml-3 text-[10px] font-black uppercase tracking-[3px] text-foreground">Recent_Syncs</Text>
        </View>
        
        {history.length === 0 && (
          <Text className="text-[10px] font-black uppercase tracking-[3px] text-subtle py-5">No_Syncs_Yet</Text>
        )}
        {history.slice(0, 5).map((h) => (
          <View key={h.id} className="flex-row justify-between items-center py-5 border-b-2 border-muted">
            <View className="flex-1 pr-4">
              <Text className="text-lg font-black uppercase italic tracking-tighter text-foreground">{h.node_name}</Text>
              <Text className="text-[9px] text-subtle font-black uppercase tracking-[2px] italic">
                {new Date(h.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text className="text-4xl font-black italic tracking-tighter text-foreground">{h.score}%</Text>
          </View>
        ))}
      </View>

      {/* 4. THE CONTROL MODULE (Dark Container) */}
      <View className="mx-6 bg-primary p-8 border-4 border-primary shadow-[8px_8px_0px_0px_rgb(var(--success))]">
        <View className="mb-10">
          <View className="flex-row items-center mb-2">
            <Zap size={12} fill="currentColor" className="text-highlight" />
            <Text className="ml-2 text-[8px] font-black uppercase tracking-[4px] text-highlight">Initialization</Text>
          </View>
          <Text className="text-4xl font-black tracking-tighter uppercase italic text-primary-foreground leading-9">
            Deploy{'\n'}Assessment
          </Text>
        </View>

        {/* TARGET NODE */}
        <View className="mb-10">
          <Text className="text-[8px] font-black uppercase tracking-[3px] text-primary-foreground/40 mb-3 px-1">Target_Node</Text>
          {courses.length === 0 && (
            <Text className="text-[9px] font-black uppercase text-primary-foreground/40">No_Ready_Courses</Text>
          )}
          {courses.map((c) => (
            <TouchableOpacity
              key={c.id}
              activeOpacity={1}
              onPress={() => setTargetNode(c.title)}
              className={`py-3 px-4 mb-1 ${targetNode === c.title ? 'bg-card' : 'bg-card/10'}`}
            >
              <Text className={`text-[10px] font-black uppercase ${targetNode === c.title ? 'text-foreground' : 'text-primary-foreground/60'}`}>{c.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DEPTH SELECTOR */}
        <View className="mb-10">
          <Text className="text-[8px] font-black uppercase tracking-[3px] text-primary-foreground/40 mb-3 px-1">Proficiency_Depth</Text>
          <View className="flex-row bg-card/10 p-1 border border-card/20">
            {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
              <TouchableOpacity 
                key={lvl}
                onPress={() => setLevel(lvl)}
                activeOpacity={1}
                /* FIXED: Active tab uses bg-card with text-foreground for high contrast */
                className={`flex-1 py-4 items-center ${level === lvl ? 'bg-card' : 'bg-transparent'}`}
              >
                <Text className={`text-[9px] font-black uppercase ${level === lvl ? 'text-foreground' : 'text-primary-foreground/60'}`}>
                  {lvl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* UNITS SLIDER COUNTER */}
        <View className="flex-row gap-6 mb-10">
          <View className="flex-1 border-l-2 border-highlight/50 pl-4">
            <Text className="text-[8px] font-black uppercase text-primary-foreground/40 italic mb-1">Units</Text>
            <View className="flex-row items-baseline">
              <Text className="text-5xl font-black text-primary-foreground italic tracking-tighter">{units}</Text>
              <Text className="ml-2 text-[8px] font-black text-primary-foreground/40 uppercase tracking-[1px]">Queries</Text>
            </View>
          </View>
          <View className="flex-1 border-l-2 border-card/20 pl-4">
            <Text className="text-[8px] font-black uppercase text-primary-foreground/40 italic mb-1">Sync</Text>
            <Text className="text-[10px] font-black text-success uppercase tracking-[2px]">Node_Active</Text>
          </View>
        </View>

        {/* THE ROCKET LAUNCHER */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={handleInitialize}
          disabled={initializing || !targetNode}
          className="bg-card h-20 items-center justify-center flex-row border-b-8 border-primary-foreground active:translate-y-1 active:border-b-4 transition-all"
        >
          <Text className="text-foreground font-black uppercase tracking-[5px] text-xs mr-4">Initialize</Text>
          {initializing ? <ActivityIndicator color={colors.primary} /> : <Rocket size={20} className="text-primary" />}
        </TouchableOpacity>

        {/* FIXED: Corner dots bg-primary -> bg-primary-foreground/40 */}
        <View className="mt-8 flex-row justify-between items-end opacity-60">
          <View>
            <Text className="text-[8px] font-black uppercase text-primary-foreground tracking-[2px]">SKILLINEX_ID: {user?.id?.slice(0,8) || 'SKILL-AI'}</Text>
            <Text className="text-[7px] font-black uppercase text-primary-foreground tracking-[1px] mt-1">Durg_Terminal_V2.0</Text>
          </View>
          <View className="flex-row gap-2">
            <View className="h-1.5 w-1.5 rounded-full bg-primary-foreground/40" />
            <View className="h-1.5 w-1.5 rounded-full bg-primary-foreground/40" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}