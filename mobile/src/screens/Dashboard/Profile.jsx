import React, { useState, useContext, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  Image, ActivityIndicator, StyleSheet, Dimensions 
} from 'react-native';
import { 
  Camera, ChevronLeft, ChevronRight, 
  Database, Terminal, ShieldCheck, 
  LogOut, BarChart3, Zap, Settings,
  Cpu, Layers
} from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';

const { width } = Dimensions.get('window');

export default function Profile({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const systemMetrics = [
    { label: "PRACTICE", value: user?.practice_count || "128", color: "#10B981" },
    { label: "TESTS", value: user?.test_count || "14", color: "#FACC15" },
    { label: "RANK", value: "#42", color: "#6366F1" }
  ];

  return (
    <View className="flex-1 bg-white">
      {/* 1. TOP NAVIGATION NAV-BAR */}
      <View className="px-6 pt-14 pb-4 border-b-4 border-slate-900 flex-row justify-between items-center bg-white">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="h-10 w-10 border-2 border-slate-900 items-center justify-center bg-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
        >
          <ChevronLeft size={20} color="#0F172A" strokeWidth={3} />
        </TouchableOpacity>
        
        <Text className="text-[10px] font-black uppercase tracking-[3px] text-slate-900">
          User_Protocol_v4.0
        </Text>

        <TouchableOpacity 
          className="h-10 w-10 border-2 border-slate-900 items-center justify-center bg-slate-900"
        >
          <Settings size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* 2. IDENTITY HEADER */}
        <View className="px-8 pt-10 pb-8 bg-slate-50 border-b-2 border-slate-200">
          <View className="flex-row items-center mb-4">
            <View className="h-2 w-2 bg-primary mr-3 animate-pulse" />
            <Text className="text-[9px] font-black uppercase tracking-[2px] text-slate-400">
              Session_Node // {user?.id?.substring(0,12) || "CORE_SYNC_ACTIVE"}
            </Text>
          </View>

          <Text className="text-7xl font-black uppercase italic tracking-tighter leading-[0.75] text-slate-900">
            {user?.full_name?.split(' ')[0] || "USER"}{'\n'}
            <Text className="text-slate-200">CORE</Text>
          </Text>
        </View>

        {/* 3. HARDWARE CORE (Avatar & XP) */}
        <View className="p-6 flex-row gap-4">
          {/* Avatar with Neo-Brutalist Frame */}
          <View className="relative">
            <View className="w-32 h-32 border-4 border-slate-900 bg-white p-1 shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]">
              <View className="flex-1 bg-slate-100 overflow-hidden items-center justify-center">
                <Image 
                  source={{ uri: user?.photo_url || `https://api.dicebear.com/7.x/bottts-neutral/png?seed=${user?.email}` }}
                  className="w-24 h-24"
                  style={{ tintColor: '#0F172A' }} // Forces a "schematic" look
                />
                {/* Visual Scanline Effect */}
                <View className="absolute top-0 left-0 w-full h-[1px] bg-primary/50" style={{ top: '40%' }} />
              </View>
            </View>
            <TouchableOpacity className="absolute -bottom-1 -right-1 bg-slate-900 p-2 border-2 border-white">
              <Camera size={14} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* XP & Level Module */}
          <View className="flex-1 bg-slate-900 p-5 border-b-8 border-primary shadow-xl justify-between">
            <View className="flex-row justify-between items-center">
               <Text className="text-[8px] font-black text-emerald-400 uppercase tracking-[2px]">Neural_Credits</Text>
               <Zap size={14} color="#FACC15" fill="#FACC15" />
            </View>
            <View>
              <Text className="text-5xl font-black italic text-white leading-none tracking-tighter">
                {user?.xp_points || 0}
              </Text>
              <Text className="text-[10px] font-black text-white/30 uppercase mt-1">Level_14_Architect</Text>
            </View>
          </View>
        </View>

        {/* 4. SYSTEM METRICS GRID */}
        <View className="flex-row px-6 mb-8 gap-3">
          {systemMetrics.map((s, i) => (
            <View key={i} className="flex-1 bg-white border-2 border-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,0.05)]">
              <Text className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-[1px]">{s.label}</Text>
              <Text className="text-xl font-black text-slate-900 italic">{s.value}</Text>
              <View className="h-1 w-full bg-slate-100 mt-2">
                <View className="h-full bg-slate-900" style={{ width: '60%' }} />
              </View>
            </View>
          ))}
        </View>

        {/* 5. TECH STACK NODES */}
        <View className="px-6 mb-10">
          <View className="flex-row items-center mb-5">
            <Cpu size={16} color="#0F172A" strokeWidth={3} />
            <Text className="ml-3 text-[10px] font-black uppercase tracking-[3px] text-slate-900">Integrated_Stack</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {user?.tech_stack?.interests?.map(tech => (
              <View key={tech} className="bg-slate-50 border-2 border-slate-900 px-4 py-2 flex-row items-center">
                <View className="h-1.5 w-1.5 bg-primary mr-2 rounded-full" />
                <Text className="text-[10px] font-black uppercase italic text-slate-900">{tech}</Text>
              </View>
            )) || <Text className="text-[10px] italic text-slate-400 font-bold">Waiting for Stack Sync...</Text>}
            
            <TouchableOpacity className="border-2 border-dashed border-slate-300 px-4 py-2 bg-slate-50/50">
              <Text className="text-[10px] font-black text-slate-400 uppercase">+ Add_Module</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. SYSTEM DIRECTIVES */}
        <View className="px-6 pb-20">
          <View className="flex-row items-center mb-5">
            <Layers size={16} color="#0F172A" strokeWidth={3} />
            <Text className="ml-3 text-[10px] font-black uppercase tracking-[3px] text-slate-900">System_Directives</Text>
          </View>
          
          <View className="border-4 border-slate-900 bg-white overflow-hidden">
            <DirectiveItem label="Practice Records" icon={<Terminal size={18} color="#0F172A" />} />
            <DirectiveItem label="Security Protocols" icon={<ShieldCheck size={18} color="#0F172A" />} />
            <DirectiveItem 
              label="Terminate Session" 
              icon={<LogOut size={18} color="#EF4444" />} 
              danger 
              onPress={logout}
              last 
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const DirectiveItem = ({ label, icon, danger, onPress, last }) => (
  <TouchableOpacity 
    onPress={onPress}
    activeOpacity={0.8}
    className={`flex-row items-center justify-between p-6 ${!last ? 'border-b-2 border-slate-900' : ''} ${danger ? 'bg-red-50' : 'bg-white'}`}
  >
    <View className="flex-row items-center">
      <View className={`h-10 w-10 items-center justify-center border-2 ${danger ? 'border-red-500 bg-white' : 'border-slate-100 bg-slate-50'}`}>
        {icon}
      </View>
      <Text className={`ml-4 text-xs font-black uppercase italic tracking-widest ${danger ? 'text-red-500' : 'text-slate-900'}`}>
        {label}
      </Text>
    </View>
    <ChevronRight size={18} color={danger ? "#EF4444" : "#CBD5E1"} />
  </TouchableOpacity>
);