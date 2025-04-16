"use client";

import Image from "next/image";
import Link from "next/link";
import { AlignJustify, X } from "lucide-react";
import { useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { loginWithKakao } from "@/lib/auth/loginWithKakao";
import { AuthContext } from "@/context/AuthContext";
import { logout } from "@/lib/auth/logout";

const navList = [
  { name: "홈", url: "/" },
  { name: "웨딩홀 투어", url: "/halltour" },
  { name: "플래너", url: "/planner" },
  { name: "모바일 청첩장", url: "/invitation" },
  { name: "프리미엄", url: "/premium" },
];

export default function Navigation() {
  const [isMenu, setIsMenu] = useState(false);
  const { user }: any = useContext(AuthContext);
  const { setUser }: any = useContext(AuthContext);
  console.log("user", user);

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
                  <Link
                    href={item.url}
                    className="hover:text-gray-600 transition text-[16px] font-semibold"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="w-[180px] h-[40px] flex items-center justify-center">
            {user ? (
              <HeaderButtons></HeaderButtons>
            ) : (
              <button
                onClick={loginWithKakao}
                className="w-[80px] h-[40px] bg-[#FFE4DE] text-[#ff767b] text-[14px] font-semibold rounded-xl cursor-pointer"
              >
                로그인
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="w-full sm:hidden h-[70px] fixed top-0 px-[10px] bg-white z-10 flex items-center justify-between">
        <div className="w-[90px] h-[35px] relative">
          <Link href="/">
            <Image src="/logo.svg" fill alt="logo"></Image>
          </Link>
        </div>
        <div className="" onClick={() => setIsMenu((prev) => !prev)}>
          {!isMenu ? <AlignJustify></AlignJustify> : <X></X>}
        </div>
      </div>
      {/* 드롭다운 메뉴 영역 */}
      <AnimatePresence>
        {isMenu && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col justify-between h-screen pb-[150px] bg-white z-10 fixed top-[70px] left-0" // fixed 위치 조정
          >
            <ul className="flex flex-col space-y-6 p-5">
              {navList.map((item, index) => (
                <Link
                  key={index}
                  href={item.url}
                  className="text-lg font-medium hover:text-gray-600 transition"
                >
                  <li>{item.name}</li>
                </Link>
              ))}
            </ul>
            <ul className="flex flex-col space-y-4 p-5">
              {user ? (
                <>
                  <li>
                    <a
                      href={"/users"}
                      className="block px-4 py-3 text-center text-white bg-[#FF767B] rounded-md font-semibold hover:text-gray-600 transition"
                    >
                      내정보
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={() => logout(setUser)}
                      className="block w-full py-3 text-center text-white bg-[#FF767B] rounded-md font-semibold hover:text-gray-600 transition"
                    >
                      로그아웃
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <button
                    onClick={loginWithKakao}
                    className="block w-full py-3 text-center text-white bg-[#FF767B] rounded-md font-semibold hover:text-gray-600 transition"
                  >
                    로그인
                  </button>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const HeaderButtons = () => {
  const { setUser }: any = useContext(AuthContext);
  const checkUser = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
        {
          method: "GET",
          credentials: "include", // 🔥 쿠키 포함 필수
        }
      );

      if (!res.ok) {
        throw new Error("인증 실패");
      }

      const data = await res.json();
      console.log("✅ 인증된 유저:", data);
      // 👉 여기에 Link 이동 추가도 가능
      window.location.href = "/users"; // 또는 router.push("/users")
    } catch (err) {
      console.error("❌ 인증 실패:", err);
      alert("로그인이 필요합니다");
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={checkUser}
        className="w-[80px] h-[40px] bg-[#FFE4DE] text-[#ff767b] text-[14px] font-semibold rounded-xl cursor-pointer"
      >
        내정보
      </button>

      <button
        onClick={() => logout(setUser)}
        className="w-[80px] h-[40px] bg-[#FFE4DE] text-[#ff767b] text-[14px] font-semibold rounded-xl cursor-pointer"
      >
        로그아웃
      </button>
    </div>
  );
};
