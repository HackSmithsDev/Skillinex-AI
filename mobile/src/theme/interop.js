import { TextInput, Image } from 'react-native';
import { cssInterop } from 'nativewind';
import {
  AlertCircle, ArrowLeft, ArrowRight, BarChart3, Bot, Briefcase, BookOpen, Brain, Camera, CheckCircle, CheckCircle2,
  ChevronLeft, ChevronRight, Clock, Code, Code2, Cpu, Database, Eye, EyeOff, FileText, FlaskConical,
  Home, Info, KeyRound, Layers, Layout, LayoutDashboard, Lock, LogOut, Mail, Play, PlayCircle, Plus,
  RotateCcw, Rocket, Send, Settings, Share, Share2, ShieldAlert, ShieldCheck, Sparkles, Activity, Flame,
  Target, Terminal, Trash2, Trophy, User, Zap,
} from 'lucide-react-native';

// Lets icons take their colour from className (e.g. "text-primary"), resolved from global.css tokens.
const ICONS = [
  AlertCircle, ArrowLeft, ArrowRight, BarChart3, Bot, Briefcase, BookOpen, Brain, Camera, CheckCircle, CheckCircle2,
  ChevronLeft, ChevronRight, Clock, Code, Code2, Cpu, Database, Eye, EyeOff, FileText, FlaskConical,
  Home, Info, KeyRound, Layers, Layout, LayoutDashboard, Lock, LogOut, Mail, Play, PlayCircle, Plus,
  RotateCcw, Rocket, Send, Settings, Share, Share2, ShieldAlert, ShieldCheck, Sparkles, Activity, Flame,
  Target, Terminal, Trash2, Trophy, User, Zap,
];

ICONS.forEach((Icon) => {
  if (Icon) {
    cssInterop(Icon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
  }
});

cssInterop(TextInput, {
  className: { target: 'style', nativeStyleToProp: { textAlign: true } },
  placeholderClassName: { target: false, nativeStyleToProp: { color: 'placeholderTextColor' } },
});

cssInterop(Image, {
  className: { target: 'style', nativeStyleToProp: { color: 'tintColor' } },
});
