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
    
    // アクティブ状態の場合のみドラッグを開始
    if (isActive) {
      setIsDragging(true);

      // OrbitControlsを無効化
      const controls = scene.userData.orbitControls;
      if (controls) {
        controls.enabled = false;
      }
    }
  };

  // ドラッグ処理をグローバルイベントリスナーで処理するように変更
  // キーボードイベントのハンドリング
  React.useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;

      const step = 0.1; // 移動ステップ（メートル）
      const rotationStep = Math.PI / 8; // 回転ステップ（22.5度）
      const sizeStep = 5; // サイズステップ（cm）

      switch (e.key) {
        // 回転
        case 'r':
        case 'R':
          updateFurniture(furniture.id, {
            rotation: {
              ...furniture.rotation,
              y: furniture.rotation.y + rotationStep,
            }
          });
          break;

        // サイズ変更
        case '=':
        case '+':
          updateFurniture(furniture.id, {
            size: {
              width: Math.min(furniture.size.width + sizeStep, 500),
              height: Math.min(furniture.size.height + sizeStep, 400),
              depth: Math.min(furniture.size.depth + sizeStep, 500),
            }
          });
          break;

        case '-':
        case '_':
          updateFurniture(furniture.id, {
            size: {
              width: Math.max(furniture.size.width - sizeStep, 10),
              height: Math.max(furniture.size.height - sizeStep, 10),
              depth: Math.max(furniture.size.depth - sizeStep, 10),
            }
          });
          break;

        // 選択解除
        case 'Enter':
          e.preventDefault();
          setIsDragging(false);
          
          // OrbitControlsを再有効化
          const controls = scene.userData.orbitControls;
          if (controls) {
            controls.enabled = true;
          }
          
          setActiveFurnitureId(null);
          break;

        // 微調整移動
        case 'ArrowUp':
          e.preventDefault();
          const room1 = rooms.find(r => r.id === furniture.roomId);
          const newPos1 = { x: furniture.position.x, z: furniture.position.z + step };
          const constrainedPos1 = room1 ? constrainFurnitureToRoom(newPos1, { width, depth }, room1) : newPos1;
          updateFurniture(furniture.id, {
            position: { ...furniture.position, z: constrainedPos1.z }
          });
          break;

        case 'ArrowDown':
          e.preventDefault();
          const room2 = rooms.find(r => r.id === furniture.roomId);
          const newPos2 = { x: furniture.position.x, z: furniture.position.z - step };
          const constrainedPos2 = room2 ? constrainFurnitureToRoom(newPos2, { width, depth }, room2) : newPos2;
          updateFurniture(furniture.id, {
            position: { ...furniture.position, z: constrainedPos2.z }
          });
          break;

        case 'ArrowLeft':
          e.preventDefault();
          const room3 = rooms.find(r => r.id === furniture.roomId);
          const newPos3 = { x: furniture.position.x - step, z: furniture.position.z };
          const constrainedPos3 = room3 ? constrainFurnitureToRoom(newPos3, { width, depth }, room3) : newPos3;
          updateFurniture(furniture.id, {
            position: { ...furniture.position, x: constrainedPos3.x }
          });
          break;

        case 'ArrowRight':
          e.preventDefault();
          const room4 = rooms.find(r => r.id === furniture.roomId);
          const newPos4 = { x: furniture.position.x + step, z: furniture.position.z };
          const constrainedPos4 = room4 ? constrainFurnitureToRoom(newPos4, { width, depth }, room4) : newPos4;
          updateFurniture(furniture.id, {
            position: { ...furniture.position, x: constrainedPos4.x }
          });
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, furniture, updateFurniture, width, depth, rooms]);

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

  const handleDoubleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setActiveFurnitureId(furniture.id);
    
    // ダブルクリック直後にドラッグを開始する準備
    setIsDragging(true);
    
    // OrbitControlsを無効化
    const controls = scene.userData.orbitControls;
    if (controls) {
      controls.enabled = false;
    }
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!isDragging) { // ドラッグ中でない場合のみ
      e.stopPropagation();
      if (isActive) {
        // アクティブ状態の場合は解除
        setActiveFurnitureId(null);
      }
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
        onDoubleClick={handleDoubleClick}
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