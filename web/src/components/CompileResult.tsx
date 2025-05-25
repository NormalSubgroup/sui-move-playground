import { useState } from 'react';
import { EnterFullScreenIcon, ExitFullScreenIcon } from '@radix-ui/react-icons';
import type { CompileResponse } from '../types/api';

interface CompileResultProps {
  result: CompileResponse | null;
  error: string | null;
  isCompiling: boolean;
}

const CompileResult = ({ result, error, isCompiling }: CompileResultProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 处理文本显示，保留换行符并支持文本换行
  const formatText = (text: string) => {
    return (
      <div className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">
        {text}
      </div>
    );
  };

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-background p-4 overflow-auto"
    : "";

  const contentClass = isFullscreen 
    ? "h-full flex flex-col"
    : "";

  if (isCompiling) {
    return (
      <div className={containerClass}>
        <div className={`p-4 text-center text-foreground/80 ${contentClass}`}>
          <div className="animate-pulse">Compiling, please wait...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClass}>
        <div className={`text-error ${contentClass}`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Compilation Error</h3>
            <button
              onClick={toggleFullscreen}
              className="p-1 rounded hover:bg-panel text-foreground/70 hover:text-foreground transition-colors"
              title={isFullscreen ? "退出全屏" : "全屏显示"}
            >
              {isFullscreen ? <ExitFullScreenIcon className="w-4 h-4" /> : <EnterFullScreenIcon className="w-4 h-4" />}
            </button>
          </div>
          <div className={`bg-panel p-3 rounded border border-border ${isFullscreen ? 'flex-1 overflow-auto' : 'overflow-auto'}`}>
            {formatText(error)}
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className={containerClass}>
        <div className={`p-4 text-foreground/60 italic ${contentClass}`}>
          Click the "Compile" button to start compilation.
        </div>
      </div>
    );
  }

  if (!result.success) {
    return (
      <div className={containerClass}>
        <div className={contentClass}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-error">Compilation Failed</h3>
            <button
              onClick={toggleFullscreen}
              className="p-1 rounded hover:bg-panel text-foreground/70 hover:text-foreground transition-colors"
              title={isFullscreen ? "退出全屏" : "全屏显示"}
            >
              {isFullscreen ? <ExitFullScreenIcon className="w-4 h-4" /> : <EnterFullScreenIcon className="w-4 h-4" />}
            </button>
          </div>
          {result.error_message && (
            <div className={`bg-panel p-3 rounded border border-border text-error ${isFullscreen ? 'flex-1 overflow-auto' : 'overflow-auto'}`}>
              {formatText(result.error_message)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className={`text-foreground ${contentClass}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-success">Compilation Successful!</h3>
          <button
            onClick={toggleFullscreen}
            className="p-1 rounded hover:bg-panel text-foreground/70 hover:text-foreground transition-colors"
            title={isFullscreen ? "退出全屏" : "全屏显示"}
          >
            {isFullscreen ? <ExitFullScreenIcon className="w-4 h-4" /> : <EnterFullScreenIcon className="w-4 h-4" />}
          </button>
        </div>
        
        <div className={`space-y-3 ${isFullscreen ? 'flex-1 overflow-auto' : ''}`}>
          <div>
            <span className="text-foreground/80">Compile Time: </span>
            <span className="font-mono text-accent">{result.compile_time_ms} ms</span>
          </div>
          
          <div>
            <h4 className="font-medium mb-1 text-foreground/90">Generated Modules:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {result.module_names.map((name, index) => (
                <li key={index}>
                  <span className="font-mono text-accent break-words">{name}</span>
                  <span className="text-foreground/70 ml-2">({result.bytecode_size[index]} bytes)</span>
                </li>
              ))}
            </ul>
          </div>
          
          {result.warnings.length > 0 && (
            <div>
              <h4 className="font-medium mb-1 text-warning">Warnings:</h4>
              <div className="bg-panel p-3 rounded border border-border">
                {result.warnings.map((warning, index) => (
                  <div key={index} className="text-warning/90 mb-2 last:mb-0">
                    {formatText(warning)}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {result.bytecode_path && (
            <div className="bg-panel p-3 rounded border border-border">
              <div className="font-medium mb-1 text-foreground/90">Bytecode Path:</div>
              <code className="block font-mono text-accent text-sm whitespace-pre-wrap break-all">
                {result.bytecode_path}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompileResult;