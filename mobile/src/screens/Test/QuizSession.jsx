import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import { ArrowRight, Zap, Info, ShieldCheck } from "lucide-react-native";

const { width } = Dimensions.get('window');

export default function QuizSession({ navigation }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const totalQuestions = 10;
  
  // Calculate progress for the bar
  const progressWidth = (currentStep / totalQuestions) * 100;

  const options = [
    "Step size for optimization",
    "Number of hidden layers",
    "Input data volume",
    "Activation function type"
  ];

  const handleNext = () => {
    if (selectedOption === null) return;

    if (currentStep < totalQuestions) {
      setCurrentStep(prev => prev + 1);
      setSelectedOption(null);
    } else {
      navigation.navigate("TestResult");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 1. NEURAL PROGRESS HEADER */}
      <View className="px-8 pt-6 pb-6 border-b-2 border-slate-100">
        <View className="flex-row justify-between items-end mb-6">
          <View>
            <View className="flex-row items-center mb-1">
              <ShieldCheck size={12} color="#0F172A" strokeWidth={3} />
              <Text className="ml-2 text-[10px] font-black text-primary uppercase tracking-[0.3em]">Neural_Sync_Active</Text>
            </View>
            <Text className="text-4xl font-black text-slate-900 italic uppercase tracking-tighter">Assessment</Text>
          </View>
          <View className="bg-slate-900 px-4 py-2 border-b-4 border-primary">
            <Text className="text-[12px] font-black text-white italic">
              {currentStep.toString().padStart(2, '0')} / {totalQuestions.toString().padStart(2, '0')}
            </Text>
          </View>
        </View>
        
        {/* Progress Track - Hardware Style */}
        <View className="h-4 bg-slate-100 w-full border-2 border-slate-900 p-[2px]">
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
            <View className="bg-slate-900 p-2 mt-1 shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]">
                <Zap size={20} color="#0F172A" strokeWidth={3} />
            </View>
            <Text className="ml-5 text-2xl font-black text-slate-900 leading-tight uppercase italic tracking-tighter flex-1">
              Which of the following best describes the "Learning Rate" in a Neural Network?
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
                  ? 'border-slate-900 bg-slate-900 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]' 
                  : 'border-slate-100 bg-white'
                }`}
              >
                {/* Custom Square Checkbox */}
                <View className={`h-6 w-6 border-2 items-center justify-center ${
                  selectedOption === i ? 'border-primary bg-primary' : 'border-slate-200 bg-white'
                }`}>
                  {selectedOption === i && <View className="h-3 w-3 bg-slate-900" />}
                </View>

                <Text className={`ml-5 text-xs font-black uppercase tracking-widest flex-1 ${
                  selectedOption === i ? 'text-white' : 'text-slate-400'
                }`}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 3. TACTICAL ACTION FOOTER */}
      <View className="p-8 border-t-4 border-slate-900 bg-slate-50">
        <View className="flex-row items-center mb-6">
          <Info size={14} color={selectedOption !== null ? "#0F172A" : "#94A3B8"} />
          <Text className={`ml-3 text-[9px] font-black uppercase tracking-widest ${
             selectedOption !== null ? 'text-slate-900' : 'text-slate-400'
          }`}>
            {selectedOption !== null ? "Parameter_Selected: Confirm_Submission" : "Select_Node_to_Proceed"}
          </Text>
        </View>

        <TouchableOpacity
          disabled={selectedOption === null}
          onPress={handleNext}
          activeOpacity={0.9}
          className={`h-20 flex-row items-center justify-center border-b-8 shadow-2xl ${
            selectedOption !== null ? 'bg-primary border-slate-400' : 'bg-slate-200 border-slate-300'
          }`}
        >
          <Text className={`text-sm font-black uppercase tracking-[0.4em] italic ${
            selectedOption !== null ? 'text-slate-900' : 'text-slate-400'
          }`}>
            {currentStep === totalQuestions ? "Finalize_Sync" : "Next_Node"}
          </Text>
          <ArrowRight size={20} color={selectedOption !== null ? "#0F172A" : "#94A3B8"} className="ml-4" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}