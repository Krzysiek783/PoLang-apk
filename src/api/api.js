import { getAuth } from "firebase/auth";
import { API_BASE_URL } from '@env';

const BASE_URL = API_BASE_URL;




export const fetchUserProfile = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) throw new Error("Użytkownik niezalogowany");

    const token = await user.getIdToken();

    const response = await fetch(`${BASE_URL}/api/user/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Błąd serwera");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Błąd w fetchUserProfile:", error);
    throw error;
  }
};
