import { useState } from 'react';
import CompileResult from './CompileResult';
import OperationResult from './OperationResult';
import DeployOptions from './DeployOptions';
import { RocketIcon, CheckCircledIcon, LightningBoltIcon, CubeIcon } from '@radix-ui/react-icons';
import type { CompileResponse, DeployResponse, TestResponse } from '../types/api'; // Import correct types

interface RightPanelProps {
  compileResultData: { result: CompileResponse | null; error: string | null; isCompiling: boolean; };
  deployResultData: { result: DeployResponse | null; error: string | null; isDeploying: boolean; };
  testResultData: { result: TestResponse | null; error: string | null; isTesting: boolean; };
  onTest: (command: string) => void;
  onDeploy: (command: string, isMainnet: boolean) => void;
  isCompileSuccess: boolean;
  className?: string;
}

const TABS = [
  { id: 'compile', label: 'Compile', icon: CubeIcon },
  { id: 'test', label: 'Test', icon: LightningBoltIcon },
  { id: 'deploy', label: 'Deploy', icon: RocketIcon },
];

const RightPanel = ({
  compileResultData,
  deployResultData,
  testResultData,
  onTest,
  onDeploy,
  isCompileSuccess,
  className, // Destructure className
}: RightPanelProps) => {
  const [activeTab, setActiveTab] = useState<'compile' | 'test' | 'deploy'>('compile');
  const bytecodePath = compileResultData.result?.success ? compileResultData.result.bytecode_path : null;

  return (
    <div className={`p-0 h-full flex flex-col ${className}`}> {/* Apply className */}
      <div className="flex border-b border-border px-2 pt-2 bg-panel rounded-t-md">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'compile' | 'test' | 'deploy')}
            className={`flex items-center py-2.5 px-4 text-sm font-medium focus:outline-none transition-all duration-150 rounded-t-md -mb-px border-b-2
              ${activeTab === tab.id
                ? 'text-accent border-accent bg-background' // Active tab style
                : 'text-foreground/70 hover:text-accent border-transparent hover:border-border'
            }`}
          >
            <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-accent' : 'text-foreground/60'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-grow p-4 overflow-y-auto bg-background rounded-b-md"> {/* Content area background */}
        {activeTab === 'compile' && (
          <CompileResult
            result={compileResultData.result}
            error={compileResultData.error}
            isCompiling={compileResultData.isCompiling}
          />
        )}
        {activeTab === 'test' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <LightningBoltIcon className="w-5 h-5 mr-2 text-warning" /> Test Execution
            </h3>
            <button
              onClick={() => bytecodePath && onTest(`sui move test --path ${bytecodePath}`)}
              disabled={!isCompileSuccess || testResultData.isTesting || !bytecodePath}
              className="w-full flex items-center justify-center bg-warning text-background py-2.5 px-4 rounded-md hover:bg-warning/90 disabled:bg-panel disabled:text-foreground/50 disabled:cursor-not-allowed text-sm font-medium transition-colors duration-150 shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-warning/70 focus:ring-opacity-75"
            >
              {testResultData.isTesting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircledIcon className="w-4 h-4 mr-2" /> Run Package Tests
                </>
              )}
            </button>
            <OperationResult
              type="test"
              result={testResultData.result}
              error={testResultData.error}
              isLoading={testResultData.isTesting}
            />
          </div>
        )}
        {activeTab === 'deploy' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <RocketIcon className="w-5 h-5 mr-2 text-accent" /> Deployment Management
            </h3>
            <DeployOptions
              bytecodePathOrCommand={bytecodePath ?? undefined}
              onDeployTestnet={(command: string) => onDeploy(command, false)}
              onDeployMainnet={(command: string) => onDeploy(command, true)}
              isCompileSuccess={isCompileSuccess}
              isDeploying={deployResultData.isDeploying}
              isTesting={false}
              onTest={() => {}}
            />
            <div className="mt-3">
              <OperationResult
                type="deploy"
                result={deployResultData.result}
                error={deployResultData.error}
                isLoading={deployResultData.isDeploying}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightPanel;