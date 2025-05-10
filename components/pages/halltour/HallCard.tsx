"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HallCard({ data }: { data: any }) {
  // data 타입을 any 또는 Company 타입으로 지정
  const router = useRouter();

  // HallCard 클릭 시 상세 페이지로 이동하는 함수
  const handleClick = () => {
    const companyName = data.name; // ✅ Company 객체의 id를 가져와 업체 ID로 사용합니다.
    const targetUrl = `/halltour/${companyName}`;

    router.push(targetUrl); // 해당 URL로 페이지 이동
  };

  const addressParts = data.address?.split(" ") || [];
  const displayAddress =
    addressParts.length > 1
      ? `${addressParts[0]} ${addressParts[1]}`
      : data.address || "주소 정보 없음";

  return (
    <div
      onClick={handleClick} // 클릭 시 handleClick 함수 실행
      className="sm:max-w-[350px] w-full h-[515px] px-4 sm:p-0 cursor-pointer"
    >
      {/* 웨딩홀 대표 이미지 부분 */}
      <div className="w-full h-[350px] relative rounded-xl my-1 bg-gray-100 overflow-hidden ">
        {/* 업체에 홀이 있고, 첫 번째 홀에 사진이 있고, 첫 번째 사진의 url이 유효할 때만 Image 표시 */}
        {data.halls?.[0]?.hall_photos?.[0]?.url && (
          <Image
            fill // 부모 div 크기에 맞춰 채우기
            src={data.halls[0].hall_photos[0].url} // 첫 번째 홀의 첫 번째 사진 URL 사용
            alt={data.name || "웨딩홀 이미지"} // alt 텍스트는 업체명 또는 기본값
            style={{ objectFit: "cover" }} // 이미지 비율 유지하며 영역 채우기
            className="rounded-xl hover:transition-all hover:scale-105 duration-500" // 호버 효과
          />
        )}
      </div>

      {/* 주소 간략 표시 */}
      <div className="text-lg text-gray-500">{displayAddress}</div>

      {/* 웨딩 업체 이름 */}
      <div className="text-2xl font-semibold my-1">
        {data.name || "업체명 정보 없음"}
      </div>

      {/* 홀 이름들 나열하는 부분 */}
      {/* data.halls 배열을 map으로 순회하며 각 홀 이름을 '#홀이름' 형태로 만들고 공백으로 합칩니다. */}
      <div className="flex items-center justify-start gap-1 text-sm text-gray-500">
        {/* data.halls 배열이 유효하고 비어있지 않을 때만 홀 이름 표시 */}
        {data.halls && Array.isArray(data.halls) && data.halls.length > 0 ? (
          <span className="">
            {data.halls.map((hall: any) => `#${hall.name}`).join("   ")}
          </span>
        ) : (
          <span>홀 정보 없음</span>
        )}
      </div>

      <div className="flex gap-2 items-center justify-end">
        <button className="px-2 py-1.5">상세견적서 보기</button>
      </div>
    </div>
  );
}
