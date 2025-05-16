import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import RNModal from 'react-native-modal';



export default function ResetHaslaScreen() {
  const { user, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchEmail = async () => {
      if (!user) return;
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setEmail(data.email || user.email);
        } else {
          setEmail(user.email);
        }
      } catch (error) {
        console.log("Błąd przy pobieraniu emaila:", error);
        setEmail(user.email);
      } finally {
        setLoading(false);
      }
    };

    fetchEmail();
  }, [user]);

  const confirmReset = async () => {
    setShowConfirm(false);
    const result = await resetPassword(email);
    if (result.success) {
      setShowSuccess(true);
    } else {
      alert(result.message || "Coś poszło nie tak.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFAD84" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📩</Text>

      <Text style={styles.title}>Reset hasła</Text>
      <Text style={styles.info}>
        Na poniższy adres e-mail wyślemy specjalny link umożliwiający zmianę hasła:
      </Text>
      <Text style={styles.email}>{email}</Text>

      <Text style={styles.instructions}>
        Kliknij w link, który otrzymasz w wiadomości i podążaj za instrukcjami, aby ustawić nowe hasło.
      </Text>

      <Text style={styles.hint}>
        Jeśli nie widzisz maila, sprawdź folder „Spam” lub „Oferty”.
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => setShowConfirm(true)}>
        <Text style={styles.buttonText}>Resetuj hasło</Text>
      </TouchableOpacity>

      {/* MODAL POTWIERDZENIA */}
      <RNModal isVisible={showConfirm} onBackdropPress={() => setShowConfirm(false)}>
        <View style={styles.modal}>
          <Text style={styles.modalIcon}>⚠️</Text>
          <Text style={styles.modalTitle}>Na pewno?</Text>
          <Text style={styles.modalText}>
            Czy na pewno chcesz wysłać link do resetu hasła na:
          </Text>
          <Text style={styles.modalEmail}>{email}</Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowConfirm(false)}>
              <Text style={styles.cancelText}>Anuluj</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmReset}>
              <Text style={styles.confirmText}>Tak, wyślij</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>

      {/* MODAL SUKCESU */}
      <RNModal isVisible={showSuccess} onBackdropPress={() => setShowSuccess(false)}>
        <View style={styles.modal}>
          <Text style={styles.modalIcon}>✅</Text>
          <Text style={styles.modalTitle}>Mail wysłany!</Text>
          <Text style={styles.modalText}>
            Sprawdź swoją skrzynkę 📬 i kliknij w link, aby zmienić hasło.
          </Text>
          <Text style={styles.modalHint}>
            Jeśli nie widzisz wiadomości, zajrzyj do folderu „Spam” lub „Oferty”.
          </Text>

          <TouchableOpacity style={styles.confirmBtn} onPress={() => setShowSuccess(false)}>
            <Text style={styles.confirmText}>OK</Text>
          </TouchableOpacity>
        </View>
      </RNModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F5',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
    textAlign: 'center',
  },
  email: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
    textAlign: 'center',
  },
  instructions: {
    fontSize: 15,
    color: '#444',
    marginBottom: 10,
    textAlign: 'center',
  },
  hint: {
    fontSize: 13,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#FFB78C',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
  fontSize: 16,
  color: '#000', // 👈 teraz czarne
  fontWeight: '600',
  },
  modal: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#555',
    marginBottom: 6,
  },
  modalHint: {
    fontSize: 13,
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  modalEmail: {
    fontSize: 17,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#000',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  cancelBtn: {
    backgroundColor: '#EEE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  confirmBtn: {
    backgroundColor: '#FFAD84',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  cancelText: {
    color: '#555',
    fontWeight: '500',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
  },
});