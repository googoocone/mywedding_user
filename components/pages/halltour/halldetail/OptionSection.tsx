import Link from "next/link";
import cn from "classnames";

import OptionDescDisplay from "./OptionDescDisplay"; // OptionDescDisplay 컴포넌트 경로가 정확한지 확인해주세요.
import { AiOutlineLink } from "react-icons/ai";

// 옵션 항목에 대한 타입 정의 (더 구체적으로 정의하는 것이 좋습니다)
interface HallOptionItem {
  id: number | string; // 고유 ID (key로 사용)
  name?: string | null;
  price?: number | null;
  is_required?: boolean | null;
  description?: string | null;
  reference_url?: string | null;
  // OptionDescDisplay에 필요한 다른 속성들이 있다면 추가
  [key: string]: any; // OptionDescDisplay가 item 전체를 받을 경우를 대비
}

export default function OptionSection({
  hall_options,
}: {
  hall_options: HallOptionItem[]; // props 타입 힌트 적용
}) {
  // hall_options 배열이 유효한지 확인 후 렌더링 (안전성 추가)
  if (
    !hall_options ||
    !Array.isArray(hall_options) ||
    hall_options.length === 0
  ) {
    return null; // 옵션 데이터가 없으면 아무것도 렌더링하지 않음
  }

  // ✨ [수정됨] 옵션 정렬 로직
  const sortedOptions = [...hall_options].sort((a, b) => {
    // 1차 정렬: is_required (true가 위로)
    // item.is_required가 true, false, null, undefined 등 다양한 값을 가질 수 있으므로 명확히 비교
    const aIsRequired = a.is_required === true;
    const bIsRequired = b.is_required === true;

    if (aIsRequired && !bIsRequired) {
      return -1; // a가 먼저 (true는 false보다 작게 취급되어 위로 감)
    }
    if (!aIsRequired && bIsRequired) {
      return 1; // b가 먼저
    }

    // 2차 정렬: name (가나다순)
    // item.name이 없을 경우를 대비해 빈 문자열로 처리
    const nameA = a.name || "";
    const nameB = b.name || "";
    return nameA.localeCompare(nameB, "ko"); // 'ko'는 한국어 기준으로 정렬
  });

  console.log("Sorted hall_options", sortedOptions); // 정렬된 결과 확인 (개발 중)

  return (
    // 전체 섹션 컨테이너
    <div className="w-full flex flex-col items-start justify-center px-3 sm:px-0">
      {/* 섹션 제목 */}
      <div className="text-xl font-[600] mb-4">옵션 사항</div>

      <div className="w-full flex items-center justify-center">
        <div className="w-full flex flex-col items-start gap-5">
          {/* ✨ [수정됨] 정렬된 sortedOptions 배열을 사용하여 맵핑 */}
          {sortedOptions.map(
            (
              item: HallOptionItem, // 타입 힌트 적용
              index: number // map의 두 번째 인자는 index
            ) => (
              <div
                key={item.id || `option-${index}`} // item.id가 없을 경우를 대비한 fallback key
                className="w-full flex items-start justify-between "
              >
                <div className="hidden sm:block sm:w-[180px] flex-shrink-0 text-gray-500 self-start">
                  {item.name || "옵션 이름 없음"}{" "}
                  {/* 안전한 접근 및 폴백 텍스트 */}
                </div>

                {/* 옵션 이름 표시 영역 (작은 화면용) - OptionDescDisplay 컴포넌트 사용 */}
                <div className="w-[130px] sm:hidden flex-shrink-0 text-gray-500 self-start">
                  <OptionDescDisplay item={item}></OptionDescDisplay>{" "}
                  {/* item 데이터를 prop으로 전달 */}
                </div>

                <div className="w-full sm:w-[570px] pl-3 sm:pl-[20px] flex flex-wrap items-start justify-start gap-4 sm:gap-8">
                  {/* 가격 표시 영역 */}
                  <div className="w-[95px] flex-shrink-0 self-start gap-2 flex-wrap text-gray-700">
                    {item.price?.toLocaleString() || "가격 정보 없음"}원{" "}
                    {/* 안전한 접근 및 폴백 */}
                  </div>

                  <div className="w-[40px] flex-shrink-0 self-start">
                    <div
                      className={cn({
                        "text-red-400": item.is_required === true, // 명확한 true 비교
                        "text-gray-500": item.is_required !== true, // true가 아닌 모든 경우
                      })}
                    >
                      {item.is_required === true ? "필수" : "선택"}{" "}
                    </div>
                  </div>

                  <div className="hidden sm:block sm:w-[285px] text-gray-700">
                    {item.description || "-"}{" "}
                    {/* item.description이 없을 경우 '-' 표시 */}
                  </div>

                  {item?.reference_url ? (
                    <a
                      href={item.reference_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline inline-flex items-center"
                      aria-label={`${item.name || "옵션"} 참고 링크`} // 접근성 향상
                    >
                      <AiOutlineLink className="mr-1" />
                      {/* 링크 텍스트가 필요하다면 추가: 예: "링크" */}
                    </a>
                  ) : // 빈 문자열 대신 null 또는 아무것도 렌더링하지 않도록 할 수 있습니다.
                  // 여기서는 레이아웃 유지를 위해 빈 div나 span을 둘 수도 있지만, 여기서는 그냥 생략.
                  // 만약 레이아웃을 위해 공간이 필요하다면 <div className="w-[24px] h-[24px]"></div> 등으로 처리 가능
                  null}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <div className="w-full border border-gray-300 my-4"></div>
    </div>
  );
}
