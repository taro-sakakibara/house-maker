'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Room, RoomFormData } from '@/types/room';
import { parseVertices, validateOrthogonalPolygon, generateId } from '@/utils/roomUtils';

const initialFormData: RoomFormData = {
  name: '',
  verticesInput: '',
  height: '2.5',
  floorColor: '#e0e0e0',
  wallColor: '#ffffff',
};

export default function RoomForm() {
  const { addRoom, rooms } = useApp();
  const [formData, setFormData] = useState<RoomFormData>(initialFormData);
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
      setError('部屋名を入力してください');
      return;
    }

    const vertices = parseVertices(formData.verticesInput);
    if (vertices.length === 0) {
      setError('頂点の形式が正しくありません。例: 0,0 5,0 5,3 0,3');
      return;
    }

    if (!validateOrthogonalPolygon(vertices)) {
      setError('直交多角形（90度の角のみ）を入力してください');
      return;
    }

    const height = parseFloat(formData.height);
    if (isNaN(height) || height <= 0) {
      setError('高さは正の数値を入力してください');
      return;
    }

    // 部屋を追加
    const newRoom: Room = {
      id: generateId(),
      name: formData.name.trim(),
      vertices,
      height,
      floorColor: formData.floorColor,
      wallColor: formData.wallColor,
    };

    addRoom(newRoom);
    
    // フォームをリセット
    setFormData(initialFormData);
    setError('');
  };

  const handleExample = () => {
    setFormData({
      name: `サンプル部屋${rooms.length + 1}`,
      verticesInput: '0,0 5,0 5,3 3,3 3,5 0,5',
      height: '2.5',
      floorColor: '#e0e0e0',
      wallColor: '#ffffff',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          部屋名
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="リビング、寝室など"
        />
      </div>

      <div>
        <label htmlFor="verticesInput" className="block text-sm font-medium text-gray-700 mb-1">
          頂点座標（時計回り）
        </label>
        <input
          type="text"
          id="verticesInput"
          name="verticesInput"
          value={formData.verticesInput}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0,0 5,0 5,3 0,3"
        />
        <p className="text-xs text-gray-500 mt-1">
          x,y形式でスペース区切り。単位：メートル
        </p>
      </div>

      <div>
        <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
          天井高（m）
        </label>
        <input
          type="number"
          id="height"
          name="height"
          value={formData.height}
          onChange={handleInputChange}
          step="0.1"
          min="0.1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="floorColor" className="block text-sm font-medium text-gray-700 mb-1">
            床の色
          </label>
          <input
            type="color"
            id="floorColor"
            name="floorColor"
            value={formData.floorColor}
            onChange={handleInputChange}
            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
          />
        </div>
        <div>
          <label htmlFor="wallColor" className="block text-sm font-medium text-gray-700 mb-1">
            壁の色
          </label>
          <input
            type="color"
            id="wallColor"
            name="wallColor"
            value={formData.wallColor}
            onChange={handleInputChange}
            className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          部屋を追加
        </button>
        <button
          type="button"
          onClick={handleExample}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          サンプル
        </button>
      </div>
    </form>
  );
}