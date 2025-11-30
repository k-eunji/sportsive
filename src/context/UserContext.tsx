// src/context/UserContext.tsx

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { CustomUser } from '@/types/user';

type UserContextType = {
  user: CustomUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  setUserContext: (user: CustomUser) => void;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  setUserContext: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setLoading(true);

      if (firebaseUser) {
        try {
          // ✅ 토큰은 여기서 가져와야 함
          const token = await firebaseUser.getIdToken();

          // Firestore에서 user 데이터 가져오기
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const data = userDoc.exists() ? userDoc.data() : null;

          const u: CustomUser = {
            uid: firebaseUser.uid,
            userId: firebaseUser.uid,
            authorNickname:
              (data as any)?.authorNickname ||   // ✅ 기존
              (data as any)?.nickname ||         // ✅ 추가
              (data as any)?.username ||         // ✅ 추가
              (data as any)?.displayName ||      // ✅ 추가
              firebaseUser.displayName ||        // ✅ Fallback
              'guest',
            displayName:
              (data as any)?.displayName ||
              firebaseUser.displayName ||
              '',
            email: firebaseUser.email || '',
            token,
          };

          setUser(u);
          if (typeof window !== 'undefined')
            localStorage.setItem('user', JSON.stringify(u));
        } catch (err) {
          console.error('Failed to fetch user data:', err);
          setUser({
            uid: firebaseUser.uid,
            userId: firebaseUser.uid,
            authorNickname: firebaseUser.displayName || 'guest',
            displayName: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
          });
        }
      } else {
        setUser(null);
        if (typeof window !== 'undefined') localStorage.removeItem('user');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    if (typeof window !== 'undefined') localStorage.removeItem('user');
  };

  const setUserContext = (user: CustomUser) => {
    setUser(user);
    if (typeof window !== 'undefined')
      localStorage.setItem('user', JSON.stringify(user));
  };

  return (
    <UserContext.Provider value={{ user, loading, logout, setUserContext }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
