// src/app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, app } from '@/lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useUser } from '@/context/UserContext';

export default function RegisterPage() {
  const router = useRouter();
  const { setUserContext } = useUser();

  // 입력 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authorNickname, setAuthorNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Firebase Cloud Function (닉네임 중복검사)
  const functions = getFunctions(app, 'us-central1');
  const checkNicknameExistsFunction = httpsCallable(functions, 'checkNicknameExists');

  /** Firebase 오류 메시지 변환 */
  const getErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already in use.';
      case 'auth/invalid-email':
        return 'Invalid email format.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  /** 닉네임 중복 확인 */
  const checkNicknameExists = async (nickname: string) => {
    const trimmed = nickname.trim();
    if (!trimmed) return false;
    try {
      const res = await checkNicknameExistsFunction({ nickname: trimmed });
      if (res && typeof res === 'object' && 'data' in res) {
        return (res as any).data.exists ?? false;
      }
      return false;
    } catch (err) {
      console.error('Error checking nickname:', err);
      return false;
    }
  };

  /** 회원가입 핸들러 */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!authorNickname.trim()) {
      setError('Please enter a nickname.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const nicknameTaken = await checkNicknameExists(authorNickname.trim());
      if (nicknameTaken) {
        setError('This nickname is already taken.');
        setLoading(false);
        return;
      }

      // Firebase Auth 계정 생성
      const userCredential = await createUserWithEmailAndPassword(auth!, email, password);
      const user = userCredential.user;

      // 인증 상태 확인
      await new Promise<void>((resolve) => {
        const unsub = onAuthStateChanged(auth!, (currentUser) => {
          if (currentUser && currentUser.uid === user.uid) {
            unsub();
            resolve();
          }
        });
      });

      if (!auth!.currentUser) throw new Error('User not authenticated.');

      // Firestore에 유저 정보 저장
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        authorNickname: authorNickname.trim(),
        createdAt: serverTimestamp(),
        userId: user.uid,
      });

      // UserContext 업데이트
      setUserContext({
        uid: user.uid,
        userId: user.uid,
        authorNickname: authorNickname.trim(),
        displayName: user.displayName || '',
        email: user.email || '',
      });

      alert('Registration successful!');
      router.push('/');
    } catch (err: any) {
      console.error('Error during registration:', err);
      setError(err?.code ? getErrorMessage(err.code) : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-white text-gray-900 px-6 py-10 font-sans">
      <h1 className="text-4xl font-semibold tracking-tight mb-8">Register to Sportsive</h1>

      <form
        onSubmit={handleRegister}
        className="w-full max-w-sm space-y-4 bg-gray-50/60 p-6 rounded-2xl shadow-sm border border-gray-200"
      >
        <input
          type="text"
          placeholder="Nickname"
          value={authorNickname}
          onChange={(e) => setAuthorNickname(e.target.value)}
          required
          className="block w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400"
        />
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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Registering...
            </>
          ) : (
            'Register'
          )}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-red-600 text-sm animate-fade-in">{error}</p>
      )}

      <p className="mt-6 text-gray-700">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Login here
        </Link>
      </p>
    </main>
  );
}
