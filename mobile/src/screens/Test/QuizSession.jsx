import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { ArrowRight, Zap, Info, ShieldCheck } from "lucide-react-native";
import quizService from '../../api/quizService';
import { errorMessage } from '../../api/axios';
import useThemeColors from '../../theme/useThemeColors';

const { width } = Dimensions.get('window');

export default function QuizSession({ navigation, route }) {
  const colors = useThemeColors();
  const testData = route.params?.testData;
  const [questions, setQuestions] = useState(testData?.questions || []);
  const [meta, setMeta] = useState({ session_id: testData?.session_id, node_name: testData?.node_name });
  const [loading, setLoading] = useState(!testData);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (testData) return;
    Alert.alert('No active session', 'Initialize an assessment first.');
    navigation.goBack();
  }, []);

  const totalQuestions = questions.length;
  const currentStep = currentIndex + 1;
  const progressWidth = totalQuestions ? (currentStep / totalQuestions) * 100 : 0;
  const q = questions[currentIndex];
  const options = q ? [q.option1, q.option2, q.option3, q.option4].filter(Boolean) : [];
  const selectedOption = answers[currentIndex] !== undefined ? options.indexOf(answers[currentIndex]) : null;
  const hasSelection = selectedOption !== null && selectedOption >= 0;

  const setSelectedOption = (i) => setAnswers((prev) => ({ ...prev, [currentIndex]: options[i] }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const correct = questions.reduce((acc, item, idx) => acc + (answers[idx] === item.answer ? 1 : 0), 0);
      const score = Math.round((correct / questions.length) * 100);
      const result = await quizService.submit(meta.session_id, {
        node_name: meta.node_name,
        score,
        total_questions: questions.length,
        analysis: { difficulty: testData?.depth || 'General', completed_at: new Date().toISOString() },
      });
      navigation.replace('TestResult', {
        result, score, hits: `${correct}/${questions.length}`, xp: score * 2,
        questions, answers, courseId: meta.node_name,
      });
    } catch (e) {
      Alert.alert('Sync failed', errorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!hasSelection || submitting) return;
    if (currentIndex < totalQuestions - 1) setCurrentIndex((p) => p + 1);
    else handleSubmit();
  };

  if (!q) {
    return (
      <SafeAreaView className="flex-1 bg-card items-center justify-center">
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-card">
      {/* 1. NEURAL PROGRESS HEADER */}
      <View className="px-8 pt-6 pb-6 border-b-2 border-muted">
        <View className="flex-row justify-between items-end mb-6">
          <View>
            <View className="flex-row items-center mb-1">
              <ShieldCheck size={12} strokeWidth={3} className="text-primary" />
              <Text className="ml-2 text-[10px] font-black text-primary uppercase tracking-[0.3em]">Neural_Sync_Active</Text>
            </View>
            <Text className="text-4xl font-black text-foreground italic uppercase tracking-tighter">Assessment</Text>
          </View>
          <View className="bg-primary px-4 py-2 border-b-4 border-primary">
            <Text className="text-[12px] font-black text-primary-foreground italic">
              {currentStep.toString().padStart(2, '0')} / {totalQuestions.toString().padStart(2, '0')}
            </Text>
          </View>
        </View>
        
        {/* Progress Track - Hardware Style */}
        <View className="h-4 bg-muted w-full border-2 border-primary p-[2px]">
          <View 
            style={{ width: `${progressWidth}%` }}
            className="h-full bg-primary"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8">
        {/* 2. QUESTION STAGE */}
        <View className="py-12">
          <View className="flex-row items-start mb-10">
            {/* FIXED: Zap icon text-primary -> text-primary-foreground */}
            <View className="bg-primary p-2 mt-1 shadow-[3px_3px_0px_0px_rgb(var(--success))]">
                <Zap size={20} strokeWidth={3} className="text-primary-foreground" />
            </View>
            <Text className="ml-5 text-2xl font-black text-foreground leading-tight uppercase italic tracking-tighter flex-1">
              {q.question}
            </Text>
          </View>

          {/* OPTIONS STACK */}
          <View className="space-y-4">
            {options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.8}
                onPress={() => setSelectedOption(i)}
                className={`flex-row items-center p-6 border-2 transition-all ${
                  selectedOption === i 
                  ? 'border-primary bg-primary shadow-[4px_4px_0px_0px_rgb(var(--success))]' 
                  : 'border-muted bg-card'
                }`}
              >
                {/* FIXED: Selected checkbox inner indicator bg-primary -> bg-primary-foreground */}
                <View className={`h-6 w-6 border-2 items-center justify-center ${
                  selectedOption === i ? 'border-primary-foreground bg-primary' : 'border-border bg-card'
                }`}>
                  {selectedOption === i && <View className="h-3 w-3 bg-primary-foreground" />}
                </View>

                <Text className={`ml-5 text-xs font-black uppercase tracking-widest flex-1 ${
                  selectedOption === i ? 'text-primary-foreground' : 'text-subtle'
                }`}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 3. TACTICAL ACTION FOOTER */}
      <View className="p-8 border-t-4 border-primary bg-surface">
        <View className="flex-row items-center mb-6">
          <Info size={14} className={hasSelection ? "text-primary" : "text-subtle"} />
          <Text className={`ml-3 text-[9px] font-black uppercase tracking-widest ${
             hasSelection ? 'text-foreground' : 'text-subtle'
          }`}>
            {hasSelection ? "Parameter_Selected: Confirm_Submission" : "Select_Node_to_Proceed"}
          </Text>
        </View>

        {/* FIXED: Footer CTA button text and icon contrast classes */}
        <TouchableOpacity
          disabled={!hasSelection || submitting}
          onPress={handleNext}
          activeOpacity={0.9}
          className={`h-20 flex-row items-center justify-center border-b-8 shadow-2xl ${
            hasSelection ? 'bg-primary border-subtle' : 'bg-border border-line-strong'
          }`}
        >
          {submitting ? (
            <ActivityIndicator color={colors['primary-foreground']} />
          ) : (
            <>
              <Text className={`text-sm font-black uppercase tracking-[0.4em] italic ${
                hasSelection ? 'text-primary-foreground' : 'text-subtle'
              }`}>
                {currentStep === totalQuestions ? "Finalize_Sync" : "Next_Node"}
              </Text>
              <ArrowRight size={20} className={`ml-4 ${hasSelection ? "text-primary-foreground" : "text-subtle"}`} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}