import { useState } from 'react';
import type { DeployResponse } from '../types/api';
import { deployCode } from '../services/api';

export function useDeployer() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [result, setResult] = useState<DeployResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deploy = async (command: string) => {
    setIsDeploying(true);
    setError(null);
    
    try {
      const response = await deployCode({ command });
      setResult(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '部署过程中发生未知错误';
      setError(errorMessage);
      return null;
    } finally {
      setIsDeploying(false);
    }
  };

  return {
    deploy,
    isDeploying,
    result,
    error,
    isSuccess: result?.success ?? false,
  };
} 