import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import tutorialService from '../../api/tutorialService';
import courseService from '../../api/courseService';
import { errorMessage } from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import useThemeColors from '../../theme/useThemeColors';

import { 
  Brain, Code, Database, Sparkles, 
  ArrowRight, Clock, Layout, Zap 
} from "lucide-react-native";

export default function LearningVault({ navigation }) {
  const { user } = useContext(AuthContext);
  const colors = useThemeColors();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [generating, setGenerating] = useState(false);
  const pollRef = useRef(null);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const fetchVault = useCallback(async () => {
    try {
      const data = await tutorialService.getLearningVault();
      const list = Array.isArray(data) ? data : [];
      setEnrolledCourses(list);
      const building = list.some((c) => !c.is_ready);
      if (building && !pollRef.current) pollRef.current = setInterval(fetchVault, 6000);
      else if (!building) stopPolling();
    } catch (e) {
      console.log('Vault sync failed', e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    fetchVault();
    return stopPolling;
  }, [fetchVault]));

  useEffect(() => stopPolling, []);

  const onRefresh = async () => { setRefreshing(true); await fetchVault(); setRefreshing(false); };

  const handleGenerate = async () => {
    if (!topic.trim() || generating) return;
    setGenerating(true);
    try {
      await courseService.generate(topic.trim(), difficulty);
      setTopic('');
      setShowGenerator(false);
      await fetchVault();
    } catch (e) {
      Alert.alert('Generation failed', errorMessage(e));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* 1. VAULT HEADER */}
      <View className="px-8 pt-20 pb-10 bg-card border-b-2 border-muted">
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <View className="bg-primary self-start px-3 py-1 mb-2">
              <Text className="text-[8px] font-black text-success uppercase tracking-widest">Active_Terminal</Text>
            </View>
            <Text className="text-4xl font-black text-foreground tracking-tighter uppercase italic">
              Learning{'\n'}Vault
            </Text>
          </View>
          
        </View>
        <Text className="text-xs text-muted-foreground font-bold leading-5">
          Welcome back, {user?.full_name?.split(' ')[0] || 'Operator'}. Your neural pathways are ready for synchronization.
        </Text>
      </View>

      {/* 2. COURSE MISSION CARDS */}
      <View className="px-6 mt-8 space-y-6">
        {loading && <ActivityIndicator color={colors.primary} />}
        {enrolledCourses.map((course) => (
          <View
            key={course.id}
            className={`bg-card p-6 ${course.is_ready ? '' : 'opacity-60'} border-2 border-primary shadow-[6px_6px_0px_0px_rgb(var(--primary))]`}
          >
            <View className="flex-row justify-between items-center mb-4">
              <View className="p-3 bg-surface border border-border">
                <Brain size={24} className={course.is_ready ? 'text-primary' : 'text-line-strong'} />
              </View>
              <Text className="text-[9px] font-black uppercase tracking-widest text-subtle">
                {course.is_ready ? (course.category || 'General') : 'Constructing'}
              </Text>
            </View>

            <Text className="text-xl font-black text-foreground uppercase italic tracking-tighter mb-2">
              {course.title}
            </Text>
            <Text className="text-[10px] text-muted-foreground font-bold leading-4 mb-6">
              {course.is_ready ? (course.description || 'Comprehensive modular learning path.') : 'Roadmap generation in progress...'}
            </Text>

            {/* PROGRESS SECTION */}
            <View className="mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-[8px] font-black text-subtle uppercase">Sync_Progress</Text>
                <Text className="text-[8px] font-black text-foreground uppercase">{Math.round(course.progress || 0)}%</Text>
              </View>
              <View className="h-2 bg-muted w-full">
                <View 
                  className="h-2" 
                  style={{ width: `${Math.round(course.progress || 0)}%`, backgroundColor: course.accent }} 
                />
              </View>
            </View>

            <View className="flex-row justify-between items-center pt-4 border-t border-muted">
              <View className="flex-row gap-4">
                <View className="flex-row items-center">
                  <Layout size={12} className="text-subtle" />
                  <Text className="ml-1 text-[9px] font-black text-subtle uppercase">{course.nodes || course.chapters_count || 0}_Nodes</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                disabled={!course.is_ready}
                onPress={() => navigation.navigate('Tutorials', { courseId: course.id })}
                className="bg-primary h-12 w-12 items-center justify-center"
              >
                {course.is_ready
                  ? <ArrowRight size={20} className="text-primary-foreground" />
                  : <ActivityIndicator color={colors['primary-foreground']} />}
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* 3. EXPAND INTEL (ADD COURSE) */}
        {showGenerator && (
          <View className="bg-card border-2 border-primary p-6">
            <TextInput
              value={topic}
              onChangeText={setTopic}
              placeholder="Topic, e.g. Rust ownership"
              placeholderClassName="text-line-strong"
              className="border-2 border-primary h-12 px-4 text-foreground font-bold mb-4"
            />
            <View className="flex-row mb-4">
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <TouchableOpacity key={lvl} onPress={() => setDifficulty(lvl)}
                  className={`flex-1 py-3 items-center border-2 border-primary ${difficulty === lvl ? 'bg-primary' : 'bg-card'}`}>
                  <Text className={`text-[9px] font-black uppercase ${difficulty === lvl ? 'text-primary-foreground' : 'text-foreground'}`}>{lvl}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={handleGenerate} disabled={generating} className="bg-primary h-12 items-center justify-center">
              {generating
                ? <ActivityIndicator color={colors['primary-foreground']} />
                : <Text className="text-primary-foreground font-black uppercase text-xs tracking-widest">Generate_Roadmap</Text>}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity onPress={() => setShowGenerator((v) => !v)} className="border-4 border-dashed border-border p-8 items-center justify-center mt-4">
          <View className="w-12 h-12 rounded-full bg-muted items-center justify-center mb-4">
            <Sparkles size={24} className="text-line-strong" />
          </View>
          <Text className="font-black text-subtle text-sm uppercase italic">Expand_Intelligence</Text>
          <Text className="text-[8px] text-line-strong font-black uppercase tracking-widest mt-1">Unlock_New_Node</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}