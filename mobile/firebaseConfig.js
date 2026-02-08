import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './services/api';

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
  measurementId: "SEU_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    let enabled = false;

    if (typeof Notification !== 'undefined' && Notification.requestPermission) {
      const perm = await Notification.requestPermission();
      enabled = perm === 'granted';
    } else {
      // Ambiente React Native: presume-se permissão tratada pelo runtime (Expo/Firebase native)
      enabled = true;
    }

    if (enabled) {
      console.log('Permissão para notificações concedida');
      const token = await getToken(messaging);
      if (token) {
        await AsyncStorage.setItem('fcmToken', token);
        // Enviar token para o backend
        await sendTokenToBackend(token);
        return token;
      }
    }
  } catch (error) {
    console.error('Erro ao solicitar permissão:', error);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

const sendTokenToBackend = async (token) => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      await api.post('/users/fcm-token', {
        userId: user._id,
        fcmToken: token
      });
    }
  } catch (error) {
    console.error('Erro ao enviar token:', error);
  }
};

export { messaging };
