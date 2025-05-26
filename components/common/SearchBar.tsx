// components/common/SearchBar.tsx

"use client";

import { useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";

interface SearchBarProps {
  onSearch: (term: string) => void; // 검색 실행 시 호출될 함수
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchClick = () => {
    onSearch(searchTerm); // 부모로부터 받은 onSearch 함수 호출
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  return (
    <div className="w-full h-[50px] border border-gray-300 rounded-full flex items-center">
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 h-full rounded-full focus:outline-none pl-6 pr-2" // 패딩 조정
        placeholder="웨딩홀을 입력해주세요"
        type="text"
      />
      <AiOutlineSearch
        onClick={handleSearchClick}
        className="text-2xl mr-4 cursor-pointer text-gray-500 hover:text-black" // 아이콘 스타일
      />
    </div>
  );
}
