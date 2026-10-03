import React, { useContext, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Trophy, Flame, Target, Code2, Brain, Zap, Activity, ChevronRight } from "lucide-react-native";
import { AuthContext } from '../../context/AuthContext';
import userService from '../../api/userService';
import useThemeColors from '../../theme/useThemeColors';

export default function Achievements() {
  const { user } = useContext(AuthContext);

  const colors = useThemeColors();
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await userService.achievements());
    } catch (e) {
      console.log('Achievements sync failed', e?.message);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const skills = (data?.skills || []).map((x) => ({ ...x, xp: Math.min(100, x.xp || 0) }));
  const badges = (data?.badges || []).map((b) => ({ ...b, id: b.slug }));
  const formatXp = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K` : String(n || 0));

  return (
    <ScrollView
      className="flex-1 bg-card"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} tintColor={colors.primary} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
    >
      
      {/* 1. SYSTEM HEADER */}
      <View className="px-6 pt-16 pb-8 border-b-4 border-primary">
        <View className="flex-row items-center mb-3">
          <View className="h-2 w-2 bg-primary mr-2" />
          <Text className="text-[10px] font-black uppercase tracking-[2px] text-subtle">
            Achievement_Node_Active
          </Text>
        </View>
        
        {/* Main Title */}
        <Text className="text-7xl font-black uppercase italic tracking-tighter leading-[0.75] text-foreground">
          SKILL{'\n'}
          <Text className="text-border">_LOG</Text>
        </Text>

        <View className="mt-6 flex-row justify-between items-center">
          <Text className="text-[8px] font-bold text-subtle uppercase tracking-[1px]">
            ID: {user?.id?.toString().substring(0, 12) || "GUEST"} // SYNC: REALTIME
          </Text>
          <View className="h-[1px] flex-1 bg-muted ml-4" />
        </View>
      </View>

      {/* 2. REAL-TIME HUD (Horizontal Stats) */}
      <View className="flex-row border-b-4 border-primary bg-surface">
        <StatNode label="STREAK" value={data?.streak?.replace("_", "") || "0D"} icon={<Flame size={20} className="text-warning" />} />
        <StatNode label="SYSTEM_XP" value={formatXp(data?.total_xp)} icon={<Trophy size={20} className="text-highlight" />} border />
        <StatNode label="RANK" value={data?.rank?.split(" ")[0]?.toUpperCase() || "—"} icon={<Target size={20} className="text-subtle" />} border />
      </View>

      {/* 3. PROGRESSION MATRIX (Skills) */}
      <View className="p-6">
        <View className="flex-row items-center mb-8">
          <Activity size={18} strokeWidth={3} className="text-primary" />
          <Text className="ml-3 text-[10px] font-black uppercase tracking-[4px] text-foreground">
            Progression_Matrix
          </Text>
        </View>

        {skills.length === 0 && <Text className="text-[10px] font-black uppercase text-subtle mb-6">No_Tests_Logged_Yet</Text>}
        {skills.map((skill, i) => (
          <View key={i} className="mb-10">
            <View className="flex-row justify-between items-end mb-3">
              <View className="flex-row items-center">
                <View className="p-2 bg-primary mr-3 border-b-2 border-r-2 border-primary">
                  <Brain size={16} className="text-primary-foreground" />
                </View>
                <Text className="text-xs font-black uppercase italic text-foreground">{skill.name}</Text>
              </View>
              <Text className="text-[10px] font-black text-subtle">LVL_{skill.level}</Text>
            </View>
            
            {/* Progress Bar Container */}
            <View className="h-5 bg-muted border-2 border-primary shadow-[4px_4px_0px_0px_rgb(var(--primary))] overflow-hidden">
              {/* Width is set via standard style prop for stability */}
              <View 
                style={{ width: `${skill.xp}%` }}
                className="h-full bg-primary border-r-2 border-primary"
              />
            </View>
            <Text className="text-[8px] font-black text-line-strong mt-2 tracking-[2px] uppercase text-right">
              Sync_Progress: {skill.xp}/100_XP
            </Text>
          </View>
        ))}
      </View>

      {/* 4. UNLOCKED NODES (Badges) */}
      <View className="px-6 pb-24">
        <View className="flex-row items-center mb-6">
          <Zap size={18} strokeWidth={3} className="text-primary" />
          <Text className="ml-3 text-[10px] font-black uppercase tracking-[4px] text-foreground">
            Unlocked_Nodes
          </Text>
        </View>

        {badges.map((badge) => (
          <View 
            key={badge.id}
            className={`p-5 border-2 mb-4 flex-row items-center justify-between shadow-[4px_4px_0px_0px_rgb(var(--inverse)/0.05)]
              ${badge.earned ? 'border-primary bg-card' : 'border-muted opacity-30 bg-surface'}`}
          >
            <View className="flex-row items-center">
              <View className={`p-2 rounded-full ${badge.earned ? 'bg-highlight-subtle' : 'bg-transparent'}`}>
                <Trophy size={18} className={badge.earned ? "text-highlight" : "text-line-strong"} />
              </View>
              <View className="ml-4">
                <Text className="text-[11px] font-black uppercase italic text-foreground">{badge.title}</Text>
                <Text className="text-[9px] font-bold text-subtle uppercase tracking-[1px]">{badge.desc}</Text>
              </View>
            </View>
            {badge.earned && (
              <View className="bg-primary p-1">
                <ChevronRight size={14} className="text-primary-foreground" />
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const StatNode = ({ label, value, icon, border }) => (
  <View className={`flex-1 p-6 items-center justify-center ${border ? 'border-l-2 border-primary' : ''}`}>
    {icon}
    <Text className="text-[8px] font-black uppercase tracking-[2px] text-subtle mt-3">{label}</Text>
    <Text className="text-2xl font-black italic text-foreground uppercase tracking-tighter">{value}</Text>
  </View>
);