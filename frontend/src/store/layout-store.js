import { create } from 'zustand';

export const useLayoutStore = create((set) => ({
  isLeftOpen: true,
  isRightOpen: false,
  isZenMode: false,
  
  setLeftOpen: (isOpen) => set({ isLeftOpen: isOpen }),
  setRightOpen: (isOpen) => set({ isRightOpen: isOpen }),
  setZenMode: (isZen) => set({ isZenMode: isZen }),
  
  toggleLeft: () => set((state) => ({ isLeftOpen: !state.isLeftOpen })),
  toggleRight: () => set((state) => ({ isRightOpen: !state.isRightOpen })),
  toggleZen: () => set((state) => ({ isZenMode: !state.isZenMode })),
}));

