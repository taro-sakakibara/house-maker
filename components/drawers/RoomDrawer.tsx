'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import RoomForm from '@/components/RoomForm';
import RoomList from '@/components/RoomList';

interface RoomDrawerProps {
  onClose: () => void;
}

export default function RoomDrawer({ onClose }: RoomDrawerProps) {
  const { rooms } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  const handleAddNew = () => {
    setEditingRoom(null);
    setShowForm(true);
  };

  const handleEditRoom = (room: any) => {
    setEditingRoom(room);
    setShowForm(true);
  };

  const handleFormComplete = () => {
    setShowForm(false);
    setEditingRoom(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.stopPropagation();
    }
  };

  return (
    <div className="space-y-[12px]" onKeyDown={handleKeyDown}>
      {/* Add Room Button */}
      <button
        onClick={handleAddNew}
        disabled={rooms.length >= 1 && !showForm}
        className={`w-full flex items-center space-x-[8px] px-[8px] py-[4px] rounded text-xs transition-colors ${
          rooms.length >= 1 && !showForm
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        <svg className="w-[12px] h-[12px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>新規部屋</span>
      </button>

      {/* Form */}
      {showForm && (
        <div className="bg-gray-50 p-[8px] rounded text-xs border">
          <div className="flex items-center justify-between mb-[8px]">
            <span className="font-medium text-gray-800">
              {editingRoom ? '編集' : '新規作成'}
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
          <RoomForm editingRoom={editingRoom} onEditComplete={handleFormComplete} />
        </div>
      )}

      {/* Room List */}
      <div>
        <div className="text-xs text-gray-600 mb-[8px]">部屋一覧 ({rooms.length})</div>
        <RoomList onEditRoom={handleEditRoom} />
      </div>
    </div>
  );
}