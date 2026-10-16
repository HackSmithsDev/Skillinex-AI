import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
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
import { nativeTheme, useThemeColors } from '../../theme/useThemeColors';

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
  const [taskSyncStatus, setTaskSyncStatus] = useState('');
  const taskPollRef = useRef(null);
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

      const mappedLanguages = langData.status === 'fulfilled' && Array.isArray(langData.value)
        ? langData.value.map((i) => ({
          id: i.id,
          label: (i.display_name || i.id).toUpperCase(),
          course: i.origin || 'practice',
        }))
        : [];

      if (langData.status === 'fulfilled' && Array.isArray(langData.value) && langData.value.length) {
        setLanguages(mappedLanguages);
      }

      if (taskData.status === 'fulfilled' && taskData.value) {
        const t = taskData.value;
        if (t.language && !mappedLanguages.some((item) => item.id === t.language)) {
          setLanguages((previous) => [
            ...previous.filter((item) => item.id !== t.language),
            { id: t.language, label: t.language.toUpperCase(), course: 'Active Lab Runtime' },
          ]);
        }
        setTask(t);
        setLanguage(t.language || 'python');
        setCode(t.starter_code || "");
        setTaskSyncStatus(t.is_bootstrap
          ? 'Challenge generation is still in progress.'
          : t.generation_error ? 'AI generation is unavailable. A fallback challenge is ready.' : '');
        log('sys', `Target_Assigned: ${(t.title || 'ACTIVE_CHALLENGE').toUpperCase()}`);
      } else {
        // Fallback default starter
        setCode("# Implement your solution here\ndef solve():\n    return 1\n");
        setTaskSyncStatus('Challenge unavailable. Refresh to retry.');
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

  useEffect(() => {
    if (!task?.is_bootstrap) return undefined;

    let cancelled = false;
    const poll = async () => {
      try {
        const nextTask = await practiceService.getActiveTask(task.topic);
        if (cancelled) return;
        if (nextTask && !nextTask.is_bootstrap) {
          setTask(nextTask);
          setLanguage(nextTask.language || 'python');
          setCode(nextTask.starter_code || '');
          setLanguages((previous) => previous.some((item) => item.id === nextTask.language)
            ? previous
            : [...previous, {
              id: nextTask.language,
              label: nextTask.language.toUpperCase(),
              course: 'Active Lab Runtime',
            }]);
          setTaskSyncStatus(nextTask.generation_error
            ? 'AI generation is unavailable. A fallback challenge is ready.'
            : '');
          log('sys', nextTask.generation_error
            ? 'AI_Generation_Unavailable: Fallback_Challenge_Ready'
            : 'Challenge_Synchronized');
          return;
        }
        setTaskSyncStatus('Challenge generation is still in progress.');
      } catch {
        if (!cancelled) setTaskSyncStatus('Challenge sync failed. Retrying...');
      }
      if (!cancelled) taskPollRef.current = setTimeout(poll, 5000);
    };

    taskPollRef.current = setTimeout(poll, 5000);
    return () => {
      cancelled = true;
      if (taskPollRef.current) clearTimeout(taskPollRef.current);
    };
  }, [task]);

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
      const isPassed = data?.run?.passed === true;

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
      } else if (task && language !== task.language) {
        log('sys', `Challenge verification requires ${task.language}. No XP awarded.`);
      } else if (task) {
        log('proc', 'Challenge checks failed. Review the output and try again.');
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
          <View className="bg-primary p-2 border-2 border-primary shadow-offset-primary-sm">
            <Cpu size={18} className="text-primary-foreground" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-label font-black uppercase tracking-compact text-subtle" numberOfLines={1}>
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
            style={{ ...nativeTheme.controls.compilerPicker, color: colors['primary-foreground'] }}
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
            <Text className={`text-compact font-black ${activeTab === tab ? 'text-primary-foreground' : 'text-subtle'}`}>
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
                  <Text className="ml-2 text-compact font-black text-warning-strong uppercase">
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
              <View className="bg-surface p-4 border-2 border-primary shadow-offset-primary mb-8">
                <Text className="text-compact font-black text-subtle uppercase mb-2 underline">Validation Criteria</Text>
                <Text className="text-xs font-mono text-soft leading-5">
                  {task.target_criteria}
                </Text>
              </View>
            ) : null}
            {taskSyncStatus ? (
              <Text className="mb-4 text-xs font-bold text-warning-strong">{taskSyncStatus}</Text>
            ) : null}
          </ScrollView>
        )}

        {activeTab === "EDITOR" && (
          <View className="flex-1 bg-inverse">
            {/* Editor Toolbar */}
            <View className="flex-row items-center justify-between px-4 py-2 bg-primary border-b border-card/10">
              <View className="flex-row items-center">
                <Code2 size={12} className="text-primary-foreground/70" />
                <Text className="ml-2 text-compact font-black text-primary-foreground/70 tracking-compact uppercase">
                  workspace/{language === 'python' ? 'main.py' : language === 'javascript' ? 'index.js' : `main.${language}`}
                </Text>
              </View>
              
              <TouchableOpacity 
                onPress={runCode}
                disabled={isExecuting || loadingTask || task?.is_bootstrap}
                className="bg-primary px-3 py-1 flex-row items-center border border-success"
              >
                <Play size={10} fill="currentColor" className="text-success" />
                <Text className="ml-1 text-compact font-black uppercase text-primary-foreground">
                  {isExecuting ? 'Running...' : 'Execute'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              multiline
              value={code}
              onChangeText={setCode}
              editable={!task?.is_bootstrap}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              className="flex-1 p-6 font-mono text-sm text-success"
              style={nativeTheme.controls.multilineInput}
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
                <Text className="ml-2 text-compact font-black text-primary-foreground uppercase tracking-wide">Terminal_Out</Text>
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
            className="flex-1 h-14 border-2 border-primary items-center justify-center flex-row shadow-offset-primary bg-card active:translate-y-1 active:shadow-none"
          >
            <RotateCcw size={16} className="text-primary" />
            <Text className="ml-2 text-xs font-black uppercase italic text-foreground">Clear_Log</Text>
         </TouchableOpacity>
         
         <TouchableOpacity 
            onPress={runCode}
            disabled={isExecuting || loadingTask || task?.is_bootstrap}
            className="flex-1 h-14 bg-primary items-center justify-center flex-row shadow-offset-primary active:translate-y-1 active:shadow-none"
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