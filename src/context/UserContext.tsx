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

interface User {
  id: string;
  displayName: string;
  role: 'user' | 'guest';
}

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
        // 로그아웃 상태 → guest 생성
        // =========================
        if (!firebaseUser) {
          // 1️⃣ 이미 guest 있으면 재사용
          const savedGuest = typeof window !== 'undefined'
            ? localStorage.getItem('guestUser')
            : null;

          if (savedGuest) {
            setUser(JSON.parse(savedGuest));
            setAuthReady(true);
            setLoading(false);
            return;
          }

          // 2️⃣ 없으면 서버에서 guest 발급
          try {
            const res = await fetch('/api/guest', { method: 'POST' });
            const guest = await res.json();

            const guestUser: CustomUser = {
              uid: guest.id,
              userId: guest.id,
              authorNickname: guest.displayName,
              displayName: guest.displayName,
              email: '',
              role: 'guest', // 🔥 구분용
            };

            setUser(guestUser);
            localStorage.setItem('guestUser', JSON.stringify(guestUser));
          } catch (e) {
            console.error('Failed to create guest:', e);
            setUser(null);
          }

          setAuthReady(true);
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
