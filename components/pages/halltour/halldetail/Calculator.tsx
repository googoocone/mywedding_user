// /components/pages/halltour/halldetail/Calculator.tsx

"use client"; // 클라이언트 컴포넌트 명시

import { useState, useMemo, useEffect } from "react";
import { CiCalculator1 } from "react-icons/ci"; // 아이콘 임포트

// --- 데이터 구조를 위한 인터페이스 정의 ---

// 식대 항목 인터페이스
interface MealPrice {
  id: number; // 고유 ID
  estimate_id: number; // 연결된 견적서 ID
  meal_type: string; // 식사 타입 (예: "뷔페")
  category: string; // 식대 카테고리 (예: "대인", "소인", "음주류" 등)
  price: number; // 단위 가격 (1인당)
  extra?: string; // 추가 정보 (예: "서비스")
}

// 옵션 항목 인터페이스 (구조 가정)
interface EstimateOption {
  id: number; // 고유 ID (가정)
  name: string; // 옵션 이름 (가정)
  price: number; // 옵션 가격 (가정)
  is_required: boolean; // 필수/선택 여부 (가정)
}

// 견적서 정보 인터페이스
interface Estimate {
  id: number; // 견적서 고유 ID
  hall_id: number; // 연결된 홀 ID
  hall_price: number; // 홀 대관료
  date: string; // 날짜
  time: string; // 시간
  type: "standard" | "admin"; // 견적서 종류 (일반/할인)
  meal_prices: MealPrice[]; // 식대 항목 목록
  estimate_options: EstimateOption[]; // 옵션 항목 목록 (구조 가정)
}

// 컴포넌트 Props 인터페이스
interface CalculatorProps {
  estimate: Estimate | null; // 부모 컴포넌트로부터 받을 선택된 견적서 객체
}

// 식대 항목별 인원수를 저장하기 위한 상태 인터페이스
interface MealCounts {
  [mealPriceId: number]: number; // Key: 식대 항목(MealPrice)의 id, Value: 해당 항목의 인원수
}

