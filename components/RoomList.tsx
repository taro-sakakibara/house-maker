'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';

interface RoomListProps {
  onEditRoom?: (room: any) => void;
}

export default function RoomList({ onEditRoom }: RoomListProps) {
  const { rooms, activeRoomId, setActiveRoomId, deleteRoom } = useApp();

  if (rooms.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        部屋がまだ登録されていません
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <div
          key={room.id}
          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
            activeRoomId === room.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => setActiveRoomId(room.id)}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{room.name}</h3>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditRoom?.(room);
                }}
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                編集
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRoom(room.id);
                }}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                削除
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {(() => {
              // 頂点から幅と奥行きを計算
              const vertices = room.vertices;
              let width = 0, depth = 0;
              
              if (vertices.length >= 4) {
                // 幅の計算
                width = Math.abs(vertices[1].x - vertices[0].x) * 100; // mからcmに変換
                
                // 奥行きの計算 - より堅牢な方法
                if (vertices[2].y != null && vertices[1].y != null) {
                  depth = Math.abs(vertices[2].y - vertices[1].y) * 100;
                } else if (vertices[3].y != null && vertices[0].y != null) {
                  depth = Math.abs(vertices[3].y - vertices[0].y) * 100;
                } else {
                  // 全ての頂点のy座標をチェック
                  const validY = vertices.map(v => v.y).filter(y => y != null);
                  if (validY.length >= 2) {
                    depth = Math.abs(Math.max(...validY) - Math.min(...validY)) * 100;
                  } else {
                    depth = 300; // デフォルト値
                  }
                }
              }
              
              const height = room.height * 100; // mからcmに変換
              return `${width.toFixed(0)}cm × ${depth.toFixed(0)}cm × ${height.toFixed(0)}cm`;
            })()}
          </div>
        </div>
      ))}
    </div>
  );
}