import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  SafeAreaView, ActivityIndicator 
} from 'react-native';
import { 
  ChevronRight, ArrowLeft, 
  Clock, Play 
} from "lucide-react-native";
import tutorialService from '../../api/tutorialService';
import useThemeColors from '../../theme/useThemeColors';

export default function Tutorials({ navigation, route }) {
  const courseId = route.params?.courseId;
  const colors = useThemeColors();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await tutorialService.getCourse(courseId);
        setCourse(data);
        if (data.sections?.[0]) setOpenSection(data.sections[0].id);
      } catch (e) {
        console.log('Course sync failed', e?.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  const sections = course?.sections || [];

  if (loading || !course) {
    return (
      <SafeAreaView className="flex-1 bg-card items-center justify-center">
        {loading
          ? <ActivityIndicator color={colors.primary} />
          : <Text className="text-[10px] font-black uppercase text-subtle">Archive_Not_Found</Text>}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-card">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-8">
        
        {/* TOP NAVIGATION */}
        <TouchableOpacity 
          onPress={() => selectedChapter ? setSelectedChapter(null) : navigation.goBack()}
          className="mb-10 flex-row items-center bg-surface self-start px-4 py-2 border-2 border-primary shadow-[2px_2px_0px_0px_rgb(var(--inverse))]"
        >
          <ArrowLeft size={16} strokeWidth={3} className="text-primary" />
          <Text className="ml-3 text-[10px] font-black uppercase tracking-[4px] text-foreground">
            {selectedChapter ? "Return_to_Index" : "Exit_Vault"}
          </Text>
        </TouchableOpacity>

        {!selectedChapter ? (
          <View>
            <Text className="text-5xl font-black tracking-tighter text-foreground leading-[0.85] mb-2 uppercase italic">
              {course.title}
            </Text>
            <Text className="text-[10px] font-bold text-subtle uppercase tracking-[3px] mb-8">System_Curriculum</Text>
            
            <View className="h-2 bg-primary w-20 mb-10" />

            {sections.map((section, idx) => (
              <View key={section.id} className="mb-6">
                <TouchableOpacity 
                  onPress={() => setOpenSection(openSection === section.id ? null : section.id)}
                  activeOpacity={0.8}
                  className={`flex-row items-center p-5 border-2 ${openSection === section.id ? 'bg-primary border-primary shadow-[4px_4px_0px_0px_rgb(var(--success))]' : 'bg-card border-muted'}`}
                >
                  {/* FIXED: Section number contrast on active accordion */}
                  <Text className={`text-2xl font-black mr-4 ${openSection === section.id ? 'text-primary-foreground/50' : 'text-border'}`}>
                    {(idx + 1).toString().padStart(2, '0')}
                  </Text>
                  <Text className={`text-[11px] font-black uppercase tracking-widest flex-1 ${openSection === section.id ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {section.name}
                  </Text>
                  <ChevronRight size={18} style={{ transform: [{ rotate: openSection === section.id ? '90deg' : '0deg' }] }} className={openSection === section.id ? "text-success" : "text-primary"} />
                </TouchableOpacity>

                {openSection === section.id && (
                  <View className="mt-2 ml-4 border-l-4 border-primary bg-surface p-2">
                    {section.chapters.map((ch) => (
                      <TouchableOpacity 
                        key={ch.id} 
                        onPress={() => setSelectedChapter(ch)}
                        className="pl-6 py-4 border-b border-border"
                      >
                        <Text className="text-xs font-black text-foreground uppercase italic">
                          {ch.title}
                        </Text>
                        <Text className={`text-[9px] font-bold uppercase mt-1 ${ch.is_completed ? 'text-success' : 'text-subtle'}`}>{ch.is_completed ? 'Status: Synced' : 'Status: Pending_Sync'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View>
            <View className="flex-row items-center mb-8">
              {/* FIXED: NODE_ID badge text-primary -> text-primary-foreground */}
              <View className="bg-primary px-3 py-1 border border-primary">
                <Text className="text-[8px] font-black text-primary-foreground uppercase tracking-widest">NODE_ID: {String(selectedChapter.id).split('-')[0]}</Text>
              </View>
              <View className="ml-6 flex-row items-center">
                <Clock size={12} className="text-subtle" />
                <Text className="ml-2 text-[10px] font-black text-subtle uppercase">{selectedChapter.time}</Text>
              </View>
            </View>

            <Text className="text-5xl font-black text-foreground tracking-tighter leading-[0.85] uppercase italic mb-8">
              {selectedChapter.title}
            </Text>

            <View className="bg-surface p-6 border-l-8 border-primary mb-10">
              <Text className="text-lg text-soft font-bold leading-6 italic">
                "{selectedChapter.overview}"
              </Text>
            </View>

            <View className="flex-row gap-8 border-y-2 border-muted py-8 mb-12">
              <View className="flex-1">
                <Text className="text-[8px] font-black text-subtle uppercase tracking-widest mb-2">Complexity_Tier</Text>
                <Text className="text-xs font-black text-foreground uppercase">{selectedChapter.complexity || "Standard"}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[8px] font-black text-subtle uppercase tracking-widest mb-2">Sync_Reward</Text>
                <Text className="text-xs font-black text-success uppercase">+50_XP_POINTS</Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Lecture', { courseId, sectionId: openSection, lectureId: selectedChapter.id })}
              activeOpacity={0.9}
              className="bg-primary h-24 w-full flex-row items-center justify-center border-b-8 border-subtle shadow-2xl"
            >
              <Play fill="currentColor" size={24} className="text-primary-foreground" />
              <Text className="ml-4 text-primary-foreground font-black uppercase tracking-[2px] italic text-lg">
                Initialize_Lecture
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}