// src/app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useUser } from '@/context/UserContext';

export default function LoginPage() {
  const router = useRouter();
  const { setUserContext } = useUser();

  // 입력 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /** Firebase 에러 코드 메시지 변환 */
  const getErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already in use.';
      case 'auth/invalid-email':
        return 'Invalid email format.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/user-not-found':
        return 'User not found.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  /** Firestore에서 사용자 데이터 가져오기 */
  const getUserData = async (uid: string) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() : null;
  };

  /** 로그인/회원가입 처리 */
  /** 로그인 처리 (로그인 전용) */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 🔥 로그인만 한다
      await signInWithEmailAndPassword(auth!, email, password);

      // ❌ setUserContext 절대 호출하지 마라
      // ❌ Firestore 직접 읽지 마라
      // Firebase onIdTokenChanged가 user를 세팅함

      router.replace('/'); // 로그인 성공 → 메인
    } catch (err: any) {
      setError(err.message || getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-white text-gray-900 px-6 py-10 font-sans">
      <h1 className="text-4xl font-semibold mb-8 tracking-tight">
        Welcome Back
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 bg-gray-50/60 p-6 rounded-2xl shadow-sm border border-gray-200"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="block w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="block w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400"
        />

        {error && (
          <p className="text-red-600 text-sm animate-fade-in">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </button>

        {/* 🔥 회원가입은 "페이지 이동" */}
        <button
          type="button"
          onClick={() => router.push('/auth/register')}
          className="w-full text-sm text-blue-600 underline hover:text-blue-700 transition-colors"
        >
          Don’t have an account? Register
        </button>
      </form>
    </main>
  );
}
