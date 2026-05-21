import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          const isDeveloperAdmin = currentUser.email === '2231091067@uttarauniversity.edu.bd';
          const defaultRole = isDeveloperAdmin ? 'admin' : 'user';
          
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: defaultRole,
              createdAt: serverTimestamp()
            });
            setIsAdmin(isDeveloperAdmin);
          } else {
            const storedRole = userDoc.data()?.role;
            if (isDeveloperAdmin && storedRole !== 'admin') {
              await setDoc(userRef, { role: 'admin' }, { merge: true });
              setIsAdmin(true);
            } else {
              setIsAdmin(storedRole === 'admin');
            }
          }
        } catch (error) {
          console.error("Error syncing user profile:", error);
          setIsAdmin(currentUser.email === '2231091067@uttarauniversity.edu.bd');
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
