export default function IncludedSection({ data }: any) {
  return (
    <div className="w-full flex flex-col items-start justify-center">
      <div className="text-xl font-[600] mb-4">포함 사항</div>
      <div className="w-full flex items-center justify-center">
        {/* 이 부분이 기본정보의 요소들이 들어가는 부분 */}
        <div className="w-full  flex flex-col items-start gap-4">
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] flex-shrink-0 text-gray-500 self-start">
              포토테이블
            </div>
            <div className="w-[650px] pl-[20px] pr-[50px] flex flex-wrap items-center justify-start gap-2">
              {data.photoTable}
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] flex-shrink-0 text-gray-500 self-start">
              특수연출
            </div>
            <div className="w-[650px] pl-[20px] flex flex-wrap items-center justify-start gap-2">
              {data.specialDirecting.map((item: string, index: number) => (
                <div key={index}>{item}</div>
              ))}
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] text-[justify] flex-shrink-0 text-gray-500 self-start">
              혼구용품
            </div>
            <div className="w-[650px] pl-[20px] flex flex-wrap items-center justify-start gap-2">
              {data.weddingSupplies.map((item: string, index: number) => (
                <div key={index}>{item}, </div>
              ))}
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] dflex-shrink-0 text-gray-500 self-start">
              컨시어즈
            </div>
            <div className="w-[650px] pl-[20px] flex flex-wrap items-center justify-start gap-2">
              {data.concierge.map((item: number, index: number) => (
                <div key={index}>{item} </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full border border-gray-300 my-4"></div>
    </div>
  );
}