// --- 계산기 컴포넌트 ---
export default function Calculator({ estimate }: CalculatorProps) {
  // --- 상태 변수 선언 ---
  // 식대 항목별 인원수 관리 상태 (Key: mealPrice.id, Value: count)
  const [mealCounts, setMealCounts] = useState<MealCounts>({});
  // 선택된 옵션 ID 목록 관리 상태
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  // --- 파생 상태 계산 (useMemo) ---
  // '소인', '음주류' 카테고리를 제외한 식대 항목 목록 필터링
  const filteredMealPrices = useMemo(() => {
    // estimate 객체와 meal_prices 배열이 유효한지 확인 후 필터링
    return (
      estimate?.meal_prices?.filter(
        // category가 '소인' 또는 '음주류'가 아닌 항목만 포함
        (meal) => meal.category !== "소인" && meal.category !== "음주류"
      ) || []
    ); // 유효하지 않으면 빈 배열 반환
  }, [estimate?.meal_prices]); // estimate.meal_prices 배열이 변경될 때만 재계산

  // --- 사이드 이펙트 처리 (useEffect) ---
  // estimate 또는 필터링된 식대 목록(filteredMealPrices)이 변경될 때 실행
  useEffect(() => {
    // 필터링된 식대 목록(filteredMealPrices)을 기반으로 mealCounts 상태 초기화
    const initialCounts = filteredMealPrices.reduce((acc, meal) => {
      acc[meal.id] = 0; // 각 항목의 인원수를 0으로 초기화
      return acc;
    }, {} as MealCounts);
    setMealCounts(initialCounts); // 계산된 초기값으로 상태 업데이트

    setSelectedOptions([]); // 견적서가 바뀌면 선택된 옵션도 초기화
  }, [filteredMealPrices]); // filteredMealPrices 배열 자체가 변경될 때 실행

  // --- 이벤트 핸들러 ---
  // 옵션 체크박스 토글 핸들러
  const handleOptionToggle = (optionId: number) => {
    setSelectedOptions(
      (prevSelected) =>
        prevSelected.includes(optionId)
          ? prevSelected.filter((id) => id !== optionId) // 이미 선택된 경우 제거
          : [...prevSelected, optionId] // 선택되지 않은 경우 추가
    );
  };

  // 식대 인원수 입력 변경 핸들러
  const handleMealCountChange = (mealPriceId: number, value: string) => {
    const count = parseInt(value, 10); // 입력값을 정수로 변환
    // 입력값이 숫자가 아니거나 음수이면 0으로 처리, 아니면 변환된 값 사용
    const validCount = isNaN(count) || count < 0 ? 0 : count;
    // mealCounts 상태 업데이트: 이전 상태를 복사하고, 변경된 항목의 ID에 해당하는 값만 수정
    setMealCounts((prevCounts) => ({
      ...prevCounts,
      [mealPriceId]: validCount,
    }));
  };

  // --- 총 비용 계산 (useMemo) ---
  // 관련된 상태(견적서 정보, 식대 인원수, 선택 옵션)가 변경될 때만 재계산
  const totalCost = useMemo(() => {
    // 견적서 정보가 없으면 0 반환
    if (!estimate) return 0;

    // 1. 홀 비용 계산
    const hallCost = estimate.hall_price || 0;

    // 2. 식대 비용 계산 (필터링된 목록 기준)
    let mealCost = 0;
    // filteredMealPrices 배열 순회
    mealCost = filteredMealPrices.reduce((sum, mealPrice) => {
      // mealCounts 상태에서 해당 항목의 인원수 가져오기 (없으면 0)
      const count = mealCounts[mealPrice.id] || 0;
      // (인원수 * 단가)를 누적 합계에 더함
      return sum + count * mealPrice.price;
    }, 0); // 초기값 0부터 시작

    // 3. 옵션 비용 계산 (estimate_options 구조 가정)
    let optionsCost = 0;
    // estimate_options 배열이 유효한지 확인
    if (estimate.estimate_options && Array.isArray(estimate.estimate_options)) {
      estimate.estimate_options.forEach((option) => {
        // 필수 옵션이면 가격 추가
        if (option.is_required) {
          optionsCost += option.price;
        }
        // 선택 옵션이고, selectedOptions 배열에 포함되어 있으면 가격 추가
        else if (selectedOptions.includes(option.id)) {
          optionsCost += option.price;
        }
      });
    }

    // 최종 비용 반환 (홀 비용 + 식대 비용 + 옵션 비용)
    return hallCost + mealCost + optionsCost;
    // 의존성 배열: 이 값들이 변경될 때만 useMemo 콜백 함수가 재실행됨
  }, [
    estimate?.hall_price,
    estimate?.estimate_options,
    filteredMealPrices,
    mealCounts,
    selectedOptions,
  ]);

  // --- 렌더링 로직 ---

  // 견적서 데이터가 로딩 중이거나 없을 경우 표시할 UI
  if (!estimate) {
    return (
      <div className="w-[400px] h-[500px] rounded-xl border border-gray-400 mt-4 p-5 flex items-center justify-center text-gray-500">
        홀과 견적서 종류, 날짜를 선택해주세요.
      </div>
    );
  }

  // 숫자(금액)를 한국 원화 형식 문자열로 포맷하는 함수
  const formatCurrency = (amount: number): string => {
    // 숫자가 아니거나 유효하지 않은 경우 '0' 반환
    if (isNaN(amount)) return "0";
    // 한국 로케일 기준으로 포맷 (예: 1,000,000)
    return amount.toLocaleString("ko-KR");
  };

  // 필수 옵션과 선택 옵션 분리 (estimate_options 구조 가정)
  const requiredEstimateOptions =
    estimate.estimate_options?.filter((o) => o.is_required) || [];
  const optionalEstimateOptions =
    estimate.estimate_options?.filter((o) => !o.is_required) || [];

  // 최종 계산기 UI 반환
  return (
    <div className="w-[400px] min-h-[500px] rounded-xl border border-gray-400 mt-4 p-5 flex flex-col bg-white shadow-md">
      {/* 계산기 헤더 */}
      <div className="w-full flex items-center justify-between text-2xl mb-2">
        <div className="font-semibold text-gray-800">견적서 계산기</div>
        <CiCalculator1 className="text-3xl text-gray-600" />
      </div>
      <div className="text-sm text-gray-500 mb-4">
        ❤️ 나의 웨딩 견적은 얼마?
      </div>
      {/* 구분선 */}
      <div className="w-full border-b border-gray-200 mb-4"></div>

      {/* 홀 비용 표시 섹션 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">홀 비용</h3>
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
          <span className="text-gray-700 text-sm">홀 대관료</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(estimate.hall_price || 0)} 원
          </span>
        </div>
      </div>

      {/* 식대 표시 및 입력 섹션 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          {/* 필터링된 식대 목록의 첫 번째 항목 meal_type 표시, 없으면 '정보 없음' */}
          식대
        </h3>
        {/* 필터링된 식대 목록(filteredMealPrices) 순회하며 각 항목 렌더링 */}
        {filteredMealPrices.map((mealPrice) => (
          <div
            key={mealPrice.id}
            className="flex justify-between items-center mb-2 bg-gray-50 p-3 rounded-lg"
          >
            {/* 식대 항목 정보 (카테고리, 가격, 추가 정보) */}
            <div className="flex-1">
              <span className="text-gray-700 text-sm font-medium">
                {mealPrice.meal_type}
              </span>
              <div>
                <span className="text-xs text-gray-500 ml-2">
                  ({formatCurrency(mealPrice.price)}원/{mealPrice.category})
                </span>
                {/* 추가 정보(extra)가 있으면 파란색으로 강조 표시 */}
                {mealPrice.extra && (
                  <span className="text-xs text-blue-600 ml-2 font-medium">
                    ({mealPrice.extra})
                  </span>
                )}
              </div>
            </div>
            {/* 인원수 입력 필드 */}
            <div className="flex items-center mx-2">
              <input
                type="number" // 숫자 입력 타입
                min="0" // 최소값 0
                // mealCounts 상태에서 해당 id의 인원수 가져와 표시 (없으면 0)
                value={mealCounts[mealPrice.id] || 0}
                // 입력값 변경 시 handleMealCountChange 호출
                onChange={(e) =>
                  handleMealCountChange(mealPrice.id, e.target.value)
                }
                className="w-16 text-right border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#ff767b]" // 스타일링
                aria-label={`${mealPrice.category} 인원수`} // 접근성을 위한 라벨
              />
              <span className="text-sm text-gray-600 ml-1">명</span>{" "}
              {/* 단위 표시 */}
            </div>
            {/* 항목별 소계 금액 */}
            <span className="font-semibold text-gray-900 w-28 text-right">
              {/* 해당 항목의 인원수와 가격을 곱하여 소계 표시 */}
              {formatCurrency(
                (mealCounts[mealPrice.id] || 0) * mealPrice.price
              )}{" "}
              원
            </span>
          </div>
        ))}
        {/* 필터링된 식대 항목이 없을 경우 메시지 표시 */}
        {filteredMealPrices.length === 0 && (
          <div className="text-sm text-gray-400 bg-gray-50 p-3 rounded-lg">
            계산 가능한 식대 항목이 없습니다. ('소인', '음주류' 제외)
          </div>
        )}
      </div>

      {/* 옵션 표시 및 선택 섹션 (estimate_options 구조 가정) */}
      {/* 필수 또는 선택 옵션이 하나라도 있을 경우 섹션 표시 */}
      {(requiredEstimateOptions.length > 0 ||
        optionalEstimateOptions.length > 0) && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">옵션</h3>
          {/* 필수 옵션 목록 */}
          {requiredEstimateOptions.length > 0 && (
            <div className="mb-3">
              <h4 className="text-md font-medium mb-1 text-gray-600">
                필수 포함 옵션
              </h4>
              {requiredEstimateOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mb-1"
                >
                  <span className="text-sm text-gray-700">{option.name}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(option.price)} 원
                  </span>
                </div>
              ))}
            </div>
          )}
          {/* 선택 옵션 목록 */}
          {optionalEstimateOptions.length > 0 && (
            <div>
              <h4 className="text-md font-medium mb-1 text-gray-600">
                선택 가능 옵션
              </h4>
              {optionalEstimateOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex justify-between items-center bg-gray-50 p-2 rounded-lg mb-1 hover:bg-gray-100 transition-colors"
                >
                  {/* 옵션 선택 체크박스 */}
                  <label className="flex items-center text-sm text-gray-700 cursor-pointer flex-1 mr-2">
                    <input
                      type="checkbox"
                      // selectedOptions 배열에 해당 옵션 ID가 있는지 확인
                      checked={selectedOptions.includes(option.id)}
                      // 체크박스 변경 시 handleOptionToggle 호출
                      onChange={() => handleOptionToggle(option.id)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-[#ff767b] focus:ring-[#ff9a9e]" // 스타일링
                    />
                    {option.name} {/* 옵션 이름 */}
                  </label>
                  {/* 옵션 가격 */}
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(option.price)} 원
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* 옵션 데이터 자체가 없을 경우 메시지 표시 */}
      {estimate.estimate_options?.length === 0 && (
        <div className="mb-4 text-sm text-gray-400">
          추가 옵션 정보가 없습니다.
        </div>
      )}

      {/* 구분선 */}
      <div className="w-full border-t border-gray-300 my-4"></div>

      {/* 최종 계산 금액 표시 섹션 */}
      {/* mt-auto 클래스를 사용하여 부모 flex 컨테이너의 하단에 위치시킴 */}
      <div className="mt-auto">
        <div className="flex justify-between items-center text-xl">
          <span className="font-semibold text-gray-800">총 예상 금액</span>
          {/* 최종 계산된 금액(totalCost) 표시 */}
          <span className="font-bold text-2xl text-[#ff767b]">
            {formatCurrency(totalCost)} 원
          </span>
        </div>
      </div>
    </div>
  );
}
