import { useState } from 'react';
import { codeExamples } from '../services/api';

interface ExampleSelectorProps {
  onSelectExample: (code: string) => void;
}

const ExampleSelector = ({ onSelectExample }: ExampleSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectExample = (code: string) => {
    onSelectExample(code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center"
      >
        <span>加载示例</span>
        <svg
          className={`ml-1 w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
          {codeExamples.map((example, index) => (
            <button
              key={index}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => handleSelectExample(example.code)}
            >
              <div className="font-medium">{example.name}</div>
              <div className="text-xs text-gray-500">{example.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExampleSelector; 