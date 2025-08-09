"use client";

import React, { Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, PerspectiveCamera } from "@react-three/drei";
import { useApp } from "@/contexts/AppContext";
import Room3D from "@/components/three/Room3D";
import Furniture3D from "@/components/three/Furniture3D";

function Scene() {
  const { rooms, activeRoomId, furniture, activeFurnitureId, setActiveFurnitureId } = useApp();
  const controlsRef = React.useRef();
  const { scene } = useThree();

  const handleBackgroundClick = () => {
    setActiveFurnitureId(null);
  };

  // OrbitControlsをsceneに保存
  React.useEffect(() => {
    if (controlsRef.current) {
      scene.userData.orbitControls = controlsRef.current;
    }
  }, [scene]);

  return (
    <>
      {/* カメラ設定 */}
      <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={60} />

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
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        panSpeed={1.0}
        rotateSpeed={0.5}
        zoomSpeed={1.0}
        zoomToCursor={true}
        mouseButtons={{
          LEFT: 0, // 左クリック：回転
          MIDDLE: 1, // ミドルクリック：ズーム
          RIGHT: 2, // 右クリック：パン（移動）
        }}
        touches={{
          ONE: 0, // 1本指：回転
          TWO: 2, // 2本指：パン・ズーム
        }}
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
        onClick={handleBackgroundClick}
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* 部屋の3D表示 */}
      {rooms.map((room) => (
        <Room3D 
          key={room.id} 
          room={room} 
          isActive={room.id === activeRoomId}
        />
      ))}
      
      {/* 家具の3D表示 */}
      {furniture.map((item) => (
        <Furniture3D
          key={item.id}
          furniture={item}
          isActive={item.id === activeFurnitureId}
        />
      ))}
      
      {/* 部屋がない場合の仮のキューブ */}
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
    <div className="flex-1 bg-gray-50 relative h-full">
      <Canvas shadows className="absolute inset-0">
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      {/* 3D操作の説明 */}
      <div className="absolute bottom-[10px] left-[10px]">
        <div className="bg-white bg-opacity-90 p-3 rounded-lg text-sm shadow-lg border border-gray-200">
          <p className="font-semibold mb-1 text-gray-800">操作方法</p>
          <div className="space-y-1">
            <p className="text-gray-600">視点回転: 左ドラッグ</p>
            <p className="text-gray-600">視点移動: 右ドラッグ</p>
            <p className="text-gray-600">ズーム: ホイール</p>
            <hr className="border-gray-300" />
            <p className="text-gray-600">家具移動: 家具を左ドラッグ</p>
            <p className="text-gray-600">家具回転: R キー</p>
            <p className="text-gray-600">サイズ変更: + / - キー</p>
            <p className="text-gray-600">微調整: 矢印キー</p>
          </div>
        </div>
      </div>
    </div>
  );
}
