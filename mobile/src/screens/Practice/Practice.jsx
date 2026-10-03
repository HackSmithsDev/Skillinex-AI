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
import { AuthContext } from '../../context/AuthContext';
import practiceService from '../../api/practiceService';
import { errorMessage } from '../../api/axios';
import useThemeColors from '../../theme/useThemeColors';

const { width } = Dimensions.get('window');

export default function Practice() {
  const { user } = useContext(AuthContext);
  const colors = useThemeColors();
  const [languages, setLanguages] = useState([{ id: 'python', label: 'PYTHON_3', course: 'practice' }]);
  const [language, setLanguage] = useState("python");
  const [activeTab, setActiveTab] = useState("EDITOR"); 
  const [code, setCode] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'sys', msg: 'Kernel_Initialized_v2.4' },
    { type: 'sys', msg: 'Awaiting_Sync...' }
  ]);

  useEffect(() => {
    practiceService.languages().then((data) => {
      if (Array.isArray(data) && data.length) {
        setLanguages(data.map((i) => ({ id: i.id, label: i.display_name || i.id, course: i.origin || 'practice' })));
        setLanguage((cur) => (data.some((i) => i.id === cur) ? cur : data[0].id));
      }
    }).catch(() => {});
  }, []);

  // Boilerplate logic based on language
  useEffect(() => {
    const templates = {
      python: "def and_gate_logic(a, b):\n    # TODO: Implement AND logic\n    return 0",
      java: "public class Main {\n    public static int andGate(int a, int b) {\n        return 0;\n    }\n}",
      cpp: "int andGate(int a, int b) {\n    return 0;\n}"
    };
    setCode(templates[language] || `// ${language}`);
  }, [language]);

  const log = (type, msg) => setTerminalOutput(prev => [...prev, { type, msg }]);

  const runCode = async () => {
    setIsExecuting(true);
    setActiveTab("CONSOLE");
    log('proc', `Compiling_${language.toUpperCase()}...`);
    try {
      const data = await practiceService.execute({
        raw_context: languages.find((l) => l.id === language)?.course || 'practice',
        language,
        code,
      });
      const stdout = data?.run?.stdout || '';
      const stderr = data?.run?.stderr || '';
      if (stdout) {
        log('res', stdout.trim());
        if (stdout.trim() === '1') {
          practiceService.verifyLab({ task_id: 'logic-gate-01', course_id: 'cse-ai-ml', success: true })
            .then((r) => r?.xp_awarded && log('sys', `XP_SYNC +${r.xp_awarded}`))
            .catch(() => {});
        }
      }
      if (stderr) log('proc', stderr.trim());
      if (!stdout && !stderr) log('sys', 'Execution completed without output.');
    } catch (e) {
      log('proc', errorMessage(e, 'Kernel Panic: Connection lost.'));
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-card"
    >
      {/* 1. TOP STATUS BAR */}
      <View className="px-6 pt-14 pb-4 border-b-4 border-primary flex-row justify-between items-center bg-card">
        <View className="flex-row items-center">
          <View className="bg-primary p-2 border-2 border-primary shadow-[2px_2px_0px_0px_rgb(var(--primary))]">
            <Cpu size={18} className="text-primary" />
          </View>
          <View className="ml-3">
            <Text className="text-[10px] font-black uppercase tracking-[1px] text-subtle">Node: {user?.full_name?.split(' ')[0] || 'Guest'}</Text>
            <Text className="text-xl font-black uppercase italic text-foreground leading-5">Practice_Lab</Text>
          </View>
        </View>

        {/* Language Selector Container */}
        <View className="bg-primary border-2 border-primary h-10 px-2 flex-row items-center justify-center overflow-hidden">
          <Picker
            selectedValue={language}
            onValueChange={(itemValue) => setLanguage(itemValue)}
            style={{ color: colors['primary-foreground'], width: 140, transform: [{ scale: 0.8 }] }}
            dropdownIconColor={colors['primary-foreground']}
          >
            {languages.map((l) => <Picker.Item key={l.id} label={l.label} value={l.id} />)}
          </Picker>
        </View>
      </View>

      {/* 2. NAVIGATION TABS */}
      <View className="flex-row border-b-2 border-primary">
        {["INSTRUCTIONS", "EDITOR", "CONSOLE"].map((tab) => (
          <TouchableOpacity 
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-4 items-center border-r border-border last:border-r-0 ${activeTab === tab ? 'bg-primary' : 'bg-card'}`}
          >
            <Text className={`text-[10px] font-black ${activeTab === tab ? 'text-primary-foreground' : 'text-subtle'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 3. WORKSPACE CONTENT */}
      <View className="flex-1">
        {activeTab === "INSTRUCTIONS" && (
          <ScrollView className="p-6">
            <View className="bg-warning-soft border-2 border-warning p-4 mb-6">
              <View className="flex-row items-center mb-2">
                <AlertCircle size={14} className="text-warning-strong" />
                <Text className="ml-2 text-[10px] font-black text-warning-strong uppercase">Mission_Briefing</Text>
              </View>
              <Text className="text-lg font-black text-foreground uppercase italic">AND_Gate_Logic</Text>
            </View>
            
            <Text className="text-sm font-bold text-soft leading-5 mb-4">
              Your objective is to implement the fundamental AND logic gate. This gate serves as the bedrock of digital circuitry.
            </Text>
            
            <View className="bg-surface p-4 border-2 border-primary shadow-[4px_4px_0px_0px_rgb(var(--primary))] mb-8">
              <Text className="text-[10px] font-black text-subtle uppercase mb-2 underline">Truth Table Check</Text>
              <Text className="text-xs font-mono text-soft leading-5">
                Input A: 1, Input B: 1 {"->"} Output: 1{"\n"}
                Input A: 1, Input B: 0 {"->"} Output: 0{"\n"}
                Input A: 0, Input B: 0 {"->"} Output: 0
              </Text>
            </View>
          </ScrollView>
        )}

        {activeTab === "EDITOR" && (
          <View className="flex-1 bg-inverse">
            {/* Editor Toolbar */}
            <View className="flex-row items-center justify-between px-4 py-2 bg-primary border-b border-card/10">
              <View className="flex-row items-center">
                <Code2 size={12} className="text-primary" />
                <Text className="ml-2 text-[10px] font-black text-primary-foreground/50 tracking-[1px] uppercase">
                  workspace/main.{language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'java'}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={runCode}
                className="bg-primary px-3 py-1 flex-row items-center border border-success"
              >
                <Play size={10} fill="currentColor" className="text-primary" />
                <Text className="ml-1 text-[10px] font-black uppercase text-foreground">Execute</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              multiline
              value={code}
              onChangeText={setCode}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              className="flex-1 p-6 font-mono text-sm text-success"
              style={{ textAlignVertical: 'top' }}
              placeholder="// Write code here..."
              placeholderClassName="text-primary-hover"
            />
          </View>
        )}

        {activeTab === "CONSOLE" && (
          <View className="flex-1 bg-inverse p-6">
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <TerminalIcon size={14} className="text-primary" />
                <Text className="ml-2 text-[10px] font-black text-primary uppercase tracking-[2px]">Terminal_Out</Text>
              </View>
              {isExecuting && <ActivityIndicator size="small" className="text-primary" />}
            </View>
            
            <ScrollView>
              {terminalOutput.map((log, i) => (
                <Text key={i} className={`font-mono text-xs mb-2 ${
                  log.type === 'sys' ? 'text-muted-foreground' : 
                  log.type === 'proc' ? 'text-warning italic' : 
                  'text-primary-foreground'
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
      <View className="px-6 py-6 border-t-4 border-primary flex-row gap-4 bg-card">
         <TouchableOpacity 
            onPress={() => setTerminalOutput([{ type: 'sys', msg: 'System_Reset_Complete' }])}
            className="flex-1 h-14 border-2 border-primary items-center justify-center flex-row shadow-[4px_4px_0px_0px_rgb(var(--primary))] bg-card active:translate-y-1 active:shadow-none"
          >
            <RotateCcw size={16} className="text-primary" />
            <Text className="ml-2 text-xs font-black uppercase italic">Clear_Log</Text>
         </TouchableOpacity>
         
         <TouchableOpacity 
            className="flex-1 h-14 bg-primary items-center justify-center flex-row shadow-[4px_4px_0px_0px_rgb(var(--primary))] active:translate-y-1 active:shadow-none"
          >
            <Activity size={16} className="text-primary-foreground" />
            <Text className="ml-2 text-xs font-black text-primary-foreground uppercase italic">Push_Code</Text>
         </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}