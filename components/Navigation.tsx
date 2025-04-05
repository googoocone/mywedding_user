import Image from "next/image";
import Link from "next/link";
import { AlignJustify } from "lucide-react";

const navList = [
  { name: "홈", url: "/" },
  { name: "웨딩홀 투어", url: "/halltour" },
  { name: "플래너", url: "/planner" },
  { name: "모바일 청첩장", url: "/invitation" },
  { name: "프리미엄", url: "/premium" },
];

export default function Navigation() {
  return (
    <>
      <div className="hidden w-full min-w-[1250px] h-[70px] sm:flex items-center justify-center">
        <div className="w-[1250px] h-full flex items-center justify-between">
          <div className="w-[105px] h-[40px] relative">
            <Link href="/">
              <Image src="/logo.svg" fill alt="logo"></Image>
            </Link>
          </div>
          <div className="w-full h-full  flex items-center justify-center">
            <ul className="flex space-x-12 text-lg font-medium">
              {navList.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.url}
                    className="hover:text-gray-600 transition text-[16px] font-semibold"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-[180px] h-[40px] flex items-center justify-center">
            <button className="w-[80px] h-[40px] bg-[#FFE4DE] text-[#ff767b] text-[14px] font-semibold rounded-xl cursor-pointer">
              로그인
            </button>
          </div>
        </div>
      </div>
      <div className="w-full sm:hidden h-[70px] fixed top-0 px-[10px] bg-white z-10 flex items-center justify-between">
        <div className="w-[90px] h-[35px] relative">
          <Link href="/">
            <Image src="/logo.svg" fill alt="logo"></Image>
          </Link>
        </div>
        <div className="">
          <AlignJustify></AlignJustify>
        </div>
      </div>
    </>
  );
}
