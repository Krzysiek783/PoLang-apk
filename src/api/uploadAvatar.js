import { storage, auth } from '../config/firebase';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const BASE_URL = API_BASE_URL;



export const uploadAvatarFromUri = async (uri) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Brak zalogowanego użytkownika');

    const token = await user.getIdToken();

    const cleanedUri = uri.startsWith('file://') ? uri : `file://${uri}`;

    const formData = new FormData();
    formData.append('avatar', {
      uri: cleanedUri,
      name: 'avatar.jpg',
      type: 'image/jpeg',
    });

    console.log("🧪 FormData ready:", formData);

    const response = await axios.post(`${BASE_URL}/api/users/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ Avatar URL z backendu:', response.data.url);
    return response.data.url;

  } catch (err) {
    console.error('❌ Błąd uploadu avatara:', err);
    return null;
  }
};
