import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

import { 
  Brain, Code, Database, Sparkles, 
  ArrowRight, Clock, Layout, Zap 
} from "lucide-react-native";

const { width } = Dimensions.get('window');

export default function LearningVault({ navigation }) {
  const enrolledCourses = [
    {
      id: "cs-101",
      title: "Full-Stack AI Deployment",
      category: "Computer Science",
      progress: 35,
      nodes: 15,
      icon: <Brain color="#0F172A" size={24} />,
      accent: "#3B82F6",
      description: "Mastering the pipeline from neural model architecture to production-ready APIs."
    },
    {
      id: "ds-202",
      title: "Advanced Data Structures",
      category: "Engineering",
      progress: 60,
      nodes: 12,
      icon: <Database color="#F59E0B" size={24} />,
      accent: "#F59E0B",
      description: "Optimizing algorithmic complexity for high-performance computing systems."
    },
    {
      id: "web-303",
      title: "React & Next.js Mastery",
      category: "Development",
      progress: 10,
      nodes: 20,
      icon: <Code color="#0F172A" size={24} />,
      accent: "#10B981",
      description: "Building scalable, interactive UIs with modern state management patterns."
    }
  ];

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* 1. VAULT HEADER */}
      <View className="px-8 pt-20 pb-10 bg-white border-b-2 border-slate-100">
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <View className="bg-slate-900 self-start px-3 py-1 mb-2">
              <Text className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Active_Terminal</Text>
            </View>
            <Text className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
              Learning{'\n'}Vault
            </Text>
          </View>
          
          <View className="bg-slate-900 p-4 items-center border-b-4 border-primary">
            <Text className="text-[8px] font-black text-white/40 uppercase mb-1">Streak</Text>
            <Text className="text-xl font-black text-white italic">14_DAYS</Text>
          </View>
        </View>
        <Text className="text-xs text-slate-500 font-bold leading-5">
          Welcome back, Tushar. Your neural pathways are ready for synchronization.
        </Text>
      </View>

      {/* 2. COURSE MISSION CARDS */}
      <View className="px-6 mt-8 space-y-6">
        {enrolledCourses.map((course, index) => (
          <View
            key={course.id}
            from={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 100 }}
            className="bg-white p-6 border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]"
          >
            <View className="flex-row justify-between items-center mb-4">
              <View className="p-3 bg-slate-50 border border-slate-200">
                {course.icon}
              </View>
              <Text className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                {course.category}
              </Text>
            </View>

            <Text className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">
              {course.title}
            </Text>
            <Text className="text-[10px] text-slate-500 font-bold leading-4 mb-6">
              {course.description}
            </Text>

            {/* PROGRESS SECTION */}
            <View className="mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-[8px] font-black text-slate-400 uppercase">Sync_Progress</Text>
                <Text className="text-[8px] font-black text-slate-900 uppercase">{course.progress}%</Text>
              </View>
              <View className="h-2 bg-slate-100 w-full">
                <View 
                  className="h-2" 
                  style={{ width: `${course.progress}%`, backgroundColor: course.accent }} 
                />
              </View>
            </View>

            <View className="flex-row justify-between items-center pt-4 border-t border-slate-100">
              <View className="flex-row gap-4">
                <View className="flex-row items-center">
                  <Layout size={12} color="#94A3B8" />
                  <Text className="ml-1 text-[9px] font-black text-slate-400 uppercase">{course.nodes}_Nodes</Text>
                </View>
                <View className="flex-row items-center">
                  <Clock size={12} color="#94A3B8" />
                  <Text className="ml-1 text-[9px] font-black text-slate-400 uppercase">12H_Left</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                onPress={() => navigation.navigate('Tutorials', { courseId: course.id })}
                className="bg-slate-900 h-12 w-12 items-center justify-center"
              >
                <ArrowRight size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* 3. EXPAND INTEL (ADD COURSE) */}
        <TouchableOpacity className="border-4 border-dashed border-slate-200 p-8 items-center justify-center mt-4">
          <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center mb-4">
            <Sparkles size={24} color="#CBD5E1" />
          </View>
          <Text className="font-black text-slate-400 text-sm uppercase italic">Expand_Intelligence</Text>
          <Text className="text-[8px] text-slate-300 font-black uppercase tracking-widest mt-1">Unlock_New_Node</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}