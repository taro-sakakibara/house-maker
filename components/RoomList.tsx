'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';

export default function RoomList() {
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
          <div className="text-xs text-gray-600 mt-1">
            頂点数: {room.vertices.length} | 高さ: {room.height}m
          </div>
        </div>
      ))}
    </div>
  );
}