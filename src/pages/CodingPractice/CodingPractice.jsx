import React from 'react';
import CodeSandbox from '../../components/CodeSandbox';
import AntiCheatPopup from '../../components/AntiCheatPopup';
import { Code2 } from 'lucide-react';

const CodingPractice = () => {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in-up h-[calc(100vh-100px)] flex flex-col">
      <AntiCheatPopup />
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#10194A] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10194A] flex items-center justify-center shadow-sm">
              <Code2 className="w-5 h-5 text-[#EBA66F]" />
            </div>
            Coding Practice Arena
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#666675] mt-1">
            Sharpen your DSA problem solving skills with curated algorithmic challenges and a real-time execution engine.
          </p>
        </div>
      </div>

      {/* Sandbox Container */}
      <div className="flex-1 min-h-[500px] relative">
        <CodeSandbox />
      </div>
    </div>
  );
};

export default CodingPractice;
