'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Room } from '@/types/room';
import { Furniture } from '@/types/furniture';

interface AppContextType {
  rooms: Room[];
  activeRoomId: string | null;
  furniture: Furniture[];
  activeFurnitureId: string | null;
  addRoom: (room: Room) => void;
  updateRoom: (roomId: string, room: Partial<Room>) => void;
  deleteRoom: (roomId: string) => void;
  setActiveRoomId: (roomId: string | null) => void;
  addFurniture: (furniture: Furniture) => void;
  updateFurniture: (furnitureId: string, furniture: Partial<Furniture>) => void;
  deleteFurniture: (furnitureId: string) => void;
  setActiveFurnitureId: (furnitureId: string | null) => void;
  getFurnitureInRoom: (roomId: string | null) => Furniture[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [furniture, setFurniture] = useState<Furniture[]>([]);
  const [activeFurnitureId, setActiveFurnitureId] = useState<string | null>(null);

  const addRoom = (room: Room) => {
    setRooms((prev) => [...prev, room]);
    setActiveRoomId(room.id);
  };

  const updateRoom = (roomId: string, updates: Partial<Room>) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, ...updates } : room
      )
    );
  };

  const deleteRoom = (roomId: string) => {
    setRooms((prev) => prev.filter((room) => room.id !== roomId));
    // その部屋にある家具も削除
    setFurniture((prev) => prev.filter((item) => item.roomId !== roomId));
    if (activeRoomId === roomId) {
      setActiveRoomId(null);
    }
  };

  const addFurniture = (item: Furniture) => {
    setFurniture((prev) => [...prev, item]);
    setActiveFurnitureId(item.id);
  };

  const updateFurniture = (furnitureId: string, updates: Partial<Furniture>) => {
    setFurniture((prev) =>
      prev.map((item) =>
        item.id === furnitureId ? { ...item, ...updates } : item
      )
    );
  };

  const deleteFurniture = (furnitureId: string) => {
    setFurniture((prev) => prev.filter((item) => item.id !== furnitureId));
    if (activeFurnitureId === furnitureId) {
      setActiveFurnitureId(null);
    }
  };

  const getFurnitureInRoom = (roomId: string | null) => {
    return furniture.filter((item) => item.roomId === roomId);
  };

  return (
    <AppContext.Provider
      value={{
        rooms,
        activeRoomId,
        furniture,
        activeFurnitureId,
        addRoom,
        updateRoom,
        deleteRoom,
        setActiveRoomId,
        addFurniture,
        updateFurniture,
        deleteFurniture,
        setActiveFurnitureId,
        getFurnitureInRoom,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}