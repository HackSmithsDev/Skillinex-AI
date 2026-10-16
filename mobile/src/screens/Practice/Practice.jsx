import React, { useState, useContext, useEffect, useCallback } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator 
} from 'react-native';
import { 
  Code2, Terminal as TerminalIcon, Cpu, 
  Play, RotateCcw, Activity, AlertCircle, RefreshCw 
} from "lucide-react-native";
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../../context/AuthContext';
import practiceService from '../../api/practiceService';
import { errorMessage } from '../../api/axios';
import useThemeColors from '../../theme/useThemeColors';

export default function Practice({ route }) {
  const { user } = useContext(AuthContext);
  const colors = useThemeColors();

  const [task, setTask] = useState(null);
  const [languages, setLanguages] = useState([{ id: 'python', label: 'PYTHON_3', course: 'practice' }]);
  const [language, setLanguage] = useState("python");
  const [activeTab, setActiveTab] = useState("EDITOR"); 
  const [code, setCode] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [loadingTask, setLoadingTask] = useState(true);
  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'sys', msg: 'Kernel_Initialized_v2.4' },
    { type: 'sys', msg: 'Awaiting_Task_Sync...' }
  ]);

  const log = (type, msg) => setTerminalOutput(prev => [...prev, { type, msg }]);

  // Load active task and supported languages dynamically
  const loadEnvironment = useCallback(async () => {
    setLoadingTask(true);
    try {
      const [langData, taskData] = await Promise.allSettled([
        practiceService.languages(),
        practiceService.getActiveTask ? practiceService.getActiveTask() : Promise.reject()
      ]);

      if (langData.status === 'fulfilled' && Array.isArray(langData.value) && langData.value.length) {
        const mapped = langData.value.map((i) => ({
          id: i.id,
          label: (i.display_name || i.id).toUpperCase(),
          course: i.origin || 'practice',
        }));
        setLanguages(mapped);
      }

      if (taskData.status === 'fulfilled' && taskData.value) {
        const t = taskData.value;
        setTask(t);
        setLanguage(t.language || 'python');
        setCode(t.starter_code || "");
        log('sys', `Target_Assigned: ${(t.title || 'ACTIVE_CHALLENGE').toUpperCase()}`);
      } else {
        // Fallback default starter
        setCode("# Implement your solution here\ndef solve():\n    return 1\n");
      }
    } catch (e) {
      log('proc', 'Task sync warning: Using local cache.');
    } finally {
      setLoadingTask(false);
    }
  }, []);

  useEffect(() => {
    loadEnvironment();
  }, [loadEnvironment]);

  // Handle switching language in editor
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (task && newLang === task.language) {
      setCode(task.starter_code);
    } else {
      setCode(`// Switched runtime to ${newLang}\n// Implement task logic below\n`);
    }
  };

  const runCode = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setActiveTab("CONSOLE");
    log('proc', `Compiling_${language.toUpperCase()}...`);

    try {
      const data = await practiceService.execute({
        raw_context: task?.topic || languages.find((l) => l.id === language)?.course || 'practice',
        language,
        code,
      });

      const stdout = data?.run?.stdout || '';
      const stderr = data?.run?.stderr || '';
      const isPassed = data?.run?.passed || stdout.trim() === '1' || stdout.trim().includes("SUCCESS");

      if (stdout) {
        log('res', stdout.trim());
      }
      if (stderr) {
        log('proc', stderr.trim());
      }

      if (isPassed) {
        log('sys', 'Verification Check Passed! Syncing XP...');
        const r = await practiceService.verifyLab({
          task_id: task?.task_id || 'general-task-01',
          course_id: task?.topic || 'general',
          success: true
        });
        if (r?.xp_awarded) {
          log('sys', `XP_SYNC +${r.xp_awarded} (Total: ${r.xp_points || 0} XP)`);
        }
      } else if (!stdout && !stderr) {
        log('sys', 'Execution completed without output.');
      }
    } catch (e) {
      log('proc', errorMessage(e, 'Kernel Panic: Remote execution timed out.'));
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
        <View className="flex-row items-center flex-1 mr-2">
          <View className="bg-primary p-2 border-2 border-primary shadow-[2px_2px_0px_0px_rgb(var(--primary))]">
            <Cpu size={18} className="text-primary-foreground" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-[9px] font-black uppercase tracking-[1px] text-subtle" numberOfLines={1}>
              {task?.topic ? task.topic.toUpperCase() : "ACTIVE_NODE"} // {user?.full_name?.split(' ')[0] || 'Operator'}
            </Text>
            <Text className="text-lg font-black uppercase italic text-foreground leading-5" numberOfLines={1}>
              {task?.title || "Practice_Lab"}
            </Text>
          </View>
        </View>

        {/* Dynamic Language Selector Container */}
        <View className="bg-primary border-2 border-primary h-10 px-2 flex-row items-center justify-center overflow-hidden">
          <Picker
            selectedValue={language}
            onValueChange={handleLanguageChange}
            style={{ color: colors['primary-foreground'], width: 140, transform: [{ scale: 0.8 }] }}
            dropdownIconColor={colors['primary-foreground']}
          >
            {languages.map((l) => (
              <Picker.Item key={l.id} label={l.label || l.id} value={l.id} />
            ))}
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
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <AlertCircle size={14} className="text-warning-strong" />
                  <Text className="ml-2 text-[10px] font-black text-warning-strong uppercase">
                    {task?.difficulty || "Active"} // Mission_Briefing
                  </Text>
                </View>
                <TouchableOpacity onPress={loadEnvironment} disabled={loadingTask}>
                  <RefreshCw size={14} className={loadingTask ? "text-warning-strong animate-spin" : "text-warning-strong"} />
                </TouchableOpacity>
              </View>
              <Text className="text-lg font-black text-foreground uppercase italic">
                {task?.title || "Operational Logic"}
              </Text>
            </View>
            
            <Text className="text-sm font-bold text-soft leading-5 mb-6">
              {task?.description || "Select a runtime from the top bar and complete the test logic required for this node."}
            </Text>
            
            {task?.target_criteria ? (
              <View className="bg-surface p-4 border-2 border-primary shadow-[4px_4px_0px_0px_rgb(var(--primary))] mb-8">
                <Text className="text-[10px] font-black text-subtle uppercase mb-2 underline">Validation Criteria</Text>
                <Text className="text-xs font-mono text-soft leading-5">
                  {task.target_criteria}
                </Text>
              </View>
            ) : null}
          </ScrollView>
        )}

        {activeTab === "EDITOR" && (
          <View className="flex-1 bg-inverse">
            {/* Editor Toolbar */}
            <View className="flex-row items-center justify-between px-4 py-2 bg-primary border-b border-card/10">
              <View className="flex-row items-center">
                <Code2 size={12} className="text-primary-foreground/70" />
                <Text className="ml-2 text-[10px] font-black text-primary-foreground/70 tracking-[1px] uppercase">
                  workspace/{language === 'python' ? 'main.py' : language === 'javascript' ? 'index.js' : `main.${language}`}
                </Text>
              </View>
              
              <TouchableOpacity 
                onPress={runCode}
                disabled={isExecuting}
                className="bg-primary px-3 py-1 flex-row items-center border border-success"
              >
                <Play size={10} fill="currentColor" className="text-success" />
                <Text className="ml-1 text-[10px] font-black uppercase text-primary-foreground">
                  {isExecuting ? 'Running...' : 'Execute'}
                </Text>
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
                <TerminalIcon size={14} className="text-primary-foreground" />
                <Text className="ml-2 text-[10px] font-black text-primary-foreground uppercase tracking-[2px]">Terminal_Out</Text>
              </View>
              {isExecuting && <ActivityIndicator size="small" color={colors['primary-foreground']} />}
            </View>
            
            <ScrollView>
              {terminalOutput.map((logItem, i) => (
                <Text key={i} className={`font-mono text-xs mb-2 ${
                  logItem.type === 'sys' ? 'text-muted-foreground' : 
                  logItem.type === 'proc' ? 'text-warning italic' : 
                  'text-primary-foreground'
                }`}>
                  [{new Date().toLocaleTimeString().split(' ')[0]}] {logItem.msg}
                </Text>
              ))}
              {!isExecuting && (
                <View className="h-4 w-2 bg-success mt-2 animate-pulse" />
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
            <Text className="ml-2 text-xs font-black uppercase italic text-foreground">Clear_Log</Text>
         </TouchableOpacity>
         
         <TouchableOpacity 
            onPress={runCode}
            disabled={isExecuting}
            className="flex-1 h-14 bg-primary items-center justify-center flex-row shadow-[4px_4px_0px_0px_rgb(var(--primary))] active:translate-y-1 active:shadow-none"
          >
            {isExecuting ? (
              <ActivityIndicator color={colors['primary-foreground']} />
            ) : (
              <>
                <Activity size={16} className="text-primary-foreground" />
                <Text className="ml-2 text-xs font-black text-primary-foreground uppercase italic">Push_Code</Text>
              </>
            )}
         </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}