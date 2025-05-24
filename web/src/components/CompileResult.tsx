import type { CompileResponse } from '../types/api';

interface CompileResultProps {
  result: CompileResponse | null;
  error: string | null;
  isCompiling: boolean;
}

const CompileResult = ({ result, error, isCompiling }: CompileResultProps) => {
  if (isCompiling) {
    return (
      <div className="p-4 text-center text-foreground/80">
        <div className="animate-pulse">Compiling, please wait...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-error">
        <h3 className="font-semibold mb-2">Compilation Error</h3>
        <pre className="bg-panel p-3 rounded text-sm overflow-auto border border-border font-mono">{error}</pre>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-4 text-foreground/60 italic">
        Click the "Compile" button to start compilation.
      </div>
    );
  }

  if (!result.success) {
    return (
      <div className="p-4">
        <h3 className="font-semibold text-error mb-2">Compilation Failed</h3>
        {result.error_message && (
          <pre className="bg-panel p-3 rounded text-sm overflow-auto border border-border text-error font-mono">{result.error_message}</pre>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 text-foreground">
      <h3 className="font-semibold text-success mb-2">Compilation Successful!</h3>
      
      <div className="mb-3">
        <span className="text-foreground/80">Compile Time: </span>
        <span className="font-mono text-accent">{result.compile_time_ms} ms</span>
      </div>
      
      <div className="mb-3">
        <h4 className="font-medium mb-1 text-foreground/90">Generated Modules:</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          {result.module_names.map((name, index) => (
            <li key={index}>
              <span className="font-mono text-accent">{name}</span>
              <span className="text-foreground/70 ml-2">({result.bytecode_size[index]} bytes)</span>
            </li>
          ))}
        </ul>
      </div>
      
      {result.warnings.length > 0 && (
        <div className="mb-3">
          <h4 className="font-medium mb-1 text-warning">Warnings:</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {result.warnings.map((warning, index) => (
              <li key={index} className="text-warning/90 font-mono">{warning}</li>
            ))}
          </ul>
        </div>
      )}
      
      {result.bytecode_path && (
        <div className="text-sm bg-panel p-3 rounded border border-border">
          <div className="font-medium mb-1 text-foreground/90">Bytecode Path:</div>
          <code className="block overflow-auto font-mono text-accent">{result.bytecode_path}</code>
        </div>
      )}
    </div>
  );
};

export default CompileResult;