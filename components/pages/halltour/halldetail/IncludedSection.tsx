// 포함사항 항목에 대한 타입 정의 (더 구체적으로 정의하는 것이 좋습니다)
import HallInclude from "@/types/hallDetail";

export default function IncludedSection({
  hall_includes,
}: {
  hall_includes: HallInclude[]; // props 타입 힌트 적용
}) {
  // hall_includes 배열이 유효한지 확인 (안전성 추가)
  if (
    !hall_includes ||
    !Array.isArray(hall_includes) ||
    hall_includes.length === 0
  ) {
    // 데이터가 없을 때 사용자에게 표시할 메시지 또는 null 반환
    // 예: return <div className="px-3 sm:px-0 text-gray-500">대관료 포함사항 정보가 없습니다.</div>;
    return null; // 또는 적절한 fallback UI
  }

  // ✨ [수정됨] item.category를 기준으로 가나다순 정렬
  const sortedIncludes = [...hall_includes].sort((a, b) => {
    const categoryA = a.category || ""; // category가 null/undefined일 경우 빈 문자열로 처리
    const categoryB = b.category || ""; // category가 null/undefined일 경우 빈 문자열로 처리
    return categoryA.localeCompare(categoryB, "ko"); // 'ko'는 한국어 기준으로 정렬
  });

  return (
    <div className="w-full flex flex-col items-start justify-center px-3 sm:px-0">
      <div className="w-full text-2xl font-[600] mb-4 flex flex-col sm:flex-row">
        <div>대관료 포함사항</div>
      </div>
      <div className="w-full flex items-center justify-center">
        {/* 이 부분이 기본정보의 요소들이 들어가는 부분 */}
        <div className="w-full flex flex-col items-start gap-4">
          {/* ✨ [수정됨] 정렬된 sortedIncludes 배열을 사용하여 맵핑 */}
          {sortedIncludes.map((item: HallInclude, index: number) => (
            <div
              key={item.id || `hall-include-${index}`}
              className="w-full flex items-center justify-between"
            >
              <div className="w-[140px] sm:w-[190px] flex-shrink-0 text-gray-500 self-start">
                {item.category || "카테고리 없음"}{" "}
                {/* category가 없을 경우 대비 */}
              </div>
              <div className="w-full sm:w-[540px] pl-2 flex flex-wrap items-center justify-start gap-2 text-gray-700">
                {item.subcategory || "상세 내용 없음"}{" "}
                {/* subcategory가 없을 경우 대비 */}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full border border-gray-300 my-4"></div>
    </div>
  );
}
