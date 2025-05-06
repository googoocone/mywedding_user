"use client";

import { useState } from "react";
import { BsQuestionCircle } from "react-icons/bs";

interface OptionDescItem {
  name: string;
  description: string;
}

// 컴포넌트가 받을 props 타입 정의
interface OptionDescDisplayProps {
  item: OptionDescItem; // 표시할 식사 가격 항목 데이터
}

// 식사 가격 항목 하나를 표시하는 컴포넌트
export default function OptionDescDisplay({ item }: OptionDescDisplayProps) {
  // 툴팁 표시 상태 관리
  const [showTooltip, setShowTooltip] = useState(false);
  const hasDesc = item.description && item.description.trim() !== "";

  return (
    <div className="flex gap-1 items-baseline">
      <div className="w-6 flex-grow text-left relative text-gray-700">
        {item.name}
        {hasDesc && (
          <span
            className="ml-1 inline-flex items-center cursor-help text-gray-500 hover:text-gray-700 transition-colors"
            onMouseEnter={() => setShowTooltip(true)} // 마우스 올리면 툴팁 표시
            onMouseLeave={() => setShowTooltip(false)} // 마우스 벗어나면 툴팁 숨김
          >
            <BsQuestionCircle size={14} /> {/* 아이콘 크기 설정 */}
          </span>
        )}
        {hasDesc && showTooltip && (
          <div className="absolute left-0 bottom-full  p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-30 w-48 whitespace-pre-wrap">
            {item.description} {/* extra 내용 표시 */}
          </div>
        )}
      </div>
    </div>
  );
}
