'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import { useApp } from '@/contexts/AppContext';

function Scene() {
  const { rooms, activeRoomId } = useApp();
  
  return (
    <>
      {/* カメラ設定 */}
      <PerspectiveCamera
        makeDefault
        position={[10, 10, 10]}
        fov={60}
      />
      
      {/* ライト設定 */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      
      {/* コントロール */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
      />
      
      {/* グリッド */}
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6e6e6e"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#9d9d9d"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />
      
      {/* 仮の床面 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      
      {/* 仮のキューブ（部屋が表示される位置） */}
      {rooms.length === 0 && (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>
      )}
    </>
  );
}

export default function View3D() {
  return (
    <div className="flex-1 bg-gray-50 relative">
      <Canvas shadows>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      
      {/* 3D操作の説明 */}
      <div className="absolute bottom-4 left-4 bg-white/80 p-3 rounded-lg text-sm">
        <p className="font-semibold mb-1">操作方法</p>
        <p>回転: マウス左ドラッグ</p>
        <p>ズーム: マウスホイール</p>
        <p>移動: マウス右ドラッグ</p>
      </div>
    </div>
  );
}