export default function EtcSection({
  penalty_amount,
  penalty_detail,
  etc,
}: {
  penalty_amount: string;
  penalty_detail: string;
  etc: string;
}) {
  console.log("penalty_amount", penalty_amount);
  console.log("etc", etc);

  return (
    <div className="w-full flex flex-col items-start justify-center px-3 sm:px-0">
      <div className="text-2xl font-[600] mb-4">기타 정보</div>
      <div className="w-full flex items-center justify-center">
        <div className="w-full flex flex-col items-start gap-4">
          <div className="w-full flex items-center justify-between">
            <div className="w-[120px] sm:w-[180px] flex-shrink-0 text-gray-500 self-start">
              계약금
            </div>

            <div className="w-[650px] pl-[20px] flex flex-wrap items-center justify-start gap-2 text-gray-700">
              {penalty_amount.toLocaleString() + "원" || "정보 없음"}
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="w-[120px] sm:w-[180px] flex-shrink-0 text-gray-500 self-start">
              계약금 조항
            </div>

            <div className="w-[650px] pl-[20px] flex flex-wrap items-center justify-start gap-2 text-gray-700">
              {penalty_detail || "정보 없음"}
            </div>
          </div>

          <div className="w-full flex items-center justify-between">
            <div className="w-[120px] sm:w-[180px] flex-shrink-0 text-gray-500 self-start">
              기타 내용
            </div>
            <div className="w-[650px] pl-[20px] flex flex-wrap items-center justify-start gap-2 text-gray-700">
              {etc || "정보 없음"}
            </div>
          </div>
        </div>
      </div>
      {/* 하단 구분선 */}
      <div className="w-full border border-gray-300 my-4"></div>
    </div>
  );
}
