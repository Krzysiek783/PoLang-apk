import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';


const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);       // tu przechowujemy użytkownika
    const [loading, setLoading] = useState(true); // czy dane o użytkowniku już się wczytały
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        console.log('🧠 Firebase user:', firebaseUser); 
        setUser(firebaseUser);
        setLoading(false);
      });
  
      return unsubscribe; // czyszczenie nasłuchu przy odmontowaniu
    }, []);
  
    const logout = () => signOut(auth);
  
    return (
      <AuthContext.Provider value={{ user, loading, logout }}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  export const useAuth = () => useContext(AuthContext);
