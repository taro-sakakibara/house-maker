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

interface FurnitureFormProps {
  editingFurniture?: Furniture;
  onEditComplete?: () => void;
}

export default function FurnitureForm({ editingFurniture, onEditComplete }: FurnitureFormProps) {
  const { addFurniture, updateFurniture, activeRoomId, rooms } = useApp();
  const [formData, setFormData] = useState<FurnitureFormData>(initialFormData);
  const [error, setError] = useState<string>('');

  // 編集モードの初期化
  React.useEffect(() => {
    if (editingFurniture) {
      setFormData({
        name: editingFurniture.name,
        width: editingFurniture.size.width.toString(),
        height: editingFurniture.size.height.toString(), 
        depth: editingFurniture.size.depth.toString(),
        color: editingFurniture.color,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingFurniture]);

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

    if (!activeRoomId && !editingFurniture) {
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

    if (editingFurniture) {
      // 編集モード
      const updatedFurniture: Partial<Furniture> = {
        name: formData.name.trim(),
        size: {
          width,
          height,
          depth,
        },
        color: formData.color,
      };
      updateFurniture(editingFurniture.id, updatedFurniture);
      onEditComplete?.();
    } else {
      // 新規追加モード
      // アクティブな部屋を取得
      const activeRoom = rooms.find(room => room.id === activeRoomId);
      
      // 部屋の中心座標を計算
      let centerPosition = getDefaultPosition();
      if (activeRoom && activeRoom.vertices.length > 0) {
        const avgX = activeRoom.vertices.reduce((sum, v) => sum + v.x, 0) / activeRoom.vertices.length;
        const avgZ = activeRoom.vertices.reduce((sum, v) => sum + v.y, 0) / activeRoom.vertices.length;
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
    }
    
    // フォームをリセット
    if (!editingFurniture) {
      setFormData(initialFormData);
    }
    setError('');
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-[8px] flex items-center">
          <svg className="w-[16px] h-[16px] mr-[8px] text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          家具名
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-[16px] py-[12px] border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm hover:shadow-md"
          placeholder="テーブル、椅子など"
        />
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-[12px] flex items-center">
          <svg className="w-[16px] h-[16px] mr-[8px] text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          サイズ設定
        </h4>
        <div className="grid grid-cols-3 gap-[12px]">
          <div>
            <label htmlFor="width" className="block text-xs font-medium text-slate-600 mb-[4px]">
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
              className="w-full px-[12px] py-[8px] border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm hover:shadow-md text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="height" className="block text-xs font-medium text-slate-600 mb-[4px]">
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
              className="w-full px-[12px] py-[8px] border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm hover:shadow-md text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="depth" className="block text-xs font-medium text-slate-600 mb-[4px]">
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
              className="w-full px-[12px] py-[8px] border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm hover:shadow-md text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="color" className="block text-sm font-semibold text-slate-700 mb-[8px] flex items-center">
          <svg className="w-[16px] h-[16px] mr-[8px] text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
          </svg>
          色
        </label>
        <input
          type="color"
          id="color"
          name="color"
          value={formData.color}
          onChange={handleInputChange}
          className="w-full h-[48px] border border-slate-300 rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-all"
        />
      </div>

      {!activeRoomId && !editingFurniture && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-[16px] py-[12px] rounded-xl flex items-center space-x-[8px]">
          <svg className="w-[20px] h-[20px] text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-sm font-medium">家具を追加するには、まず部屋を選択してください</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-[16px] py-[12px] rounded-xl flex items-center space-x-[8px]">
          <svg className="w-[20px] h-[20px] text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!activeRoomId && !editingFurniture}
        className={`w-full py-[12px] px-[24px] rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-[8px] ${
          activeRoomId || editingFurniture
            ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white'
            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
        }`}
      >
        <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingFurniture ? "M5 13l4 4L19 7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
        </svg>
        <span>{editingFurniture ? '家具を更新' : '家具を追加'}</span>
      </button>
    </form>
  );
}