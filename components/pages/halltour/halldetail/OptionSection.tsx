"use client";

import Link from "next/link";
import cn from "classnames";
import OptionDescDisplay from "./OptionDescDisplay";
import { AiOutlineLink } from "react-icons/ai";

// --- ⭐️ 타입 정의 (상위 컴포넌트와 일치시킴) ---
interface EstimateOption {
  id: number | string;
  name?: string | null;
  price?: number | null;
  is_required?: boolean | null;
  description?: string | null;
  reference_url?: string | null;
  [key: string]: any;
}

interface Estimate {
  id: number;
  type: "standard" | "admin";
  estimate_options: EstimateOption[];
  // ... 기타 Estimate 속성
}

// --- ⭐️ Props 타입 수정 ---
interface OptionSectionProps {
  standardEstimate: Estimate | null;
  displayEstimate: Estimate | null;
}

export default function OptionSection({
  standardEstimate,
  displayEstimate,
}: OptionSectionProps) {
  // ⭐️ 표시할 옵션 데이터는 displayEstimate에서 가져옵니다.
  const hall_options = displayEstimate?.estimate_options;

  if (
    !hall_options ||
    !Array.isArray(hall_options) ||
    hall_options.length === 0
  ) {
    return null;
  }

  // ⭐️ [가격 비교 로직] 옵션 가격 비교 결과를 반환하는 함수
  const getOptionComparison = (currentOption: EstimateOption) => {
    // 할인 견적서가 아니거나, 비교할 일반 견적서가 없으면 비교하지 않음
    if (displayEstimate?.type !== "admin" || !standardEstimate) {
      return { isDiscounted: false, standardPrice: undefined };
    }
    // 이름(name)으로 기준 옵션을 찾음 (고유한 ID가 있다면 ID로 찾는 것이 더 안정적)
    const standardOption = standardEstimate.estimate_options.find(
      (opt) => opt.name === currentOption.name
    );
    return {
      isDiscounted:
        standardOption && currentOption.price != null
          ? currentOption.price !== standardOption.price
          : false,
      standardPrice: standardOption?.price,
    };
  };

  const sortedOptions = [...hall_options].sort((a, b) => {
    const aIsRequired = a.is_required === true;
    const bIsRequired = b.is_required === true;
    if (aIsRequired && !bIsRequired) return -1;
    if (!aIsRequired && bIsRequired) return 1;

    const nameA = a.name || "";
    const nameB = b.name || "";
    return nameA.localeCompare(nameB, "ko");
  });

  return (
    <div className="w-full text-sm sm:text-md flex flex-col items-start justify-center px-3 sm:px-0">
      <div className="text-xl font-[600] mb-4">옵션 사항</div>
      <div className="w-full flex items-center justify-center">
        <div className="w-full flex flex-col items-start gap-5">
          {sortedOptions.map((item: EstimateOption, index: number) => {
            // ⭐️ 각 옵션에 대한 가격 비교 결과를 가져옴
            const { isDiscounted, standardPrice } = getOptionComparison(item);

            return (
              <div
                key={item.id || `option-${index}`}
                className="w-full flex items-start justify-between"
              >
                <div className="hidden sm:block sm:w-[180px] flex-shrink-0 text-gray-500 self-start">
                  {item.name || "옵션 이름 없음"}
                </div>

                <div className="w-[150px] sm:hidden flex-shrink-0 text-gray-500 self-start">
                  <OptionDescDisplay item={item} />
                </div>

                <div className="w-full sm:w-[570px] pl-3 sm:pl-[20px] flex flex-wrap items-start justify-start gap-4 sm:gap-8">
                  {/* ⭐️ [JSX 수정] 가격 표시 영역 */}
                  <div className="w-[150px]  flex items-baseline justify-end gap-1 flex-shrink-0">
                    {/* 할인된 경우, 이전 가격을 취소선과 함께 표시 */}

                    {isDiscounted && standardPrice !== undefined && (
                      <span className="text-xs text-gray-400 line-through">
                        {standardPrice.toLocaleString()}원
                      </span>
                    )}

                    {/* 현재 가격 */}

                    <span
                      className={cn("text-gray-700", {
                        "font-bold text-red-500": isDiscounted,
                      })}
                    >
                      {item.price != null
                        ? `${item.price.toLocaleString()}원`
                        : "가격 정보 없음"}
                    </span>
                  </div>

                  <div className="w-[30px] flex-shrink-0 self-start">
                    <div
                      className={cn({
                        "text-red-400": item.is_required === true,
                        "text-gray-500": item.is_required !== true,
                      })}
                    >
                      {item.is_required === true ? "필수" : "선택"}
                    </div>
                  </div>

                  <div className="hidden sm:block sm:w-[285px] text-gray-700">
                    {item.description || "-"}
                  </div>

                  {item?.reference_url ? (
                    <a
                      href={item.reference_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline inline-flex items-center"
                      aria-label={`${item.name || "옵션"} 참고 링크`}
                    >
                      <AiOutlineLink className="mr-1" />
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-full border border-gray-300 my-4"></div>
    </div>
  );
}
