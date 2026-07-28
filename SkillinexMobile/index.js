import 'react-native-gesture-handler'; 
import { registerRootComponent } from 'expo';
import App from './App';

// This handles the high-speed native bridge for Reanimated
registerRootComponent(App);