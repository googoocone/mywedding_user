import Image from "next/image";
import Link from "next/link";

const guidebookList = [
  {
    id: 1,
    title: "상견례 준비하기",
    desc: "",
    img: "/images/pages/guidebook/guidebook_1.png",
    url: "https://blog.naver.com/wedding-march/223869712777",
  },
  {
    id: 2,
    title: "웨딩홀 투어 준비하기",
    desc: "",
    img: "/images/pages/guidebook/guidebook_2.png",
    url: "https://blog.naver.com/wedding-march/223871085397",
  },
  {
    id: 3,
    title: "스튜디오 촬영 준비하기",
    desc: "",
    img: "/images/pages/guidebook/guidebook_3.png",
    url: "https://blog.naver.com/wedding-march/223872329177",
  },
  {
    id: 4,
    title: "드레스샵 투어 준비하기",
    desc: "",
    img: "/images/pages/guidebook/guidebook_4.png",
    url: "https://blog.naver.com/wedding-march/223877498289",
  },
  {
    id: 5,
    title: "웨딩 메이크업 준비하기",
    desc: "",
    img: "/images/pages/guidebook/guidebook_5.png",
    url: "https://blog.naver.com/wedding-march/223894961983",
  },
];

export default function GuideBook() {
  return (
    <div className="w-full sm:w-[1250px] h-screen mx-auto overflow-y-auto">
      <div className="w-full mt-10">
        <div className="w-full h-[350px] relative">
          <Image
            src="/images/pages/guidebook/guidebook_title_img.png"
            fill
            alt="웨딩 가이드북"
            className="object-cover"
          />
          {/* 👇 이 부분의 className을 수정합니다. */}
          <span
            className="text-[32px] font-semibold absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white whitespace-nowrap"
            // whitespace-nowrap: 텍스트가 두 줄로 넘어가는 것을 방지 (필요한 경우)
          >
            웨딩 가이드북
          </span>
        </div>
        <div className="mt-10 px-2 w-full sm:w-[1130px] mx-auto grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-8 items-start">
          {guidebookList.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              target="_blank"
              className="block group hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-full aspect-square rounded-xl cursor-pointer border-gray-200 border overflow-hidden">
                <div className="w-full h-full relative">
                  <Image
                    src={item.img}
                    fill
                    alt={item.title}
                    className="rounded-xl object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
