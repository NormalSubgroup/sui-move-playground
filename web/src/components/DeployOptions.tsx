import { useState } from 'react';

interface DeployOptionsProps {
  bytecodePathOrCommand?: string;
  // onTest: (command: string) => void; // Removed as test button is in RightPanel's Test tab
  onDeployTestnet: (command: string) => void;
  onDeployMainnet: (command: string) => void;
  isCompileSuccess: boolean;
  // isTesting: boolean; // Removed as test button is in RightPanel's Test tab
  isDeploying: boolean;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"> {/* Darker overlay */}
      <div className="bg-panel rounded-lg max-w-md w-full p-6 shadow-xl border border-border"> {/* Panel background, border, shadow */}
        <h3 className="text-xl font-bold mb-4 text-foreground">{title}</h3>
        <p className="mb-6 text-foreground/80">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md hover:bg-background text-foreground/90" // Themed cancel button
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-error text-white rounded-md hover:bg-error/90" // Themed confirm button (using error color for destructive action)
          >
            Confirm Deploy
          </button>
        </div>
      </div>
    </div>
  );
};

const DeployOptions = ({
  bytecodePathOrCommand,
  // onTest, // Removed
  onDeployTestnet,
  onDeployMainnet,
  isCompileSuccess,
  // isTesting, // Removed
  isDeploying
}: DeployOptionsProps) => {
  const [isMainnetModalOpen, setIsMainnetModalOpen] = useState(false);
  
  // Example commands, adjust as needed for actual CLI usage
  const getDeployTestnetCommand = () => {
    if (!bytecodePathOrCommand) return '';
    // Example: `sui client publish --gas-budget 10000000 --json <path-to-bytecode>`
    // If bytecodePathOrCommand is the full command, just return it.
    // For now, assuming it's a path that needs to be part of a command:
    return `sui client publish --gas-budget 200000000 ${bytecodePathOrCommand}`; // Increased gas budget
  };
  
  const getDeployMainnetCommand = () => {
    if (!bytecodePathOrCommand) return '';
    return `sui client publish --gas-budget 200000000 ${bytecodePathOrCommand}`; // Increased gas budget
  };

  // Test button logic is now in RightPanel.tsx, so handleTest and getTestCommand might be redundant here
  // unless DeployOptions is meant to have its own test button.
  // const handleTest = () => {
  //   const command = getTestCommand();
  //   if (command) onTest(command);
  // };

  const handleDeployTestnet = () => {
    const command = getDeployTestnetCommand();
    if (command) onDeployTestnet(command);
  };

  const handleDeployMainnet = () => {
    setIsMainnetModalOpen(true);
  };

  const confirmMainnetDeploy = () => {
    const command = getDeployMainnetCommand();
    if (command) onDeployMainnet(command);
    setIsMainnetModalOpen(false);
  };

  const isLoading = isDeploying; // isTesting is no longer directly relevant for these buttons
  const isDisabled = !isCompileSuccess || isLoading;

  return (
    <div className="space-y-3"> {/* Increased spacing */}
      {/* Test button has been moved to RightPanel's Test tab. If needed here, it should be re-added. */}
      {/* <button
        className={`w-full py-2.5 px-4 rounded-md font-medium transition-colors duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
          isDisabled || isTesting // Keep isTesting if this button is re-added
            ? 'bg-panel text-foreground/50 cursor-not-allowed border border-border'
            : 'bg-success text-white hover:bg-success/90 focus:ring-success/70'
        }`}
        onClick={handleTest}
        disabled={isDisabled || isTesting}
      >
        {isTesting ? 'Testing...' : 'Test Contract'}
      </button> */}
      
      <button
        className={`w-full py-2.5 px-4 rounded-md font-medium transition-colors duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
          isDisabled
            ? 'bg-panel text-foreground/50 cursor-not-allowed border border-border'
            : 'bg-accent text-white hover:bg-accent/90 focus:ring-accent/70' // Use accent for testnet
        }`}
        onClick={handleDeployTestnet}
        disabled={isDisabled}
      >
        {isDeploying ? 'Deploying...' : 'Deploy to Testnet'}
      </button>
      
      <button
        className={`w-full py-2.5 px-4 rounded-md font-medium transition-colors duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
          isDisabled
            ? 'bg-panel text-foreground/50 cursor-not-allowed border border-border'
            : 'bg-error text-white hover:bg-error/90 focus:ring-error/70' // Use error for mainnet (destructive action)
        }`}
        onClick={handleDeployMainnet}
        disabled={isDisabled}
      >
        Deploy to Mainnet
      </button>

      <ConfirmModal
        isOpen={isMainnetModalOpen}
        onClose={() => setIsMainnetModalOpen(false)}
        onConfirm={confirmMainnetDeploy}
        title="Confirm Deploy to Mainnet"
        message="You are about to deploy the contract to the Mainnet. This is an irreversible action. Please ensure you have completed thorough testing."
      />
    </div>
  );
};

export default DeployOptions;