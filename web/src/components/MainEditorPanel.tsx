import CodeEditor from './CodeEditor';
import { PlayIcon, FileTextIcon, ClockIcon } from '@radix-ui/react-icons';

interface MainEditorPanelProps {
  sourceCode: string;
  onSourceCodeChange: (value: string) => void;
  fileName: string;
  onFileNameChange: (value: string) => void;
  onCompile: () => void;
  isCompiling: boolean;
  initialEditorContent: string;
  className?: string;
}

const MainEditorPanel = ({
  sourceCode,
  onSourceCodeChange,
  fileName,
  onFileNameChange,
  onCompile,
  isCompiling,
  initialEditorContent,
  className,
}: MainEditorPanelProps) => {
  // 计算代码统计信息
  const lines = sourceCode.split('\n').length;
  const characters = sourceCode.length;
  const words = sourceCode.trim() ? sourceCode.trim().split(/\s+/).length : 0;

  return (
    <div className={`p-4 h-full flex flex-col ${className}`}>
      {/* 编辑器信息栏 */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
        <div className="flex items-center space-x-4 text-sm text-foreground/70">
          <div className="flex items-center">
            <FileTextIcon className="w-4 h-4 mr-1.5" />
            <span className="font-medium text-foreground">{fileName || 'untitled.move'}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>{lines} 行</span>
            <span>{words} 词</span>
            <span>{characters} 字符</span>
          </div>
          {isCompiling && (
            <div className="flex items-center text-accent">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span>编译中...</span>
            </div>
          )}
        </div>
        <button
          className="flex items-center justify-center bg-accent text-foreground py-2.5 px-5 rounded-md hover:bg-accent/90 disabled:bg-accent/50 disabled:cursor-not-allowed text-sm font-medium transition-colors duration-150 whitespace-nowrap shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent/70 focus:ring-opacity-75"
          onClick={onCompile}
          disabled={isCompiling || !sourceCode.trim()}
        >
          {isCompiling ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Compiling...
            </>
          ) : (
            <>
              <PlayIcon className="w-4 h-4 mr-2" />
              Compile
            </>
          )}
        </button>
      </div>
      {/* 编辑器占据剩余空间 */}
      <div className="flex-grow h-[calc(100%-70px)] rounded-md overflow-hidden shadow-inner bg-background border border-border">
        <CodeEditor
          initialValue={initialEditorContent}
          onChange={onSourceCodeChange}
        />
      </div>
    </div>
  );
};

export default MainEditorPanel;