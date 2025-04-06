import { create } from "zustand";

type WeddingFilterState = {
  selectedRegion: string;
  selectedSubRegion: string;
  selectedWeddingType: string;
  selectedFlower: string;
  searchTerm: string;
  appliedSearchTerm: string;

  setSelectedRegion: (region: string) => void;
  setSelectedSubRegion: (sub: string) => void;
  setSelectedWeddingType: (type: string) => void;
  setSelectedFlower: (flower: string) => void;
  setSearchTerm: (term: string) => void;
  setAppliedSearchTerm: (term: string) => void;
};

export const useWeddingFilterStore = create<WeddingFilterState>((set) => ({
  selectedRegion: "서울", // 기본값
  selectedSubRegion: "",
  selectedWeddingType: "전체",
  selectedFlower: "전체",
  searchTerm: "",
  appliedSearchTerm: "",

  setSelectedRegion: (region) => set({ selectedRegion: region }),
  setSelectedSubRegion: (sub) => set({ selectedSubRegion: sub }),
  setSelectedWeddingType: (type) => set({ selectedWeddingType: type }),
  setSelectedFlower: (flower) => set({ selectedFlower: flower }),
  setSearchTerm: (term) => set({ searchTerm: term }),
  setAppliedSearchTerm: (term) => set({ appliedSearchTerm: term }),
}));
