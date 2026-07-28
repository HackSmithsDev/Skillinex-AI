import React, { useState, useContext, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  TextInput, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { 
  Code2, Terminal as TerminalIcon, Cpu, 
  Globe, Play, RotateCcw, Activity, ChevronRight, AlertCircle
} from "lucide-react-native";
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../../context/AuthContext'; // Ensure this path is correct

const { width } = Dimensions.get('window');

export default function Practice() {
  const { user } = useContext(AuthContext);
  const [language, setLanguage] = useState("python");
  const [activeTab, setActiveTab] = useState("EDITOR"); 
  const [code, setCode] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'sys', msg: 'Kernel_Initialized_v2.4' },
    { type: 'sys', msg: 'Awaiting_Sync...' }
  ]);

  // Boilerplate logic based on language
  useEffect(() => {
    const templates = {
      python: "def and_gate_logic(a, b):\n    # TODO: Implement AND logic\n    return 0",
      java: "public class Main {\n    public static int andGate(int a, int b) {\n        return 0;\n    }\n}",
      cpp: "int andGate(int a, int b) {\n    return 0;\n}"
    };
    setCode(templates[language]);
  }, [language]);

  const runCode = () => {
    setIsExecuting(true);
    setActiveTab("CONSOLE");
    
    // Simulated execution delay
    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev, 
        { type: 'proc', msg: `Compiling_${language.toUpperCase()}...` },
        { type: 'res', msg: '> Test Case 1 [1,1]: Passed' },
        { type: 'res', msg: '> Test Case 2 [1,0]: Failed (Expected 0, got 1)' }
      ]);
      setIsExecuting(false);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      {/* 1. TOP STATUS BAR */}
      <View className="px-6 pt-14 pb-4 border-b-4 border-slate-900 flex-row justify-between items-center bg-white">
        <View className="flex-row items-center">
          <View className="bg-primary p-2 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
            <Cpu size={18} color="#0F172A" />
          </View>
          <View className="ml-3">
            <Text className="text-[10px] font-black uppercase tracking-[1px] text-slate-400">Node: {user?.full_name?.split(' ')[0] || 'Guest'}</Text>
            <Text className="text-xl font-black uppercase italic text-slate-900 leading-5">Practice_Lab</Text>
          </View>
        </View>

        {/* Language Selector Container */}
        <View className="bg-slate-900 border-2 border-slate-900 h-10 px-2 flex-row items-center justify-center overflow-hidden">
          <Picker
            selectedValue={language}
            onValueChange={(itemValue) => setLanguage(itemValue)}
            style={{ color: 'white', width: 140, transform: [{ scale: 0.8 }] }}
            dropdownIconColor="white"
          >
            <Picker.Item label="PYTHON_3" value="python" />
            <Picker.Item label="JAVA_21" value="java" />
            <Picker.Item label="CPP_STD" value="cpp" />
          </Picker>
        </View>
      </View>

      {/* 2. NAVIGATION TABS */}
      <View className="flex-row border-b-2 border-slate-900">
        {["INSTRUCTIONS", "EDITOR", "CONSOLE"].map((tab) => (
          <TouchableOpacity 
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-4 items-center border-r border-slate-200 last:border-r-0 ${activeTab === tab ? 'bg-slate-900' : 'bg-white'}`}
          >
            <Text className={`text-[10px] font-black ${activeTab === tab ? 'text-white' : 'text-slate-400'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 3. WORKSPACE CONTENT */}
      <View className="flex-1">
        {activeTab === "INSTRUCTIONS" && (
          <ScrollView className="p-6">
            <View className="bg-amber-100 border-2 border-amber-500 p-4 mb-6">
              <View className="flex-row items-center mb-2">
                <AlertCircle size={14} color="#B45309" />
                <Text className="ml-2 text-[10px] font-black text-amber-700 uppercase">Mission_Briefing</Text>
              </View>
              <Text className="text-lg font-black text-slate-900 uppercase italic">AND_Gate_Logic</Text>
            </View>
            
            <Text className="text-sm font-bold text-slate-700 leading-5 mb-4">
              Your objective is to implement the fundamental AND logic gate. This gate serves as the bedrock of digital circuitry.
            </Text>
            
            <View className="bg-slate-50 p-4 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] mb-8">
              <Text className="text-[10px] font-black text-slate-400 uppercase mb-2 underline">Truth Table Check</Text>
              <Text className="text-xs font-mono text-slate-700 leading-5">
                Input A: 1, Input B: 1 {"->"} Output: 1{"\n"}
                Input A: 1, Input B: 0 {"->"} Output: 0{"\n"}
                Input A: 0, Input B: 0 {"->"} Output: 0
              </Text>
            </View>
          </ScrollView>
        )}

        {activeTab === "EDITOR" && (
          <View className="flex-1 bg-slate-950">
            {/* Editor Toolbar */}
            <View className="flex-row items-center justify-between px-4 py-2 bg-slate-900 border-b border-white/10">
              <View className="flex-row items-center">
                <Code2 size={12} color="#0F172A" />
                <Text className="ml-2 text-[10px] font-black text-white/50 tracking-[1px] uppercase">
                  workspace/main.{language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'java'}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={runCode}
                className="bg-primary px-3 py-1 flex-row items-center border border-emerald-400"
              >
                <Play size={10} color="#0F172A" fill="#0F172A" />
                <Text className="ml-1 text-[10px] font-black uppercase text-slate-900">Execute</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              multiline
              value={code}
              onChangeText={setCode}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              className="flex-1 p-6 font-mono text-sm text-emerald-400"
              style={{ textAlignVertical: 'top' }}
              placeholder="// Write code here..."
              placeholderTextColor="#1E293B"
            />
          </View>
        )}

        {activeTab === "CONSOLE" && (
          <View className="flex-1 bg-black p-6">
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <TerminalIcon size={14} color="#0F172A" />
                <Text className="ml-2 text-[10px] font-black text-primary uppercase tracking-[2px]">Terminal_Out</Text>
              </View>
              {isExecuting && <ActivityIndicator size="small" color="#0F172A" />}
            </View>
            
            <ScrollView>
              {terminalOutput.map((log, i) => (
                <Text key={i} className={`font-mono text-xs mb-2 ${
                  log.type === 'sys' ? 'text-slate-500' : 
                  log.type === 'proc' ? 'text-amber-500 italic' : 
                  'text-white'
                }`}>
                  [{new Date().toLocaleTimeString().split(' ')[0]}] {log.msg}
                </Text>
              ))}
              {!isExecuting && (
                <View className="h-4 w-2 bg-primary mt-2 animate-pulse" />
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* 4. FOOTER ACTIONS */}
      <View className="px-6 py-6 border-t-4 border-slate-900 flex-row gap-4 bg-white">
         <TouchableOpacity 
            onPress={() => setTerminalOutput([{ type: 'sys', msg: 'System_Reset_Complete' }])}
            className="flex-1 h-14 border-2 border-slate-900 items-center justify-center flex-row shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] bg-white active:translate-y-1 active:shadow-none"
          >
            <RotateCcw size={16} color="#0F172A" />
            <Text className="ml-2 text-xs font-black uppercase italic">Clear_Log</Text>
         </TouchableOpacity>
         
         <TouchableOpacity 
            className="flex-1 h-14 bg-slate-900 items-center justify-center flex-row shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-1 active:shadow-none"
          >
            <Activity size={16} color="#FFF" />
            <Text className="ml-2 text-xs font-black text-white uppercase italic">Push_Code</Text>
         </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}