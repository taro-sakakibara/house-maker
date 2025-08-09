'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';

export default function Sidebar() {
  const { rooms } = useApp();
  return (
    <aside className="w-80 bg-gray-100 border-r border-gray-300 overflow-y-auto">
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">
            部屋の設定 ({rooms.length}部屋)
          </h2>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">部屋の入力フォームがここに入ります</p>
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