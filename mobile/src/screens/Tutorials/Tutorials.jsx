import React, { useState } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { 
  ChevronRight, ArrowLeft, 
  Clock, Play 
} from "lucide-react-native";

export default function Tutorials({ navigation }) {
  const [openSection, setOpenSection] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  const sections = [
    { 
      id: "sec-1", 
      name: "Neural Foundation", 
      chapters: [
        { id: "ch-1", title: "Neuron Mathematical Models", overview: "Decoding biological architecture into pure linear algebra.", time: "45m", complexity: "Beginner" },
        { id: "ch-2", title: "Weight Initialization", overview: "The art of breaking symmetry. Mastering Xavier and He distribution.", time: "30m", complexity: "Intermediate" }
      ]
    },
    { 
      id: "sec-2", 
      name: "Optimization Matrix", 
      chapters: [
        { id: "ch-3", title: "Stochastic Gradient Descent", overview: "Navigating high-dimensional loss landscapes with precision.", time: "55m", complexity: "Intermediate" },
        { id: "ch-4", title: "Adam & RMSProp", overview: "Adaptive learning velocities. Engineering momentum for convergence.", time: "40m", complexity: "Advanced" }
      ]
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-8">
        
        {/* TOP NAVIGATION */}
        <TouchableOpacity 
          onPress={() => selectedChapter ? setSelectedChapter(null) : navigation.goBack()}
          className="mb-10 flex-row items-center bg-slate-50 self-start px-4 py-2 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <ArrowLeft size={16} color="#0F172A" strokeWidth={3} />
          <Text className="ml-3 text-[10px] font-black uppercase tracking-[4px] text-slate-900">
            {selectedChapter ? "Return_to_Index" : "Exit_Vault"}
          </Text>
        </TouchableOpacity>

        {!selectedChapter ? (
          <View>
            <Text className="text-5xl font-black tracking-tighter text-slate-900 leading-[0.85] mb-2 uppercase italic">
              FULL-STACK{'\n'}
              <Text className="text-primary">AI_DEPLOY</Text>
            </Text>
            {/* CHANGED: tracking-[0.3em] -> tracking-[3px] */}
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-[3px] mb-8">System_Curriculum_v1.0</Text>
            
            <View className="h-2 bg-slate-900 w-20 mb-10" />

            {sections.map((section, idx) => (
              <View key={section.id} className="mb-6">
                <TouchableOpacity 
                  onPress={() => setOpenSection(openSection === section.id ? null : section.id)}
                  activeOpacity={0.8}
                  className={`flex-row items-center p-5 border-2 ${openSection === section.id ? 'bg-slate-900 border-slate-900 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]' : 'bg-white border-slate-100'}`}
                >
                  <Text className={`text-2xl font-black mr-4 ${openSection === section.id ? 'text-primary' : 'text-slate-200'}`}>
                    {(idx + 1).toString().padStart(2, '0')}
                  </Text>
                  {/* CHANGED: tracking-widest is safer than arbitrary em */}
                  <Text className={`text-[11px] font-black uppercase tracking-widest flex-1 ${openSection === section.id ? 'text-white' : 'text-slate-900'}`}>
                    {section.name}
                  </Text>
                  <ChevronRight size={18} color={openSection === section.id ? "#10B981" : "#0F172A"} style={{ transform: [{ rotate: openSection === section.id ? '90deg' : '0deg' }] }} />
                </TouchableOpacity>

                {openSection === section.id && (
                  <View className="mt-2 ml-4 border-l-4 border-primary bg-slate-50 p-2">
                    {section.chapters.map((ch) => (
                      <TouchableOpacity 
                        key={ch.id} 
                        onPress={() => setSelectedChapter(ch)}
                        className="pl-6 py-4 border-b border-slate-200"
                      >
                        <Text className="text-xs font-black text-slate-900 uppercase italic">
                          {ch.title}
                        </Text>
                        <Text className="text-[9px] text-slate-400 font-bold uppercase mt-1">Status: Pending_Sync</Text>
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
              <View className="bg-slate-900 px-3 py-1 border border-primary">
                <Text className="text-[8px] font-black text-primary uppercase tracking-widest">NODE_ID: {selectedChapter.id}</Text>
              </View>
              <View className="ml-6 flex-row items-center">
                <Clock size={12} color="#94A3B8" />
                <Text className="ml-2 text-[10px] font-black text-slate-400 uppercase">{selectedChapter.time}</Text>
              </View>
            </View>

            <Text className="text-5xl font-black text-slate-900 tracking-tighter leading-[0.85] uppercase italic mb-8">
              {selectedChapter.title}
            </Text>

            <View className="bg-slate-50 p-6 border-l-8 border-slate-900 mb-10">
              <Text className="text-lg text-slate-700 font-bold leading-6 italic">
                "{selectedChapter.overview}"
              </Text>
            </View>

            <View className="flex-row gap-8 border-y-2 border-slate-100 py-8 mb-12">
              <View className="flex-1">
                <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Complexity_Tier</Text>
                <Text className="text-xs font-black text-slate-900 uppercase">{selectedChapter.complexity}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Sync_Reward</Text>
                <Text className="text-xs font-black text-emerald-600 uppercase">+50_XP_POINTS</Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => navigation.navigate('Lecture', { chapterId: selectedChapter.id })}
              activeOpacity={0.9}
              className="bg-primary h-24 w-full flex-row items-center justify-center border-b-8 border-slate-400 shadow-2xl"
            >
              <Play color="#0F172A" fill="#0F172A" size={24} />
              {/* CHANGED: tracking-[0.2em] -> tracking-[2px] */}
              <Text className="ml-4 text-slate-900 font-black uppercase tracking-[2px] italic text-lg">Initialize_Lecture</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}