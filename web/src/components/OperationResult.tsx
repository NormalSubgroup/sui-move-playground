import { useState } from 'react';
import type { DeployResponse, TestResponse } from '../types/api';
import { ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon, Cross2Icon } from '@radix-ui/react-icons';

interface OperationResultProps {
  type: 'deploy' | 'test';
  result: DeployResponse | TestResponse | null;
  error: string | null;
  isLoading: boolean;
}

const OutputModal = ({ 
  isOpen, 
  onClose, 
  title, 
  content, 
  isError = false 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  content: string; 
  isError?: boolean; 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            aria-label="关闭弹窗"
          >
            <Cross2Icon width={20} height={20} />
          </button>
        </div>
        <div className="flex-grow overflow-hidden p-4">
          <pre className={`bg-slate-900 p-4 rounded text-sm overflow-auto h-full whitespace-pre-wrap font-mono ${isError ? 'text-red-400' : 'text-slate-300'}`}>
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
};

const OperationResult = ({ type, result, error, isLoading }: OperationResultProps) => {
  const operationName = type === 'deploy' ? 'Deployment' : 'Test';
  const operationNameInProgress = type === 'deploy' ? 'Deploying' : 'Testing';
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderOutputSection = (content: string, isError = false, title = 'Output') => {
    const hasLongContent = content.split('\n').length > 8;
    
    return (
      <div>
        <div className="font-medium mb-1 text-foreground/90 flex items-center justify-between">
          <span>{title}:</span>
          {hasLongContent && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center text-xs text-accent hover:text-accent/80 bg-accent/10 hover:bg-accent/20 px-2 py-1 rounded transition-colors"
            >
              <ExternalLinkIcon className="w-3 h-3 mr-1" />
              全屏查看
            </button>
          )}
        </div>
        <div className="relative">
          <pre className={`bg-panel p-3 rounded text-sm overflow-auto whitespace-pre-wrap border border-border ${isError ? 'text-error' : 'text-foreground/90'} ${isExpanded ? 'max-h-[400px]' : 'max-h-32'}`}>
            {content}
          </pre>
          {hasLongContent && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute bottom-2 right-2 bg-panel/90 text-foreground/90 px-2 py-1 rounded-md text-xs flex items-center hover:bg-panel shadow"
            >
              {isExpanded ? (
                <>
                  <ChevronUpIcon className="w-3 h-3 mr-1" /> 收起
                </>
              ) : (
                <>
                  <ChevronDownIcon className="w-3 h-3 mr-1" /> 展开
                </>
              )}
            </button>
          )}
        </div>
        <OutputModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`${operationName} ${title}`}
          content={content}
          isError={isError}
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-foreground/80">
        <div className="animate-pulse">{operationNameInProgress}, please wait...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-error">
        <h3 className="font-semibold mb-2">{operationName} Error</h3>
        {renderOutputSection(error, true, 'Error Details')}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="p-4 text-foreground/60 italic">
        {operationName} results will be displayed here.
      </div>
    );
  }

  if (!result.success) {
    return (
      <div className="p-4">
        <h3 className="font-semibold text-error mb-2">{operationName} Failed</h3>
        {result.error && renderOutputSection(result.error, true, 'Error Details')}
        {!result.error && type === 'test' && result.output && renderOutputSection(result.output, false, 'Test Output')}
      </div>
    );
  }

  return (
    <div className="p-4 text-foreground">
      <h3 className="font-semibold text-success mb-2">{operationName} Successful!</h3>
      
      {type === 'deploy' && (result as DeployResponse).package_id && (
        <div className="mb-3">
          <div className="font-medium mb-1 text-foreground/90">Package ID:</div>
          <code className="block bg-panel p-2 rounded overflow-auto font-mono text-accent border border-border">
            {(result as DeployResponse).package_id}
          </code>
        </div>
      )}
      
      {result.output && renderOutputSection(result.output, false, 'Output')}
    </div>
  );
};

export default OperationResult;