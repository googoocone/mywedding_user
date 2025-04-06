"use client";

import { useWeddingFilterStore } from "@/store/useWeddingFilterStore";

const regions = {
  서울: [
    "강남구",
    "강동구",
    "강북구",
    "강서구",
    "관악구",
    "광진구",
    "구로구",
    "금천구",
    "노원구",
    "도봉구",
    "동대문구",
    "동작구",
    "마포구",
    "서대문구",
    "서초구",
    "성동구",
    "성북구",
    "송파구",
    "양천구",
    "영등포구",
    "용산구",
    "은평구",
    "종로구",
    "중구",
    "중랑구",
  ],
  부산: [
    "중구",
    "서구",
    "동구",
    "영도구",
    "부산진구",
    "동래구",
    "남구",
    "북구",
    "해운대구",
    "사하구",
    "금정구",
    "강서구",
    "연제구",
    "수영구",
    "사상구",
    "기장군",
  ],
  경기도: [
    "수원시",
    "성남시",
    "고양시",
    "용인시",
    "부천시",
    "안산시",
    "안양시",
    "남양주시",
    "화성시",
    "평택시",
    "의정부시",
    "시흥시",
    "파주시",
    "광명시",
    "김포시",
    "군포시",
    "광주시",
    "이천시",
    "양주시",
    "오산시",
    "구리시",
    "안성시",
    "포천시",
    "의왕시",
    "하남시",
    "여주시",
    "양평군",
    "동두천시",
    "가평군",
    "과천시",
    "연천군",
  ],
};

const weddingTypes = [
  "전체",
  "컨벤션홀",
  "호텔웨딩",
  "하우스웨딩",
  "야외웨딩",
  "채플",
];
const flowerDecorations = ["전체", "생화장식", "조화장식"];

export default function HallFilter() {
  const {
    selectedRegion,
    selectedSubRegion,
    selectedWeddingType,
    selectedFlower,
    setSelectedRegion,
    setSelectedSubRegion,
    setSelectedWeddingType,
    setSelectedFlower,
  } = useWeddingFilterStore();

  return (
    <div className="w-[250px] bg-white border border-gray-100 rounded-xl p-4 shadow-md">
      <h3 className="text-lg font-bold mb-2">필터</h3>

      {/* 지역 선택 */}
      <div className="my-4">
        <h4 className="text-md font-semibold mb-4">위치</h4>
        <div className="flex flex-col space-y-2">
          {Object.keys(regions).map((region) => (
            <label
              key={region}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                name="region"
                value={region}
                checked={selectedRegion === region}
                onChange={() => {
                  setSelectedRegion(region);
                  setSelectedSubRegion("");
                }}
                className="appearance-none w-5 h-5 rounded-full bg-white border border-gray-200 checked:bg-[#FF767B] checked:border-none outline-none focus:ring-0"
              />
              <span>{region}</span>
            </label>
          ))}
        </div>
        <hr className="mt-4" />
      </div>

      {/* 상세 지역 선택 */}
      <div className="mt-8">
        <h4 className="text-md font-semibold mb-4">상세 지역</h4>
        <div className="h-[250px] scrollbar overflow-y-auto rounded-lg p-2 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {(regions[selectedRegion as keyof typeof regions] || []).map(
            (subRegion) => (
              <label
                key={subRegion}
                className="flex items-center space-x-2 my-2 cursor-pointer p-1 rounded-md hover:bg-orange-100 transition"
              >
                <input
                  type="radio"
                  name="subRegion"
                  value={subRegion}
                  checked={selectedSubRegion === subRegion}
                  onChange={() => setSelectedSubRegion(subRegion)}
                  className="appearance-none w-5 h-5 rounded-full bg-white border border-gray-200 checked:bg-[#FF767B] checked:border-none outline-none focus:ring-0"
                />
                <span>{subRegion}</span>
              </label>
            )
          )}
        </div>
        <hr className="mt-4" />
      </div>

      {/* 예식 타입 선택 */}
      <div className="mt-8">
        <h4 className="text-md font-semibold mb-4">예식 타입</h4>
        <div className="flex flex-col space-y-2">
          {weddingTypes.map((type) => (
            <label
              key={type}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                name="weddingType"
                value={type}
                checked={selectedWeddingType === type}
                onChange={() => setSelectedWeddingType(type)}
                className="appearance-none w-5 h-5 rounded-full bg-white border border-gray-200 checked:bg-[#FF767B] checked:border-none outline-none focus:ring-0"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
        <hr className="mt-4" />
      </div>

      {/* 생화장식 선택 */}
      <div className="mt-8">
        <h4 className="text-md font-semibold mb-4">생화장식</h4>
        <div className="flex flex-col space-y-2">
          {flowerDecorations.map((flower) => (
            <label
              key={flower}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="radio"
                name="flowerDecoration"
                value={flower}
                checked={selectedFlower === flower}
                onChange={() => setSelectedFlower(flower)}
                className="appearance-none w-5 h-5 rounded-full bg-white border border-gray-200 checked:bg-[#FF767B] checked:border-none outline-none focus:ring-0"
              />
              <span>{flower}</span>
            </label>
          ))}
        </div>
        <hr className="mt-4" />
      </div>

      {/* 초기화 버튼 */}
      <button
        className="w-full bg-[#FF767B] text-white py-2 rounded-md mt-3 cursor-pointer hover:shadow-lg transition-all duration-200"
        onClick={() => {
          setSelectedRegion("서울");
          setSelectedSubRegion("");
          setSelectedWeddingType("전체");
          setSelectedFlower("전체");
        }}
      >
        초기화
      </button>
    </div>
  );
}
