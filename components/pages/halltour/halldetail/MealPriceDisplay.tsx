"use client";

import { useState } from "react";
import { BsQuestionCircle } from "react-icons/bs";

interface MealPriceItem {
  id?: number; // 고유 ID (key prop으로 사용될 수 있음)
  category: string; // 식사 카테고리 (예: 대인, 소인, 음주류)
  price?: number; // 가격
  extra?: string; // 추가 정보 (있을 수도, 없을 수도 있음)
}

// 컴포넌트가 받을 props 타입 정의
interface MealPriceDisplayProps {
  item: MealPriceItem; // 표시할 식사 가격 항목 데이터
}

// 식사 가격 항목 하나를 표시하는 컴포넌트
export default function MealPriceDisplay({ item }: MealPriceDisplayProps) {
  // 툴팁 표시 상태 관리
  const [showTooltip, setShowTooltip] = useState(false);

  // item.extra 내용이 비어있지 않은지 확인
  const hasExtra = item.extra && item.extra.trim() !== "";

  return (
    <div className="w-full flex gap-1 items-baseline">
      <div className="w-[55px] flex items-center justify-start flex-shrink-0 text-gray-700">
        {item.category} : {/* 카테고리 텍스트와 콜론 */}
      </div>

      <div className="w-[130px] xs:w-[170px] flex-grow text-right relative text-gray-700">
        {item.price?.toLocaleString()}원
        {hasExtra && (
          <span
            className="ml-1 inline-flex items-center cursor-help text-gray-500 hover:text-gray-700 transition-colors"
            onMouseEnter={() => setShowTooltip(true)} // 마우스 올리면 툴팁 표시
            onMouseLeave={() => setShowTooltip(false)} // 마우스 벗어나면 툴팁 숨김
          >
            <BsQuestionCircle size={14} /> {/* 아이콘 크기 설정 */}
          </span>
        )}
        {hasExtra && showTooltip && (
          <div className="absolute right-0 bottom-full  p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-30 w-48 whitespace-pre-wrap">
            {item.extra} {/* extra 내용 표시 */}
          </div>
        )}
      </div>
    </div>
  );
}
