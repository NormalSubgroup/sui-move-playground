import { useState } from 'react';
import type { CompileResponse } from '../types/api';
import { compileCode } from '../services/api';

export function useCompiler() {
  const [isCompiling, setIsCompiling] = useState(false);
  const [result, setResult] = useState<CompileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compile = async (sourceCode: string, fileName: string, addressesToml?: string) => {
    setIsCompiling(true);
    setError(null);
    
    try {
      const response = await compileCode({
        source_code: sourceCode,
        file_name: fileName,
        addresses_toml_content: addressesToml
      });
      
      setResult(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '编译过程中发生未知错误';
      setError(errorMessage);
      return null;
    } finally {
      setIsCompiling(false);
    }
  };

  return {
    compile,
    isCompiling,
    result,
    error,
    isSuccess: result?.success ?? false,
  };
} 