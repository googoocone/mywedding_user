import Image from "next/image";

export default function GuideBook() {
  return (
    // 부모 div에 스크롤을 가능하게 하는 스타일을 추가합니다.
    // max-w-full을 사용하여 너비가 부모 컨테이너를 넘어가지 않도록 합니다.
    // overflow-y-auto는 세로 스크롤바를 만듭니다.
    // h-screen 또는 고정된 높이를 주어 스크롤 가능한 영역을 만듭니다.
    <div className="w-full h-screen overflow-y-auto mx-auto">
      {/* Image 컴포넌트의 fill 속성 대신 width와 height를 직접 지정합니다.
        원본 이미지의 너비를 100%로 맞추고, 높이는 원본 비율에 따라 자동으로 설정되도록 합니다.
        또는, 원본 이미지의 크기를 직접 지정하여 고정된 비율을 유지하도록 합니다.
      */}
      <div
        className="relative w-full"
        style={{ height: "12000px" /* 원본 이미지 높이 지정 */ }}
      >
        <Image
          src="/test.png"
          alt="가이드북"
          fill // 부모 div의 height에 맞춰 이미지를 채웁니다.
          style={{ objectFit: "contain" }} // 이미지가 부모 영역에 맞게 조정되도록 합니다.
          // 'cover'를 사용하면 잘릴 수 있고, 'contain'은 여백이 생길 수 있습니다.
        />
      </div>
      <div className="w-full h-100"></div>
    </div>
  );
}
