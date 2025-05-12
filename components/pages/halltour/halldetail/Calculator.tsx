// /components/pages/halltour/halldetail/Calculator.tsx

"use client";

import { useState, useMemo, useEffect } from "react";
import { CiCalculator1 } from "react-icons/ci";

// --- 인터페이스 정의 ---
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
interface MealCounts {
  [mealPriceId: number]: number;
}

// --- CalculatorProps 인터페이스 수정 ---
interface CalculatorProps {
  standardEstimate: Estimate | null; // 홀의 standard 견적서
  adminEstimate: Estimate | null; // 선택 날짜의 admin 견적서 (없을 수 있음)
  selectedType: "standard" | "admin"; // 사용자가 필터에서 선택한 타입
}

// --- 계산기 컴포넌트 ---
export default function Calculator({
  standardEstimate,
  adminEstimate,
  selectedType,
}: CalculatorProps) {
  const [mealCounts, setMealCounts] = useState<MealCounts>({});
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  // --- 표시할 견적서 및 비교 견적서 결정 ---
  // selectedType이 'admin'이고 adminEstimate가 실제로 존재하면 adminEstimate를 표시, 아니면 standardEstimate 표시
  const displayEstimate =
    selectedType === "admin" && adminEstimate
      ? adminEstimate
      : standardEstimate;
  // 비교 대상은 selectedType이 'admin'이고 adminEstimate와 standardEstimate 둘 다 있을 때만 standardEstimate가 됨
  const compareEstimate =
    selectedType === "admin" && adminEstimate && standardEstimate
      ? standardEstimate
      : null;

  // --- 표시할 식대 목록 필터링 ('소인', '음주류' 제외) ---
  const filteredMealPrices = useMemo(() => {
    // displayEstimate 기준으로 필터링
    return (
      displayEstimate?.meal_prices?.filter(
        (meal) => meal.category !== "소인" && meal.category !== "음주류"
      ) || []
    );
  }, [displayEstimate?.meal_prices]);

  // --- 상태 초기화 useEffect ---
  useEffect(() => {
    // displayEstimate가 바뀔 때마다 실행
    const initialCounts = filteredMealPrices.reduce((acc, meal) => {
      // filteredMealPrices는 displayEstimate에서 파생되었으므로 meal.id 사용 가능
      acc[meal.id] = 0;
      return acc;
    }, {} as MealCounts);
    setMealCounts(initialCounts);
    setSelectedOptions([]);
  }, [displayEstimate]); // displayEstimate가 변경될 때 초기화 (filteredMealPrices 대신)

  // --- 이벤트 핸들러 ---
  const handleOptionToggle = (optionId: number) => {
    // 옵션 ID가 displayEstimate에 존재하는지 확인 후 토글
    const optionExists = displayEstimate?.estimate_options.find(
      (opt) => opt.id === optionId
    );
    if (!optionExists) return;

    setSelectedOptions((prevSelected) =>
      prevSelected.includes(optionId)
        ? prevSelected.filter((id) => id !== optionId)
        : [...prevSelected, optionId]
    );
  };

  const handleMealCountChange = (mealPriceId: number, value: string) => {
    // 식대 ID가 displayEstimate에 존재하는지 확인 후 업데이트
    const mealExists = displayEstimate?.meal_prices.find(
      (meal) => meal.id === mealPriceId
    );
    if (!mealExists) return;

    const count = parseInt(value, 10);
    const validCount = isNaN(count) || count < 0 ? 0 : count;
    setMealCounts((prevCounts) => ({
      ...prevCounts,
      [mealPriceId]: validCount,
    }));
  };

  // --- 비용 계산 useMemo ---
  // totalDisplayCost: 화면에 표시되는 최종 금액
  // totalCompareCost: 비교 대상(standard)의 총 금액 (할인 계산용)
  // totalDiscount: 총 할인액
  const { totalDisplayCost, totalCompareCost, totalDiscount } = useMemo(() => {
    // 표시할 견적서가 없으면 0 반환
    if (!displayEstimate)
      return { totalDisplayCost: 0, totalCompareCost: 0, totalDiscount: 0 };

    // displayEstimate 기준 비용 요소 초기화
    let currentHallCost = displayEstimate.hall_price || 0;
    let currentMealCost = 0;
    let currentOptionsCost = 0;

    // compareEstimate 기준 비용 요소 초기화 (없으면 displayEstimate 값으로)
    let compareHallCost = compareEstimate?.hall_price ?? currentHallCost;
    let compareMealCost = 0;
    let compareOptionsCost = 0;

    // 식대 비용 계산
    filteredMealPrices.forEach((mealPrice) => {
      const count = mealCounts[mealPrice.id] || 0;
      currentMealCost += count * mealPrice.price; // 현재 식대 비용 누적

      // 비교 대상(standard) 식대 비용 계산
      const compareMeal = compareEstimate?.meal_prices.find(
        (m) => m.category === mealPrice.category
      );
      const comparePriceValue = compareMeal?.price ?? mealPrice.price; // standard 가격 없으면 현재 가격
      compareMealCost += count * comparePriceValue;
    });

    // 옵션 비용 계산
    if (
      displayEstimate.estimate_options &&
      Array.isArray(displayEstimate.estimate_options)
    ) {
      displayEstimate.estimate_options.forEach((option) => {
        const isSelected = selectedOptions.includes(option.id);
        const currentPrice = option.price;

        // 비교 대상(standard) 옵션 찾기 (ID 또는 이름으로 매칭)
        const compareOption = compareEstimate?.estimate_options.find(
          (opt) => opt.id === option.id || opt.name === option.name
        );
        const comparePriceValue = compareOption?.price ?? currentPrice; // standard 가격 없으면 현재 가격

        // 필수 옵션 비용 누적
        if (option.is_required) {
          currentOptionsCost += currentPrice;
          compareOptionsCost += comparePriceValue;
        }
        // 선택된 옵션 비용 누적
        else if (isSelected) {
          currentOptionsCost += currentPrice;
          compareOptionsCost += comparePriceValue;
        }
      });
    }

    // 최종 비용 합산
    const calcTotalDisplayCost =
      currentHallCost + currentMealCost + currentOptionsCost;
    // 비교 총액은 compareEstimate가 있을 때만 의미 있음
    const calcTotalCompareCost = compareEstimate
      ? compareHallCost + compareMealCost + compareOptionsCost
      : calcTotalDisplayCost;
    // 할인액 계산 (음수 방지)
    const calcTotalDiscount =
      compareEstimate && calcTotalCompareCost > calcTotalDisplayCost
        ? calcTotalCompareCost - calcTotalDisplayCost
        : 0;

    return {
      totalDisplayCost: calcTotalDisplayCost,
      totalCompareCost: calcTotalCompareCost,
      totalDiscount: calcTotalDiscount,
    };
  }, [
    displayEstimate,
    compareEstimate,
    filteredMealPrices,
    mealCounts,
    selectedOptions,
  ]);

  // --- 렌더링 로직 ---
  if (!displayEstimate) {
    return (
      <div className="w-[400px] h-[500px] rounded-xl border border-gray-400 mt-4 p-5 flex items-center justify-center text-gray-500">
        표시할 견적 정보가 없습니다. 필터를 확인해주세요.
      </div>
    );
  }

  const formatCurrency = (amount: number): string => {
    if (isNaN(amount)) return "0";
    return amount.toLocaleString("ko-KR");
  };

  // 필수/선택 옵션 분리 (displayEstimate 기준)
  const requiredEstimateOptions =
    displayEstimate.estimate_options?.filter((o) => o.is_required) || [];
  const optionalEstimateOptions =
    displayEstimate.estimate_options?.filter((o) => !o.is_required) || [];

  // --- 최종 계산기 UI 반환 ---
  return (
    <div className="w-[400px] min-h-[500px] rounded-xl border border-gray-400 mt-4 p-5 flex flex-col bg-white shadow-md">
      {/* 계산기 헤더 */}
      <div className="w-full flex items-center justify-between text-2xl mb-2">
        <div className="font-semibold text-gray-800">견적서 계산기</div>
        <CiCalculator1 className="text-3xl text-gray-600" />
      </div>
      <div className="text-sm text-gray-500 mb-4">
        ❤️ 나의 웨딩 견적은 얼마?
        {/* compareEstimate가 있을 때만 (즉, admin 견적을 보고 있을 때만) 할인 표시 */}
        {compareEstimate && (
          <span className="ml-2 text-blue-600 font-semibold">(할인 적용)</span>
        )}
      </div>
      <div className="w-full border-b border-gray-200 mb-4"></div>

      {/* 홀 비용 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">홀 비용</h3>
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
          <span className="text-gray-700 text-sm">홀 대관료</span>
          <div className="flex items-center">
            {/* 할인 정보 표시: compareEstimate가 있고 가격이 다를 때 */}
            {compareEstimate &&
              compareEstimate.hall_price !== displayEstimate.hall_price && (
                <span className="text-xs text-gray-400 line-through mr-2">
                  {formatCurrency(compareEstimate.hall_price)} 원
                </span>
              )}
            <span className="font-semibold text-gray-900">
              {formatCurrency(displayEstimate.hall_price || 0)} 원
            </span>
          </div>
        </div>
      </div>

      {/* 식대 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">식대</h3>
        {filteredMealPrices.map((mealPrice) => {
          // 비교 가격 찾기
          const compareMeal = compareEstimate?.meal_prices.find(
            (m) => m.category === mealPrice.category
          );
          const comparePriceValue = compareMeal?.price;
          const currentPrice = mealPrice.price;
          // 할인 정보 표시 조건: compareEstimate가 있고, standard 가격이 존재하며, standard > admin 일 때
          const showDiscount =
            compareEstimate &&
            comparePriceValue !== undefined &&
            comparePriceValue > currentPrice;
          const discountAmount = showDiscount
            ? comparePriceValue - currentPrice
            : 0;
          const discountPercent =
            showDiscount && comparePriceValue > 0
              ? Math.round((discountAmount / comparePriceValue) * 100)
              : 0;

          return (
            <div key={mealPrice.id} className="bg-gray-50 p-3 rounded-lg mb-2">
              <div className="flex justify-between items-center">
                {/* 식대 정보 */}
                <div className="flex-1">
                  <span className="text-gray-700 text-sm font-medium">
                    {mealPrice.meal_type}
                  </span>
                  <div>
                    <span className="text-xs text-gray-500">
                      ({formatCurrency(currentPrice)}원/{mealPrice.category})
                    </span>
                    {/* {mealPrice.extra && (
                      <span className="text-xs text-blue-600  font-medium">
                        ({mealPrice.extra})
                      </span>
                    )} */}
                    {/* 할인 정보 조건부 표시 */}
                    {showDiscount && (
                      <div className="text-xs text-red-500  font-semibold">
                        ({formatCurrency(discountAmount)}원 / {discountPercent}%
                        할인)
                      </div>
                    )}
                  </div>
                </div>
                {/* 인원수 입력 */}
                <div className="flex items-center mx-2">
                  <input
                    type="number"
                    min="0"
                    value={mealCounts[mealPrice.id] || 0}
                    onChange={(e) =>
                      handleMealCountChange(mealPrice.id, e.target.value)
                    }
                    className="w-16 text-right border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff767b]"
                    aria-label={`${mealPrice.category} 인원수`}
                  />
                  <span className="text-sm text-gray-600 ml-1">명</span>
                </div>
                {/* 소계 */}
                <span className="font-semibold text-gray-900 w-28 text-right">
                  {formatCurrency(
                    (mealCounts[mealPrice.id] || 0) * currentPrice
                  )}{" "}
                  원
                </span>
              </div>
            </div>
          );
        })}
        {filteredMealPrices.length === 0 && (
          <div className="text-sm text-gray-400 bg-gray-50 p-3 rounded-lg">
            {" "}
            계산 가능한 식대 항목이 없습니다. ('소인', '음주류' 제외){" "}
          </div>
        )}
      </div>

      {/* 옵션 */}
      {(requiredEstimateOptions.length > 0 ||
        optionalEstimateOptions.length > 0) && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">옵션</h3>
          {/* 필수 옵션 */}
          {requiredEstimateOptions.length > 0 && (
            <div className="mb-3">
              <h4 className="text-md font-medium mb-1 text-gray-600">
                필수 포함 옵션
              </h4>
              {requiredEstimateOptions.map((option) => {
                const compareOption = compareEstimate?.estimate_options.find(
                  (opt) => opt.id === option.id || opt.name === option.name
                );
                const comparePriceValue = compareOption?.price;
                const currentPrice = option.price;
                const showDiscount =
                  compareEstimate &&
                  comparePriceValue !== undefined &&
                  comparePriceValue > currentPrice;
                return (
                  <div
                    key={option.id}
                    className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mb-1"
                  >
                    <span className="text-sm text-gray-700">{option.name}</span>
                    <div className="flex items-center">
                      {showDiscount && (
                        <span className="text-xs text-gray-400 line-through mr-2">
                          {" "}
                          {formatCurrency(comparePriceValue)} 원{" "}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-gray-900">
                        {" "}
                        {formatCurrency(currentPrice)} 원{" "}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* 선택 옵션 */}
          {optionalEstimateOptions.length > 0 && (
            <div>
              <h4 className="text-md font-medium mb-1 text-gray-600">
                선택 가능 옵션
              </h4>
              {optionalEstimateOptions.map((option) => {
                const compareOption = compareEstimate?.estimate_options.find(
                  (opt) => opt.id === option.id || opt.name === option.name
                );
                const comparePriceValue = compareOption?.price;
                const currentPrice = option.price;
                const showDiscount =
                  compareEstimate &&
                  comparePriceValue !== undefined &&
                  comparePriceValue > currentPrice;
                return (
                  <div
                    key={option.id}
                    className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mb-1 hover:bg-gray-100 transition-colors"
                  >
                    <label className="flex items-center text-sm text-gray-700 cursor-pointer flex-1 mr-2">
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(option.id)}
                        onChange={() => handleOptionToggle(option.id)}
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-[#ff767b] focus:ring-[#ff9a9e]"
                      />
                      {option.name}
                    </label>
                    <div className="flex items-center">
                      {showDiscount && (
                        <span className="text-xs text-gray-400 line-through mr-2">
                          {" "}
                          {formatCurrency(comparePriceValue)} 원{" "}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-gray-900">
                        {" "}
                        {formatCurrency(currentPrice)} 원{" "}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {/* 옵션 없을 때 메시지 (displayEstimate 기준) */}
      {displayEstimate.estimate_options?.length === 0 && (
        <div className="mb-4 text-sm text-gray-400">
          {" "}
          추가 옵션 정보가 없습니다.{" "}
        </div>
      )}

      {/* 구분선 */}
      <div className="w-full border-t border-gray-300 my-4"></div>

      {/* 최종 금액 */}
      <div className="mt-auto">
        {/* 총 할인 금액 (0보다 클 때만 표시) */}
        {totalDiscount > 0 && (
          <div className="flex justify-between items-center text-sm mb-2 text-red-600">
            <span className="font-semibold">총 할인 금액</span>
            <span className="font-bold">
              - {formatCurrency(totalDiscount)} 원
            </span>
          </div>
        )}
        {/* 총 예상 금액 */}
        <div className="flex justify-between items-center text-xl">
          <span className="font-semibold text-gray-800">총 예상 금액</span>
          <span className="font-bold text-2xl text-[#ff767b]">
            {formatCurrency(totalDisplayCost)} 원
          </span>
        </div>
      </div>
    </div>
  );
}
