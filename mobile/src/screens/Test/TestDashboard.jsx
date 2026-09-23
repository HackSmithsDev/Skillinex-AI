import React, { useState, useContext } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  Dimensions, StyleSheet, Platform 
} from 'react-native';
import { BarChart3, Activity, Rocket, Zap } from "lucide-react-native";
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function TestTerminal() {
  const { user } = useContext(AuthContext);
  const [level, setLevel] = useState("Intermediate");
  const [units, setUnits] = useState(15);

  return (
    <ScrollView 
      className="flex-1 bg-white" 
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. BRUTALIST HEADER */}
      <View className="px-8 pt-20 pb-10">
        <View className="flex-row items-center mb-4">
          {/* Static indicator to replace the crashing animation prop */}
          <View className="h-2 w-2 bg-slate-900 mr-3 animate-pulse" />
          <Text className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">
            Skillinex_Systems // {user?.full_name?.split(' ')[0] || 'Node_Active'}
          </Text>
        </View>
        <Text className="text-7xl font-black tracking-tighter leading-[0.8] uppercase italic text-slate-900">
          SKILL{'\n'}
          <Text className="text-slate-200">TERMINAL</Text>
        </Text>
      </View>

      {/* 2. ANALYTICS PREVIEW */}
      <View className="px-8 mb-12">
        <View className="flex-row items-center mb-6">
          <BarChart3 size={16} color="#0F172A" strokeWidth={3} />
          <Text className="ml-3 text-[10px] font-black uppercase tracking-[3px] text-slate-900">Neural_Growth</Text>
        </View>
        <View className="h-40 bg-slate-50 border-2 border-slate-900 items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <Text className="text-[10px] font-black text-slate-300 uppercase tracking-[6px]">Stream_Idle</Text>
        </View>
      </View>

      {/* 3. SYNC TABLE */}
      <View className="px-8 mb-12">
        <View className="flex-row items-center border-b-4 border-slate-900 pb-3 mb-6">
          <Activity size={16} color="#0F172A" strokeWidth={3} />
          <Text className="ml-3 text-[10px] font-black uppercase tracking-[3px] text-slate-900">Recent_Syncs</Text>
        </View>
        
        <View className="flex-row justify-between items-center py-5 border-b-2 border-slate-100">
          <View>
            <Text className="text-lg font-black uppercase italic tracking-tighter text-slate-900">AI Deployment</Text>
            <Text className="text-[9px] text-slate-400 font-black uppercase tracking-[2px] italic">05.04.2026</Text>
          </View>
          <Text className="text-4xl font-black italic tracking-tighter text-slate-900">85%</Text>
        </View>
      </View>

      {/* 4. THE CONTROL MODULE (Dark Mode) */}
      <View className="mx-6 bg-slate-900 p-8 border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]">
        <View className="mb-10">
          <View className="flex-row items-center mb-2">
            <Zap size={12} color="#FACC15" fill="#FACC15" />
            <Text className="ml-2 text-[8px] font-black uppercase tracking-[4px] text-yellow-400">Initialization</Text>
          </View>
          <Text className="text-4xl font-black tracking-tighter uppercase italic text-white leading-9">
            Deploy{'\n'}Assessment
          </Text>
        </View>

        {/* DEPTH SELECTOR */}
        <View className="mb-10">
          <Text className="text-[8px] font-black uppercase tracking-[3px] text-white/30 mb-3 px-1">Proficiency_Depth</Text>
          <View className="flex-row bg-white/5 p-1 border border-white/10">
            {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
              <TouchableOpacity 
                key={lvl}
                onPress={() => setLevel(lvl)}
                activeOpacity={1}
                className={`flex-1 py-4 items-center ${level === lvl ? 'bg-primary' : 'bg-transparent'}`}
              >
                <Text className={`text-[9px] font-black uppercase ${level === lvl ? 'text-slate-900' : 'text-white/40'}`}>
                  {lvl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* UNITS SLIDER COUNTER */}
        <View className="flex-row gap-6 mb-10">
          <View className="flex-1 border-l-2 border-yellow-400/50 pl-4">
            <Text className="text-[8px] font-black uppercase text-white/30 italic mb-1">Units</Text>
            <View className="flex-row items-baseline">
              <Text className="text-5xl font-black text-white italic tracking-tighter">{units}</Text>
              <Text className="ml-2 text-[8px] font-black text-white/20 uppercase tracking-[1px]">Queries</Text>
            </View>
          </View>
          <View className="flex-1 border-l-2 border-white/10 pl-4">
            <Text className="text-[8px] font-black uppercase text-white/30 italic mb-1">Sync</Text>
            <Text className="text-[10px] font-black text-emerald-400 uppercase tracking-[2px]">Node_Active</Text>
          </View>
        </View>

        {/* THE ROCKET LAUNCHER */}
        <TouchableOpacity 
          activeOpacity={0.9}
          className="bg-white h-20 items-center justify-center flex-row border-b-8 border-primary active:translate-y-1 active:border-b-4 transition-all"
        >
          <Text className="text-slate-900 font-black uppercase tracking-[5px] text-xs mr-4">Initialize</Text>
          <Rocket size={20} color="#0F172A" />
        </TouchableOpacity>

        <View className="mt-8 flex-row justify-between items-end opacity-40">
          <View>
            <Text className="text-[8px] font-black uppercase text-white tracking-[2px]">SKILLINEX_ID: {user?.id?.slice(0,8) || 'SKILL-AI'}</Text>
            <Text className="text-[7px] font-black uppercase text-white tracking-[1px] mt-1">Durg_Terminal_V2.0</Text>
          </View>
          <View className="flex-row gap-2">
            <View className="h-1.5 w-1.5 rounded-full bg-primary" />
            <View className="h-1.5 w-1.5 rounded-full bg-primary" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}