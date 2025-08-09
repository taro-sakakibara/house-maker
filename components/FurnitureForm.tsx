'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Furniture, FurnitureFormData } from '@/types/furniture';
import { generateFurnitureId, getDefaultPosition, getDefaultRotation, cmToM } from '@/utils/furnitureUtils';

const initialFormData: FurnitureFormData = {
  name: '',
  width: '80',
  height: '80',
  depth: '40',
  color: '#8B4513', // 茶色
};

export default function FurnitureForm() {
  const { addFurniture, activeRoomId, rooms } = useApp();
  const [formData, setFormData] = useState<FurnitureFormData>(initialFormData);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (!formData.name.trim()) {
      setError('家具名を入力してください');
      return;
    }

    if (!activeRoomId) {
      setError('先に部屋を選択してください');
      return;
    }

    const width = parseFloat(formData.width);
    const height = parseFloat(formData.height);
    const depth = parseFloat(formData.depth);

    if (isNaN(width) || width <= 0) {
      setError('幅は正の数値を入力してください');
      return;
    }

    if (isNaN(height) || height <= 0) {
      setError('高さは正の数値を入力してください');
      return;
    }

    if (isNaN(depth) || depth <= 0) {
      setError('奥行きは正の数値を入力してください');
      return;
    }

    // アクティブな部屋を取得
    const activeRoom = rooms.find(room => room.id === activeRoomId);
    
    // 部屋の中心座標を計算
    let centerPosition = getDefaultPosition();
    if (activeRoom && activeRoom.vertices.length > 0) {
      const avgX = activeRoom.vertices.reduce((sum, v) => sum + v.x, 0) / activeRoom.vertices.length;
      const avgZ = activeRoom.vertices.reduce((sum, v) => sum + (-v.y), 0) / activeRoom.vertices.length;
      centerPosition = {
        x: avgX,
        y: cmToM(height) / 2, // 床から家具の高さの半分だけ上に配置
        z: avgZ,
      };
    }

    // 家具を作成
    const newFurniture: Furniture = {
      id: generateFurnitureId(),
      name: formData.name.trim(),
      position: centerPosition,
      size: {
        width,
        height,
        depth,
      },
      rotation: getDefaultRotation(),
      color: formData.color,
      roomId: activeRoomId,
    };

    addFurniture(newFurniture);
    
    // フォームをリセット
    setFormData(initialFormData);
    setError('');
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          家具名
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="テーブル、椅子など"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
            幅 (cm)
          </label>
          <input
            type="number"
            id="width"
            name="width"
            value={formData.width}
            onChange={handleInputChange}
            min="1"
            step="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
            高さ (cm)
          </label>
          <input
            type="number"
            id="height"
            name="height"
            value={formData.height}
            onChange={handleInputChange}
            min="1"
            step="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="depth" className="block text-sm font-medium text-gray-700 mb-1">
            奥行き (cm)
          </label>
          <input
            type="number"
            id="depth"
            name="depth"
            value={formData.depth}
            onChange={handleInputChange}
            min="1"
            step="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
          色
        </label>
        <input
          type="color"
          id="color"
          name="color"
          value={formData.color}
          onChange={handleInputChange}
          className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
        />
      </div>

      {!activeRoomId && (
        <div className="text-amber-600 text-sm bg-amber-50 p-2 rounded">
          家具を追加するには、まず部屋を選択してください
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!activeRoomId}
        className={`w-full py-2 px-4 rounded-md transition-colors ${
          activeRoomId
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        家具を追加
      </button>
    </form>
  );
}