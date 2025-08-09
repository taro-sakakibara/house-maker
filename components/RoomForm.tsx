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
        floorColor: editingRoom.floorColor,
        wallColor: editingRoom.wallColor,
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                幅 (cm)
              </label>
              <input
                type="number"
                value={shapeParams.rectangle.width}
                onChange={(e) => handleShapeParamChange('width', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="10"
                step="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                奥行き (cm)
              </label>
              <input
                type="number"
                value={shapeParams.rectangle.depth}
                onChange={(e) => handleShapeParamChange('depth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="10"
                step="10"
              />
            </div>
          </>
        );
      
      case 'lShape':
        return (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  全体幅 (cm)
                </label>
                <input
                  type="number"
                  value={shapeParams.lShape.width}
                  onChange={(e) => handleShapeParamChange('width', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  step="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  全体奥行き (cm)
                </label>
                <input
                  type="number"
                  value={shapeParams.lShape.depth}
                  onChange={(e) => handleShapeParamChange('depth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  step="10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  切り欠き幅 (cm)
                </label>
                <input
                  type="number"
                  value={shapeParams.lShape.cutoutWidth}
                  onChange={(e) => handleShapeParamChange('cutoutWidth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  step="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  切り欠き奥行き (cm)
                </label>
                <input
                  type="number"
                  value={shapeParams.lShape.cutoutDepth}
                  onChange={(e) => handleShapeParamChange('cutoutDepth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  全体幅 (cm)
                </label>
                <input
                  type="number"
                  value={shapeParams.uShape.width}
                  onChange={(e) => handleShapeParamChange('width', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  step="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  全体奥行き (cm)
                </label>
                <input
                  type="number"
                  value={shapeParams.uShape.depth}
                  onChange={(e) => handleShapeParamChange('depth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  step="10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  開口部幅 (cm)
                </label>
                <input
                  type="number"
                  value={shapeParams.uShape.openingWidth}
                  onChange={(e) => handleShapeParamChange('openingWidth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  step="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  腕の奥行き (cm)
                </label>
                <input
                  type="number"
                  value={shapeParams.uShape.armDepth}
                  onChange={(e) => handleShapeParamChange('armDepth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <label htmlFor="shapeType" className="block text-sm font-medium text-gray-700 mb-1">
          部屋の形状
        </label>
        <select
          id="shapeType"
          name="shapeType"
          value={formData.shapeType}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="rectangle">四角形</option>
          <option value="lShape">L字型</option>
          <option value="uShape">コの字型</option>
        </select>
      </div>

      {renderShapeParams()}

      <div>
        <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
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

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
      >
        {editingRoom ? '部屋を更新' : '部屋を追加'}
      </button>
    </form>
  );
}