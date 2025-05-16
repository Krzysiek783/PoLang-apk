// src/components/NotificationManager.js
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import * as Device from 'expo-device';

export default function NotificationManager() {
useEffect(() => {
  const init = async () => {
    console.log("🟡 NotificationManager start");

    const auth = getAuth();
    const uid = auth.currentUser?.uid;
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
    const ref = doc(firestore, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("❌ Nie znaleziono dokumentu użytkownika w Firestore");
      return;
    }

    const data = snap.data();
    const { enabled, hour } = data.notifications ?? {};
    console.log("📦 Dane z Firestore:", data.notifications);

    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("🧹 Wszystkie poprzednie powiadomienia usunięte");

    if (!enabled || !hour) {
      console.log("ℹ️ Powiadomienia są wyłączone lub brak godziny");
      return;
    }

    const [h, m] = hour.split(':').map(Number);
    const now = new Date();
    const next = new Date();
    next.setHours(h, m, 0, 0);
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🧠 Czas na angielski!",
        body: "Zrób dziś chociaż jedną lekcję 💪",
        sound: true,
      },
      trigger: {
        hour: h,
        minute: m,
        repeats: true,
      },
    });

    console.log(`✅ Powiadomienie zaplanowane na codziennie ${h}:${m}`);

    // Testowe powiadomienie na teraz (5 sekund od teraz)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 Testowe powiadomienie",
        body: "To test, czy w ogóle działa",
      },
      trigger: { seconds: 5 },
    });

    console.log("✅ Testowe powiadomienie wysłane (za 5 sekund)");
  };

  init();
}, []);


  return null;
}
