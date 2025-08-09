// 2D座標を表す型
export interface Point2D {
  x: number;
  y: number;
}

// 直交多角形の部屋を表す型
export interface Room {
  id: string;
  name: string;
  // 頂点の配列（時計回りで定義）
  vertices: Point2D[];
  // 高さ（メートル）
  height: number;
  // 床の色
  floorColor?: string;
  // 壁の色
  wallColor?: string;
}

// 部屋の入力フォーム用の型
export interface RoomFormData {
  name: string;
  // 頂点を文字列で入力（例: "0,0 5,0 5,3 3,3 3,5 0,5"）
  verticesInput: string;
  height: string;
  floorColor: string;
  wallColor: string;
}