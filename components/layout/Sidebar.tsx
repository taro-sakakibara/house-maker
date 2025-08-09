'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import RoomForm from '@/components/RoomForm';
import RoomList from '@/components/RoomList';
import FurnitureForm from '@/components/FurnitureForm';
import FurnitureList from '@/components/FurnitureList';

export default function Sidebar() {
  const { rooms, getFurnitureInRoom, activeRoomId } = useApp();
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showFurnitureForm, setShowFurnitureForm] = useState(false);
  return (
    <aside className="w-80 bg-gray-100 border-r border-gray-300 overflow-y-auto">
      <div className="p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">
              部屋の設定 ({rooms.length}部屋)
            </h2>
            <button
              onClick={() => setShowRoomForm(!showRoomForm)}
              className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
            >
              {showRoomForm ? '閉じる' : '新規追加'}
            </button>
          </div>
          
          {showRoomForm && (
            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <RoomForm />
            </div>
          )}
          
          <div className="bg-white p-4 rounded-lg shadow">
            <RoomList />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">
              家具の管理 ({getFurnitureInRoom(activeRoomId).length}個)
            </h2>
            <button
              onClick={() => setShowFurnitureForm(!showFurnitureForm)}
              className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
            >
              {showFurnitureForm ? '閉じる' : '新規追加'}
            </button>
          </div>
          
          {showFurnitureForm && (
            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <FurnitureForm />
            </div>
          )}
          
          <div className="bg-white p-4 rounded-lg shadow">
            <FurnitureList />
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-3">ファイル操作</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">保存・読み込み機能がここに入ります</p>
          </div>
        </div>
      </div>
    </aside>
  );
}