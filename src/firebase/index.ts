'use client';

export { initializeFirebase } from './init';
export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';

import { useMemo } from 'react';
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  return useMemo(factory, deps);
}
