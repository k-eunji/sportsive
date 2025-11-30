// src/hooks/useAuth.ts

import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';

export function useAuth() {
  return useContext(UserContext);
}
