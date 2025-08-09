'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Room } from '@/types/room';
import { generateId } from '@/utils/roomUtils';
import { 
  ShapeType, 
  ShapeParams, 
  defaultShapeParams,
  generateRectangle,
  generateLShape,
  generateUShape
} from '@/utils/presetShapes';

interface RoomFormData {
  name: string;
  shapeType: ShapeType;
  shapeParams: ShapeParams;
  height: string;
  floorColor: string;
  wallColor: string;
}

const initialFormData: RoomFormData = {
  name: '',
  shapeType: 'rectangle',
  shapeParams: defaultShapeParams,
  height: '250', // cm
  floorColor: '#e0e0e0',
  wallColor: '#ffffff',
};

interface RoomFormProps {
  editingRoom?: Room;
  onEditComplete?: () => void;
}

export default function RoomForm({ editingRoom, onEditComplete }: RoomFormProps) {
  const { addRoom, updateRoom, rooms } = useApp();
  const [formData, setFormData] = useState<RoomFormData>(initialFormData);
  const [error, setError] = useState<string>('');

  // 編集モードの初期化
  React.useEffect(() => {
    if (editingRoom) {
      // 既存の部屋データからフォームデータを復元
      const vertices = editingRoom.vertices;
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

      setFormData({
        name: editingRoom.name,
        shapeType: 'rectangle', // 簡易実装のため、とりあえずrectangleに固定
        shapeParams: {
          ...defaultShapeParams,
          rectangle: {
            width: width || 300, // デフォルト値
            depth: depth || 200, // デフォルト値
          }
        },
        height: (editingRoom.height * 100).toString(), // mからcmに変換
        floorColor: editingRoom.floorColor || '#e0e0e0',
        wallColor: editingRoom.wallColor || '#ffffff',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingRoom]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleShapeParamChange = (paramName: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev) => ({
      ...prev,
      shapeParams: {
        ...prev.shapeParams,
        [prev.shapeType]: {
          ...prev.shapeParams[prev.shapeType],
          [paramName]: numValue,
        },
      },
    }));
  };

  const generateVertices = () => {
    const { shapeType, shapeParams } = formData;
    switch (shapeType) {
      case 'rectangle':
        return generateRectangle(shapeParams.rectangle);
      case 'lShape':
        return generateLShape(shapeParams.lShape);
      case 'uShape':
        return generateUShape(shapeParams.uShape);
      default:
        return [];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 新規追加の場合のみ部屋数制限をチェック
    if (!editingRoom && rooms.length >= 1) {
      setError('部屋は1つまでしか追加できません');
      return;
    }
    
    if (!formData.name.trim()) {
      setError('部屋名を入力してください');
      return;
    }

    const height = parseFloat(formData.height);
    if (isNaN(height) || height <= 0) {
      setError('高さは正の数値を入力してください');
      return;
    }

    const vertices = generateVertices();
    
    if (editingRoom) {
      // 編集モード
      const updatedRoom: Partial<Room> = {
        name: formData.name.trim(),
        vertices,
        height: height / 100, // cmをmに変換
        floorColor: formData.floorColor,
        wallColor: formData.wallColor,
      };
      updateRoom(editingRoom.id, updatedRoom);
      onEditComplete?.();
    } else {
      // 新規追加モード
      const newRoom: Room = {
        id: generateId(),
        name: formData.name.trim(),
        vertices,
        height: height / 100, // cmをmに変換
        floorColor: formData.floorColor,
        wallColor: formData.wallColor,
      };
      addRoom(newRoom);
    }
    
    // フォームをリセット
    if (!editingRoom) {
      setFormData(initialFormData);
    }
    setError('');
  };

  const renderShapeParams = () => {
    const { shapeType, shapeParams } = formData;
    
    switch (shapeType) {
      case 'rectangle':
        return (
          <>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-[8px]">
                幅 (cm)
              </label>
              <input
                type="number"
                value={shapeParams.rectangle.width}
                onChange={(e) => handleShapeParamChange('width', e.target.value)}
                className="w-full px-[8px] py-[4px] border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                min="10"
                step="10"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-[8px]">
                奥行き (cm)
              </label>
              <input
                type="number"
                value={shapeParams.rectangle.depth}
                onChange={(e) => handleShapeParamChange('depth', e.target.value)}
                className="w-full px-[8px] py-[4px] border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                min="10"
                step="10"
              />
            </div>
          </>
        );
      
      case 'lShape':
        return (
          <>
            <div className="grid grid-cols-2 gap-[8px]">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-[8px]">
                  全体幅 (cm)
                </label>
                <input
                  type="number"
                  value={shapeParams.lShape.width}
                  onChange={(e) => handleShapeParamChange('width', e.target.value)}
                  className="w-full px-[8px] py-[4px] border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  min="10"
                  step="10"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-[8px]">
                  全体奥行き (cm)
                </label>
                <input
                  type="number"
                  value={shapeParams.lShape.depth}
                  onChange={(e) => handleShapeParamChange('depth', e.target.value)}
                  className="w-full px-[8px] py-[4px] border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  min="10"
                  step="10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-[8px]">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-[8px]">
                  切り欠き幅 (cm)
                </label>
                <input
                  type="number"
                  value={shapeParams.lShape.cutoutWidth}
                  onChange={(e) => handleShapeParamChange('cutoutWidth', e.target.value)}
                  className="w-full px-[8px] py-[4px] border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  min="10"
                  step="10"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-[8px]">
                  切り欠き奥行き (cm)
                </label>
                <input
                  type="number"
                  value={shapeParams.lShape.cutoutDepth}
                  onChange={(e) => handleShapeParamChange('cutoutDepth', e.target.value)}
                  className="w-full px-[8px] py-[4px] border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  min="10"
                  step="10"
                />
              </div>
            </div>
          </>
        );
      
      case 'uShape':
        return (
          <>
            <div className="grid grid-cols-2 gap-[8px]">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-[8px]">
                  全体幅 (cm)
                </label>
                <input
                  type="number"
                  value={shapeParams.uShape.width}
                  onChange={(e) => handleShapeParamChange('width', e.target.value)}
                  className="w-full px-[8px] py-[4px] border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  min="10"
                  step="10"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-[8px]">
                  全体奥行き (cm)
                </label>
                <input
                  type="number"
                  value={shapeParams.uShape.depth}
                  onChange={(e) => handleShapeParamChange('depth', e.target.value)}
                  className="w-full px-[8px] py-[4px] border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  min="10"
                  step="10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-[8px]">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-[8px]">
                  開口部幅 (cm)
                </label>
                <input
                  type="number"
                  value={shapeParams.uShape.openingWidth}
                  onChange={(e) => handleShapeParamChange('openingWidth', e.target.value)}
                  className="w-full px-[8px] py-[4px] border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  min="10"
                  step="10"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-[8px]">
                  腕の奥行き (cm)
                </label>
                <input
                  type="number"
                  value={shapeParams.uShape.armDepth}
                  onChange={(e) => handleShapeParamChange('armDepth', e.target.value)}
                  className="w-full px-[8px] py-[4px] border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  min="10"
                  step="10"
                />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-[8px] flex items-center">
          <svg className="w-[16px] h-[16px] mr-[8px] text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          部屋名
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-[8px] py-[4px] border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          placeholder="リビング、寝室など"
        />
      </div>

      <div>
        <label htmlFor="shapeType" className="block text-sm font-semibold text-slate-700 mb-[8px] flex items-center">
          <svg className="w-[16px] h-[16px] mr-[8px] text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          部屋の形状
        </label>
        <select
          id="shapeType"
          name="shapeType"
          value={formData.shapeType}
          onChange={handleInputChange}
          className="w-full px-[8px] py-[4px] border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
        >
          <option value="rectangle">四角形</option>
          <option value="lShape">L字型</option>
          <option value="uShape">コの字型</option>
        </select>
      </div>

      {renderShapeParams()}

      <div>
        <label htmlFor="height" className="block text-sm font-semibold text-slate-700 mb-[8px] flex items-center">
          <svg className="w-[16px] h-[16px] mr-[8px] text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          天井高 (cm)
        </label>
        <input
          type="number"
          id="height"
          name="height"
          value={formData.height}
          onChange={handleInputChange}
          step="10"
          min="10"
          className="w-full px-[8px] py-[4px] border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-[16px]">
        <div>
          <label htmlFor="floorColor" className="block text-sm font-semibold text-slate-700 mb-[8px] flex items-center">
            <svg className="w-[16px] h-[16px] mr-[8px] text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
            床の色
          </label>
          <input
            type="color"
            id="floorColor"
            name="floorColor"
            value={formData.floorColor}
            onChange={handleInputChange}
            className="w-full h-[32px] border border-slate-300 rounded cursor-pointer transition-all"
          />
        </div>
        <div>
          <label htmlFor="wallColor" className="block text-sm font-semibold text-slate-700 mb-[8px] flex items-center">
            <svg className="w-[16px] h-[16px] mr-[8px] text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            壁の色
          </label>
          <input
            type="color"
            id="wallColor"
            name="wallColor"
            value={formData.wallColor}
            onChange={handleInputChange}
            className="w-full h-[32px] border border-slate-300 rounded cursor-pointer transition-all"
          />
        </div>
      </div>

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
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-[4px] px-[8px] rounded text-xs font-medium transition-all flex items-center justify-center space-x-[4px]"
      >
        <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingRoom ? "M5 13l4 4L19 7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
        </svg>
        <span>{editingRoom ? '部屋を更新' : '部屋を追加'}</span>
      </button>
    </form>
  );
}