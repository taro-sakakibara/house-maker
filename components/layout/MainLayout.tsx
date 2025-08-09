'use client';

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import View3D from './View3D';

export default function MainLayout() {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <View3D />
      </div>
    </div>
  );
}