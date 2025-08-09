"use client";

import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import RoomDrawer from "@/components/drawers/RoomDrawer";
import FurnitureDrawer from "@/components/drawers/FurnitureDrawer";
import ProjectDrawer from "@/components/drawers/ProjectDrawer";

type DrawerType = "rooms" | "furniture" | "projects" | null;

export default function Sidebar() {
  const { saveCurrentProject } = useApp();
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);

  const toggleDrawer = (drawer: DrawerType) => {
    setActiveDrawer(activeDrawer === drawer ? null : drawer);
  };

  const menuItems = [
    {
      id: "rooms" as const,
      icon: (
        <svg
          className="w-[24px] h-[24px]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      label: "部屋設定",
    },
    {
      id: "furniture" as const,
      icon: (
        <svg
          className="w-[24px] h-[24px]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      label: "家具管理",
    },
    {
      id: "projects" as const,
      icon: (
        <svg
          className="w-[24px] h-[24px]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      label: "プロジェクト管理",
    },
    {
      id: "save",
      icon: (
        <svg
          className="w-[24px] h-[24px]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
      label: "保存",
    },
  ];

  const handleItemClick = (id: string) => {
    if (id === "save") {
      saveCurrentProject();
    } else {
      toggleDrawer(id as DrawerType);
    }
  };

  return (
    <div className="h-screen">
      {/* Main Sidebar */}
      <aside className="w-[320px] bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto">
        <div className="p-[16px]">
          <nav className="space-y-[4px]">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center space-x-[12px] px-[12px] py-[8px] rounded-lg text-left transition-all duration-200 ${
                    activeDrawer === item.id
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-gray-600">{item.icon}</div>
                  <span className="font-medium text-sm">{item.label}</span>
                </button>

                {/* Drawer Content - expands below the button */}
                {activeDrawer === item.id && (
                  <div className="mt-[8px] ml-[24px] border-l-[2px] border-gray-200 pl-[16px]">
                    {activeDrawer === "rooms" && (
                      <RoomDrawer onClose={() => setActiveDrawer(null)} />
                    )}
                    {activeDrawer === "furniture" && (
                      <FurnitureDrawer onClose={() => setActiveDrawer(null)} />
                    )}
                    {activeDrawer === "projects" && (
                      <ProjectDrawer onClose={() => setActiveDrawer(null)} />
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </div>
  );
}
