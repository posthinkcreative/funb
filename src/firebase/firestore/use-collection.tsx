'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type WithId<T> = T & { id: string };

export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

export function useCollection<T = any>(
  memoizedTargetRefOrQuery: any | null | undefined,
): UseCollectionResult<T> {
  const [data, setData] = useState<WithId<T>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results = snapshot.docs.map(doc => ({
          ...(doc.data() as T),
          id: doc.id
        }));
        
        setData(results);
        setIsLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        let errorPath = "unknown_path";
        try {
          if (memoizedTargetRefOrQuery.path) {
            errorPath = memoizedTargetRefOrQuery.path;
          } else if (memoizedTargetRefOrQuery._query?.path) {
            errorPath = memoizedTargetRefOrQuery._query.path.toString();
          }
        } catch (e) {
          errorPath = "query_complex_path";
        }

        if (err.code === 'failed-precondition') {
          setError(err); 
        } else {
          const contextualError = new FirestorePermissionError({
            operation: 'list',
            path: errorPath,
          });
          setError(contextualError);
          if (errorEmitter) errorEmitter.emit('permission-error', contextualError);
        }

        setData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]);

  return { data, isLoading, error };
}