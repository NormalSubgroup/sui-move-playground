import React from 'react';
import { Cross2Icon, ExclamationTriangleIcon } from '@radix-ui/react-icons';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string | React.ReactNode; // Allow ReactNode for more complex messages
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'warning' | 'danger';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = "确认",
  cancelText = "取消",
  variant = 'default',
}) => {
  if (!isOpen) return null;

  let titleColor = "text-slate-100";
  let icon: React.ReactNode = null;
  let confirmButtonClass = "bg-violet-600 hover:bg-violet-500 text-white";

  if (variant === 'warning') {
    titleColor = "text-amber-400";
    icon = <ExclamationTriangleIcon className="w-6 h-6 mr-2 text-amber-400" />;
    confirmButtonClass = "bg-amber-500 hover:bg-amber-400 text-black";
  } else if (variant === 'danger') {
    titleColor = "text-red-400";
    icon = <ExclamationTriangleIcon className="w-6 h-6 mr-2 text-red-400" />; // Could use a different icon for danger
    confirmButtonClass = "bg-red-600 hover:bg-red-500 text-white";
  }


  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"> {/* Higher z-index than EditAddressesModal */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-6 w-full max-w-md flex flex-col z-[70]">
        <div className="flex items-start mb-4">
          {icon}
          <h2 className={`text-xl font-semibold ${titleColor}`}>{title}</h2>
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            aria-label="关闭确认框"
          >
            <Cross2Icon width={18} height={18} />
          </button>
        </div>

        <div className="text-slate-300 mb-6 text-sm whitespace-pre-line">
          {message}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose(); // Usually, confirm also closes the modal
            }}
            className={`px-4 py-2 rounded-md text-sm ${confirmButtonClass} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 