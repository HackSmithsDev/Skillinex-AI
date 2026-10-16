import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, RefreshControl, Modal } from 'react-native';

import { Trophy, Zap, PlayCircle, Clock, BookOpen, ChevronRight, Plus } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import userService from '../../api/userService';
import { resolveMediaUrl } from '../../api/axios';

const { width } = Dimensions.get('window');

export default function UserHome({ navigation }) {
  const [stats, setStats] = useState(null);
  const [course, setCourse] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await userService.dashboard();
      setStats(data.stats);
      setCourse(data.currentCourse);
    } catch (e) {
      console.log('Dashboard sync failed', e?.message);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const openCourse = () => course && navigation.navigate('Tutorials', { courseId: course.id });
  const goals = stats?.goals || [];

  return (
    <ScrollView
      className="flex-1 bg-card px-6 pt-8"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      
      {/* 1. WELCOME HEADER */}
      <View className="mb-8">
        <Text className="text-3xl font-black text-foreground uppercase italic tracking-tighter">
          Welcome back, {stats?.name || 'Operator'}! 👋
        </Text>
        <Text className="text-[10px] font-bold text-subtle uppercase tracking-widest mt-1">
          {stats?.dailyGoalStatus || 'System Status: Syncing'}
        </Text>
        
        {/* Quick Action Row */}
        <View className="flex-row gap-3 mt-6">
          <TouchableOpacity 
            className="flex-1 h-12 bg-card border-2 border-primary flex-row items-center justify-center"
            onPress={() => navigation.navigate('LOG')}
          >
            <Trophy size={16} className="text-highlight" />
            {/* FIXED: added text-foreground */}
            <Text className="ml-2 font-black text-[10px] uppercase text-foreground">
              {(stats?.totalXP ?? 0).toLocaleString()} XP
            </Text>
          </TouchableOpacity>
          
          {/* FIXED: added flex-1 and onPress */}
          <TouchableOpacity 
            onPress={openCourse} 
            className="flex-1 h-12 bg-primary border-2 border-primary flex-row items-center justify-center"
          >
            <Zap size={16} className="text-primary-foreground" />
            <Text className="ml-2 font-black text-[10px] uppercase text-primary-foreground">Resume</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. CURRENT COURSE CARD (The "Active Node") */}
      {course ? (
      <View className="mb-8 border-4 border-primary bg-card">
        <TouchableOpacity activeOpacity={0.9} onPress={openCourse} className="relative h-48 bg-border border-b-4 border-primary">
          <Image 
            source={{ uri: resolveMediaUrl(course.thumbnail_url) || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600' }}
            className="w-full h-full opacity-80"
          />
          <View className="absolute inset-0 items-center justify-center bg-primary/10">
            <PlayCircle size={60} strokeWidth={1.5} className="text-primary-foreground" />
          </View>
          {/* FIXED: added text-primary-foreground */}
          <View className="absolute top-4 right-4 bg-primary px-3 py-1 border-2 border-primary">
            <Text className="text-[10px] font-black uppercase italic text-primary-foreground">{course.difficulty}</Text>
          </View>
        </TouchableOpacity>

        <View className="p-5">
          <Text className="text-xl font-black text-foreground uppercase italic tracking-tighter mb-4">
            {course.title}
          </Text>
          
          {/* Brutalist Progress Bar */}
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-[8px] font-black uppercase text-subtle">Sync_Progress</Text>
              <Text className="text-[8px] font-black text-foreground">{course.progress}%</Text>
            </View>
            <View className="h-4 bg-muted border-2 border-primary">
              <View 
                style={{ width: `${course.progress}%` }}
                className="h-full bg-primary"
              />
            </View>
          </View>

          <View className="flex-row justify-between items-center opacity-60">
            <View className="flex-row items-center">
              <Clock size={12} className="text-primary" />
              {/* FIXED: added text-foreground */}
              <Text className="ml-1 text-[10px] font-bold uppercase text-foreground">{course.timeLeft} left</Text>
            </View>
            <View className="flex-row items-center">
              <BookOpen size={12} className="text-primary" />
              {/* FIXED: added text-foreground */}
              <Text className="ml-1 text-[10px] font-bold uppercase text-foreground">{course.completedLectures}/{course.totalLectures} Lectures</Text>
            </View>
          </View>
        </View>
      </View>
      ) : (
        <TouchableOpacity onPress={() => navigation.navigate('VAULT')} className="mb-8 h-32 border-4 border-dashed border-line-strong items-center justify-center">
          <Text className="text-[10px] font-black uppercase text-subtle">No_Active_Node // Open_Vault</Text>
        </TouchableOpacity>
      )}

      {/* 3. QUICK STATS GRID */}
      <View className="flex-row gap-4 mb-8">
        <View className="flex-1 p-4 border-2 border-primary bg-surface">
          <Trophy size={18} className="text-success-strong" />
          <Text className="mt-2 text-[8px] font-black text-success-strong uppercase">Top Subject</Text>
          <Text className="text-sm font-black text-foreground uppercase italic">{stats?.topCategory || '—'}</Text>
        </View>
        <View className="flex-1 p-4 border-2 border-primary bg-warning-subtle">
          <Zap size={18} className="text-warning-strong" />
          <Text className="mt-2 text-[8px] font-black text-warning-strong uppercase">Test Avg</Text>
          <Text className="text-sm font-black text-foreground uppercase italic">{stats?.avgScore ?? 0}%</Text>
        </View>
      </View>

      {/* 4. DAILY GOALS SECTION */}
      <View className="mb-12">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xs font-black uppercase tracking-widest text-subtle">Daily_Targets</Text>
        </View>
        
        <View className="border-2 border-primary bg-card">
          {goals.map((g, i) => (
            <GoalItem key={g.label} label={g.label} done={g.done} border={i < goals.length - 1} />
          ))}
        </View>

        <TouchableOpacity onPress={() => setGoalDialogOpen(true)} className="mt-4 h-16 border-2 border-dashed border-line-strong flex-row items-center justify-center gap-2">
          <Plus size={16} className="text-subtle" />
          <Text className="text-[10px] font-black uppercase text-subtle">Add Custom Goal</Text>
        </TouchableOpacity>
      </View>
      
      <Modal visible={goalDialogOpen} transparent animationType="fade" onRequestClose={() => setGoalDialogOpen(false)}>
        <View className="flex-1 items-center justify-center bg-foreground/60 px-8">
          <View className="w-full bg-card border-2 border-primary p-6 items-center">
            <Text className="text-sm font-black uppercase tracking-widest text-foreground">Custom_Goals</Text>
            <Text className="text-xs text-subtle text-center mt-3">This feature is a work in progress and is unavailable right now. Check back soon!</Text>
            <TouchableOpacity onPress={() => setGoalDialogOpen(false)} className="mt-6 h-12 w-full bg-primary items-center justify-center">
              <Text className="text-primary-foreground font-black uppercase tracking-widest text-[10px]">Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Spacer */}
      <View className="h-20" />
    </ScrollView>
  );
}

const GoalItem = ({ label, done, border = true }) => (
  <View className={`flex-row items-center p-4 ${border ? 'border-b-2 border-primary' : ''}`}>
    <View className={`w-5 h-5 border-2 border-primary mr-4 items-center justify-center ${done ? 'bg-primary' : 'bg-card'}`}>
      {done && <View className="w-2 h-2 bg-card" />}
    </View>
    <Text className={`text-[11px] font-black uppercase ${done ? 'text-line-strong line-through italic' : 'text-foreground'}`}>
      {label}
    </Text>
  </View>
);