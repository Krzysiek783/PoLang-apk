import { auth, db } from '../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export const syncVerificationWithFirestore = async () => {
  await auth.currentUser.reload();

  if (!auth.currentUser.emailVerified) return;

  const uid = auth.currentUser.uid;
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();

    if (data.verified === false) {
      await updateDoc(userRef, {
        verified: true,
        verifiedAt: serverTimestamp(), // KROK 2
      });
      console.log("✅ Firestore: verified → true & verifiedAt ustawione");
    }
  }
};
