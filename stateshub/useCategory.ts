import { categeryType } from "@/app/(protected)/(tabs)/files";
import { create } from "zustand";

interface CategoryState {
  category: categeryType;
  setCategory: (category: categeryType) => void;
}

export const useCategory = create<CategoryState>((set) => ({
  category: "photos",
  setCategory: (category: categeryType) => set({ category }),
}));
