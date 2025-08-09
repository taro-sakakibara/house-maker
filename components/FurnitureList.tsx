'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';

interface FurnitureListProps {
  onEditFurniture?: (furniture: any) => void;
}

export default function FurnitureList({ onEditFurniture }: FurnitureListProps) {
  const { furniture, activeFurnitureId, setActiveFurnitureId, deleteFurniture, activeRoomId } = useApp();
  
  const roomFurniture = furniture.filter(item => item.roomId === activeRoomId);

  if (!activeRoomId) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        部屋を選択してください
      </div>
    );
  }

  if (roomFurniture.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        この部屋に家具がまだ配置されていません
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {roomFurniture.map((item) => (
        <div
          key={item.id}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            activeFurnitureId === item.id
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => setActiveFurnitureId(item.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: item.color }}
              />
              <h3 className="font-medium">{item.name}</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditFurniture?.(item);
                }}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                編集
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFurniture(item.id);
                }}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                削除
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {item.size.width}cm × {item.size.height}cm × {item.size.depth}cm
          </div>
          <div className="text-xs text-gray-500 mt-1">
            位置: ({item.position.x.toFixed(2)}, {item.position.z.toFixed(2)})
          </div>
        </div>
      ))}
    </div>
  );
}