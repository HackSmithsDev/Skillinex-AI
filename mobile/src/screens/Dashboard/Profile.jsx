import React, { useState, useContext, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, 
  Image, ActivityIndicator, TextInput, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { 
  Camera, ChevronLeft, ChevronRight, 
  Terminal, ShieldCheck, LogOut, 
  Zap, Settings, Cpu, Layers, Trash2
} from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import { resolveMediaUrl, errorMessage } from '../../api/axios';
import userService from '../../api/userService';
import useThemeColors from '../../theme/useThemeColors';

export default function Profile({ navigation }) {
  const { user, logout, fetchUser } = useContext(AuthContext);
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [dash, setDash] = useState(null);
  const [ach, setAch] = useState(null);
  const [panel, setPanel] = useState(null);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [comment, setComment] = useState('');
  const [purgePw, setPurgePw] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    userService.dashboard().then(setDash).catch(() => {});
    userService.achievements().then(setAch).catch(() => {});
  }, []);

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Permission required', 'Allow photo access to change your avatar.');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (res.canceled) return;
    const asset = res.assets[0];
    setLoading(true);
    try {
      await userService.uploadAvatar({ uri: asset.uri, name: asset.fileName || 'avatar.jpg', type: asset.mimeType || 'image/jpeg' });
      await fetchUser();
    } catch (e) {
      Alert.alert('Upload failed', errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const submitPanel = async () => {
    setBusy(true);
    try {
      if (panel === 'password') {
        await userService.changePassword({ old_password: oldPw, new_password: newPw });
        setOldPw(''); setNewPw('');
        Alert.alert('Updated', 'Password changed.');
      } else if (panel === 'delete') {
        if (!purgePw) { Alert.alert('Password required', 'Enter your password to authorize termination.'); return; }
        await userService.deleteAccount(purgePw);
        setPurgePw('');
        await logout();
        return;
      } else {
        await userService.sendFeedback(comment.trim());
        setComment('');
        Alert.alert('Sent', 'Feedback received.');
      }
      setPanel(null);
    } catch (e) {
      Alert.alert('Failed', errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    try { await userService.logout(); } catch (e) {}
    logout();
  };

  const level = Math.floor((user?.xp_points || 0) / 100) + 1;
  const systemMetrics = [
    { label: "SKILLS", value: ach?.skills?.length ?? 0, bar: 'bg-success' },
    { label: "BADGES", value: ach?.badges?.filter((b) => b.earned).length ?? 0, bar: 'bg-highlight' },
    { label: "RANK", value: ach?.rank?.split(' ')[0] || '—', bar: 'bg-brand' },
  ];
  const stack = Object.entries(user?.tech_stack || {});
  const avatarUri = resolveMediaUrl(user?.photo_url) || `https://api.dicebear.com/7.x/bottts-neutral/png?seed=${user?.email}`;

  return (
    <View className="flex-1 bg-card">
      {/* 1. TOP NAVIGATION NAV-BAR */}
      <View className="px-6 pt-14 pb-4 border-b-4 border-primary flex-row justify-between items-center bg-card">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          className="h-10 w-10 border-2 border-primary items-center justify-center bg-card shadow-[2px_2px_0px_0px_rgb(var(--primary))]"
        >
          <ChevronLeft size={20} strokeWidth={3} className="text-primary" />
        </TouchableOpacity>
        
        <Text className="text-[10px] font-black uppercase tracking-[3px] text-foreground">
          User_Protocol_v4.0
        </Text>

        <TouchableOpacity 
          activeOpacity={0.8}
          className="h-10 w-10 border-2 border-primary items-center justify-center bg-primary"
        >
          <Settings size={18} className="text-primary-foreground" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* 2. IDENTITY HEADER */}
        <View className="px-8 pt-10 pb-8 bg-surface border-b-2 border-border">
          <View className="flex-row items-center mb-4">
            <View className="h-2 w-2 bg-primary mr-3 animate-pulse" />
            <Text className="text-[9px] font-black uppercase tracking-[2px] text-subtle">
              Session_Node // {user?.id?.toString().substring(0,12) || "CORE_SYNC_ACTIVE"}
            </Text>
          </View>

          <Text className="text-7xl font-black uppercase italic tracking-tighter leading-[0.75] text-foreground">
            {user?.full_name?.split(' ')[0] || "USER"}{'\n'}
            <Text className="text-border">CORE</Text>
          </Text>
        </View>

        {/* 3. HARDWARE CORE (Avatar & XP) */}
        <View className="p-6 flex-row gap-4">
          <View className="relative">
            <View className="w-32 h-32 border-4 border-primary bg-card p-1 shadow-[6px_6px_0px_0px_rgb(var(--success))]">
              <View className="flex-1 bg-muted overflow-hidden items-center justify-center">
                <Image 
                  source={{ uri: avatarUri }}
                  className="w-24 h-24"
                />
                <View className="absolute top-0 left-0 w-full h-[1px] bg-primary/50" style={{ top: '40%' }} />
              </View>
            </View>
            <TouchableOpacity 
              onPress={pickAvatar} 
              disabled={loading} 
              activeOpacity={0.8}
              className="absolute -bottom-1 -right-1 bg-primary p-2 border-2 border-card"
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors['primary-foreground']} />
              ) : (
                <Camera size={14} className="text-primary-foreground" />
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-1 bg-primary p-5 border-b-8 border-primary shadow-xl justify-between">
            <View className="flex-row justify-between items-center">
               <Text className="text-[8px] font-black text-success uppercase tracking-[2px]">Neural_Credits</Text>
               <Zap size={14} fill="currentColor" className="text-highlight" />
            </View>
            <View>
              <Text className="text-5xl font-black italic text-primary-foreground leading-none tracking-tighter">
                {user?.xp_points || 0}
              </Text>
              <Text className="text-[10px] font-black text-primary-foreground/40 uppercase mt-1">Level_{level}</Text>
            </View>
          </View>
        </View>

        {/* 4. SYSTEM METRICS GRID */}
        <View className="flex-row px-6 mb-8 gap-3">
          {systemMetrics.map((s, i) => (
            <View key={i} className="flex-1 bg-card border-2 border-primary p-4 shadow-[4px_4px_0px_0px_rgb(var(--primary)/0.05)]">
              <Text className="text-[8px] font-black text-subtle uppercase mb-1 tracking-[1px]">{s.label}</Text>
              <Text className="text-xl font-black text-foreground italic">{s.value}</Text>
              <View className="h-1 w-full bg-muted mt-2">
                <View className={`h-full ${s.bar}`} style={{ width: '60%' }} />
              </View>
            </View>
          ))}
        </View>

        {/* 5. TECH STACK NODES */}
        <View className="px-6 mb-10">
          <View className="flex-row items-center mb-5">
            <Cpu size={16} strokeWidth={3} className="text-primary" />
            <Text className="ml-3 text-[10px] font-black uppercase tracking-[3px] text-foreground">Integrated_Stack</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {stack.length ? stack.map(([tech, lvl]) => (
              <View key={tech} className="bg-surface border-2 border-primary px-4 py-2 flex-row items-center">
                <View className="h-1.5 w-1.5 bg-primary mr-2 rounded-full" />
                <Text className="text-[10px] font-black uppercase italic text-foreground">{tech} // {lvl}</Text>
              </View>
            )) : <Text className="text-[10px] italic text-subtle font-bold">Waiting for Stack Sync...</Text>}
            
            <TouchableOpacity activeOpacity={0.7} className="border-2 border-dashed border-line-strong px-4 py-2 bg-surface/50">
              <Text className="text-[10px] font-black text-subtle uppercase">+ Add_Module</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. SYSTEM DIRECTIVES */}
        <View className="px-6 pb-20">
          <View className="flex-row items-center mb-5">
            <Layers size={16} strokeWidth={3} className="text-primary" />
            <Text className="ml-3 text-[10px] font-black uppercase tracking-[3px] text-foreground">System_Directives</Text>
          </View>
          
          {panel && (
            <View className={`border-2 ${panel === 'delete' ? 'border-danger bg-danger-subtle/30' : 'border-primary bg-surface'} p-4 mb-4`}>
              {panel === 'password' ? (
                <>
                  <TextInput 
                    value={oldPw} 
                    onChangeText={setOldPw} 
                    secureTextEntry 
                    placeholder="CURRENT_PASSWORD" 
                    placeholderClassName="text-subtle" 
                    className="border-2 border-primary bg-card p-3 mb-3 text-foreground font-bold" 
                  />
                  <TextInput 
                    value={newPw} 
                    onChangeText={setNewPw} 
                    secureTextEntry 
                    placeholder="NEW_PASSWORD (8+)" 
                    placeholderClassName="text-subtle" 
                    className="border-2 border-primary bg-card p-3 mb-3 text-foreground font-bold" 
                  />
                </>
              ) : panel === 'delete' ? (
                <>
                  <Text className="text-[10px] font-black uppercase text-danger mb-3">Warning: permanently purges your account and all learning data.</Text>
                  <TextInput 
                    value={purgePw} 
                    onChangeText={setPurgePw} 
                    secureTextEntry 
                    placeholder="CONFIRM_PASSWORD" 
                    placeholderClassName="text-subtle" 
                    className="border-2 border-danger bg-card p-3 mb-3 text-foreground font-bold" 
                  />
                </>
              ) : (
                <TextInput 
                  value={comment} 
                  onChangeText={setComment} 
                  multiline 
                  placeholder="YOUR_FEEDBACK" 
                  placeholderClassName="text-subtle" 
                  className="border-2 border-primary bg-card p-3 mb-3 h-24 text-foreground font-bold" 
                  style={{ textAlignVertical: 'top' }} 
                />
              )}
              
              <TouchableOpacity 
                onPress={submitPanel} 
                disabled={busy} 
                activeOpacity={0.8}
                className={`${panel === 'delete' ? 'bg-danger border-2 border-danger' : 'bg-primary'} h-12 items-center justify-center`}
              >
                {busy ? (
                  <ActivityIndicator color={colors['primary-foreground']} />
                ) : (
                  <Text className="text-primary-foreground font-black uppercase tracking-[2px] text-xs">
                    {panel === 'delete' ? 'Confirm_Purge' : 'Submit'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View className="border-4 border-primary bg-card overflow-hidden">
            <DirectiveItem label="Security Protocols" icon={<ShieldCheck size={18} className="text-primary" />} onPress={() => setPanel(panel === 'password' ? null : 'password')} />
            <DirectiveItem label="Send Feedback" icon={<Terminal size={18} className="text-primary" />} onPress={() => setPanel(panel === 'feedback' ? null : 'feedback')} />
            <DirectiveItem label="Purge Identity" icon={<Trash2 size={18} className="text-danger" />} danger onPress={() => setPanel(panel === 'delete' ? null : 'delete')} />
            <DirectiveItem 
              label="Terminate Session" 
              icon={<LogOut size={18} className="text-danger" />} 
              danger 
              onPress={handleLogout}
              last 
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const DirectiveItem = ({ label, icon, danger, onPress, last }) => (
  <TouchableOpacity 
    onPress={onPress}
    activeOpacity={0.8}
    className={`flex-row items-center justify-between p-6 ${!last ? 'border-b-2 border-primary' : ''} ${danger ? 'bg-danger-subtle' : 'bg-card'}`}
  >
    <View className="flex-row items-center">
      <View className={`h-10 w-10 items-center justify-center border-2 ${danger ? 'border-danger bg-card' : 'border-muted bg-surface'}`}>
        {icon}
      </View>
      <Text className={`ml-4 text-xs font-black uppercase italic tracking-widest ${danger ? 'text-danger' : 'text-foreground'}`}>
        {label}
      </Text>
    </View>
    <ChevronRight size={18} className={danger ? "text-danger" : "text-line-strong"} />
  </TouchableOpacity>
);