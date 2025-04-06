export default function HallInfoSection({ data }: any) {
  return (
    <div className="w-full flex flex-col items-start justify-center">
      <div className="text-xl font-[600] mb-4">식장 정보</div>
      <div className="w-full flex items-center justify-center">
        {/* 이 부분이 기본정보의 요소들이 들어가는 부분 */}
        <div className="w-full  flex flex-col items-start gap-4">
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] flex-shrink-0 text-gray-500 self-start">
              주소
            </div>
            <div className="w-[650px] pl-[20px] pr-[50px] flex flex-wrap items-center justify-start gap-2">
              {data.address}
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] flex-shrink-0 text-gray-500 self-start">
              전화번호
            </div>
            <div className="w-[650px] pl-[20px] flex flex-wrap items-center justify-start gap-2">
              {data.tel}
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] text-[justify] flex-shrink-0 text-gray-500 self-start">
              홈페이지
            </div>
            <div className="w-[650px] pl-[20px] flex flex-wrap items-center justify-start gap-2">
              <a href={data.homePage} target="_blank" rel="noopener noreferrer">
                {data.homePage}
              </a>
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[100px] text-[justify] flex-shrink-0 text-gray-500 self-start">
              접근성
            </div>
            <div className="w-[650px] pl-[20px] flex flex-wrap items-center justify-start gap-2">
              {data.publicTransport}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full border border-gray-300 my-4"></div>
    </div>
  );
}
