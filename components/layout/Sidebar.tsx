'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import RoomForm from '@/components/RoomForm';
import RoomList from '@/components/RoomList';
import FurnitureForm from '@/components/FurnitureForm';
import FurnitureList from '@/components/FurnitureList';

export default function Sidebar() {
  const { rooms, furniture, getFurnitureInRoom, activeRoomId, saveProject } = useApp();
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showFurnitureForm, setShowFurnitureForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [editingFurniture, setEditingFurniture] = useState<any>(null);

  const handleEditRoom = (room: any) => {
    setEditingRoom(room);
    setShowRoomForm(true);
  };

  const handleEditComplete = () => {
    setEditingRoom(null);
    setShowRoomForm(false);
  };

  const handleEditFurniture = (furniture: any) => {
    setEditingFurniture(furniture);
    setShowFurnitureForm(true);
  };

  const handleFurnitureEditComplete = () => {
    setEditingFurniture(null);
    setShowFurnitureForm(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // サイドバー内でのキーボードイベントを停止
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.stopPropagation();
    }
  };

  return (
    <aside 
      className="w-80 bg-gray-100 border-r border-gray-300 overflow-y-auto"
      onKeyDown={handleKeyDown}
    >
      <div className="p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">
              部屋の設定 ({rooms.length}部屋)
            </h2>
            <button
              onClick={() => {
                if (showRoomForm) {
                  setShowRoomForm(false);
                  setEditingRoom(null);
                } else {
                  setShowRoomForm(true);
                  setEditingRoom(null);
                }
              }}
              disabled={rooms.length >= 1 && !showRoomForm && !editingRoom}
              className={`text-sm px-3 py-1 rounded transition-colors ${
                rooms.length >= 1 && !showRoomForm && !editingRoom
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {showRoomForm ? '閉じる' : '新規追加'}
            </button>
          </div>
          
          {showRoomForm && (
            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <RoomForm editingRoom={editingRoom} onEditComplete={handleEditComplete} />
            </div>
          )}
          
          <div className="bg-white p-4 rounded-lg shadow">
            <RoomList onEditRoom={handleEditRoom} />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">
              家具の管理 ({getFurnitureInRoom(activeRoomId).length}個)
            </h2>
            <button
              onClick={() => {
                if (showFurnitureForm) {
                  setShowFurnitureForm(false);
                  setEditingFurniture(null);
                } else {
                  setShowFurnitureForm(true);
                  setEditingFurniture(null);
                }
              }}
              className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
            >
              {showFurnitureForm ? '閉じる' : '新規追加'}
            </button>
          </div>
          
          {showFurnitureForm && (
            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <FurnitureForm editingFurniture={editingFurniture} onEditComplete={handleFurnitureEditComplete} />
            </div>
          )}
          
          <div className="bg-white p-4 rounded-lg shadow">
            <FurnitureList onEditFurniture={handleEditFurniture} />
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-3">ファイル操作</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            <button
              onClick={saveProject}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              プロジェクトを保存
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}