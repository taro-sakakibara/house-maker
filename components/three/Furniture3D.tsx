import React, { useRef, useState } from 'react';
import { Furniture } from '@/types/furniture';
import { useApp } from '@/contexts/AppContext';
import { cmToM } from '@/utils/furnitureUtils';
import { constrainFurnitureToRoom } from '@/utils/roomBounds';
import * as THREE from 'three';
import { ThreeEvent, useThree } from '@react-three/fiber';

interface Furniture3DProps {
  furniture: Furniture;
  isActive?: boolean;
}

export default function Furniture3D({ furniture, isActive = false }: Furniture3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { updateFurniture, setActiveFurnitureId, rooms } = useApp();
  const { gl, camera, scene } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [dragPlane] = useState(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const [raycaster] = useState(new THREE.Raycaster());

  // 家具のサイズをメートルに変換
  const width = cmToM(furniture.size.width);
  const height = cmToM(furniture.size.height);
  const depth = cmToM(furniture.size.depth);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setActiveFurnitureId(furniture.id);
    setIsDragging(true);

    // OrbitControlsを無効化
    const controls = scene.userData.orbitControls;
    if (controls) {
      controls.enabled = false;
    }
  };

  // ドラッグ処理をグローバルイベントリスナーで処理するように変更
  React.useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      // レイキャストで床平面との交点を求める
      raycaster.setFromCamera(mouse, camera);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(dragPlane, intersection);
      
      if (intersection) {
        // 家具が属する部屋を取得
        const room = rooms.find(r => r.id === furniture.roomId);
        
        let newPosition = {
          x: intersection.x,
          z: intersection.z,
        };

        // 部屋内に制限
        if (room) {
          newPosition = constrainFurnitureToRoom(
            newPosition,
            { width, depth },
            room
          );
        }

        updateFurniture(furniture.id, {
          position: {
            x: newPosition.x,
            y: furniture.position.y,
            z: newPosition.z,
          }
        });
      }
    };

    const handleGlobalPointerUp = () => {
      setIsDragging(false);
      
      // OrbitControlsを再有効化
      const controls = scene.userData.orbitControls;
      if (controls) {
        controls.enabled = true;
      }
    };

    if (isDragging) {
      document.addEventListener('pointermove', handleGlobalPointerMove);
      document.addEventListener('pointerup', handleGlobalPointerUp);
    }

    return () => {
      document.removeEventListener('pointermove', handleGlobalPointerMove);
      document.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [isDragging, furniture.id, furniture.position, updateFurniture, gl.domElement, camera, raycaster, scene.userData.orbitControls]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!isDragging) { // ドラッグ中でない場合のみ選択
      e.stopPropagation();
      setActiveFurnitureId(furniture.id);
    }
  };

  return (
    <group
      position={[furniture.position.x, furniture.position.y + height / 2, furniture.position.z]}
      rotation={[furniture.rotation.x, furniture.rotation.y, furniture.rotation.z]}
    >
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial 
          color={furniture.color}
          opacity={isDragging ? 0.7 : 1}
          transparent={isDragging}
        />
      </mesh>

      {/* アクティブな家具の輪郭表示 */}
      {isActive && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
          <lineBasicMaterial color="#10b981" linewidth={2} />
        </lineSegments>
      )}

      {/* ドラッグ中の影表示 */}
      {isDragging && (
        <mesh
          position={[0, -height / 2 - 0.001, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[width * 1.1, depth * 1.1]} />
          <meshBasicMaterial 
            color="#000000" 
            opacity={0.2} 
            transparent 
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}