"use client";

// useState 제거 (부모에서 관리)
// import { useState } from "react";

import { CiShare1 } from "react-icons/ci";
import { CiHeart } from "react-icons/ci";
import { AiOutlineUnorderedList } from "react-icons/ai";

import Image from "next/image";

// 부모로부터 사진 데이터 배열과 모달 열기 함수를 prop으로 받습니다.
// data 타입을 명확히 배열 any[]로 지정합니다.
export default function PhotoSection({
  data,
  onShowAllPhotos,
}: {
  data: any[];
  onShowAllPhotos: () => void;
}) {
  // PhotoSection 컴포넌트 자체의 showImageModal 상태는 필요 없어집니다.
  // const [showImageModal, setShowImageModal] = useState<boolean>(false); // 이 줄 제거

  // HallDetailPage에서 이미 데이터 유무를 체크하지만, 컴포넌트 자체의 안정성을 위해 여기서도 간단히 체크할 수 있습니다.
  if (!data || data.length === 0) {
    return (
      <div className="h-64 bg-gray-200 flex items-center justify-center rounded-md">
        이미지 정보가 없습니다.
      </div>
    );
  }

  // console.log("main photo url", data[0]?.url); // data[0]가 undefined일 수 있으므로 안전하게 접근

  const mainPhoto = data[0]; // 첫 번째 사진 객체
  const subPhotos = data.slice(1, 5); // 두 번째부터 다섯 번째 사진 객체 (최대 4개)

  return (
    <>
      {/* 이미지와 버튼 레이아웃 컨테이너 */}{" "}
      <div className="w-full mt-6 relative">
        {/* 이미지가 1개라도 있을 경우에만 이미지 그리드 렌더링 */}
        {data.length > 0 && (
          <div className="grid md:grid-cols-2 md:gap-4 gap-2 align-middle h-[400px] overflow-hidden md:rounded-lg">
            {mainPhoto?.url && (
              <div
                className={`relative w-full h-full col-span-1 ${
                  subPhotos.length > 0
                    ? "md:row-span-2"
                    : "col-span-2 row-span-2"
                }`}
              >
                <Image
                  src={mainPhoto.url}
                  alt={mainPhoto.caption || "대표 이미지"} // alt 텍스트는 caption 또는 기본값 사용
                  style={{ objectFit: "cover" }}
                  fill
                  className="rounded-lg"
                  priority // 페이지 로딩 시 가장 중요한 이미지이므로 priority 설정
                />
              </div>
            )}

            {subPhotos.length > 0 && (
              // md:row-span-2 추가하여 큰 이미지와 높이 맞춤
              <div className="hidden sm:grid grid-cols-2 grid-rows-2 gap-2 w-full h-full col-span-1 md:row-span-2">
                {subPhotos.map(
                  (
                    img: any,
                    index: number // index 타입 명시
                  ) =>
                    // img 객체가 존재하고 url이 있을 때만 Image 컴포넌트 렌더링
                    img?.url && (
                      <div
                        key={img.id || index}
                        className="relative w-full h-full"
                      >
                        {" "}
                        <Image
                          src={img.url} // 사진 객체의 url 속성 사용
                          alt={img.caption || `이미지 ${index + 2}`} // alt 텍스트 사용 (index는 0부터 시작하므로 +2)
                          style={{ objectFit: "cover" }}
                          fill
                          className="rounded-lg"
                        />
                      </div>
                    )
                )}
              </div>
            )}
          </div>
        )}

        <button
          className="absolute bottom-6 right-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 hover:shadow-lg text-black text-sm border-black rounded-md gap-2 flex items-center z-5 cursor-pointer" // z-10 추가하여 이미지 위에 표시되도록
          onClick={onShowAllPhotos} // 부모 함수 호출
        >
          <AiOutlineUnorderedList />
          사진 모두 보기 ({data.length}개) {/* 전체 사진 개수 표시 */}
        </button>
      </div>
      {/* 공유하기, 찜하기 버튼 영역 */}
      {/* <div className="flex w-full justify-end items-center px-4 mt-2">
        <div className="flex gap-2 text-xs md:text-sm">
          <button
            type="button"
            className="flex gap-2 items-center px-2 py-1.5 rounded-lg hover:bg-black/10"
          >
            <CiShare1 />
            공유하기
          </button>
          <button
            type="button"
            className="flex gap-2 items-center px-2 py-1.5 rounded-lg hover:bg-black/10"
          >
            <CiHeart />찜
          </button>
        </div>
      </div> */}
      {/* ImageModal 컴포넌트는 HallDetailPage에서 렌더링합니다. */}
    </>
  );
}
