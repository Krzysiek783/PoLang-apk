// src/components/NotificationManager.js
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NotificationManager() {
  useEffect(() => {
    let unsubscribeAuth;
    let intervalId;

    const init = async (uid) => {
      console.log("🟡 NotificationManager start");

      if (!uid) {
        console.log("❌ Brak UID - użytkownik niezalogowany");
        return;
      }

      if (!Device.isDevice) {
        console.log("❌ Nie na fizycznym urządzeniu - powiadomienia nie zadziałają");
        return;
      }

      const { status } = await Notifications.getPermissionsAsync();
      console.log("🔐 Uprawnienia powiadomień:", status);

      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        console.log("🟡 Nowy status po zapytaniu:", newStatus);
        if (newStatus !== 'granted') {
          console.log("❌ Uprawnienia nadal nieprzyznane");
          return;
        }
      }

      const firestore = getFirestore();

      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("🧹 Wszystkie poprzednie powiadomienia usunięte");

      intervalId = setInterval(async () => {
        const authCheck = getAuth();
        const currentUser = authCheck.currentUser;

        if (!currentUser) {
          console.log("⏸️ Użytkownik nie jest zalogowany – pomijam powiadomienie");
          return;
        }

        const ref = doc(firestore, 'users', currentUser.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          console.log("❌ Nie znaleziono dokumentu użytkownika w Firestore");
          return;
        }

        const data = snap.data();
        const { enabled, hour } = data.notifications ?? {};
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        console.log(`⏱️ Sprawdzam o ${now.toTimeString().slice(0,5)} | UID: ${currentUser.uid} | Firestore: ${hour} | Aktywne: ${enabled}`);

        if (!enabled || !hour) {
          console.log("ℹ️ Powiadomienia są wyłączone lub brak godziny");
          return;
        }

        const [h, m] = hour.split(':').map(Number);

        if (currentHour === h && currentMinute === m) {
          console.log("🔔 Wywołanie powiadomienia (godzina pasuje)");
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "🧠 Czas na angielski!",
              body: "Zrób dziś chociaż jedną lekcję 💪",
              sound: true,
            },
            trigger: null,
          });
        }
      }, 60000);

      console.log("✅ Interwał powiadomień aktywowany");
    };

    const auth = getAuth();
    unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        init(user.uid);
      } else {
        console.log("🚪 Użytkownik się wylogował - zatrzymuję interwał");
        if (intervalId) clearInterval(intervalId);
      }
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return null;
}
