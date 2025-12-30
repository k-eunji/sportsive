// src/context/UserContext.tsx

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { auth } from '@/lib/firebase';
import {
  onIdTokenChanged,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { CustomUser } from '@/types/user';

type UserContextType = {
  user: CustomUser | null;
  loading: boolean;
  authReady: boolean; // 🔥 추가
  logout: () => Promise<void>;
  setUserContext: (user: CustomUser) => void;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  authReady: false,
  logout: async () => {},
  setUserContext: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false); // 🔥 추가

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onIdTokenChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        setLoading(true);

        // =========================
        // 로그아웃 상태
        // =========================
        if (!firebaseUser) {
          setUser(null);
          setAuthReady(true); // 🔥 auth는 끝났음
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
          }
          setLoading(false);
          return;
        }

        try {
          // ✅ 이 시점: Auth + Firestore 인증 컨텍스트 확정
          const token = await firebaseUser.getIdToken();

          const u: CustomUser = {
            uid: firebaseUser.uid,
            userId: firebaseUser.uid,
            authorNickname: firebaseUser.displayName || 'guest',
            displayName: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            token,
          };

          setUser(u);

          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(u));
          }
        } catch (err) {
            console.error('Failed to initialize user:', err);

            const fallback: CustomUser = {
              uid: firebaseUser.uid,
              userId: firebaseUser.uid,
              authorNickname: firebaseUser.displayName || 'guest',
              displayName: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
            };

            setUser(fallback);
          }


        setAuthReady(true); // 🔥 Firestore 써도 되는 시점
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setUser(null);
    //setAuthReady(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  };

  const setUserContext = (user: CustomUser) => {
    setUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

  return (
    <UserContext.Provider
      value={{ user, loading, authReady, logout, setUserContext }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
