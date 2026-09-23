import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { 
  PlayCircle, FileText, Bot, 
  Clock, ArrowLeft, Layers, Zap, Sparkles, ChevronRight 
} from "lucide-react-native";
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

export default function LectureView({ navigation, route }) {
  // Ensure we fall back to a default if params aren't passed
  const lectureId = route?.params?.lectureId || "ch-1";

  const playlist = [
    { id: "ch-1", title: "Neuron Mathematical Models", duration: "12:05", type: "video" },
    { id: "ch-2", title: "Weight Initialization", duration: "18:45", type: "video" },
    { id: "ch-3", title: "SGD Matrix Operations", duration: "15:20", type: "reading" },
  ];

  // Robust back handler
  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Fallback if there is no history stack
      navigation.navigate('Tutorials'); 
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* 1. CINEMATIC VIDEO STAGE */}
      <View 
        style={{ width, height: width * 0.56 }} 
        className="bg-slate-900 overflow-hidden border-b-8 border-slate-900 shadow-2xl z-50"
      >
        <WebView 
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsFullscreenVideo={true}
          source={{ uri: "https://www.youtube.com/embed/dQw4w9WgXcQ" }} 
          style={{ flex: 1, backgroundColor: '#000' }}
        />
        
        {/* Floating Back Button - Fixed Z-Index and Touch Area */}
        <View className="absolute top-10 left-6">
           <TouchableOpacity 
            onPress={handleGoBack}
            activeOpacity={0.7}
            style={{ elevation: 10 }}
            className="h-12 w-12 bg-black/80 items-center justify-center border-2 border-primary/50 rounded-none shadow-lg"
          >
            <ArrowLeft size={22} color="#0F172A" strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 2. HUD & METADATA */}
        <View className="p-8 border-b-4 border-slate-900">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center bg-slate-900 px-4 py-2 border-l-4 border-primary">
              <Layers size={14} color="#0F172A" />
              <Text className="ml-3 text-[10px] font-black text-white uppercase tracking-[2px]">SYNC_NODE_01</Text>
            </View>
            <View className="bg-slate-50 px-3 py-1 border border-emerald-200">
               <Text className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">Live_Feed</Text>
            </View>
          </View>

          <Text className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-[0.85] mb-6">
            Neuron{'\n'}
            <Text className="text-primary">Math_Models</Text>
          </Text>
          
          <View className="bg-slate-50 p-5 border-l-8 border-slate-900 mb-8 shadow-sm">
            <Text className="text-xs text-slate-600 font-bold leading-5 italic">
              "Decoding biological architecture into pure linear algebra. Protocol: Weight Distributions & Partial Derivatives."
            </Text>
          </View>

          {/* AI TUTOR ACTION */}
          <TouchableOpacity 
            activeOpacity={0.9}
            className="bg-slate-900 h-16 flex-row items-center justify-center border-b-8 border-emerald-600 active:border-b-2 active:translate-y-1"
          >
            <Bot size={22} color="#0F172A" strokeWidth={2.5} />
            <Text className="ml-4 text-white font-black uppercase tracking-[3px] italic text-xs">Query_AI_Mentor</Text>
          </TouchableOpacity>
        </View>

        {/* 3. SESSION BRIEFING */}
        <View className="p-8 space-y-6">
          <View className="flex-row gap-4">
            <View className="flex-1 bg-slate-900 p-6 items-center border-b-8 border-primary">
              <Zap size={20} color="#0F172A" strokeWidth={2.5} fill="#10B981" />
              <Text className="text-[12px] font-black text-white mt-3 tracking-[2px]">+150_XP</Text>
            </View>
            <View className="flex-1 bg-white border-4 border-slate-900 p-6 items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Clock size={20} color="#0F172A" strokeWidth={2.5} />
              <Text className="text-[12px] font-black text-slate-900 mt-3 tracking-[2px]">45_MINS</Text>
            </View>
          </View>

          <View className="bg-slate-900 border-2 border-primary p-5 flex-row items-center">
            <Sparkles size={20} color="#0F172A" />
            <View className="ml-4 flex-1">
              <Text className="text-[10px] font-black text-emerald-400 uppercase tracking-[2px]">System_Protocol</Text>
              <Text className="text-[11px] font-bold text-white italic mt-1 leading-4">
                High-frequency data streaming active. Optimize your cognitive load for matrix math.
              </Text>
            </View>
          </View>
        </View>

        {/* 4. SECTION STACK (Playlist) */}
        <View className="px-8 pb-20">
          <View className="flex-row items-center justify-between mb-8">
            <Text className="text-[12px] font-black text-slate-900 uppercase tracking-[5px]">Section_Stack</Text>
            <View className="h-[3px] flex-1 bg-slate-100 ml-6" />
          </View>

          {playlist.map((item, idx) => (
            <TouchableOpacity 
              key={item.id}
              activeOpacity={0.8}
              className={`flex-row items-center p-6 mb-5 border-2 ${
                item.id === lectureId 
                ? 'bg-slate-900 border-slate-900 shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]' 
                : 'bg-white border-slate-200'
              }`}
            >
              <View className={`h-12 w-12 items-center justify-center border-2 ${
                item.id === lectureId ? 'bg-primary border-white' : 'bg-slate-50 border-slate-200'
              }`}>
                {item.type === 'video' ? 
                  <PlayCircle size={24} color={item.id === lectureId ? "#FFF" : "#0F172A"} /> : 
                  <FileText size={24} color={item.id === lectureId ? "#FFF" : "#0F172A"} />
                }
              </View>
              <View className="ml-6 flex-1">
                <Text className={`text-[12px] font-black uppercase italic leading-tight ${
                  item.id === lectureId ? 'text-white' : 'text-slate-900'
                }`}>
                  {item.title}
                </Text>
                <Text className={`text-[9px] font-bold uppercase mt-2 tracking-[2px] ${
                  item.id === lectureId ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {item.duration} // NODE_0{idx+1}
                </Text>
              </View>
              {item.id === lectureId && (
                <Zap size={16} color="#0F172A" fill="#10B981" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}