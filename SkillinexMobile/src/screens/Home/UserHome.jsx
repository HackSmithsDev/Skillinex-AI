import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';

import { Trophy, Zap, PlayCircle, Clock, BookOpen, ChevronRight, Plus } from 'lucide-react-native';
import { styled } from 'nativewind';

const { width } = Dimensions.get('window');

export default function UserHome({ navigation }) {
  return (
    <ScrollView className="flex-1 bg-white px-6 pt-8" showsVerticalScrollIndicator={false}>
      
      {/* 1. WELCOME HEADER */}
      <View className="mb-8">
        <Text className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
          Welcome back, Tushar! 👋
        </Text>
        <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          System Status: 3 Chapters remaining for target
        </Text>
        
        {/* Quick Action Row */}
        <View className="flex-row gap-3 mt-6">
          <TouchableOpacity 
            className="flex-1 h-12 bg-white border-2 border-slate-900 flex-row items-center justify-center"
            onPress={() => navigation.navigate('LOG')}
          >
            <Trophy size={16} color="#EAB308" />
            <Text className="ml-2 font-black text-[10px] uppercase">1,250 XP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-1 h-12 bg-primary border-2 border-slate-900 flex-row items-center justify-center">
            <Zap size={16} color="#0F172A" />
            <Text className="ml-2 font-black text-[10px] uppercase">Resume</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. CURRENT COURSE CARD (The "Active Node") */}
      <View className="mb-8 border-4 border-slate-900 bg-white">
        <View className="relative h-48 bg-slate-200 border-b-4 border-slate-900">
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600' }}
            className="w-full h-full opacity-80"
          />
          <View className="absolute inset-0 items-center justify-center bg-slate-900/10">
            <PlayCircle size={60} color="#FFFFFF" strokeWidth={1.5} />
          </View>
          <View className="absolute top-4 right-4 bg-primary px-3 py-1 border-2 border-slate-900">
            <Text className="text-[10px] font-black uppercase italic">Subject 1</Text>
          </View>
        </View>

        <View className="p-5">
          <Text className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-4">
            Advanced Neural Networks
          </Text>
          
          {/* Brutalist Progress Bar */}
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-[8px] font-black uppercase text-slate-400">Sync_Progress</Text>
              <Text className="text-[8px] font-black text-slate-900">65%</Text>
            </View>
            <View className="h-4 bg-slate-100 border-2 border-slate-900">
              <View 
                from={{ width: 0 }}
                animate={{ width: '65%' }}
                className="h-full bg-slate-900"
              />
            </View>
          </View>

          <View className="flex-row justify-between items-center opacity-60">
            <View className="flex-row items-center">
              <Clock size={12} color="#0F172A" />
              <Text className="ml-1 text-[10px] font-bold uppercase">12h left</Text>
            </View>
            <View className="flex-row items-center">
              <BookOpen size={12} color="#0F172A" />
              <Text className="ml-1 text-[10px] font-bold uppercase">8/12 Chapters</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3. QUICK STATS GRID */}
      <View className="flex-row gap-4 mb-8">
        <View className="flex-1 p-4 border-2 border-slate-900 bg-slate-50">
          <Trophy size={18} color="#059669" />
          <Text className="mt-2 text-[8px] font-black text-emerald-800 uppercase">Top Subject</Text>
          <Text className="text-sm font-black text-slate-900 uppercase italic">AI & ML</Text>
        </View>
        <View className="flex-1 p-4 border-2 border-slate-900 bg-orange-50">
          <Zap size={18} color="#EA580C" />
          <Text className="mt-2 text-[8px] font-black text-orange-800 uppercase">Test Avg</Text>
          <Text className="text-sm font-black text-slate-900 uppercase italic">88%</Text>
        </View>
      </View>

      {/* 4. DAILY GOALS SECTION */}
      <View className="mb-12">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xs font-black uppercase tracking-widest text-slate-400">Daily_Targets</Text>
        </View>
        
        <View className="border-2 border-slate-900 bg-white">
          <GoalItem label="Complete 1 Quiz" done={true} />
          <GoalItem label="Watch 2 Videos" done={false} />
          <GoalItem label="Practice 15 mins" done={false} border={false} />
        </View>

        <TouchableOpacity className="mt-4 h-16 border-2 border-dashed border-slate-300 flex-row items-center justify-center gap-2">
          <Plus size={16} color="#94A3B8" />
          <Text className="text-[10px] font-black uppercase text-slate-400">Add Custom Goal</Text>
        </TouchableOpacity>
      </View>
      
      {/* Bottom Spacer */}
      <View className="h-20" />
    </ScrollView>
  );
}

// Internal Goal Component
const GoalItem = ({ label, done, border = true }) => (
  <View className={`flex-row items-center p-4 ${border ? 'border-b-2 border-slate-900' : ''}`}>
    <View className={`w-5 h-5 border-2 border-slate-900 mr-4 items-center justify-center ${done ? 'bg-primary' : 'bg-white'}`}>
      {done && <View className="w-2 h-2 bg-white" />}
    </View>
    <Text className={`text-[11px] font-black uppercase ${done ? 'text-slate-300 line-through italic' : 'text-slate-900'}`}>
      {label}
    </Text>
  </View>
);