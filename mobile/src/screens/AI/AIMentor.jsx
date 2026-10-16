import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowLeft, Bot, Plus, Send, ThumbsDown, ThumbsUp } from 'lucide-react-native';
import aiService from '../../api/aiService';
import { errorMessage } from '../../api/axios';
import useThemeColors from '../../theme/useThemeColors';

export default function AIMentor({ navigation, route }) {
  const colors = useThemeColors();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const lectureTitle = route.params?.lectureTitle;

  const createSession = useCallback(async () => {
    if (creating || sending) return;
    setCreating(true);
    try {
      const title = lectureTitle ? `Mentorship: ${lectureTitle}` : undefined;
      const session = await aiService.createSession(title);
      setSessions((previous) => [session, ...previous.filter((item) => item.id !== session.id)]);
      setActiveSession(session);
      setMessages(session.messages || []);
    } catch (error) {
      Alert.alert('Mentor unavailable', errorMessage(error, 'Could not start a mentor session.'));
    } finally {
      setCreating(false);
    }
  }, [creating, lectureTitle, sending]);

  useEffect(() => {
    let mounted = true;

    const loadSessions = async () => {
      setLoading(true);
      try {
        const data = await aiService.sessions();
        if (!mounted) return;
        const availableSessions = Array.isArray(data) ? data : [];
        setSessions(availableSessions);

        const requested = availableSessions.find((item) => item.id === route.params?.sessionId);
        const latest = availableSessions[0];
        const selected = requested || (!lectureTitle ? latest : null);
        if (selected) {
          setActiveSession(selected);
          setMessages(selected.messages || []);
        } else {
          const title = lectureTitle ? `Mentorship: ${lectureTitle}` : undefined;
          const session = await aiService.createSession(title);
          if (!mounted) return;
          setSessions((previous) => [session, ...previous]);
          setActiveSession(session);
          setMessages(session.messages || []);
        }
      } catch (error) {
        if (mounted) Alert.alert('Mentor unavailable', errorMessage(error, 'Could not load mentor sessions.'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSessions();
    return () => { mounted = false; };
  }, [lectureTitle, route.params?.sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, sending]);

  const selectSession = (session) => {
    setActiveSession(session);
    setMessages(session.messages || []);
  };

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || !activeSession || sending) return;

    setDraft('');
    setSending(true);
    const pendingId = `pending-${Date.now()}`;
    setMessages((previous) => [...previous, { id: pendingId, role: 'user', content }]);
    try {
      const response = await aiService.sendMessage(activeSession.id, content);
      const userMessage = { id: pendingId, role: 'user', content };
      setMessages((previous) => [
        ...previous.filter((message) => message.id !== pendingId),
        userMessage,
        response,
      ]);
      setSessions((previous) => previous.map((session) => (
        session.id === activeSession.id
          ? { ...session, messages: [...(session.messages || []), userMessage, response] }
          : session
      )));
    } catch (error) {
      setMessages((previous) => previous.filter((message) => message.id !== pendingId));
      setDraft((previous) => previous || content);
      Alert.alert('Answer failed', errorMessage(error, 'The mentor could not answer. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  const rateMessage = async (message, helpful) => {
    if (!message.id || message.is_helpful === true || message.is_helpful === false) return;
    try {
      await aiService.rateMessage(message.id, helpful);
      const update = (items) => items.map((item) => (
        item.id === message.id ? { ...item, is_helpful: helpful } : item
      ));
      setMessages(update);
      setSessions((previous) => previous.map((session) => (
        session.id === activeSession?.id
          ? { ...session, messages: update(session.messages || []) }
          : session
      )));
    } catch (error) {
      Alert.alert('Feedback failed', errorMessage(error, 'Could not save your feedback.'));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-card">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View className="px-5 py-4 border-b-2 border-primary flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="h-10 w-10 border-2 border-primary items-center justify-center"
          >
            <ArrowLeft size={20} className="text-primary" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Bot size={20} className="text-primary" />
            <Text className="ml-2 text-xs font-black uppercase tracking-widest text-foreground">AI Mentor</Text>
          </View>
          <TouchableOpacity
            onPress={createSession}
            disabled={loading || creating || sending}
            accessibilityRole="button"
            accessibilityLabel="Start a new mentor session"
            className="h-10 w-10 bg-primary items-center justify-center"
          >
            {creating
              ? <ActivityIndicator size="small" color={colors['primary-foreground']} />
              : <Plus size={20} className="text-primary-foreground" />}
          </TouchableOpacity>
        </View>

        {sessions.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
            className="max-h-14 border-b border-muted"
          >
            {sessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                onPress={() => selectSession(session)}
                disabled={sending}
                className={`mr-2 px-3 py-2 border ${activeSession?.id === session.id ? 'bg-primary border-primary' : 'bg-card border-muted'}`}
              >
                <Text
                  numberOfLines={1}
                  className={`max-w-40 text-label font-black uppercase ${activeSession?.id === session.id ? 'text-primary-foreground' : 'text-foreground'}`}
                >
                  {session.title || 'Mentorship Session'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <ScrollView
          ref={scrollRef}
          className="flex-1 px-5"
          contentContainerStyle={{ flexGrow: 1, paddingVertical: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={colors.primary} />
              <Text className="mt-3 text-compact font-black uppercase text-subtle">Connecting to mentor</Text>
            </View>
          ) : messages.length === 0 ? (
            <View className="flex-1 items-center justify-center px-8">
              <Bot size={42} className="text-primary" />
              <Text className="mt-5 text-center text-sm font-black uppercase text-foreground">Ask the AI Mentor</Text>
              <Text className="mt-2 text-center text-xs leading-5 text-subtle">
                Get help with concepts, code, and the next steps in your learning.
              </Text>
            </View>
          ) : messages.map((message) => (
            <View
              key={message.id}
              className={`mb-4 max-w-content p-4 ${message.role === 'user' ? 'self-end bg-primary' : 'self-start border-2 border-muted bg-surface'}`}
            >
              <Text className={`text-xs leading-5 ${message.role === 'user' ? 'font-bold text-primary-foreground' : 'text-foreground'}`}>
                {message.content}
              </Text>
              {message.role === 'assistant' && message.id && (
                <View className="mt-3 flex-row items-center border-t border-muted pt-2">
                  <Text className="mr-3 text-label font-bold text-subtle">Helpful?</Text>
                  <TouchableOpacity
                    onPress={() => rateMessage(message, true)}
                    disabled={message.is_helpful === true || message.is_helpful === false}
                    accessibilityRole="button"
                    accessibilityLabel="This answer was helpful"
                    className="mr-3 p-1"
                  >
                    <ThumbsUp size={15} className={message.is_helpful === true ? 'text-success' : 'text-subtle'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => rateMessage(message, false)}
                    disabled={message.is_helpful === true || message.is_helpful === false}
                    accessibilityRole="button"
                    accessibilityLabel="This answer was not helpful"
                    className="p-1"
                  >
                    <ThumbsDown size={15} className={message.is_helpful === false ? 'text-danger' : 'text-subtle'} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
          {sending && (
            <View className="self-start mb-4 p-4 border-2 border-muted bg-surface">
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        </ScrollView>

        <View className="p-4 border-t-2 border-muted flex-row items-end bg-card">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={sendMessage}
            editable={!loading && !sending && Boolean(activeSession)}
            placeholder="Ask your question..."
            placeholderTextColor={colors.subtle}
            returnKeyType="send"
            className="flex-1 min-h-12 max-h-28 px-4 py-3 border-2 border-primary text-foreground"
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={loading || sending || !activeSession || !draft.trim()}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            className={`ml-2 h-12 w-12 items-center justify-center ${draft.trim() && !sending ? 'bg-primary' : 'bg-muted'}`}
          >
            {sending
              ? <ActivityIndicator size="small" color={colors['primary-foreground']} />
              : <Send size={18} className={draft.trim() ? 'text-primary-foreground' : 'text-subtle'} />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
