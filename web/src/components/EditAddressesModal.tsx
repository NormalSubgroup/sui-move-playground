import React, { useState, useEffect, useMemo } from 'react';
import { Cross2Icon, ExclamationTriangleIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import ConfirmModal from './ConfirmModal';

interface AddressEntry {
  id: string;
  name: string;
  value: string;
}

interface EditAddressesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSourceCode: string;
  initialAddressesToml: string;
  onSave: (addressesToml: string) => void;
  suggestedAddressName?: string;
}

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const extractIntendedAddressNameFromSource = (source: string): string | null => {
  const lines = source.split('\n').slice(0, 20);
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('module')) {
      const match = trimmedLine.match(/^module\s+([a-zA-Z_][a-zA-Z0-9_]*)::/);
      if (match && match[1]) {
        return match[1];
      }
    }
  }
  return null;
};

const parseAddressesToml = (tomlString: string): { normal: AddressEntry[], dev: AddressEntry[] } => {
  const normal: AddressEntry[] = [];
  const dev: AddressEntry[] = [];
  if (!tomlString) return { normal, dev };

  let currentSection: 'normal' | 'dev' | null = null;
  tomlString.split('\n').forEach(line => {
    line = line.trim();
    if (line.toLowerCase() === '[addresses]') {
      currentSection = 'normal';
      return;
    }
    if (line.toLowerCase() === '[dev-addresses]') {
      currentSection = 'dev';
      return;
    }
    if (line.startsWith('#') || !line.includes('=')) return;

    const parts = line.split('=').map(p => p.trim());
    if (parts.length === 2) {
      const name = parts[0];
      const value = parts[1].replace(/["']/g, ''); // Remove quotes
      const entry = { id: generateId(), name, value };
      if (currentSection === 'normal') normal.push(entry);
      else if (currentSection === 'dev') dev.push(entry);
    }
  });
  return { normal, dev };
};

const formatAddressesToToml = (normal: AddressEntry[], dev: AddressEntry[]): string => {
  let toml = "";
  const hasNormal = normal.some(addr => addr.name.trim() && addr.value.trim());
  const hasDev = dev.some(addr => addr.name.trim() && addr.value.trim());

  if (hasNormal) {
    toml += "[addresses]\n";
    normal.forEach(addr => {
      if (addr.name.trim() && addr.value.trim()) {
        toml += `${addr.name.trim()} = "${addr.value.trim()}"\n`;
      }
    });
    if (hasDev) toml += "\n"; // Add a newline if dev addresses follow
  }

  if (hasDev) {
    toml += "[dev-addresses]\n";
    dev.forEach(addr => {
      if (addr.name.trim() && addr.value.trim()) {
        toml += `${addr.name.trim()} = "${addr.value.trim()}"\n`;
      }
    });
  }
  return toml.trim();
};


const EditAddressesModal: React.FC<EditAddressesModalProps> = ({
  isOpen,
  onClose,
  currentSourceCode,
  initialAddressesToml,
  onSave,
  suggestedAddressName,
}) => {
  const [normalAddresses, setNormalAddresses] = useState<AddressEntry[]>([]);
  const [devAddresses, setDevAddresses] = useState<AddressEntry[]>([]);
  
  const [intendedAddressName, setIntendedAddressName] = useState<string | null>(null);
  const [addressStatus, setAddressStatus] = useState<{ message: string; type: 'info' | 'warning' | 'error' } | null>(null);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
    variant?: 'default' | 'warning' | 'danger';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    if (isOpen) {
      const { normal, dev } = parseAddressesToml(initialAddressesToml);
      setNormalAddresses(normal);
      setDevAddresses(dev);
      const extractedName = extractIntendedAddressNameFromSource(currentSourceCode);
      setIntendedAddressName(extractedName || suggestedAddressName || null);
    } else {
      // Reset when closed
      setAddressStatus(null);
      setIntendedAddressName(null);
    }
  }, [initialAddressesToml, isOpen, currentSourceCode, suggestedAddressName]);

  useEffect(() => {
    if (!isOpen || !intendedAddressName) {
      setAddressStatus(null);
      return;
    }

    const addressEntry = normalAddresses.find(addr => addr.name === intendedAddressName);

    if (!addressEntry) {
      setAddressStatus({
        message: `代码中使用的地址名称 "${intendedAddressName}" 未在普通地址中配置。建议添加：${intendedAddressName} = "0x0"`,
        type: 'warning',
      });
    } else if (addressEntry.value.toLowerCase() !== '0x0') {
      setAddressStatus({
        message: `地址 "${intendedAddressName}" 的值应为 "0x0"，但配置为 "${addressEntry.value}"。这可能导致编译问题。`,
        type: 'error',
      });
    } else {
      setAddressStatus({
        message: `地址 "${intendedAddressName}" 配置正确: ${intendedAddressName} = "0x0"`,
        type: 'info',
      });
    }
  }, [isOpen, intendedAddressName, normalAddresses, currentSourceCode]);

  const handleAddAddress = (type: 'normal' | 'dev') => {
    const newAddress = { id: generateId(), name: '', value: '' };
    if (type === 'normal') {
      setNormalAddresses([...normalAddresses, newAddress]);
    } else {
      setDevAddresses([...devAddresses, newAddress]);
    }
  };

  const handleRemoveAddress = (type: 'normal' | 'dev', id: string) => {
    if (type === 'normal') {
      setNormalAddresses(normalAddresses.filter(addr => addr.id !== id));
    } else {
      setDevAddresses(devAddresses.filter(addr => addr.id !== id));
    }
  };

  const handleChangeAddress = (
    type: 'normal' | 'dev',
    id: string,
    field: 'name' | 'value',
    inputValue: string
  ) => {
    const updater = (prev: AddressEntry[]) =>
      prev.map(addr =>
        addr.id === id ? { ...addr, [field]: inputValue } : addr
      );
    if (type === 'normal') setNormalAddresses(updater);
    else setDevAddresses(updater);
  };

  const checkGeneralAddressConflicts = (): string[] => {
    const conflicts: string[] = [];
    const allAddresses = [...normalAddresses, ...devAddresses];
    const addressValues = new Map<string, string[]>(); // value -> list of names

    allAddresses.forEach(addr => {
      if (!addr.name.trim() || !addr.value.trim()) return;
      const cleanValue = addr.value.trim().toLowerCase();
      if (!addressValues.has(cleanValue)) {
        addressValues.set(cleanValue, []);
      }
      addressValues.get(cleanValue)!.push(addr.name.trim());
    });

    addressValues.forEach((names, value) => {
      if (names.length > 1) {
        conflicts.push(`地址 "${value}" 被用于多个名称: ${names.join(', ')}`);
      }
    });
    return conflicts;
  };

  const handleSave = () => {
    const generalConflicts = checkGeneralAddressConflicts();
    let currentModuleConflictMessage = '';

    if (intendedAddressName) {
        const addressEntry = normalAddresses.find(addr => addr.name === intendedAddressName);
        if (!addressEntry) {
            currentModuleConflictMessage = `地址 "${intendedAddressName}" 未在普通地址中配置。建议添加：${intendedAddressName} = "0x0"`;
        } else if (addressEntry.value.toLowerCase() !== '0x0') {
            currentModuleConflictMessage = `地址 "${intendedAddressName}" 的值应为 "0x0"，但配置为 "${addressEntry.value}"。这可能导致编译问题。`;
        }
    }
    
    const allConflictMessages: string[] = [];
    if (currentModuleConflictMessage) {
        allConflictMessages.push(currentModuleConflictMessage);
    }
    allConflictMessages.push(...generalConflicts);

    if (allConflictMessages.length > 0) {
      setConfirmConfig({
        isOpen: true,
        title: "地址配置问题",
        message: (
          <div>
            <p className="mb-2">检测到以下问题:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {allConflictMessages.map((msg, idx) => <li key={idx}>{msg}</li>)}
            </ul>
            <p className="mt-3">是否仍要保存？</p>
          </div>
        ),
        variant: 'warning',
        onConfirm: () => {
          onSave(formatAddressesToToml(normalAddresses, devAddresses));
          onClose();
        }
      });
      return;
    }

    onSave(formatAddressesToToml(normalAddresses, devAddresses));
    onClose();
  };

  const currentTomlPreview = useMemo(() => {
    return formatAddressesToToml(normalAddresses, devAddresses);
  }, [normalAddresses, devAddresses]);

  if (!isOpen) return null;

  const renderAddressList = (
    list: AddressEntry[],
    type: 'normal' | 'dev',
    title: string
  ) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-slate-200 mb-3">{title}</h3>
      {list.length === 0 && <p className="text-sm text-slate-400 italic">此部分没有地址。</p>}
      {list.map(addr => (
        <div key={addr.id} className="flex items-center space-x-2 mb-2 bg-slate-700/50 p-2.5 rounded-md">
          <input
            type="text"
            placeholder="名称 (e.g., std)"
            value={addr.name}
            onChange={e => handleChangeAddress(type, addr.id, 'name', e.target.value)}
            className="flex-1 p-2 border border-slate-600 rounded bg-slate-900 text-slate-200 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <span className="text-slate-400">=</span>
          <input
            type="text"
            placeholder="地址值 (e.g., 0x1)"
            value={addr.value}
            onChange={e => handleChangeAddress(type, addr.id, 'value', e.target.value)}
            className="flex-1 p-2 border border-slate-600 rounded bg-slate-900 text-slate-200 placeholder-slate-400 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <button
            onClick={() => handleRemoveAddress(type, addr.id)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-md transition-colors"
            title="删除地址"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      ))}
      <button
        onClick={() => handleAddAddress(type)}
        className="mt-1 text-sm bg-violet-600/80 text-white hover:bg-violet-600 px-3 py-1.5 rounded-md transition-colors"
      >
        + 添加 {type === 'normal' ? '普通' : '开发'} 地址
      </button>
    </div>
  );
  
  let statusIcon = null;
  let statusColor = 'text-slate-400';
  if (addressStatus) {
    if (addressStatus.type === 'info') {
      statusIcon = <InfoCircledIcon className="w-5 h-5 mr-2 text-green-400" />;
      statusColor = 'text-green-400';
    } else if (addressStatus.type === 'warning') {
      statusIcon = <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-amber-400" />;
      statusColor = 'text-amber-400';
    } else if (addressStatus.type === 'error') {
      statusIcon = <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-400" />;
      statusColor = 'text-red-400';
    }
  }

  const handleQuickAddIntendedAddress = () => {
    if (!intendedAddressName) return;
    
    const newAddress = { 
      id: generateId(), 
      name: intendedAddressName, 
      value: '0x0' 
    };
    setNormalAddresses([...normalAddresses, newAddress]);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-40">
        <div 
          className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col z-50"
        >
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-slate-100">配置 Move 地址</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              aria-label="关闭弹窗"
            >
              <Cross2Icon width={20} height={20} />
            </button>
          </div>

          <div className="mb-4 p-3 rounded-md bg-slate-900/70 border border-slate-700">
            <p className="text-sm text-slate-300">
              当前检测到的地址名称: <strong className="text-violet-400">{intendedAddressName || '未检测到'}</strong>
            </p>
            {addressStatus && (
              <div className={`mt-2 flex items-center justify-between text-sm ${statusColor}`}>
                <div className="flex items-center">
                  {statusIcon}
                  <span>{addressStatus.message}</span>
                </div>
                {addressStatus.type === 'warning' && intendedAddressName && (
                  <button
                    onClick={handleQuickAddIntendedAddress}
                    className="ml-3 px-3 py-1 text-xs bg-amber-600/80 text-white hover:bg-amber-600 rounded-md transition-colors"
                  >
                    快速添加
                  </button>
                )}
              </div>
            )}
             {!intendedAddressName && !addressStatus && (
                <p className="text-xs text-slate-500 mt-1">提示: 地址名称通常在代码类似 <code>module my_address::...</code> 定义处提取。如果未检测到，请检查模块定义。</p>
            )}
          </div>
          
          <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
            {renderAddressList(normalAddresses, 'normal', '普通地址 ([addresses])')}
            {renderAddressList(devAddresses, 'dev', '开发地址 ([dev-addresses])')}
          
            <div className="mt-4 pt-3 border-t border-slate-700">
              <h3 className="text-md font-semibold text-slate-300 mb-2">Toml 格式预览:</h3>
              <pre className="bg-slate-900 p-3 rounded text-xs text-slate-400 whitespace-pre-wrap max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                {currentTomlPreview || "# 当前没有配置地址"}
              </pre>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-700">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md text-sm text-white bg-violet-600 hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              保存并应用
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        variant={confirmConfig.variant}
      />
    </>
  );
};

export default EditAddressesModal; 