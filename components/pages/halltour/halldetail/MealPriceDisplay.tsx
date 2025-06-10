"use client";

import { useState } from "react";
import { BsQuestionCircle } from "react-icons/bs";
import { MealPrice } from "@/types/hallDetail";

// --- ⭐️ 타입 정의 추가 ---
// 부모 컴포넌트로부터 받을 가격 비교 결과의 타입을 정의합니다.
interface ComparisonResult {
  isDiscounted: boolean;
  standardPrice?: number;
}

// 컴포넌트가 받을 props 타입 정의를 수정합니다.
interface MealPriceDisplayProps {
  item: MealPrice; // 표시할 식사 가격 항목 데이터
  comparisonResult: ComparisonResult; // ⭐️ 가격 비교 결과 prop 추가
}

// 식사 가격 항목 하나를 표시하는 컴포넌트
export default function MealPriceDisplay({
  item,
  comparisonResult,
}: MealPriceDisplayProps) {
  // 툴팁 표시 상태 관리
  const [showTooltip, setShowTooltip] = useState(false);

  // ⭐️ 비교 결과에서 할인 여부와 기준 가격을 추출합니다.
  const { isDiscounted, standardPrice } = comparisonResult;

  // item.extra 내용이 비어있지 않은지 확인
  const hasExtra = item.extra && item.extra.trim() !== "";

  return (
    <div className="w-full flex  justify-between gap-1 items-baseline">
      {/* 식사 타입 (성인/소인) */}
      <div className="w-auto flex items-center justify-start flex-shrink-0 text-gray-700">
        {item.meal_type}
      </div>
      {/* 카테고리 (뷔페/코스) */}
      <div className="w-[55px] flex items-center justify-start flex-shrink-0 text-gray-700">
        {item.category} :
      </div>

      {/* ⭐️ [수정됨] 가격 및 툴팁 아이콘을 포함하는 오른쪽 영역 */}
      <div className="flex-grow flex items-baseline justify-end gap-1 relative text-gray-700">
        {/* 가격 표시 영역 */}
        <div className="flex items-baseline justify-end gap-2 flex-wrap">
          {/* 할인된 경우, 이전 가격을 취소선과 함께 표시 */}
          {isDiscounted && standardPrice !== undefined && (
            <span className="text-xs text-gray-400 line-through">
              {standardPrice.toLocaleString()}원
            </span>
          )}
          {/* 현재 가격 */}
          <span className={isDiscounted ? "font-bold text-red-500" : ""}>
            {item.price?.toLocaleString()}원
          </span>
        </div>

        {/* 툴팁 아이콘 영역 */}
        <div className="w-[20px] h-[20px] flex-shrink-0">
          {hasExtra && (
            <span
              className="flex items-center justify-center cursor-help text-gray-500 hover:text-gray-700 transition-colors"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <BsQuestionCircle size={14} />
            </span>
          )}
          {hasExtra && showTooltip && (
            <div className="absolute right-0 bottom-full mb-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-30 w-48 whitespace-pre-wrap">
              {item.extra}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
