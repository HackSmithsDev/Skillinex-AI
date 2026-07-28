import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Trophy, Flame, Target, Code2, Brain, Zap, Activity, ChevronRight } from "lucide-react-native";
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function Achievements() {
  const { user } = useContext(AuthContext);

  const skills = [
    { name: "Artificial Intelligence", level: 12, xp: 85, icon: <Brain size={16} color="#FFF" /> },
    { name: "Data Structures", level: 8, xp: 40, icon: <Code2 size={16} color="#FFF" /> },
  ];

  const badges = [
    { id: 1, title: "Quick_Learner", desc: "5_Chapters/Day", earned: true },
    { id: 2, title: "Quiz_Master", desc: "100%_Accuracy", earned: true },
    { id: 3, title: "AI_Architect", desc: "ML_Track_Complete", earned: false },
  ];

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      
      {/* 1. SYSTEM HEADER */}
      <View className="px-6 pt-16 pb-8 border-b-4 border-slate-900">
        <View className="flex-row items-center mb-3">
          <View className="h-2 w-2 bg-primary mr-2" />
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">
            Achievement_Node_Active
          </Text>
        </View>
        
        {/* Main Title */}
        <Text className="text-7xl font-black uppercase italic tracking-tighter leading-[0.75] text-slate-900">
          SKILL{'\n'}
          <Text className="text-slate-200">_LOG</Text>
        </Text>

        <View className="mt-6 flex-row justify-between items-center">
          <Text className="text-[8px] font-bold text-slate-400 uppercase tracking-[1px]">
            ID: {user?.id?.substring(0, 12) || "GUEST_USER_01"} // SYNC: REALTIME
          </Text>
          <View className="h-[1px] flex-1 bg-slate-100 ml-4" />
        </View>
      </View>

      {/* 2. REAL-TIME HUD (Horizontal Stats) */}
      <View className="flex-row border-b-4 border-slate-900 bg-slate-50">
        <StatNode label="STREAK" value="14D" icon={<Flame size={20} color="#F97316" />} />
        <StatNode label="SYSTEM_XP" value="12K" icon={<Trophy size={20} color="#EAB308" />} border />
        <StatNode label="RANK" value="#42" icon={<Target size={20} color="#94A3B8" />} border />
      </View>

      {/* 3. PROGRESSION MATRIX (Skills) */}
      <View className="p-6">
        <View className="flex-row items-center mb-8">
          <Activity size={18} color="#0F172A" strokeWidth={3} />
          <Text className="ml-3 text-[10px] font-black uppercase tracking-[4px] text-slate-900">
            Progression_Matrix
          </Text>
        </View>

        {skills.map((skill, i) => (
          <View key={i} className="mb-10">
            <View className="flex-row justify-between items-end mb-3">
              <View className="flex-row items-center">
                <View className="p-2 bg-slate-900 mr-3 border-b-2 border-r-2 border-primary">
                  {skill.icon}
                </View>
                <Text className="text-xs font-black uppercase italic text-slate-900">{skill.name}</Text>
              </View>
              <Text className="text-[10px] font-black text-slate-400">LVL_{skill.level}</Text>
            </View>
            
            {/* Progress Bar Container */}
            <View className="h-5 bg-slate-100 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
              {/* Width is set via standard style prop for stability */}
              <View 
                style={{ width: `${skill.xp}%` }}
                className="h-full bg-slate-900 border-r-2 border-primary"
              />
            </View>
            <Text className="text-[8px] font-black text-slate-300 mt-2 tracking-[2px] uppercase text-right">
              Sync_Progress: {skill.xp}/100_XP
            </Text>
          </View>
        ))}
      </View>

      {/* 4. UNLOCKED NODES (Badges) */}
      <View className="px-6 pb-24">
        <View className="flex-row items-center mb-6">
          <Zap size={18} color="#0F172A" strokeWidth={3} />
          <Text className="ml-3 text-[10px] font-black uppercase tracking-[4px] text-slate-900">
            Unlocked_Nodes
          </Text>
        </View>

        {badges.map((badge) => (
          <View 
            key={badge.id}
            className={`p-5 border-2 mb-4 flex-row items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]
              ${badge.earned ? 'border-slate-900 bg-white' : 'border-slate-100 opacity-30 bg-slate-50'}`}
          >
            <View className="flex-row items-center">
              <View className={`p-2 rounded-full ${badge.earned ? 'bg-yellow-50' : 'bg-transparent'}`}>
                <Trophy size={18} color={badge.earned ? "#EAB308" : "#CBD5E1"} />
              </View>
              <View className="ml-4">
                <Text className="text-[11px] font-black uppercase italic text-slate-900">{badge.title}</Text>
                <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-[1px]">{badge.desc}</Text>
              </View>
            </View>
            {badge.earned && (
              <View className="bg-slate-900 p-1">
                <ChevronRight size={14} color="#FFF" />
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const StatNode = ({ label, value, icon, border }) => (
  <View className={`flex-1 p-6 items-center justify-center ${border ? 'border-l-2 border-slate-900' : ''}`}>
    {icon}
    <Text className="text-[8px] font-black uppercase tracking-[2px] text-slate-400 mt-3">{label}</Text>
    <Text className="text-2xl font-black italic text-slate-900 uppercase tracking-tighter">{value}</Text>
  </View>
);