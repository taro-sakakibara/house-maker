'use client';

import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import View3D from './View3D';

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <View3D />
      </div>
    </div>
  );
}