// components/pages/halltour/halldetail/BasicInfoSection.tsx

"use client";

import { useMemo } from "react";
import MealPriceDisplay from "./MealPriceDisplay"; // 이 컴포넌트도 수정이 필요합니다.

// --- 타입 정의 (상위 컴포넌트와 일치시킴) ---
interface MealPrice {
  id: number;
  estimate_id: number;
  meal_type: string;
  category: string;
  price: number;
  extra?: string;
}

interface EstimateOption {
  id: number;
  name: string;
  price: number;
  is_required: boolean;
}

interface Estimate {
  id: number;
  hall_id: number;
  hall_price: number;
  date: string;
  time: string;
  type: "standard" | "admin";
  meal_prices: MealPrice[];
  estimate_options: EstimateOption[];
  penalty_amount?: number;
  penalty_detail?: string;
  etcs?: { content: string }[];
}

// ⭐️ Props 인터페이스를 수정하여 전체 견적서 정보를 받도록 변경
interface BasicInfoSectionProps {
  standardEstimate: Estimate | null;
  adminEstimate: Estimate | null;
  displayEstimate: Estimate | null; // 현재 화면에 표시될 견적서
  name?: string | null;
  mood?: string | null;
  time?: string | null;
  hall_type?: string | null;
  guarantee?: number | null;
  parking?: number | null;
  interval_minutes?: number | null;
}

export default function BasicInfoSection({
  standardEstimate,
  displayEstimate,
  name,
  mood,
  time,
  hall_type,
  guarantee,
  parking,
  interval_minutes,
}: BasicInfoSectionProps) {
  // 💡 표시할 견적 정보가 없으면 아무것도 렌더링하지 않음 (방어 코드)
  if (!displayEstimate) {
    return null;
  }

  // ⭐️ 표시될 데이터는 displayEstimate에서 추출
  const { hall_price, meal_prices } = displayEstimate;

  // ⭐️ [가격 비교 로직] 대관료 비교
  const standardHallPrice = standardEstimate?.hall_price;
  const isHallPriceDiscounted =
    displayEstimate.type === "admin" &&
    standardHallPrice !== undefined &&
    hall_price !== standardHallPrice;

  // ⭐️ [가격 비교 로직] 식대 비교 결과를 반환하는 함수
  const getMealComparison = (currentMeal: MealPrice) => {
    if (displayEstimate.type !== "admin" || !standardEstimate) {
      return { isDiscounted: false, standardPrice: undefined };
    }
    const standardMeal = standardEstimate.meal_prices.find(
      (m) =>
        m.category === currentMeal.category &&
        m.meal_type === currentMeal.meal_type
    );
    return {
      isDiscounted: standardMeal
        ? currentMeal.price !== standardMeal.price
        : false,
      standardPrice: standardMeal?.price,
    };
  };

  const cleanedStringTime = time?.replace(/"/g, "") || "";

  const hallTypesArray = useMemo(() => {
    if (hall_type && typeof hall_type === "string") {
      return hall_type
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }
    return [];
  }, [hall_type]);

  return (
    <div className="w-full text-sm sm:text-md flex flex-col items-start justify-center sm:px-0">
      <div className="text-xl font-[600] mb-4">홀 상세정보</div>
      <div className="w-full flex flex-col sm:flex-row items-start justify-start">
        {/* 왼쪽 정보 컬럼 */}
        <div className="w-full sm:w-[375px] flex flex-col items-start gap-4 sm:pr-4">
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] sm:w-[120px] flex-shrink-0 text-gray-500 self-start">
              홀 이름
            </div>
            <div className="flex-1 pl-2 text-gray-700 text-right sm:text-left">
              {name || "정보 없음"}
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] sm:w-[120px] flex-shrink-0 text-gray-500 self-start">
              홀 분위기
            </div>
            <div className="flex-1 pl-2 text-gray-700 text-right sm:text-left">
              {mood || "정보 없음"}
            </div>
          </div>
          <div className="w-full flex items-start justify-between">
            <div className="w-[100px] sm:w-[120px] flex-shrink-0 text-gray-500 self-start pt-1">
              홀 타입
            </div>
            <div className="flex-1 pl-2 flex flex-wrap items-center justify-end sm:justify-start gap-1">
              {hallTypesArray.length > 0 ? (
                hallTypesArray.map((type, index) => (
                  <span
                    key={`${type}-${index}`}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-md mr-1 mb-1"
                  >
                    {type}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-xs">정보 없음</span>
              )}
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] sm:w-[120px] flex-shrink-0 text-gray-500 self-start">
              예식시간
            </div>
            <div className="flex-1 pl-2 text-gray-700 text-right sm:text-left whitespace-pre-wrap break-all">
              {cleanedStringTime || "정보 없음"}
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] sm:w-[120px] flex-shrink-0 text-gray-500 self-start">
              예식간격
            </div>
            <div className="flex-1 pl-2 text-gray-700 text-right sm:text-left">
              {interval_minutes != null ? `${interval_minutes}분` : "정보 없음"}
            </div>
          </div>
        </div>
        {/* 오른쪽 정보 컬럼 */}
        <div className="w-full sm:w-[375px] flex flex-col text-sm items-start gap-4 mt-4 sm:mt-0 sm:pl-4">
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] sm:w-[120px] flex-shrink-0 text-gray-500 self-start">
              대관료
            </div>
            {/* ⭐️ [JSX 수정] 대관료 강조 표시 */}
            <div className="flex pl-2 text-gray-700 text-right sm:text-left flex items-center justify-end sm:justify-start">
              {isHallPriceDiscounted && standardHallPrice !== undefined && (
                <span className="text-sm text-gray-400 line-through mr-2">
                  {standardHallPrice.toLocaleString()}원
                </span>
              )}
              <span
                className={
                  isHallPriceDiscounted ? "text-red-500 font-bold" : ""
                }
              >
                {hall_price != null
                  ? hall_price.toLocaleString() + "원"
                  : "정보 없음"}
              </span>
            </div>
          </div>
          <div className="w-full flex items-start">
            <div className="w-[100px] sm:w-[120px] flex-shrink-0 text-gray-500 self-start">
              식대
            </div>
            <div className="w-full flex-1 pl-2 flex flex-col items-end sm:items-start gap-1 text-gray-700">
              {meal_prices && meal_prices.length > 0 ? (
                [...meal_prices]
                  .sort((a, b) => b.price - a.price)
                  .map((item, index) => (
                    // ⭐️ [JSX 수정] 가격 비교 결과를 MealPriceDisplay에 prop으로 전달
                    <MealPriceDisplay
                      key={item.id || `meal-price-${index}`}
                      item={item}
                      comparisonResult={getMealComparison(item)} // 비교 결과 전달
                    />
                  ))
              ) : (
                <span className="text-xs text-gray-400">정보 없음</span>
              )}
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] sm:w-[120px] flex-shrink-0 text-gray-500 self-start">
              보증인원
            </div>
            <div className="flex-1 pl-2 text-gray-700 text-right sm:text-left">
              {guarantee != null ? `${guarantee}명` : "정보 없음"}
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] sm:w-[120px] flex-shrink-0 text-gray-500 self-start">
              주차대수
            </div>
            <div className="flex-1 pl-2 text-gray-700 text-right sm:text-left">
              {parking != null ? `${parking}대` : "정보 없음"}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full border-b border-gray-300 my-8"></div>{" "}
      {/* 간격 조정을 위해 border-t 제거 및 my-8로 변경 */}
    </div>
  );
}
