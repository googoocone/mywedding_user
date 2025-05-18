// components/pages/halltour/halldetail/BasicInfoSection.tsx

"use client";

import { useMemo } from "react"; // useState는 현재 이 컴포넌트에서 불필요
import MealPriceDisplay from "./MealPriceDisplay"; // 경로 확인 필요
// import { BsQuestionCircle } from "react-icons/bs"; // 현재 미사용으로 주석 처리

// BasicInfoSectionProps 인터페이스 정의 (타입 안정성 강화)
interface MealPriceData {
  // MealPriceDisplay에서 사용할 수 있는 타입 예시
  id: number | string;
  meal_type: string;
  category: string;
  price: number;
  extra?: string;
}

interface BasicInfoSectionProps {
  name?: string | null;
  mood?: string | null;
  time?: string | null;
  hall_type?: string | null; // ✨ 쉼표로 구분된 문자열 또는 단일 문자열
  // meal_types는 현재 JSX에서 직접 사용되지 않고, meal_price를 사용하고 있습니다.
  // 만약 meal_price가 meal_types와 동일한 데이터를 의미한다면 하나로 통일하는 것이 좋습니다.
  // 여기서는 meal_price를 MealPriceData[] 타입으로 가정합니다.
  guarantee?: number | null;
  parking?: number | null;
  interval_minutes?: number | null;
  price?: number | null;
  meal_price?: MealPriceData[];
  meal_types: string[];
}

export default function BasicInfoSection({
  name,
  mood,
  time,
  hall_type,
  guarantee,
  parking,
  interval_minutes,
  price,
  meal_price,
  meal_types,
}: BasicInfoSectionProps) {
  const cleanedStringTime = time?.replace(/"/g, "") || "";

  // ✨ hall_type 문자열을 분리하여 배열로 만들고, 각 요소의 공백 제거 및 빈 요소 필터링
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
    <div className="w-full flex flex-col items-start justify-center px-3 sm:px-0">
      <div className="text-2xl font-[600] mb-4">홀 상세정보</div>
      <div className="w-full flex flex-col sm:flex-row items-start justify-start">
        {" "}
        {/* justify-center -> justify-start */}
        {/* 왼쪽 정보 컬럼 */}
        <div className="w-full sm:w-[375px] flex flex-col items-start gap-4 sm:pr-4">
          {" "}
          {/* 오른쪽 패딩 추가 */}
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
            {" "}
            {/* items-start로 변경하여 여러 줄 타입 표시 용이 */}
            <div className="w-[100px] sm:w-[120px] flex-shrink-0 text-gray-500 self-start pt-1">
              {" "}
              {/* pt-1 추가로 수직 정렬 미세 조정 */}홀 타입
            </div>
            {/* ✨ [수정됨] 홀 타입 표시 방식 변경: 여러 타입을 태그 형태로 표시 */}
            <div className="flex-1 pl-2 flex flex-wrap items-center justify-end sm:justify-start gap-1">
              {hallTypesArray.length > 0 ? (
                hallTypesArray.map((type, index) => (
                  <span
                    key={`${type}-${index}`}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs mr-1 mb-1"
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
        <div className="w-full sm:w-[375px] flex flex-col items-start gap-4 mt-4 sm:mt-0 sm:pl-4">
          {" "}
          {/* 왼쪽 패딩 추가 */}
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] sm:w-[120px] flex-shrink-0 text-gray-500 self-start">
              대관료
            </div>
            <div className="flex-1 pl-2 text-gray-700 text-right sm:text-left">
              {price != null ? price.toLocaleString() + "원" : "정보 없음"}
            </div>
          </div>
          <div className="w-full flex items-start justify-between">
            <div className="w-[70px] sm:w-[80px] flex-shrink-0 text-gray-500 self-start pt-1">
              식대
            </div>
            <div className="flex-1 pl-2 flex flex-col items-end sm:items-start gap-1 text-gray-700">
              {meal_price && meal_price.length > 0 ? (
                meal_price.map((item, index) => (
                  <MealPriceDisplay
                    key={item.id || `meal-price-${index}`}
                    item={item}
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
      <div className="w-full border border-gray-300 my-4"></div>
    </div>
  );
}
