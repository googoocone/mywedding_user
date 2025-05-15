export default function IncludedSection({ hall_includes }: any) {
  return (
    <div className="w-full flex flex-col items-start justify-center px-3 sm:px-0">
      <div className="w-full text-2xl font-[600] mb-4 flex flex-col sm:flex-row">
        <div>대관료 포함사항</div>
      </div>
      <div className="w-full flex items-center justify-center">
        {/* 이 부분이 기본정보의 요소들이 들어가는 부분 */}
        <div className="w-full  flex flex-col items-start gap-4">
          {hall_includes.map((item: any) => (
            <div className="w-full flex items-center justify-between">
              <div className="w-[140px] sm:w-[190px] flex-shrink-0 text-gray-500 self-start">
                {item.category}
              </div>
              <div className="w-[540px] pl-2   flex flex-wrap items-center justify-start gap-2">
                {item.subcategory}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full border border-gray-300 my-4"></div>
    </div>
  );
}
