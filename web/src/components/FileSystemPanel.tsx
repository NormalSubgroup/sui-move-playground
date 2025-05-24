import React, { useState, useRef } from 'react';
import { codeExamples } from '../services/api';
import { FileTextIcon, ArchiveIcon, GearIcon, ChevronDownIcon, ChevronUpIcon, MixerHorizontalIcon, Cross2Icon } from '@radix-ui/react-icons';

interface FileSystemPanelProps {
  onExampleSelect: (code: string, fileName: string) => void;
  onFileOpen: (content: string, name: string) => void;
  currentFileName: string;
  className?: string;
  onOpenAddressesModal: () => void;
  currentAddressesToml: string;
}

const FileSystemPanel = ({
  onExampleSelect,
  onFileOpen,
  currentFileName,
  className,
  onOpenAddressesModal,
  currentAddressesToml
}: FileSystemPanelProps) => {
  const [isAddressPreviewVisible, setIsAddressPreviewVisible] = useState(false);
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [isExampleModalOpen, setIsExampleModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          onFileOpen(content, file.name);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExampleSelect = (code: string, name: string) => {
    setSelectedExample(name);
    onExampleSelect(code, `${name.toLowerCase().replace(/\s+/g, '_')}.move`);
    setIsExampleModalOpen(false);
  };

  return (
    <>
      <div className={`p-4 h-full flex flex-col ${className}`}>
        {/* Desktop Layout - 大屏幕显示完整布局 */}
        <div className="hidden lg:flex lg:flex-col lg:h-full">
          <h2 className="text-lg font-semibold mb-4 text-foreground border-b border-border pb-2 flex items-center">
            <ArchiveIcon className="w-5 h-5 mr-2 text-accent" />
            File Explorer
          </h2>
          
          <div className="mb-4">
            <p className="text-xs text-foreground/70 mb-1 uppercase tracking-wider font-medium">Current File</p>
            <div className="bg-background p-3 rounded-md border border-border text-sm text-foreground truncate shadow-sm">
              {currentFileName || 'No file selected'}
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".move,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={handleOpenFile}
              className="flex items-center justify-center w-full bg-accent text-foreground p-2.5 rounded-md text-sm hover:bg-accent/90 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/70 focus:ring-opacity-75 shadow hover:shadow-md"
            >
              <FileTextIcon className="w-4 h-4 mr-2" /> Open File
            </button>
            
            <button
              onClick={() => setIsAddressPreviewVisible(!isAddressPreviewVisible)}
              className="flex items-center justify-center w-full bg-secondary text-secondary-foreground p-2.5 rounded-md text-sm hover:bg-secondary/90 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-secondary/70 focus:ring-opacity-75 shadow hover:shadow-md"
            >
              <GearIcon className="w-4 h-4 mr-2" /> Addresses Configuration
              {isAddressPreviewVisible ? <ChevronUpIcon className="w-4 h-4 ml-auto" /> : <ChevronDownIcon className="w-4 h-4 ml-auto" />}
            </button>

            {isAddressPreviewVisible && (
              <div className="mt-2 p-3 border border-slate-700 rounded-md bg-slate-800 shadow-sm">
                <h4 className="text-xs text-slate-300 mb-2 font-medium">Current Addresses Preview:</h4>
                <pre className="bg-slate-900 p-2 rounded text-xs text-slate-400 whitespace-pre-wrap max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                  {currentAddressesToml.trim() || "# No addresses configured."}
                </pre>
                <button
                  onClick={onOpenAddressesModal}
                  className="mt-3 w-full flex items-center justify-start gap-2 px-3 py-2 rounded-md text-sm text-violet-400 hover:text-violet-300 bg-transparent hover:bg-slate-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                  <MixerHorizontalIcon className="w-4 h-4" /> Configure Detailed Addresses
                </button>
              </div>
            )}
          </div>

          <h3 className="text-base font-semibold mb-3 text-foreground/90 border-t border-border pt-3">
            Load Example
          </h3>
          <div className="space-y-2 flex-grow overflow-y-auto pr-1 -mr-1">
            {codeExamples.map((ex) => (
              <button
                key={ex.name}
                onClick={() => handleExampleSelect(ex.code, ex.name)}
                title={ex.description}
                className={`w-full text-left p-3 rounded-md border transition-all duration-150 shadow-sm hover:shadow-md text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                  ${selectedExample === ex.name 
                    ? 'bg-accent text-background border-accent' 
                    : 'bg-background text-foreground border-border hover:bg-panel hover:border-accent/50'
                  }`}
              >
                <div className={`font-medium ${selectedExample === ex.name ? 'text-background' : 'text-accent'}`}>{ex.name}</div>
                <div className={`text-xs mt-1 ${selectedExample === ex.name ? 'text-background/80' : 'text-foreground/70'}`}>{ex.description}</div>
              </button>
            ))}
          </div>
          <div className="mt-auto pt-3 text-xs text-foreground/50 border-t border-border text-center">
            File System
          </div>
        </div>

        {/* Mobile Layout - 移动端紧凑布局 */}
        <div className="lg:hidden flex flex-col h-full">
          <h2 className="text-lg font-semibold mb-3 text-foreground border-b border-border pb-2 flex items-center">
            <ArchiveIcon className="w-5 h-5 mr-2 text-accent" />
            File Explorer
          </h2>

          {/* 当前文件显示 */}
          <div className="mb-3">
            <div className="bg-background p-2.5 rounded-md border border-border text-sm text-foreground truncate shadow-sm">
              📄 {currentFileName || 'No file selected'}
            </div>
          </div>

          {/* 移动端按钮网格 */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".move,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={handleOpenFile}
              className="flex items-center justify-center bg-accent text-foreground p-2.5 rounded-md text-sm hover:bg-accent/90 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/70 shadow hover:shadow-md"
            >
              <FileTextIcon className="w-4 h-4 mr-1.5" /> Open
            </button>
            
            <button
              onClick={() => setIsExampleModalOpen(true)}
              className="flex items-center justify-center bg-primary text-primary-foreground p-2.5 rounded-md text-sm hover:bg-primary/90 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/70 shadow hover:shadow-md"
            >
              <ArchiveIcon className="w-4 h-4 mr-1.5" /> Examples
            </button>
          </div>

          <button
            onClick={onOpenAddressesModal}
            className="flex items-center justify-center w-full bg-secondary text-secondary-foreground p-2.5 rounded-md text-sm hover:bg-secondary/90 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-secondary/70 shadow hover:shadow-md mb-3"
          >
            <GearIcon className="w-4 h-4 mr-2" /> Addresses Config
          </button>

          {/* 当前示例显示 */}
          {selectedExample && (
            <div className="bg-panel p-3 rounded-md border border-border text-sm">
              <div className="text-accent font-medium">✨ {selectedExample}</div>
              <div className="text-foreground/70 text-xs mt-1">
                {codeExamples.find(ex => ex.name === selectedExample)?.description}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Examples Modal for Mobile */}
      {isExampleModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 lg:hidden">
          <div className="bg-panel rounded-lg border border-border shadow-lg w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <ArchiveIcon className="w-5 h-5 mr-2 text-accent" />
                选择示例代码
              </h3>
              <button
                onClick={() => setIsExampleModalOpen(false)}
                className="p-1 rounded-md hover:bg-background/50 text-foreground/70 hover:text-foreground transition-colors"
              >
                <Cross2Icon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {codeExamples.map((ex) => (
                <button
                  key={ex.name}
                  onClick={() => handleExampleSelect(ex.code, ex.name)}
                  className={`w-full text-left p-4 rounded-md border transition-all duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                    ${selectedExample === ex.name 
                      ? 'bg-accent text-background border-accent' 
                      : 'bg-background text-foreground border-border hover:bg-panel hover:border-accent/50'
                    }`}
                >
                  <div className={`font-medium text-base ${selectedExample === ex.name ? 'text-background' : 'text-accent'}`}>
                    {ex.name}
                  </div>
                  <div className={`text-sm mt-2 ${selectedExample === ex.name ? 'text-background/80' : 'text-foreground/70'}`}>
                    {ex.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileSystemPanel;