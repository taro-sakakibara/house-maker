'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import RoomForm from '@/components/RoomForm';
import RoomList from '@/components/RoomList';

export default function Sidebar() {
  const { rooms } = useApp();
  const [showForm, setShowForm] = useState(false);
  return (
    <aside className="w-80 bg-gray-100 border-r border-gray-300 overflow-y-auto">
      <div className="p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">
              部屋の設定 ({rooms.length}部屋)
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
            >
              {showForm ? '閉じる' : '新規追加'}
            </button>
          </div>
          
          {showForm && (
            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <RoomForm />
            </div>
          )}
          
          <div className="bg-white p-4 rounded-lg shadow">
            <RoomList />
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">家具の管理</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">家具の追加・編集フォームがここに入ります</p>
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