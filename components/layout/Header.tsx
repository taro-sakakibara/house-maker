import React from 'react';
import { useApp } from '@/contexts/AppContext';

export default function Header() {
  const { saveProject, loadProject } = useApp();

  const handleSave = async () => {
    await saveProject();
  };

  const handleLoad = async () => {
    await loadProject();
  };

  return (
    <header className="bg-gray-800 text-white h-16 flex items-center justify-between px-6 shadow-lg">
      <h1 className="text-2xl font-bold">House Maker</h1>
      
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium transition-colors"
        >
          保存
        </button>
        <button
          onClick={handleLoad}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md font-medium transition-colors"
        >
          読み込み
        </button>
      </div>
    </header>
  );
}