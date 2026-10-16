import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { 
  PlayCircle, FileText, Bot, 
  Clock, ArrowLeft, Layers, Zap, Sparkles, CheckCircle 
} from "lucide-react-native";
import tutorialService from '../../api/tutorialService';
import { errorMessage } from '../../api/axios';
import useThemeColors from '../../theme/useThemeColors';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

export default function LectureView({ navigation, route }) {
  const { courseId, sectionId, lectureId } = route?.params || {};
  const colors = useThemeColors();
  const [lecture, setLecture] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const [lec, course] = await Promise.all([
          tutorialService.getLecture(lectureId),
          tutorialService.getCourse(courseId),
        ]);
        if (!active) return;
        setLecture(lec);
        const section = course?.sections?.find((x) => x.id === sectionId);
        setPlaylist(section?.chapters || []);
      } catch (e) {
        console.log('Lecture sync failed', e?.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [lectureId, courseId, sectionId]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await tutorialService.completeLecture(lectureId);
      Alert.alert('XP Synchronized', '+50 XP');
    } catch (e) {
      Alert.alert('Sync failed', errorMessage(e));
    } finally {
      setCompleting(false);
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Tutorials', { courseId });
    }
  };

  const videoUri = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(lecture?.video_query || '')}`;

  return (
    <SafeAreaView className="flex-1 bg-card">
      {/* 1. PERSISTENT TOP HUD HEADER (Guarantees Back Button is Accessible & Clickable) */}
      <View className="px-6 py-3 bg-card border-b-2 border-primary flex-row items-center justify-between">
        <TouchableOpacity 
          onPress={handleGoBack}
          activeOpacity={0.7}
          className="flex-row items-center bg-surface px-3 py-1.5 border-2 border-primary shadow-[2px_2px_0px_0px_rgb(var(--primary))]"
        >
          <ArrowLeft size={16} strokeWidth={3} className="text-primary" />
          <Text className="ml-2 text-[10px] font-black uppercase tracking-[2px] text-foreground">
            Index
          </Text>
        </TouchableOpacity>

        <View className="bg-primary px-3 py-1 border border-primary">
          <Text className="text-[8px] font-black text-primary-foreground uppercase tracking-widest">
            {lecture?.title ? lecture.title.slice(0, 24) + '...' : 'ACTIVE_NODE'}
          </Text>
        </View>
      </View>

      {/* 2. CINEMATIC VIDEO STAGE */}
      <View 
        style={{ width, height: width * 0.56 }} 
        className="bg-primary overflow-hidden border-b-4 border-primary"
      >
        <WebView 
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsFullscreenVideo={true}
          source={{ uri: videoUri }} 
          style={{ flex: 1, backgroundColor: colors.inverse }}
        />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 3. HUD & METADATA */}
        <View className="p-8 border-b-4 border-primary">
          <View className="flex-row items-center justify-between mb-6">
            {/* FIXED: Layers text-primary -> text-primary-foreground */}
            <View className="flex-row items-center bg-primary px-4 py-2 border-l-4 border-primary">
              <Layers size={14} className="text-primary-foreground" />
              <Text className="ml-3 text-[10px] font-black text-primary-foreground uppercase tracking-[2px]">SYNC_NODE</Text>
            </View>
            <View className="bg-surface px-3 py-1 border border-success-soft">
               <Text className="text-[9px] font-black text-success uppercase tracking-widest italic">Live_Feed</Text>
            </View>
          </View>

          <Text className="text-4xl font-black text-foreground uppercase italic tracking-tighter leading-[0.9] mb-6">
            {lecture?.title}
          </Text>
          
          <View className="bg-surface p-5 border-l-8 border-primary mb-8 shadow-sm">
            <Text className="text-xs text-soft font-bold leading-5">{lecture?.raw_text}</Text>
          </View>

          {/* Complete Module Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleComplete}
            disabled={completing}
            className="bg-success h-16 mb-4 flex-row items-center justify-center border-b-8 border-primary active:border-b-2 active:translate-y-1"
          >
            {completing
              ? <ActivityIndicator color={colors['primary-foreground']} />
              : <CheckCircle size={22} className="text-primary-foreground" />}
            <Text className="ml-4 text-primary-foreground font-black uppercase tracking-[3px] italic text-xs">Complete_Module</Text>
          </TouchableOpacity>

          {/* FIXED: AI Tutor Action Bot icon text-primary -> text-primary-foreground */}
          <TouchableOpacity 
            activeOpacity={0.9}
            className="bg-primary h-16 flex-row items-center justify-center border-b-8 border-success active:border-b-2 active:translate-y-1"
          >
            <Bot size={22} strokeWidth={2.5} className="text-primary-foreground" />
            <Text className="ml-4 text-primary-foreground font-black uppercase tracking-[3px] italic text-xs">Query_AI_Mentor</Text>
          </TouchableOpacity>
        </View>

        {/* 4. SESSION BRIEFING */}
        <View className="p-8 space-y-6">
          <View className="flex-row gap-4">
            <View className="flex-1 bg-primary p-6 items-center border-b-8 border-primary">
              <Zap size={20} strokeWidth={2.5} fill="currentColor" className="text-success" />
              <Text className="text-[12px] font-black text-primary-foreground mt-3 tracking-[2px]">+150_XP</Text>
            </View>
            <View className="flex-1 bg-card border-4 border-primary p-6 items-center shadow-[4px_4px_0px_0px_rgb(var(--inverse))]">
              <Clock size={20} strokeWidth={2.5} className="text-primary" />
              <Text className="text-[12px] font-black text-foreground mt-3 tracking-[2px]">45_MINS</Text>
            </View>
          </View>

          {/* FIXED: System Protocol Card Sparkles text-primary -> text-success */}
          <View className="bg-primary border-2 border-primary p-5 flex-row items-center">
            <Sparkles size={20} className="text-success" />
            <View className="ml-4 flex-1">
              <Text className="text-[10px] font-black text-success uppercase tracking-[2px]">System_Protocol</Text>
              <Text className="text-[11px] font-bold text-primary-foreground italic mt-1 leading-4">
                High-frequency data streaming active. Optimize your cognitive load for matrix math.
              </Text>
            </View>
          </View>
        </View>

        {/* 5. SECTION STACK (Playlist) */}
        <View className="px-8 pb-20">
          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-[12px] font-black text-foreground uppercase tracking-[5px]">Section_Stack</Text>
            <View className="h-[3px] flex-1 bg-muted ml-6" />
          </View>

          {loading && <ActivityIndicator color={colors.primary} />}
          {playlist.map((item, idx) => (
            <TouchableOpacity 
              key={item.id}
              activeOpacity={0.8}
              onPress={() => navigation.replace('Lecture', { courseId, sectionId, lectureId: item.id })}
              className={`flex-row items-center p-6 mb-5 border-2 ${
                item.id === lectureId 
                ? 'bg-primary border-primary shadow-[6px_6px_0px_0px_rgb(var(--success))]' 
                : 'bg-card border-border'
              }`}
            >
              <View className={`h-12 w-12 items-center justify-center border-2 ${
                item.id === lectureId ? 'bg-primary border-card' : 'bg-surface border-border'
              }`}>
                <PlayCircle size={24} className={item.id === lectureId ? "text-primary-foreground" : "text-primary"} />
              </View>
              <View className="ml-6 flex-1">
                <Text className={`text-[12px] font-black uppercase italic leading-tight ${
                  item.id === lectureId ? 'text-primary-foreground' : 'text-foreground'
                }`}>
                  {item.title}
                </Text>
                <Text className={`text-[9px] font-bold uppercase mt-2 tracking-[2px] ${
                  item.id === lectureId ? 'text-success' : 'text-subtle'
                }`}>
                  {item.time || ''} // NODE_{String(idx + 1).padStart(2, '0')}
                </Text>
              </View>
              {item.id === lectureId && (
                <Zap size={16} fill="currentColor" className="text-success" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}