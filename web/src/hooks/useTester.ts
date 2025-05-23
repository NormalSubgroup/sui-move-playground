import { useState } from 'react';
import type { TestResponse } from '../types/api';
import { testCode } from '../services/api';

export function useTester() {
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<TestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const test = async (command: string) => {
    setIsTesting(true);
    setError(null);
    
    try {
      const response = await testCode({ command });
      setResult(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '测试过程中发生未知错误';
      setError(errorMessage);
      return null;
    } finally {
      setIsTesting(false);
    }
  };

  return {
    test,
    isTesting,
    result,
    error,
    isSuccess: result?.success ?? false,
  };
} 