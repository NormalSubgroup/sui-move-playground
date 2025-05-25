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
  const [suggestedAddressName, setSuggestedAddressName] = useState<string | null>(null);
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

    // 从源代码中提取用户意图的地址名（模块声明中的第一部分）
    const lines = sourceCode.split('\n').slice(0, 10);
    let intendedAddressName: string | null = null;
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('module')) {
        // 匹配 module address_name::module_name 格式
        const match = trimmedLine.match(/^module\s+([a-zA-Z_][a-zA-Z0-9_]*)::/);
        if (match && match[1]) {
          intendedAddressName = match[1];
          break;
        }
      }
    }

    // 检查地址配置情况
    if (!intendedAddressName) {
      // 如果没有检测到意图地址名，但地址配置为空，提示用户手动配置
      if (!currentAddressesToml.trim()) {
        setConfirmModalConfig({
          isOpen: true,
          title: "地址配置缺失",
          message: "未能检测到模块中的地址名称，且地址配置为空。请手动配置地址。",
          variant: 'warning',
          onConfirm: () => setIsAddressesModalOpen(true)
        });
        return;
      }
      // 如果有地址配置但检测不到意图地址，直接编译
      await compiler.compile(sourceCode, fileName, currentAddressesToml);
      return;
    }

    // 检查意图地址是否在已配置地址中
    const foundAddress = normalAddresses.find(addr => addr.name === intendedAddressName);

    if (!currentAddressesToml.trim()) {
      // 情况a: 配置的地址是空，提示用户自动添加当前意图地址
      const autoAddressEntry = `${intendedAddressName} = "0x0"`;
      setConfirmModalConfig({
        isOpen: true,
        title: "地址配置为空",
        message: `检测到代码中使用的地址名称为 "${intendedAddressName}"，是否添加默认地址配置？\n\n${autoAddressEntry}`,
        variant: 'warning',
        onConfirm: () => {
          const newAddressesToml = `[addresses]\n${autoAddressEntry}\n`;
          setAddressesToml(newAddressesToml);
          compiler.compile(sourceCode, fileName, newAddressesToml);
        }
      });
      return;
    } else if (!foundAddress) {
      // 情况b: 检测用户意图地址是否能在已配置地址找到，如果不能，阻止编译，弹出地址配置框
      setConfirmModalConfig({
        isOpen: true,
        title: "地址配置不匹配",
        message: `代码中使用的地址名称 "${intendedAddressName}" 在当前地址配置中未找到。请配置此地址后再编译。`,
        variant: 'danger',
        onConfirm: () => {
          // 打开地址配置框，并传递意图地址名以便快速添加
          setSuggestedAddressName(intendedAddressName);
          setIsAddressesModalOpen(true);
        }
      });
      return;
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
      
      <main className="flex-1 flex flex-col lg:grid lg:grid-cols-[280px_1fr_380px] gap-2 p-2 min-h-0">
        {/* FileSystemPanel - responsive design */}
        <div className="lg:contents">
          <FileSystemPanel
            onExampleSelect={handleExampleSelect}
            onFileOpen={handleFileOpen}
            currentFileName={fileName}
            className="bg-panel border border-border rounded-md shadow-sm h-auto lg:h-full"
            onOpenAddressesModal={() => setIsAddressesModalOpen(true)}
            currentAddressesToml={addressesToml}
          />
        </div>

        {/* MainEditorPanel - takes most space on mobile */}
        <div className="flex-1 min-h-[400px] lg:min-h-0">
          <MainEditorPanel
            key={editorKey} // Key to re-mount editor when source changes externally
            sourceCode={sourceCode}
            onSourceCodeChange={setSourceCode}
            fileName={fileName}
            onCompile={handleCompile}
            isCompiling={compiler.isCompiling}
            initialEditorContent={sourceCode} // Pass initial content for editor
            className="bg-panel border border-border rounded-md shadow-sm flex flex-col h-full" // Added flex flex-col for internal layout
          />
        </div>

        {/* RightPanel - stacks below on mobile, side on desktop */}
        <div className="h-auto min-h-[300px] lg:h-full">
          <RightPanel
            compileResultData={compiler}
            deployResultData={deployer}
            testResultData={tester}
            onTest={handleTest}
            onDeploy={handleDeploy}
            isCompileSuccess={compiler.result?.success ?? false}
            className="bg-panel border border-border rounded-md shadow-sm h-full"
          />
        </div>

        {/* 新增：EditAddressesModal */}
        <EditAddressesModal
          isOpen={isAddressesModalOpen}
          onClose={() => {
            setIsAddressesModalOpen(false);
            setSuggestedAddressName(null); // 关闭时清空建议的地址名
          }}
          currentSourceCode={sourceCode}
          initialAddressesToml={addressesToml}
          onSave={handleSaveAddresses}
          suggestedAddressName={suggestedAddressName}
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
