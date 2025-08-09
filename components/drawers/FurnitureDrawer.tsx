'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import FurnitureForm from '@/components/FurnitureForm';
import FurnitureList from '@/components/FurnitureList';
import { Furniture } from '@/types/furniture';

interface FurnitureDrawerProps {
  onClose: () => void;
}

export default function FurnitureDrawer({}: FurnitureDrawerProps) {
  const { activeRoomId, getFurnitureInRoom } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingFurniture, setEditingFurniture] = useState<Furniture | undefined>(undefined);

  const roomFurniture = getFurnitureInRoom(activeRoomId);

  const handleAddNew = () => {
    setEditingFurniture(undefined);
    setShowForm(true);
  };

  const handleEditFurniture = (furniture: Furniture) => {
    setEditingFurniture(furniture);
    setShowForm(true);
  };

  const handleFormComplete = () => {
    setShowForm(false);
    setEditingFurniture(undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.stopPropagation();
    }
  };

  return (
    <div className="space-y-[12px]" onKeyDown={handleKeyDown}>
      {/* Add Furniture Button */}
      <button
        onClick={handleAddNew}
        disabled={!activeRoomId}
        className={`w-full flex items-center space-x-[8px] px-[8px] py-[4px] rounded text-xs transition-colors ${
          !activeRoomId
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-green-500 text-white hover:bg-green-600'
        }`}
      >
        <svg className="w-[12px] h-[12px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>新規家具</span>
      </button>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 p-[8px] rounded text-xs border">
          <div className="flex items-center justify-between mb-[8px]">
            <span className="font-medium text-gray-800">
              {editingFurniture ? '編集' : '新規作成'}
            </span>
            <button
              onClick={handleFormComplete}
              className="text-gray-400 hover:text-gray-600 p-[4px]"
            >
              <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <FurnitureForm editingFurniture={editingFurniture} onEditComplete={handleFormComplete} />
        </div>
      )}

      {/* Furniture List */}
      <div>
        <div className="text-xs text-gray-600 mb-[8px]">家具一覧 ({roomFurniture.length})</div>
        <FurnitureList onEditFurniture={handleEditFurniture} />
      </div>
    </div>
  );
}