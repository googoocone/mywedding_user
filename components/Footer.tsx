export default function Footer() {
  return (
    <div className="w-full h-[200px] sm:h-[500px] flex flex-col items-center justify-center px-5">
      <div className="w-full sm:w-[1250px] h-[200px] flex flex-col items-start justify-start gap-[2px] border-t-gray-300 border-t text-[14px] text-gray-500">
        <div className="mt-10 font-semibold">마이웨딩다이어리</div>
        <div>
          <strong>대표</strong> 박영호호
        </div>
        <div>
          <strong>사업자번호</strong> 875-31-01047
        </div>
        <div>
          <strong>주소</strong> 경기도 화성시 산척동 745{" "}
        </div>
        <div>
          <strong>전화</strong> 010-8285-5136
        </div>
        <div>
          <strong>이메일</strong> snu910501@naver.com
        </div>
        <div className="w-full  mt-10">
          <ul className="w-full flex items-start justify-start gap-5">
            <li>이용약관</li>
            <li>개인정보처리방침</li>
            <li>업데이트 계획</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
