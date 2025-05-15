import { useState } from "react";
import { BsQuestionCircle } from "react-icons/bs";
import MealPriceDisplay from "./MealPriceDisplay";

export default function BasicInfoSection({
  name,
  mood,
  time,
  hall_type,
  meal_types,
  guarantee,
  parking,
  interval_minutes,
  price,
  meal_price,
}: any) {
  let cleanedStringTime = time.replace(/"/g, "");

  const [showTooltip, setShowTooltip] = useState(false);
  console.log("meal_types", meal_types);

  return (
    <div className="w-full flex flex-col items-start justify-center px-3 sm:px-0">
      <div className="text-2xl font-[600] mb-4">홀 상세정보</div>
      <div className="w-full flex flex-col sm:flex-row items-start justify-center">
        {/* 이 부분이 기본정보의 요소들이 들어가는 부분 */}
        <div className="w-full sm:w-[375px] flex flex-col items-start gap-4">
          <div className="w-full flex items-center justify-between">
            <div className="w-[130px] xs:w-[130px] sm:w-[180px] flex-shrink-0 text-gray-500 self-start">
              홀 이름
            </div>
            <div className="w-[275px] pl-2 sm:pl-[20px] pr-[40px] flex flex-wrap items-center justify-start gap-2">
              <div>{name}</div>
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[130px] xs:w-[130px] sm:w-[180px] flex-shrink-0 text-gray-500 self-start">
              홀 분위기
            </div>
            <div className="w-[275px] pl-2 sm:pl-[20px] pr-[40px] flex flex-wrap items-center justify-start gap-2">
              <div>{mood}</div>
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[130px] xs:w-[130px] sm:w-[180px] flex-shrink-0 text-gray-500 self-start">
              홀종류
            </div>
            <div className="w-[275px] pl-2 sm:pl-[20px] flex flex-wrap items-center justify-start gap-2">
              <div className="flex items-center gap-1">
                <span>{hall_type}</span>
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[130px] xs:w-[130px] sm:w-[180px] flex-shrink-0 text-gray-500 self-start">
              예식시간
            </div>
            <div className="w-[275px] pl-2 sm:pl-[20px] flex flex-wrap items-center justify-start gap-2">
              <div>{cleanedStringTime}</div>
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[130px] xs:w-[130px] sm:w-[180px] flex-shrink-0 text-gray-500 self-start">
              예식간격
            </div>
            <div className="w-[275px] pl-2 sm:pl-[20px] flex flex-wrap items-center justify-start gap-2">
              {interval_minutes}분
            </div>
          </div>
        </div>

        <div className="w-full sm:w-[375px] flex flex-col items-start gap-4 mt-4">
          <div className="w-full flex items-center justify-between">
            <div className="w-[130px] xs:w-[130px] sm:w-[180px] flex-shrink-0 text-gray-500 self-start">
              대관료
            </div>
            <div className="w-[275px] pl-2 sm:pl-[20px] flex flex-wrap items-center justify-start gap-2">
              <div className="flex items-center gap-1">
                <span>{price?.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          <div className="w-full flex items-center justify-between">
            <div className="w-[130px] xs:w-[130px] sm:w-[80px] flex-shrink-0 text-gray-500 self-start">
              식대
            </div>
            <div className="flex flex-col items-center justify-start gap-1">
              {meal_types.map((item: string) => (
                <div>{item?.meal_type}</div>
              ))}
            </div>

            <div className="w-[155px] sm:w-[195px] pl-2 sm:pl-[20px] flex flex-wrap items-center justify-start gap-2">
              <div className="flex flex-col items-center gap-1">
                {meal_price.map((item: any, index: any) => (
                  <MealPriceDisplay
                    key={item.id || item.category}
                    item={item}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[130px] xs:w-[130px] sm:w-[180px] flex-shrink-0 text-gray-500 self-start">
              보증인원
            </div>
            <div className="w-[275px] pl-2 sm:pl-[20px] flex flex-wrap items-center justify-start gap-2">
              {guarantee}명
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[130px] xs:w-[130px] sm:w-[180px] flex-shrink-0 text-gray-500 self-start">
              주차대수
            </div>
            <div className="w-[275px] pl-2  sm:pl-[20px] flex flex-wrap items-center justify-start gap-2">
              {parking}대
            </div>
          </div>
        </div>
      </div>
      <div className="w-full border border-gray-300 my-4"></div>
    </div>
  );
}
