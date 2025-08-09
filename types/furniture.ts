// 3D座標を表す型
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

// 家具のサイズを表す型
export interface FurnitureSize {
  width: number;  // 幅 (cm)
  height: number; // 高さ (cm)
  depth: number;  // 奥行き (cm)
}

// 家具の回転を表す型（ラジアン）
export interface FurnitureRotation {
  x: number;
  y: number;
  z: number;
}

// 家具を表す型
export interface Furniture {
  id: string;
  name: string;
  // 位置（メートル単位）
  position: Point3D;
  // サイズ（センチメートル単位）
  size: FurnitureSize;
  // 回転（ラジアン）
  rotation: FurnitureRotation;
  // 色
  color: string;
  // どの部屋に配置されているか
  roomId: string | null;
}

// 家具の入力フォーム用の型
export interface FurnitureFormData {
  name: string;
  width: string;   // cm
  height: string;  // cm
  depth: string;   // cm
  color: string;
}