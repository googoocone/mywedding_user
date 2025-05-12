import Link from "next/link";
import cn from "classnames"; // cn 함수 import 확인

// FaInstagram 아이콘이 사용되지 않는 것 같으니 제거해도 됩니다.
// import { FaInstagram } from "react-icons/fa";

// OptionDescDisplay 컴포넌트 import 확인
import OptionDescDisplay from "./OptionDescDisplay";

// OptionSection 컴포넌트는 hall_options 배열을 prop으로 받습니다.
// 정확한 타입 정의가 있다면 { hall_options: YourOptionItemType[] } 와 같이 사용하세요.
export default function OptionSection({
  hall_options,
}: {
  hall_options: any[];
}) {
  // 타입 힌트 추가
  // hall_options 배열이 유효한지 확인 후 렌더링 (안전성 추가)
  if (
    !hall_options ||
    !Array.isArray(hall_options) ||
    hall_options.length === 0
  ) {
    return null; // 옵션 데이터가 없으면 아무것도 렌더링하지 않음
  }

  return (
    // 전체 섹션 컨테이너
    <div className="w-full flex flex-col items-start justify-center px-3 sm:px-0">
      {/* 섹션 제목 */}
      <div className="text-xl font-[600] mb-4">옵션 사항</div>

      <div className="w-full flex items-center justify-center">
        <div className="w-full flex flex-col items-start gap-5">
          {hall_options.map(
            (
              item: any,
              index: number // key prop을 위해 index 타입 명시
            ) => (
              <div
                key={item.id || index}
                className="w-full flex items-start justify-between "
              >
                <div className="hidden sm:block sm:w-[180px] flex-shrink-0 text-gray-500 self-start">
                  {item.name || "옵션 이름 없음"}{" "}
                  {/* 안전한 접근 및 폴백 텍스트 */}
                </div>

                {/* 옵션 이름 표시 영역 (작은 화면용) - OptionDescDisplay 컴포넌트 사용 */}
                {/* self-start 유지 */}
                <div className="w-[130px] sm:hidden flex-shrink-0 text-gray-500 self-start">
                  {/* item 데이터를 prop으로 전달 */}
                  <OptionDescDisplay item={item}></OptionDescDisplay>
                </div>

                <div className="w-full sm:w-[570px] pl-3 sm:pl-[20px] flex flex-wrap items-start justify-start gap-6 sm:gap-8">
                  {/* 가격 표시 영역 */}
                  {/* self-start 유지 */}
                  <div className="w-[95px] flex-shrink-0 self-start gap-2 flex-wrap text-gray-700">
                    {item.price?.toLocaleString() || "가격 정보 없음"}원{" "}
                    {/* 안전한 접근 및 폴백 */}
                  </div>

                  <div className="w-[40px] flex-shrink-0 self-start">
                    <div
                      className={cn({
                        "text-red-400": item.is_required === true, // 일치 연산자 사용

                        "text-gray-500": item.is_required !== true,
                      })}
                    >
                      {item.is_required === true ? "필수" : "선택"}{" "}
                    </div>
                  </div>

                  <div className="hidden sm:block sm:w-[335px] text-gray-700">
                    {item.description || "-"}{" "}
                  </div>
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
