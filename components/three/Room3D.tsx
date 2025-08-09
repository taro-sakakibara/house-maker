import React from 'react';
import { Room } from '@/types/room';
import * as THREE from 'three';

interface Room3DProps {
  room: Room;
  isActive?: boolean;
}

export default function Room3D({ room, isActive = false }: Room3DProps) {
  // 頂点から床面のジオメトリを作成
  const createFloorGeometry = () => {
    const shape = new THREE.Shape();
    
    // 最初の頂点に移動
    shape.moveTo(room.vertices[0].x, room.vertices[0].y);
    
    // 残りの頂点に線を描く
    for (let i = 1; i < room.vertices.length; i++) {
      shape.lineTo(room.vertices[i].x, room.vertices[i].y);
    }
    
    // 形状を閉じる
    shape.closePath();
    
    return new THREE.ShapeGeometry(shape);
  };

  // 壁面のジオメトリを作成
  const createWallGeometries = () => {
    const geometries: THREE.PlaneGeometry[] = [];
    
    for (let i = 0; i < room.vertices.length; i++) {
      const current = room.vertices[i];
      const next = room.vertices[(i + 1) % room.vertices.length];
      
      // 壁の長さを計算
      const wallLength = Math.sqrt(
        Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2)
      );
      
      // 壁のジオメトリを作成
      const geometry = new THREE.PlaneGeometry(wallLength, room.height);
      geometries.push(geometry);
    }
    
    return geometries;
  };

  const floorGeometry = createFloorGeometry();
  const wallGeometries = createWallGeometries();

  return (
    <group position={[0, 0, 0]}>
      {/* 床面 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <primitive object={floorGeometry} />
        <meshStandardMaterial 
          color={room.floorColor || '#e0e0e0'} 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* 壁面 */}
      {room.vertices.map((vertex, index) => {
        const nextVertex = room.vertices[(index + 1) % room.vertices.length];
        
        // 壁の中心位置を計算
        const centerX = (vertex.x + nextVertex.x) / 2;
        const centerY = (vertex.y + nextVertex.y) / 2;
        const centerZ = room.height / 2;
        
        // 壁の角度を計算
        const angle = Math.atan2(nextVertex.y - vertex.y, nextVertex.x - vertex.x);
        
        return (
          <mesh
            key={`wall-${index}`}
            position={[centerX, centerZ, centerY]}
            rotation={[0, angle + Math.PI / 2, 0]}
          >
            <primitive object={wallGeometries[index]} />
            <meshStandardMaterial 
              color={room.wallColor || '#ffffff'} 
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
      
      {/* アクティブな部屋の輪郭表示 */}
      {isActive && (
        <lineSegments>
          <edgesGeometry args={[floorGeometry]} />
          <lineBasicMaterial color="#3b82f6" linewidth={3} />
        </lineSegments>
      )}
    </group>
  );
}