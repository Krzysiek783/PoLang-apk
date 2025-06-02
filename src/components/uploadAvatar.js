import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp } from 'firebase/app';

export const uploadImageToFirebase = async (uri, userId) => {
  const app = getApp(); // jeśli już masz zainicjalizowane firebase
  const storage = getStorage(app);

  const response = await fetch(uri);
  const blob = await response.blob();

  const filename = `avatars/${userId}_${Date.now()}.jpg`;
  const storageRef = ref(storage, filename);

  await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
};
