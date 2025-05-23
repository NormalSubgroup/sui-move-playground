import { useState, useEffect } from 'react';
// import CodeEditor from './components/CodeEditor'; // Will be re-imported inside MainEditorPanel
// import CompileResult from './components/CompileResult'; // Will be re-imported inside RightPanel
// import OperationResult from './components/OperationResult'; // Logic will be split or reused
// import DeployOptions from './components/DeployOptions'; // Will be replaced by DeploymentPanel
// import ExampleSelector from './components/ExampleSelector'; // Will be re-imported
import { useCompiler } from './hooks/useCompiler';
import { useDeployer } from './hooks/useDeployer';
import { useTester } from './hooks/useTester';
import FileSystemPanel from './components/FileSystemPanel';
import MainEditorPanel from './components/MainEditorPanel';
import RightPanel from './components/RightPanel';
import EditAddressesModal from './components/EditAddressesModal';
import ConfirmModal from './components/ConfirmModal';

// Helper function (can be outside the component or in a utils file)
const parseNormalAddressesFromToml = (tomlString: string): Array<{name: string, value: string}> => {
  const normal: Array<{name: string, value: string}> = [];
  if (!tomlString) return normal;
  let inNormalSection = false;
  tomlString.split('\n').forEach(line => {
    line = line.trim();
    if (line === '[addresses]') {
      inNormalSection = true;
      return;
    }
    if (line.startsWith('[')) { 
      inNormalSection = false;
      return;
    }
    if (inNormalSection && line.includes('=')) {
      const parts = line.split('=').map(p => p.trim());
      if (parts.length === 2) {
        normal.push({ name: parts[0], value: parts[1].replace(/"/g, '') });
      }
    }
  });
  return normal;
};

function App() {
  const [sourceCode, setSourceCode] = useState('// Welcome to Sui Move Playground!\nmodule examples::hello_world {\n    fun main(ctx: &mut TxContext) {\n        // Your code here\n    }\n}\n');
  const [fileName, setFileName] = useState('hello.move');
  const [editorKey, setEditorKey] = useState(0); // To force re-render CodeEditor when example is loaded
  
  // 新增：地址配置相关的状态
  const [isAddressesModalOpen, setIsAddressesModalOpen] = useState(false);
  const [addressesToml, setAddressesToml] = useState<string>(() => {
    // Load from localStorage on initial render
    return localStorage.getItem('moveIdeAddressesToml') || '';
  });
  
  const compiler = useCompiler();
  const deployer = useDeployer();
  const tester = useTester();
  
  // Save to localStorage whenever addressesToml changes
  useEffect(() => {
    localStorage.setItem('moveIdeAddressesToml', addressesToml);
  }, [addressesToml]);

  const handleSaveAddresses = (newToml: string) => {
    setAddressesToml(newToml);
    setIsAddressesModalOpen(false);
  };

  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'default' | 'warning' | 'danger';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const checkAddressesAndCompile = async () => {
    let currentAddressesToml = addressesToml;
    let normalAddresses = parseNormalAddressesFromToml(currentAddressesToml);
    const hasZeroAddress = normalAddresses.some(addr => addr.value.trim() === '0x0');

    // 从源代码中提取模块名
    const lines = sourceCode.split('\n').slice(0, 10);
    let moduleName: string | null = null;
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('module')) {
        const match = trimmedLine.match(/^module\s+([a-zA-Z_][a-zA-Z0-9_]*)(::|\s*\{)/);
        if (match && match[1]) {
          moduleName = match[1];
          break;
        }
      }
    }

    // 检查地址配置
    if (!currentAddressesToml.trim() || !hasZeroAddress) {
      if (moduleName) {
        const autoAddressEntry = `${moduleName} = "0x0"`;
        let message = "";
        let title = "";
        
        if (!currentAddressesToml.trim()) {
          title = "地址配置为空";
          message = `检测到模块名称为 "${moduleName}"，是否添加默认地址配置？\n\n${autoAddressEntry}`;
        } else if (!hasZeroAddress) {
          title = "缺少默认地址";
          message = `当前配置中缺少默认地址。是否为模块 "${moduleName}" 添加默认地址？\n\n${autoAddressEntry}`;
        }

        if (message) {
          setConfirmModalConfig({
            isOpen: true,
            title,
            message,
            variant: 'warning',
            onConfirm: () => {
              let newAddressesToml = currentAddressesToml;
              if (currentAddressesToml.includes('[addresses]')) {
                newAddressesToml = currentAddressesToml.replace('[addresses]', `[addresses]\n${autoAddressEntry}`);
              } else if (currentAddressesToml.trim()) {
                newAddressesToml = `[addresses]\n${autoAddressEntry}\n\n${currentAddressesToml}`;
              } else {
                newAddressesToml = `[addresses]\n${autoAddressEntry}\n`;
              }
              setAddressesToml(newAddressesToml);
              compiler.compile(sourceCode, fileName, newAddressesToml);
            }
          });
          return;
        }
      } else if (!currentAddressesToml.trim()) {
        setConfirmModalConfig({
          isOpen: true,
          title: "地址配置缺失",
          message: "未能检测到模块名称，且地址配置为空。是否打开地址配置界面？",
          variant: 'warning',
          onConfirm: () => setIsAddressesModalOpen(true)
        });
        return;
      }
    }

    // 如果一切正常，直接编译
    await compiler.compile(sourceCode, fileName, currentAddressesToml);
  };

  const handleCompile = async () => {
    await checkAddressesAndCompile();
  };
  
  const handleFileOpen = (content: string, name: string) => {
    setSourceCode(content);
    setFileName(name);
    setEditorKey(prev => prev + 1); // Update key to re-initialize editor
  };

  const handleTest = async (command: string) => {
    await tester.test(command);
  };
  
  const handleDeploy = async (command: string) => {
    // TODO: Differentiate mainnet/testnet if DeployOptions passes this distinction
    // const isMainnet = _isMainnet; // Re-add if needed
    await deployer.deploy(command);
  };
  
  const handleExampleSelect = (code: string, exampleFileName: string) => {
    setSourceCode(code);
    setFileName(exampleFileName);
    setEditorKey(prev => prev + 1); // Force re-initialization of editor with new content
  };

  // DEBUG: Log props for child components
  console.log('[App.tsx] FileSystemPanel props:', { currentFileName: fileName });
  console.log('[App.tsx] MainEditorPanel props:', { sourceCode, fileName, isCompiling: compiler.isCompiling, editorKey });
  console.log('[App.tsx] RightPanel props:', { compileResultData: compiler, deployResultData: deployer, testResultData: tester, isCompileSuccess: compiler.result?.success ?? false });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <header className="bg-panel text-foreground p-3 shadow-md flex items-center justify-between sticky top-0 z-50 border-b border-border">
        <h1 className="text-xl font-semibold tracking-tight text-accent">Sui Move Playground ✨</h1>
        {/* Global actions could go here, e.g., Settings, Help */}
      </header>
      
      <main className="flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_380px] gap-2 p-2 overflow-hidden">
        {/* FileSystemPanel will be styled with panel background, border, etc. */}
        <FileSystemPanel
          onExampleSelect={handleExampleSelect}
          onFileOpen={handleFileOpen}
          currentFileName={fileName}
          className="bg-panel border border-border rounded-md shadow-sm"
          onOpenAddressesModal={() => setIsAddressesModalOpen(true)}
          currentAddressesToml={addressesToml}
        />

        {/* MainEditorPanel will contain the editor and its controls */}
        <MainEditorPanel
          key={editorKey} // Key to re-mount editor when source changes externally
          sourceCode={sourceCode}
          onSourceCodeChange={setSourceCode}
          fileName={fileName}
          onFileNameChange={setFileName}
          onCompile={handleCompile}
          isCompiling={compiler.isCompiling}
          initialEditorContent={sourceCode} // Pass initial content for editor
          className="bg-panel border border-border rounded-md shadow-sm flex flex-col" // Added flex flex-col for internal layout
        />

        {/* RightPanel for results and actions */}
        <RightPanel
          compileResultData={compiler}
          deployResultData={deployer}
          testResultData={tester}
          onTest={handleTest}
          onDeploy={handleDeploy}
          isCompileSuccess={compiler.result?.success ?? false}
          className="bg-panel border border-border rounded-md shadow-sm"
        />

        {/* 新增：EditAddressesModal */}
        <EditAddressesModal
          isOpen={isAddressesModalOpen}
          onClose={() => setIsAddressesModalOpen(false)}
          currentSourceCode={sourceCode}
          initialAddressesToml={addressesToml}
          onSave={handleSaveAddresses}
        />

        <ConfirmModal
          isOpen={confirmModalConfig.isOpen}
          onClose={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
          title={confirmModalConfig.title}
          message={confirmModalConfig.message}
          onConfirm={confirmModalConfig.onConfirm}
          variant={confirmModalConfig.variant}
        />
      </main>
      
      {/* 简化页脚 */}
      <footer className="bg-panel p-2 text-center text-xs text-foreground/70 border-t border-border">
        Sui Move Playground
      </footer>
    </div>
  );
}

export default App;
